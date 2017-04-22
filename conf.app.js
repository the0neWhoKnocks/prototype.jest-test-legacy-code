var path = require('path');
var conf;

function normalizePath(path){
  return path.replace(/\\/g, '/');
}

conf = {
  paths: {
    APP_ROOT: normalizePath(path.resolve(__dirname)),
    COMPONENTS: normalizePath(path.resolve(__dirname, `./dev/components`)),
    SCRIPTS: normalizePath(path.resolve(__dirname, `./src/scripts`)),
    TEMPLATES: normalizePath(path.resolve(__dirname, `./src/templates`)),
    TESTS: normalizePath(path.resolve(__dirname, `./test`))
  }
};

module.exports = conf;