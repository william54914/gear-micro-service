# Test Structure

This directory contains all test files for the application. The tests are organized as follows:

```
tests/
├── unit/                 # Unit tests for individual components
│   ├── models/          # Model tests
│   ├── services/        # Service tests
│   └── utils/           # Utility function tests
│
├── integration/         # Integration tests
│   ├── api/            # API endpoint tests
│   ├── auth/           # Authentication tests
│   └── external/       # External service integration tests
│
├── e2e/                # End-to-end tests
│   ├── flows/          # Business flow tests
│   └── scenarios/      # Complex scenario tests
│
├── performance/        # Performance tests
│   ├── load/           # Load tests
│   └── stress/         # Stress tests
│
├── fixtures/           # Test fixtures and mock data
├── helpers/            # Test helper functions
└── setup.js           # Global test setup
```

## Test Types

### Unit Tests
- Test individual components in isolation
- Mock external dependencies
- Fast execution

### Integration Tests
- Test component interactions
- Use test database
- Test API endpoints
- Test external service integrations

### End-to-End Tests
- Test complete business flows
- Simulate real user scenarios
- Use test environment

### Performance Tests
- Load testing (normal conditions)
- Stress testing (extreme conditions)
- Benchmark critical operations

## Running Tests

```bash
# Run all tests
npm test

# Run specific test type
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:performance

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Test Guidelines

1. **Naming Convention**:
   - Files: `*.test.js`
   - Describe blocks: Feature or component name
   - Test cases: Should describe expected behavior

2. **Structure**:
   - Setup test data in `beforeAll` or `beforeEach`
   - Clean up in `afterAll` or `afterEach`
   - Use test helpers for common operations

3. **Best Practices**:
   - One assertion per test when possible
   - Use meaningful test descriptions
   - Keep tests focused and atomic
   - Use appropriate test type for the task

4. **Mocking**:
   - Mock external services in unit tests
   - Use fixtures for complex test data
   - Document mock behavior

5. **Coverage**:
   - Maintain minimum 80% coverage
   - Focus on critical paths
   - Document uncovered edge cases 