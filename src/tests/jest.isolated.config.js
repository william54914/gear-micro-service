module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/isolated.test.js',
    '**/isolated-user.test.js'
  ],
  // No setup files to avoid database connection
  setupFilesAfterEnv: [],
  verbose: true,
  rootDir: '../../'
}; 