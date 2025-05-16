// This file exports the Express app for tests with server tracking for cleanup

// Import the main app file
const app = require('../app');
const http = require('http');

// Create a server but don't start listening
// This creates a server instance that's closeable in tests
const server = http.createServer(app);

// Track server for test cleanup
app.server = server;

// Add helper method to close server if it's open
app.closeServer = function() {
  if (server && server.listening) {
    return new Promise((resolve) => {
      server.close(resolve);
    });
  }
  return Promise.resolve();
};

module.exports = app; 