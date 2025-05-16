const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Failed to load .env file:', result.error);
  console.error('Attempted to load from path:', envPath);
  throw new Error('Failed to load .env file. Please ensure it exists and is accessible.');
}

// Helper functions for validation
const isValidPort = (port) => {
  const portNum = parseInt(port, 10);
  return !isNaN(portNum) && portNum > 0 && portNum <= 65535;
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Define required variables for each service
const requiredVariables = {
  database: {
    variables: ['DB_NAME', 'DB_USER', 'DB_PASS', 'DB_HOST', 'DB_PORT'],
    validate: (env) => {
      if (!isValidPort(env.DB_PORT)) {
        throw new Error('DB_PORT must be a valid port number between 1 and 65535');
      }
    }
  },
  amazon: {
    variables: [
      'AMAZON_CLIENT_ID',
      'AMAZON_CLIENT_SECRET',
      'AMAZON_REFRESH_TOKEN',
      'AWS_ACCESS_KEY',
      'AWS_SECRET_KEY',
      'AWS_REGION'
    ],
    validate: (env) => {
      const validRegions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];
      if (!validRegions.includes(env.AWS_REGION)) {
        throw new Error(`AWS_REGION must be one of: ${validRegions.join(', ')}`);
      }
    }
  },
  ls2: {
    variables: ['LS2_FTP_HOST', 'LS2_FTP_USER', 'LS2_FTP_PASS', 'LS2_FTP_PORT'],
    validate: (env) => {
      if (!isValidPort(env.LS2_FTP_PORT)) {
        throw new Error('LS2_FTP_PORT must be a valid port number between 1 and 65535');
      }
    }
  },
  onedrive: {
    variables: [
      'ONEDRIVE_CLIENT_ID',
      'ONEDRIVE_CLIENT_SECRET',
      'ONEDRIVE_TENANT_ID',
      'ONEDRIVE_USER_EMAIL'
    ],
    validate: (env) => {
      if (!env.ONEDRIVE_USER_EMAIL.includes('@')) {
        throw new Error('ONEDRIVE_USER_EMAIL must be a valid email address');
      }
    }
  }
};

// Change how validation works to make it less strict for testing
function validateEnv(service) {
  if (!requiredVariables[service]) {
    throw new Error(`Unknown service: ${service}`);
  }

  const { variables, validate } = requiredVariables[service];
  
  // If we're in test mode and dealing with external services, be more lenient
  const isTestEnv = process.env.NODE_ENV === 'test';
  const isExternalService = ['ls2', 'amazon', 'onedrive'].includes(service);
  
  // Only enforce required variables in production or for core services like database
  if (!isTestEnv || !isExternalService) {
    const missing = variables.filter(
      variable => typeof process.env[variable] === 'undefined' || process.env[variable] === ''
    );

    if (missing.length > 0) {
      console.error(`Missing or empty ${service} environment variables:`, missing);
      console.error('Current environment variables loaded from:', envPath);
      throw new Error(`Missing required ${service} environment variables: ${missing.join(', ')}`);
    }
  }

  // Skip validation in test environment for external services
  if (isTestEnv && isExternalService && validate) {
    return; // Skip validation in test mode for external services
  }
  
  // Run service-specific validation if it exists
  if (validate) {
    validate(process.env);
  }
}

// Get database URL for Prisma
function getDatabaseUrl() {
  validateEnv('database');
  return `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?schema=public`;
}

// Mock configuration for test environment
const testConfig = {
  port: 3000,
  database: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  },
  jwt: {
    secret: 'test-secret',
    expiresIn: '1h'
  },
  amazon: {
    region: 'us-east-1',
    refreshToken: 'test-refresh-token',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    accessKeyId: 'test-access-key',
    secretAccessKey: 'test-secret-key',
    roleArn: 'test-role-arn',
    marketplaceId: 'test-marketplace-id'
  }
};

// Export configuration based on environment
module.exports = (
  process.env.NODE_ENV === 'test' &&
  !process.env.FORCE_ONEDRIVE_REAL &&
  !process.env.FORCE_LS2_REAL &&
  !process.env.FORCE_AMAZON_REAL
) ? testConfig : {
  // JWT config
  jwt: {
    secret: process.env.SECRET_KEY || 'dev-secret-key',
    expiresIn: '24h'
  },
  
  // Database config
  database: {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    url: getDatabaseUrl,
    validate: () => validateEnv('database')
  },

  // Amazon config
  amazon: {
    clientId: process.env.AMAZON_CLIENT_ID,
    clientSecret: process.env.AMAZON_CLIENT_SECRET,
    refreshToken: process.env.AMAZON_REFRESH_TOKEN,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY,
    awsSecretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    validate: () => validateEnv('amazon')
  },

  // LS2 FTP config
  ls2: {
    host: process.env.LS2_FTP_HOST,
    user: process.env.LS2_FTP_USER,
    password: process.env.LS2_FTP_PASS,
    port: process.env.LS2_FTP_PORT,
    validate: () => validateEnv('ls2')
  },

  // OneDrive config
  onedrive: {
    clientId: process.env.ONEDRIVE_CLIENT_ID,
    clientSecret: process.env.ONEDRIVE_CLIENT_SECRET,
    tenantId: process.env.ONEDRIVE_TENANT_ID,
    userEmail: process.env.ONEDRIVE_USER_EMAIL,
    validate: () => validateEnv('onedrive')
  },

  // Environment info
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  },

  // Validate all configurations
  validateAll: function() {
    const services = Object.keys(requiredVariables);
    const errors = [];
    
    services.forEach(service => {
      try {
        this[service].validate();
      } catch (error) {
        errors.push(error.message);
      }
    });

    if (errors.length > 0) {
      throw new Error('Configuration validation failed:\n' + errors.join('\n'));
    }
  }
}; 