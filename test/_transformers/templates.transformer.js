var path = require('path');
var handlebars = require('handlebars');

/**
 * NOTE - If you want to log results from this file, you'll have to clear out
 * the jest cache directory first.
 */

module.exports = {
  process(fileContents, filePath, jestConfig, options) {
    return `module.exports = ${ handlebars.compile(fileContents) };`;
  }
};