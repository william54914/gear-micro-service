/**
 * Mock for k6/metrics module used in performance tests
 */

module.exports = {
  Trend: jest.fn(() => ({
    add: jest.fn()
  })),
  Counter: jest.fn(() => ({
    add: jest.fn()
  })),
  Gauge: jest.fn(() => ({
    add: jest.fn()
  })),
  Rate: jest.fn(() => ({
    add: jest.fn()
  }))
}; 