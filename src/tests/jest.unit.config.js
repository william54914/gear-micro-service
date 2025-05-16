module.exports = {
  rootDir: '../../',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  testMatch: [
    '<rootDir>/src/tests/unit/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**/*.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  // Mock external services
  moduleNameMapper: {
    '^@services/(.*)$': '<rootDir>/src/tests/mocks/services/$1'
  }
}; 