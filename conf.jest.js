var fs = require('fs');
var path = require('path');
var globAll = require('glob-all');
var appConfig = require('./conf.app.js');
var OUTPUT_NAME = 'gen.conf.jest.json';
// A list of vendor/global files that each test utilize
var LEGACY_GLOBALS = [
  `${ appConfig.paths.SCRIPTS }/Class.js`,
  `${ appConfig.paths.SCRIPTS }/handlebars.js`,
  `${ appConfig.paths.SCRIPTS }/jQuery.js`,
  `${ appConfig.paths.SCRIPTS }/lodash.js`,
  `${ appConfig.paths.SCRIPTS }/Modernizr.js`,
  `${ appConfig.paths.TESTS }/_shims/handlebarsHelpers.js`,
  `${ appConfig.paths.TESTS }/_shims/lib.js`
];
// These files will be ignored by `lib.load`
var DEPENDENCY_EXCLUSIONS = [
  `${ appConfig.paths.SCRIPTS }/lib.js`
];
var TEST_SETUP_DIRS = [
  '_mocks',
  '_shims',
  '_transformers'
];
var MOCKED_FILES = globAll.sync(`${appConfig.paths.TESTS}/_mocks/*.mock.js`);
var conf = {
  automock: false,
  // Stop running tests after the first failure
  bail: true,
  // The directory where Jest should store its cached dependency information
  cacheDirectory: `${ appConfig.paths.TESTS }/.cache`,
  // Whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    "**/{components,test}/**/*.{js,jsx}", // omitting `src` here since we have to manually instrument the legacy code
    `!**/*.min.js`,
    `!**/{node_modules,${ TEST_SETUP_DIRS.join(',') }}/**`,
    `!**/{${ getFileNames(LEGACY_GLOBALS).join(',') }}.js`
  ],
  // The directory where Jest should output its coverage files.
  coverageDirectory: `${ appConfig.paths.TESTS }/.coverage`,
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    'html',
    'lcov',
    'text-summary'
  ],
  // Used to configure minimum threshold enforcement for coverage results.
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  // A map from regular expression to module names that allow you to stub out resources, like images or styles with a single module.
  moduleNameMapper: {
    '^.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': `${ appConfig.paths.TESTS }/_mocks/mediaFiles.mock.js`,
    '^.+\\.(css|scss|style)$': `${ appConfig.paths.TESTS }/_mocks/styles.mock.js`
  },
  // Automatically reset mock state between every test
  resetMocks: false,
  // A list of paths to directories that Jest should use to search for files in.
  roots: [
    `${ appConfig.paths.COMPONENTS }/`,
    `${ appConfig.paths.SCRIPTS }/`,
    `${ appConfig.paths.TESTS }/lib/`
  ],
  // Runs code to configure or set up the testing framework before each test. 
  setupTestFrameworkScriptFile: `${ appConfig.paths.TESTS }/_shims/bootstrap.js`,
  // This option sets the URL for the jsdom environment. It is reflected in properties such as `location.href`.
  testURL: 'http://jest-test.net/',
  // Setting this value to fake allows the use of fake timers for functions such as setTimeout
  timers: 'fake',
  // A transformer is a module that provides a synchronous function for transforming source files.
  transform: {
    '^.+\\.(hbs|handlebars)$': `${ appConfig.paths.TESTS }/_transformers/templates.transformer.js`,
    '^.+(\\.babel\\.js|\\.jsx)?$': `${ appConfig.paths.TESTS }/_transformers/babel.transformer.js`
  },
  // Indicates whether each individual test should be reported during the run
  verbose: false
};

/**
 * Loops over file paths, extracts just the file names, and returns
 * those file names in an Array.
 *
 * @param {Array} paths - A list of paths.
 * @returns Array
 */
function getFileNames(paths){
  var names = [];

  PATH_LOOP: for(var i=0; i<paths.length; i++){
    var currPath = paths[i];

    // anything in the setup dirs will be skipped automatically
    for(var j=0; j<TEST_SETUP_DIRS.length; j++){
      var setupDir = TEST_SETUP_DIRS[j];

      if( currPath.indexOf(setupDir) > -1 ){
        continue PATH_LOOP;
      }
    }

    names.push( path.basename(currPath).replace(/(?:\.min)?\.js$/, '') );
  }

  return names;
}

// setup for TeamCity
if( process.env.TEAMCITY_VERSION ){
  conf.collectCoverage = false;
  conf.testResultsProcessor = 'jest-teamcity-reporter';
}

// allows from running from CLI
if( require.main === module ){
  try{
    fs.writeFileSync(OUTPUT_NAME, JSON.stringify(conf, null, 2), 'utf8');
    console.log('[GENERATED] Jest config');
  }catch(err){
    throw new Error(err);
  }
}
// OR, requiring
else{
  conf.legacy = {
    EXCLUSIONS: DEPENDENCY_EXCLUSIONS,
    MOCKED: MOCKED_FILES,
    /**
     * If these items are required & return something, they'll just point to the
     * value supplied. For example if you have `var _ = nike.requireDependency('lib.lodash')`
     * it'll just use `_`;
     */
    MODULE_TRANSFORMS: {
      'lib.lodash': '_',
      'jQuery': '$'
    },
    paths: {
      GLOBALS: LEGACY_GLOBALS
    },
    TEST_SETUP_DIRS: TEST_SETUP_DIRS
  };
  module.exports = conf;
}
