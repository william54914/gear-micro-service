/**
 * Mock for k6/http module used in performance tests
 */

module.exports = {
  get: jest.fn(() => ({
    status: 200,
    json: () => ({ data: 'mocked data' }),
    headers: {},
    timings: {
      duration: 100,
      blocked: 0,
      waiting: 100,
      receiving: 0,
      sending: 0,
      connecting: 0,
      tls_handshaking: 0,
      dns: 0
    }
  })),
  post: jest.fn(() => ({
    status: 201,
    json: () => ({ data: 'mocked data' }),
    headers: {},
    timings: {
      duration: 100,
      blocked: 0,
      waiting: 100,
      receiving: 0,
      sending: 0,
      connecting: 0,
      tls_handshaking: 0,
      dns: 0
    }
  })),
  put: jest.fn(() => ({
    status: 200,
    json: () => ({ data: 'mocked data' }),
    headers: {},
    timings: {
      duration: 100,
      blocked: 0,
      waiting: 100,
      receiving: 0,
      sending: 0,
      connecting: 0,
      tls_handshaking: 0,
      dns: 0
    }
  })),
  del: jest.fn(() => ({
    status: 204,
    headers: {},
    timings: {
      duration: 100,
      blocked: 0,
      waiting: 100,
      receiving: 0,
      sending: 0,
      connecting: 0,
      tls_handshaking: 0,
      dns: 0
    }
  })),
  batch: jest.fn(() => [
    {
      status: 200,
      json: () => ({ data: 'mocked data' }),
      headers: {},
      timings: {
        duration: 100,
        blocked: 0,
        waiting: 100,
        receiving: 0,
        sending: 0,
        connecting: 0,
        tls_handshaking: 0,
        dns: 0
      }
    }
  ])
}; 