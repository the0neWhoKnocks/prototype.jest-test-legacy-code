var fs = require('fs');
var path = require('path');
var IstanbulInstrument = require('jest/node_modules/jest-cli/node_modules/istanbul-lib-instrument');

function DependencyLoader(appConfig, jestConfig){
  this.appConfig = appConfig;
  this.jestConfig = jestConfig;

  // A list of file names will be omitted from coverage
  this.filesExcludedFromCoverage = [];
  this.dirsExcludedFromCoverage = new RegExp(jestConfig.legacy.TEST_SETUP_DIRS.join('|'));

  // build out what legacy files get excluded from coverage
  jestConfig.collectCoverageFrom.filter(function(item){
    if( /^!.*\.js$/.test(item) ){
      var matches = item.match(/\{(.*)\}/);

      if( matches && matches.length && matches[1] ){
        this.filesExcludedFromCoverage = this.filesExcludedFromCoverage.concat( matches[1].split(',') );
      }
    }
  }.bind(this));
}

DependencyLoader.prototype = {
  /**
   * Takes the legacy paths and transforms them into full system
   * paths so that the files can be read from the FS.
   *
   * @param {Array|string} files - A String or an Array of legacy paths.
   * @returns {Array|string}
   */
  transformLegacyPaths: function(files){
    var singleFile = false;

    if( !Array.isArray(files) ){
      files = [files];
      singleFile = true;
    }

    // transform paths to account for janky legacy setup
    for(var i=0; i<files.length; i++){
      var file = files[i].replace(/\./g, '/');

      file = ( file.indexOf('templates') > -1 )
        ? `${this.appConfig.paths.TEMPLATES}${ file.replace('templates','') }.handlebars`
        : `${this.appConfig.paths.SCRIPTS}/${file}.js`;

      files[i] = file;
    }

    // filter out globals & exclusions,
    files = files.filter(function(currPath){
      if(
        this.jestConfig.legacy.paths.GLOBALS.indexOf(currPath) === -1
        && this.jestConfig.legacy.EXCLUSIONS.indexOf(currPath) === -1
        || currPath.indexOf('jQuery') > -1
      ){
        return currPath;
      }
    }.bind(this));

    return ( singleFile ) ? files[0] : files;
  },

  /**
   * Checks if the current file that will be loaded has a mock. If it
   * does it will return the path to the mock.
   *
   * @param {string} filePath - The path that will be loaded.
   * @returns {null|string}
   */
  mockCheck: function(filePath){
    var mock;

    if( filePath.indexOf('.js') > -1 ){
      var fileName = path.basename(filePath, '.js');

      for(var i=0; i<this.jestConfig.legacy.MOCKED.length; i++){
        var currPath = this.jestConfig.legacy.MOCKED[i];
        var mockName = path.basename(currPath, '.mock.js');

        if( fileName === mockName ){
          mock = currPath;
          break;
        }
      }
    }

    return mock;
  },

  /**
   * Searches a files contents for it's dependencies. If it finds
   * dependencies, it'll load and return them so that they can
   * be prepended before the file's contents.
   *
   * @param {RegExp} regEx - An expression that'll be used to find legacy requires.
   * @param {string} fileContents - The contents of a file.
   * @returns {string}
   */
  checkAndLoad: function(regEx, fileContents){
    var files = fileContents.match(regEx);
    var deps = '';

    if( files && files.length ){
      for( var f=0; f<files.length; f++ ){
        var currMatch = files[f].match(regEx.source);

        if(
          currMatch && currMatch[1]
          && !currMatch[2] // don't load if second param is set since it just loads CSS
        ){
          var currPath = this.transformLegacyPaths(currMatch[1]);

          if( currPath && currPath !== '' ){
            // load the mock if one exists
            var mock = this.mockCheck(currPath);
            if( mock ) currPath = mock;

            deps += this.loadFileAndDeps(currPath);
          }
        }
      }
    }

    return deps;
  },

  /**
   * Finds any template dependencies, and ensures they're loaded before the
   * template is loaded.
   *
   * @param {string} fileContents - The template markup
   */
  loadDeps: function(fileContents, isTemplate){
    var deps = '';

    if( isTemplate ){
      deps += this.checkAndLoad(/^\{\{load (?:"|')([^"']*)/gm, fileContents);
    }else{
      deps += this.checkAndLoad(/load\((?:'|")(.*)(?:'|")(,.*)?\);/gm, fileContents);
    }

    return deps;
  },

  /**
   * This basically fakes the module 'require' pattern. Instead of
   * returning a self-contained Object or Function, it just points to
   * a the reference of what was already included.
   *
   * @param {string} fileContents - The contents of a file.
   * @returns {string}
   */
  addModuleSupport: function(fileContents){
    var regEx = /= (lib\.load\((?:'|")(.*)(?:'|")\));/gm;
    var matches = fileContents.match(regEx);

    if( matches && matches.length ){
      for( var i=0; i<matches.length; i++ ){
        var currMatch = matches[i];
        var currMatches = currMatch.match(regEx.source);
        var objectRef = currMatches[2];
        var transformUsed = false;

        // rewrite the call to a 'returned require', and have it point to the inlined instance
        for( var req in this.jestConfig.legacy.MODULE_TRANSFORMS ){
          var currItem = this.jestConfig.legacy.MODULE_TRANSFORMS[req];

          if( req === objectRef ){
            fileContents = fileContents.replace(currMatches[1], `window.${ currItem }`);
            transformUsed = true;
            break;
          }
        }

        if( !transformUsed ){
          fileContents = fileContents.replace(currMatches[1], `window.${ objectRef }`);
        }
      }
    }

    return fileContents;
  },

  escapeScriptTags: function(str){
    return str.replace(/<\/script/gm, "<\\/script");
  },

  /**
   * Starts the process of loading a file and it's dependencies. There's
   * some middleware that occurs which wraps templates so they can be
   * accessed, and instruments JS. Note - only the first file (not it's
   * dependencies) should be instrumented.
   *
   * @param {string} filePath - The path to a file that needs loading.
   * @param {bool} [shouldInstrument] - Whether or not to add instrumentation to a file for coverage.
   * @returns {string}
   */
  loadFileAndDeps: function(filePath, shouldInstrument=false){
    var scripts = '';
    var instrumenter = IstanbulInstrument.createInstrumenter({
      noAutoWrap: true
    });

    if( !window.testCtx.loadedFiles[filePath] ){
      window.testCtx.loadedFiles[filePath] = 'pending';

      var fileExists = fs.existsSync(filePath);
      var templateExt = '.handlebars';
      
      if( !fileExists ){
        // check for other template extensions
        if( filePath.indexOf('templates') > -1 ){
          filePath = filePath.replace('.handlebars', '.hbs');
          fileExists = fs.existsSync(filePath);
          
          if( fileExists ) templateExt = '.hbs';
        }
        // check if there's a `min` version of a file
        else if( filePath.indexOf('.js') > -1 ){
          filePath = filePath.replace('.js', '.min.js');
          fileExists = fs.existsSync(filePath);
        }
      }

      if( fileExists ){
        var file = fs.readFileSync(filePath, 'utf-8');
        var content = file;
        var deps;

        // pre-process templates
        if( filePath.indexOf('templates') > -1 ){
          deps = this.loadDeps(file, true);
          file = this.escapeScriptTags(file);

          var template =
            `(function(){
                Handlebars.templates = Handlebars.templates || {};
                Handlebars.partials = Handlebars.partials || {};
                Handlebars.templates['${ path.basename(filePath, templateExt) }'] =
                Handlebars.partials['${ path.basename(filePath, templateExt) }'] = Handlebars.template(${ window.Handlebars.precompile(file) });
              })();`;
          content = template;
        }else{
          // find & load deps before instrumentation
          deps = this.loadDeps(file);
          content = this.addModuleSupport(file);

          // In case a script has a string `script` tag, it needs to be escaped
          // so that it doesn't break the script that gets inserted into jsDom
          content = this.escapeScriptTags(content);

          // instrument tested file
          if(
            shouldInstrument
            && this.jestConfig.collectCoverage
            && !this.dirsExcludedFromCoverage.test(filePath)
            && this.filesExcludedFromCoverage.indexOf(path.basename(filePath, '.js')) < 0
          ){
            content = instrumenter.instrumentSync(content, filePath);
          }
        }

        // cache the file so it can be loaded instead of hitting up the fs.
        window.testCtx.loadedFiles[filePath] = content;

        scripts += `
          ${ deps }
          <script type="text/javascript">${ content }</script>
        `;
      }else{
        throw new Error(`[ERROR] File not found: ${ filePath }`);
      }
    }

    return scripts;
  },

  /**
   * Legacy scripts have to be inlined into the jsDom so that the tests have access
   * to them. Templates are pre-compiled before they're added, and JS files are
   * instrumented for coverage before they're added.
   *
   * @param {Array|string} files - An Array of file paths.
   */
  addScripts: function(files){
    var scripts = '';

    for(var i=0; i<files.length; i++){
      var filePath = files[i];

      scripts += this.loadFileAndDeps(filePath, true);
    }

    if( scripts != '' ) document.body.innerHTML += scripts;

    //fs.writeFile(`./temp_${ (new Date()).getTime() }.js`, scripts);

    // handle cases where a file is required and returns code.
    if( files.length === 1 ){
      var file = files[0];

      if( file.indexOf('jQuery') > -1 ){
        return window.$;
      }
    }
  }
};

module.exports = DependencyLoader;