var babelJest = require('jest/node_modules/jest-cli/node_modules/jest-runtime/node_modules/babel-jest');

/**
 * Normally you'd just pass in `babel-jest` which would utilize a babelrc or an
 * entry within package.json, but this enables us to use specific Babel 
 * configurations for tests without external interferance.
 */

module.exports = babelJest.createTransformer({
  plugins: [
    'transform-object-assign'
  ],
  presets: [
    'es2015'
  ]
});