var fs = require('fs');
var path = require('path');
var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var appConfig = require('../../conf.app.js');
var jestConfig = require('../../conf.jest.js');
var DependencyLoader = require('./DependencyLoader.js');

// =============================================================================

// assures that legacy assertions work
global.sinon = sinon;
global.expect = chai.expect;
chai.should();
chai.use(sinonChai);

// mock out any timers automatically
jest.useFakeTimers();

// =============================================================================

var dependencyLoader = new DependencyLoader(appConfig, jestConfig);
require('./document.js')(document, window);

window.testCtx = {
  defaults: {},
  loadedFiles: {},
  load: function(files){
    files = dependencyLoader.transformLegacyPaths(files);

    var ret = dependencyLoader.addScripts(files);

    if( files.length === 1 ) return ret;
  },
  /**
   * In order to get jsDom to load files with inlined script tags,
   * they had to be escaped. If they're actually needed, like for
   * a template to render, use this to unescape the script tags.
   *
   * @param {string} str - the contents of a template or script.
   * @returns {string}
   */
  unescapeScriptTags: function(str){
    return str.replace(/\\\/script/g, '/script');
  }
};

// add in legacy vendor scripts that are used by a majority of files
dependencyLoader.addScripts(jestConfig.legacy.paths.GLOBALS);