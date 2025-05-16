# Gear Microservice API

A robust Node.js microservice for managing vendor products, inventory, and marketplace integrations. Built with Express.js, Sequelize ORM, and PostgreSQL.

## Features

- **User Management**
  - Role-based authentication (Admin, Manager, User)
  - JWT-based authentication
  - Password reset functionality
  - Profile management

- **Vendor Management**
  - Vendor CRUD operations
  - Brand management
  - Product catalog
  - Inventory tracking

- **Marketplace Integration**
  - Amazon SP-API integration
  - Inventory sync
  - Price management
  - Order processing

- **File Management**
  - FTP/SFTP support
  - OneDrive integration
  - Bulk import/export

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn
- Git

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL, Sequelize ORM
- **Authentication**: JWT, bcrypt
- **Validation**: Joi
- **Testing**: Jest, Supertest
- **Documentation**: Swagger/OpenAPI

## Project Structure

```
.
├── src/
│   ├── config/         # Configuration files
│   │   ├── env.js     # Environment configuration
│   │   └── database.js # Database configuration
│   ├── controllers/    # Request handlers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── schemas/       # Validation schemas
│   ├── middleware/    # Custom middleware
│   ├── migrations/    # Database migrations
│   └── tests/         # Test files
│       ├── unit/     # Unit tests
│       ├── integration/ # Integration tests
│       ├── e2e/      # End-to-end tests
│       ├── performance/ # Performance tests
│       ├── fixtures/ # Test fixtures and mock data
│       ├── helpers/  # Test helper functions
│       ├── db/       # Database test utilities
│       ├── utils/    # Test utilities
│       ├── setup.js  # Global test setup
│       ├── jest.unit.config.js # Unit test configuration
│       ├── jest.integration.config.js # Integration test configuration
│       └── jest.e2e.config.js # E2E test configuration
├── scripts/           # Utility scripts
└── docs/             # Documentation
```

## Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd gear-microservice
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Server
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your-secret-key

   # Database
   DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASS=your_password
   DB_HOST=localhost
   DB_PORT=5432

   # Amazon SP-API
   AMAZON_CLIENT_ID=your_client_id
   AMAZON_CLIENT_SECRET=your_client_secret
   AMAZON_REFRESH_TOKEN=your_refresh_token
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AMAZON_ROLE_ARN=your_role_arn
   AMAZON_REGION=us-east-1

   # OneDrive
   ONEDRIVE_CLIENT_ID=your_client_id
   ONEDRIVE_CLIENT_SECRET=your_client_secret
   ONEDRIVE_TENANT_ID=your_tenant_id
   ONEDRIVE_USER_EMAIL=your@email.com

   # LS2 FTP
   LS2_FTP_HOST=ftp.ls2.com
   LS2_FTP_USER=your_user
   LS2_FTP_PASS=your_password
   LS2_FTP_PORT=21
   ```

4. **Database Setup**
   ```bash
   # Run migrations
   npm run migrate

   # Seed initial data (if needed)
   npm run seed
   ```

## Running the Application

**Development Mode**:
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

## API Documentation

### Authentication Endpoints
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `POST /api/users/password/reset-request` - Request password reset
- `POST /api/users/password/reset` - Reset password

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Update password

### Vendor Endpoints
- `GET /api/vendors` - List vendors
- `POST /api/vendors` - Create vendor
- `GET /api/vendors/:id` - Get vendor
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

### Product Endpoints
- `GET /api/vendors/:vendorId/products` - List vendor products
- `POST /api/vendors/products` - Create product
- `PUT /api/vendors/products/:id` - Update product
- `DELETE /api/vendors/products/:id` - Delete product

### Amazon Integration
- `GET /api/amazon/inventory` - Get Amazon inventory
- `GET /api/amazon/listings` - Get Amazon listings
- `POST /api/amazon/import` - Import listings

### File Management
- `POST /api/ftp/upload` - Upload file via FTP
- `GET /api/onedrive/files` - List OneDrive files

## Testing

The project uses Jest as the primary testing framework with different configurations for various test types.

### Test Structure

Tests are organized in the following directory structure:

```
src/tests/
├── unit/            # Tests for individual components in isolation
├── integration/     # Tests for component interactions and API endpoints
├── e2e/             # End-to-end tests for complete business flows
├── performance/     # Load and stress tests
├── fixtures/        # Test fixtures and mock data
├── helpers/         # Test helper functions
├── db/              # Database test utilities
└── utils/           # General test utilities
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:performance

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- src/tests/unit/services/user.test.js
```

### Test Configurations

- **Unit Tests**: Fast tests that verify individual components in isolation with mocked dependencies
- **Integration Tests**: Tests API endpoints and component interactions using a test database
- **E2E Tests**: Tests complete business flows simulating real user scenarios
- **Performance Tests**: Load and stress tests to benchmark system performance

Each test type has its own Jest configuration file:
- `src/tests/jest.unit.config.js`
- `src/tests/jest.integration.config.js`
- `src/tests/jest.e2e.config.js`

### Code Coverage

The project maintains a minimum of 80% code coverage across all files, with coverage reports generated using Jest's built-in coverage reporter.

## Error Handling

The API uses standard HTTP response codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

Error response format:
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "details": {} // Optional additional information
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 