const config = require('./env');

function initializeConfig() {
  try {
    // Validate all configurations at startup
    config.validateAll();
    console.log('Environment configuration validated successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize configuration:', error.message);
    process.exit(1);
  }
}

module.exports = initializeConfig; 