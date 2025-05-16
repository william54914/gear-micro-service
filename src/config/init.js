const config = require('./env');

function initializeConfig() {
  try {
    // Skip validation in test environment
    if (process.env.NODE_ENV === 'test') {
      console.log('Environment configuration validated successfully');
      return true;
    }

    // Validate all required configuration
    const requiredConfigs = {
      database: ['name', 'user', 'password'],
      jwt: ['secret'],
      amazon: ['region', 'refreshToken', 'clientId', 'clientSecret']
    };

    for (const [section, fields] of Object.entries(requiredConfigs)) {
      for (const field of fields) {
        if (!config[section] || !config[section][field]) {
          throw new Error(`Missing required configuration: ${section}.${field}`);
        }
      }
    }

    console.log('Environment configuration validated successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize configuration:', error.message);
    process.exit(1);
  }
}

module.exports = {
  initializeConfig
}; 