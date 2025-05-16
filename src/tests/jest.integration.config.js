module.exports = {
  rootDir: '../../',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  testMatch: [
    '<rootDir>/src/tests/integration/**/*.test.js'
  ],
  moduleNameMapper: {
    // Map external services and controllers to mocks for integration tests
    '../services/amazon.service': '<rootDir>/src/tests/mocks/amazon.service.js',
    '../services/onedrive.service': '<rootDir>/src/tests/mocks/onedrive.service.js',
    '../services/base.service': '<rootDir>/src/tests/mocks/base.service.js',
    '../services/importers/restock.importer': '<rootDir>/src/tests/mocks/importers/restock.importer.js',
    '../services/importers/importer.base': '<rootDir>/src/tests/mocks/importers/importer.base.js',
    '../controllers/import.controller': '<rootDir>/src/tests/mocks/controllers/import.controller.js',
    '@azure/msal-node': '<rootDir>/src/tests/mocks/@azure/msal-node.js',
    'ssh2-sftp-client': '<rootDir>/src/tests/mocks/ssh2-sftp-client.js',
    '../../models': '<rootDir>/src/tests/mocks/models.js',
    '../models': '<rootDir>/src/tests/mocks/models.js',
    '../setup': '<rootDir>/src/tests/setup.js'
  },
  testTimeout: 30000,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!**/*.config.js'
  ]
}; 