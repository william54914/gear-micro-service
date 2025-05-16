const config = require('./env');

// Validate Amazon config before exporting
config.amazon.validate();

module.exports = {
  clientId: config.amazon.clientId,
  clientSecret: config.amazon.clientSecret,
  refreshToken: config.amazon.refreshToken,
  awsAccessKeyId: config.amazon.awsAccessKeyId,
  awsSecretAccessKey: config.amazon.awsSecretAccessKey,
  roleArn: config.amazon.roleArn,
  region: config.amazon.region
}; 