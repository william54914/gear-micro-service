/** 
 * Jest configuration for performance tests
 * Handles ES modules for k6 tests
 */
module.exports = {
  rootDir: '../../',
  testEnvironment: 'node',
  // Don't use standard setup as these are often standalone scripts
  setupFilesAfterEnv: [],
  testMatch: [
    '<rootDir>/src/tests/performance/**/*.test.js'
  ],
  transform: {
    // Use babel to transform ES modules
    "^.+\\.jsx?$": "babel-jest"
  },
  // Use .babelrc or babel.config.js if you have one, otherwise
  // this config will handle the ES modules
  transformIgnorePatterns: [
    "node_modules/(?!(k6|k6-html-reporter)/)"
  ],
  moduleNameMapper: {
    // Map k6 modules to mocks
    "k6/http": "<rootDir>/src/tests/mocks/k6/http.js",
    "k6/metrics": "<rootDir>/src/tests/mocks/k6/metrics.js",
    "k6/(.*)": "<rootDir>/src/tests/mocks/k6/$1.js"
  },
  // Provide global mock for k6 imports
  globals: {
    "k6": true
  }
}; 