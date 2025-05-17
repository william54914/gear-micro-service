# Gear Microservice API

A robust Node.js microservice for managing vendor products, inventory, and marketplace integrations. Built with Express.js, Sequelize ORM, and PostgreSQL.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Tech Stack](#tech-stack)
- [Dependencies](#dependencies)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Configuration](#configuration)
- [Available Scripts](#available-scripts)
- [Current Project Status](#current-project-status)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Vendor Data Fields Not Currently Implemented](#vendor-data-fields-not-currently-implemented)
- [Recent Changes - Bell Import Integration](#recent-changes---bell-import-integration)
- [Data Importers](#data-importers)

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
  - FTP/SFTP support for multiple vendors (LS2, PartsUnlimited, HelmetHouse)
  - OneDrive integration
  - Bulk import/export
  - CSV processing

## Architecture Overview

### Application Flow
```
Client Request → Express Router → Middleware → Controller → Service → Model → Database
     ↑                                                           ↓
     └───────────────── Response ────────────────────────────────┘
```

### Key Components
- **Controllers** (`src/controllers/`): Handle HTTP requests and responses
- **Services** (`src/services/`): Contain business logic and external service integration
- **Models** (`src/models/`): Define database schema and relationships
- **Middleware** (`src/middleware/`): Request processing, authentication, logging
- **Routes** (`src/routes/`): API endpoint definitions
- **Schemas** (`src/schemas/`): Request/response validation schemas
- **Config** (`src/config/`): Application configuration
- **Scripts** (`src/scripts/`): Utility and maintenance scripts

### External Service Integration
```
                     ┌─── Amazon SP-API
                     │
Gear Microservice ───┼─── OneDrive API
                     │
                     └─── FTP Services (LS2, PartsUnlimited, HelmetHouse)
```

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
- **Testing**: Jest, Supertest, K6 for performance testing
- **Documentation**: OpenAPI/Swagger
- **Cloud Integration**: Microsoft Graph API, Amazon SP-API
- **File Transfer**: Basic-FTP, SSH2-SFTP-Client

## Dependencies

### Core Dependencies
```json
{
  "@microsoft/microsoft-graph-client": "^3.0.7",  // Microsoft Graph API integration
  "api": "^6.1.3",                               // API client utilities
  "aws4": "^1.13.2",                            // AWS request signing
  "basic-ftp": "^5.0.5",                        // FTP client
  "bcrypt": "^6.0.0",                           // Password hashing (native)
  "bcryptjs": "^2.4.3",                         // Password hashing (JS implementation)
  "cors": "^2.8.5",                             // Cross-Origin Resource Sharing
  "csv-parser": "^3.2.0",                       // CSV file processing
  "dotenv": "^16.3.1",                          // Environment variables management
  "express": "^4.18.2",                         // Web framework
  "ftp": "^0.3.10",                             // FTP client (legacy support)
  "helmet": "^7.1.0",                           // Security headers
  "isomorphic-fetch": "^3.0.0",                 // Universal fetch API
  "joi": "^17.11.0",                            // Data validation
  "jsonwebtoken": "^9.0.2",                     // JWT authentication
  "morgan": "^1.10.0",                          // HTTP request logger
  "oas": "^20.11.0",                            // OpenAPI/Swagger support
  "pg": "^8.11.3",                              // PostgreSQL client
  "sequelize": "^6.37.7",                       // ORM for database
  "ssh2-sftp-client": "^12.0.0",                // SFTP client
  "xlsx": "^0.18.5"                             // Excel file processing
}
```

### Development Dependencies
```json
{
  "@types/jest": "^29.5.10",                    // TypeScript definitions for Jest
  "artillery": "^2.0.0-38",                     // Load testing
  "cross-env": "^7.0.3",                        // Cross-platform env variables
  "eslint": "^8.54.0",                          // Code linting
  "eslint-config-prettier": "^9.0.0",           // Prettier integration
  "eslint-plugin-jest": "^27.6.0",              // Jest linting rules
  "jest": "^29.7.0",                            // Testing framework
  "k6": "^0.0.0",                               // Performance testing
  "nodemon": "^3.0.1",                          // Development auto-reload
  "prettier": "^3.1.0",                         // Code formatting
  "sequelize-mock": "^0.10.2",                  // Database mocking
  "sqlite3": "^5.1.7",                          // SQLite for testing
  "supertest": "^6.3.4",                        // HTTP testing
  "umzug": "^3.8.2"                             // Migration management
}
```

### Global Dependencies
These need to be installed globally on your system:
```bash
npm install -g sequelize-cli    # Sequelize command line interface
npm install -g k6              # K6 performance testing tool
npm install -g artillery       # Artillery for load testing
```

## Project Structure

```
.
├── .api/                # API specifications and documentation
│   └── apis/
│       └── sp-api/     # Amazon SP-API specifications
├── src/
│   ├── config/         # Configuration files
│   │   ├── database.js # Database configuration
│   │   ├── logger.js   # Logging configuration
│   │   └── app.js      # Application configuration
│   ├── controllers/    # Request handlers
│   │   ├── user.controller.js
│   │   ├── vendor.controller.js
│   │   └── import.controller.js
│   ├── models/        # Database models
│   │   ├── base.model.js  # Base model with common functionality
│   │   ├── index.js   # Model associations
│   │   ├── User.js    # User and authentication
│   │   ├── UserRole.js # Role definitions
│   │   └── UserPermission.js # User-Role associations
│   ├── services/      # Business logic
│   │   ├── base.service.js  # Base service class
│   │   ├── amazon.service.js # Amazon SP-API integration
│   │   ├── amazonDb.service.js # Amazon data management
│   │   ├── onedrive.service.js # OneDrive integration
│   │   ├── ftp/      # FTP services
│   │   │   ├── ftp.service.js    # Base FTP functionality
│   │   │   ├── sftp.service.js   # SFTP functionality
│   │   │   ├── ftp.vendor.service.js # Vendor FTP base
│   │   │   ├── ftp.ls2.service.js    # LS2 specific
│   │   │   ├── ftp.partsunlimited.service.js
│   │   │   └── ftp.helmethouse.service.js
│   │   └── importers/ # Data import services
│   │       ├── importer.base.js   # Base importer
│   │       └── restock.importer.js # Restock specific
│   ├── schemas/       # Validation schemas
│   │   ├── user.schema.js
│   │   └── vendor.schema.js
│   ├── middleware/    # Custom middleware
│   │   ├── auth.js    # Authentication middleware
│   │   ├── error.js   # Error handling
│   │   └── validation.js # Request validation
│   ├── migrations/    # Database migrations
│   └── tests/         # Test files
│       ├── unit/      # Unit tests
│       │   ├── models/
│       │   ├── services/
│       │   └── utils/
│       ├── integration/ # Integration tests
│       │   ├── api/
│       │   ├── auth/
│       │   └── external/
│       ├── e2e/       # End-to-end tests
│       │   ├── flows/
│       │   └── scenarios/
│       ├── performance/ # Performance tests
│       │   ├── load/   # Load testing scenarios
│       │   └── stress/ # Stress testing scenarios
│       ├── fixtures/  # Test fixtures
│       ├── helpers/   # Test helpers
│       ├── mocks/     # Mock data and services
│       │   ├── @azure/
│       │   ├── controllers/
│       │   ├── importers/
│       │   └── k6/
│       ├── real-connections/ # Real API connection tests
│       └── utils/     # Test utilities
├── coverage/         # Test coverage reports
├── test-results/    # Test execution results
├── tmp/             # Temporary files
└── docs/            # Documentation
    ├── api/         # API documentation
    └── setup/       # Setup guides
```

## Configuration

### Environment Variables
All environment variables should be set in a `.env` file. See [Setup](#setup) section for the complete list.

### Configuration Files
- `src/config/database.js`: Database connection and options
- `src/config/logger.js`: Logging configuration
- `src/config/app.js`: Application settings

### Logging
The application uses Morgan for HTTP request logging and a custom logger for application logs:
- Access logs: All HTTP requests
- Error logs: Application errors and exceptions
- Debug logs: Development debugging information

## Database

### Entity Relationship Diagram
```
Vendor ─┬─── VendorBrand ─── VendorProduct ─┬─── VendorProductAttributes
        │                                   ├─── VendorProductDimensions
        │                                   ├─── VendorProductImages
        │                                   ├─── VendorProductInventory
        │                                   ├─── VendorProductPricing
        │                                   ├─── VendorVehicleCompatibility
        │                                   └─── VendorDistributorInfo

Amazon ─┬─── AmazonVitals
        ├─── AmazonInfo
        ├─── AmazonPrice
        ├─── AmazonQuantity
        └─── AmazonZShop

Restock ─┬─── RestockVitals
         ├─── RestockInfo
         └─── RestockCost
```

### Models
- **Vendor**: Core vendor information
- **VendorBrand**: Brand management for vendors
- **VendorProduct**: Product catalog (no cost field - cost info in pricing)
- **VendorProductAttributes**: Product attributes (color, size, etc.)
- **VendorProductDimensions**: Physical dimensions and weights
- **VendorProductImages**: Product images and media
- **VendorProductInventory**: Stock levels and tracking
- **VendorProductPricing**: Pricing information including cost
- **VendorVehicleCompatibility**: Vehicle fitment data
- **VendorDistributorInfo**: Distributor-specific information

- **Amazon Models**:
  - **AmazonVitals**: Core Amazon product data
  - **AmazonInfo**: Detailed product information
  - **AmazonPrice**: Pricing data
  - **AmazonQuantity**: Inventory levels
  - **AmazonZShop**: Amazon storefront data

- **Restock Models**:
  - **RestockVitals**: Core restock product data
  - **RestockInfo**: Detailed product information
  - **RestockCost**: Cost information

### Data Processing
The application processes data in optimized batch sizes based on available system resources:
- Default batch size: 5000 records
- Configurable via environment variables
- Optimized for systems with 64GB+ RAM
- Transaction-based processing for data integrity

### Migrations
Located in `src/migrations/`. Run in sequence using:
```bash
npm run migrate
```

## Security

### Authentication
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt

### API Security
- CORS configuration
- Rate limiting
- Helmet security headers
- Input validation with Joi

### Best Practices
- Environment variable management
- Secure password storage
- API key rotation
- Error handling without information leakage

## Troubleshooting

### Common Issues
1. **Database Connection Issues**
   ```bash
   npm run test:connections
   ```
   Check database credentials in `.env`

2. **Import Failures**
   - Verify FTP/API credentials
   - Check file permissions
   - Review import logs in `logs/import/`

3. **Authentication Issues**
   - Verify JWT_SECRET in `.env`
   - Check token expiration
   - Confirm user roles

### Debugging
- Enable debug logs: `DEBUG=app:* npm run dev`
- Check application logs: `logs/app.log`
- Monitor HTTP requests: `logs/access.log`

## Deployment

### Prerequisites
- Node.js environment
- PostgreSQL database
- Environment variables configured
- Network access to external services

### Deployment Steps
1. Clone repository
2. Install dependencies
3. Configure environment
4. Run migrations
5. Start application

### Production Considerations
- Use PM2 or similar process manager
- Configure SSL/TLS
- Set up monitoring
- Configure backup strategy

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

   # Other Vendor FTP Settings
   PARTS_UNLIMITED_FTP_HOST=your_host
   HELMETHOUSE_FTP_HOST=your_host
   ```

## Available Scripts

```bash
# Development
npm run dev           # Run in development mode with nodemon
npm start            # Run in production mode

# Database
npm run migrate      # Run database migrations
npm run migrate:undo # Undo last migration
npm run seed         # Seed database with initial data

# Testing
npm test            # Run all tests
npm run test:unit   # Run unit tests
npm run test:integration # Run integration tests
npm run test:e2e    # Run end-to-end tests
npm run test:performance # Run performance tests
npm run test:k6     # Run K6 performance tests
npm run test:coverage # Run tests with coverage
npm run test:watch  # Run tests in watch mode
npm run test:clean  # Clear Jest cache

# Import and Data Management
npm run import:all  # Import data from all sources (Amazon, LS2, Restock)
npm run test:connections # Test all external service connections
npm run reset:db    # Reset database and re-run migrations

# Code Quality
npm run lint        # Run ESLint
npm run lint:fix    # Fix linting issues
```

## Current Project Status

### Testing Implementation Status
The testing framework is currently in development. Here's the current status:

- ✅ Test framework setup complete
- ✅ Basic unit test structure in place
- ✅ Connection testing utilities implemented
- 🚧 E2E tests (in progress)
- 🚧 Integration tests (in progress)
- 🚧 Performance tests (initial K6 setup done)
- ❌ Complete test coverage not yet achieved

### Data Import and Migration Status
The project includes several data import and migration utilities:

- **Import Scripts**: Located in `src/scripts/import/`
  - Amazon SP-API direct import
  - LS2 FTP file import
  - Restock data from OneDrive
  - Note: These scripts are functional but may require environment-specific configuration

- **Connection Testing**: 
  - Use `npm run test:connections` to verify connectivity to:
    - Amazon SP-API
    - OneDrive
    - FTP servers (LS2, PartsUnlimited, HelmetHouse)
    - Database
  - This should be run before attempting any imports

- **Database Reset**:
  - The `npm run reset:db` command will:
    - Drop all tables
    - Re-run migrations
    - Note: Use with caution in production environments

### Known Limitations
- Test coverage is not yet complete across all modules
- Some E2E tests are still being developed
- Performance testing scenarios need to be expanded
- Import scripts may require adjustment based on vendor API changes

## API Documentation

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### User Management
- `GET /api/users` - List all users (Admin only)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Vendor Management
- `GET /api/vendors` - List all vendors
- `POST /api/vendors` - Create vendor
- `GET /api/vendors/:id` - Get vendor details
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor
- `GET /api/vendors/:vendorId/brands` - List vendor brands
- `GET /api/vendors/:vendorId/products` - List vendor products

### Amazon Integration
- `GET /api/amazon/inventory` - Get Amazon inventory
- `GET /api/amazon/listings` - Get Amazon listings
- `GET /api/amazon/listings/:sku` - Get listing by SKU
- `POST /api/amazon/import` - Import Amazon listings

### OneDrive Integration
- `GET /api/onedrive/folders` - List OneDrive folders
- `GET /api/onedrive/files/:folderId` - List files in folder
- `GET /api/onedrive/folders/:path` - Find folder by path
- `GET /api/onedrive/import-restock` - Import restock data

### FTP Management
- `GET /api/ftp/partsunlimited` - List PartsUnlimited files
- `GET /api/ftp/helmethouse` - List HelmetHouse files
- `GET /api/ftp/vendor/files` - List vendor files
- `POST /api/ftp/vendor/import/all` - Import all vendor files
- `GET /api/ftp/ls2/files` - List LS2 files
- `GET /api/ftp/ls2/latest` - Get latest LS2 price file

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

## Testing

The project uses Jest as the primary testing framework with different configurations for various test types:

- **Unit Tests**: Test individual components in isolation (partially implemented)
- **Integration Tests**: Test API endpoints and component interactions (in development)
- **E2E Tests**: Test complete business flows (in development)
- **Performance Tests**: Load and stress tests using K6 (basic setup complete)

> ⚠️ Note: The testing framework is still under active development. Some test files may be placeholder or incomplete.

### Running Tests During Development
During development, it's recommended to:
1. Run `npm run test:connections` first to ensure all external services are accessible
2. Use `npm run test:watch` for active development
3. Run `npm test` before committing changes

Coverage requirements (target, not yet enforced):
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Component Overview

### Controllers (`src/controllers/`)
Controllers handle the HTTP layer of the application, processing requests and sending responses. They:
- Receive HTTP requests from routes
- Extract and validate request data
- Call appropriate services to handle business logic
- Format and send responses
- Handle request-specific error cases

Key controllers:
- `user.controller.js`: User registration, authentication, profile management
- `vendor.controller.js`: Vendor CRUD operations, brand management
- `import.controller.js`: Handles data import from various sources
- `amazon.controller.js`: Amazon SP-API specific operations

### Middleware (`src/middleware/`)
Middleware functions process requests before they reach route handlers. They:
- Execute code before/after requests
- Modify request/response objects
- End request-response cycles
- Call next middleware

Key middleware:
- `auth.js`: JWT authentication and role verification
- `error.js`: Global error handling and formatting
- `validation.js`: Request data validation using Joi schemas
- `logger.js`: Request logging and tracking

### Models (`src/models/`)
Models define database structure and business rules. Using Sequelize ORM, they:
- Define table schemas
- Set up relationships between tables
- Handle data validation
- Manage database operations

Key models:
- `user.js`: User account data and relationships
- `vendor.js`: Vendor information and product relationships
- `product.js`: Product catalog and inventory
- `brand.js`: Brand management and vendor associations

### Migrations (`src/migrations/`)
Database migrations manage schema changes over time. They:
- Create/modify database tables
- Add/remove columns
- Set up indexes and constraints
- Handle data transformations

Migration patterns:
- Numbered sequentially (e.g., `001-create-users.js`)
- Include both `up` (apply) and `down` (revert) functions
- Maintain database version control
- Support team collaboration on schema changes

### Routes (`src/routes/`)
Routes define API endpoints and map them to controllers. They:
- Define URL patterns
- Specify HTTP methods (GET, POST, etc.)
- Chain relevant middleware
- Direct requests to appropriate controllers

Key route files:
- `user.routes.js`: User-related endpoints
- `vendor.routes.js`: Vendor management endpoints
- `amazon.routes.js`: Amazon integration endpoints
- `onedrive.routes.js`: OneDrive integration endpoints
- `ftp.routes.js`: FTP service endpoints

### Schemas (`src/schemas/`)
Validation schemas define expected data structures. Using Joi, they:
- Validate request payloads
- Define required/optional fields
- Set data type constraints
- Provide custom validation rules

Key schemas:
- `user.schema.js`: User registration and update validation
- `vendor.schema.js`: Vendor data validation
- `product.schema.js`: Product data validation
- `import.schema.js`: Import data validation

### Services (`src/services/`)
Services contain core business logic and external integrations. They:
- Implement business rules
- Handle complex operations
- Manage external API calls
- Process data transformations

Key service categories:
- **FTP Services** (`services/ftp/`):
  - `ls2.service.js`: LS2 vendor file processing
  - `partsunlimited.service.js`: PartsUnlimited integration
  - `helmethouse.service.js`: HelmetHouse data handling

- **Importers** (`services/importers/`):
  - `amazon.importer.js`: Amazon SP-API data import
  - `restock.importer.js`: Restock data processing
  - `vendor.importer.js`: Generic vendor data import

- **External Services**:
  - `onedrive.service.js`: Microsoft OneDrive integration
  - `amazon.service.js`: Amazon SP-API operations
  - `notification.service.js`: Email/notification handling

### Config (`src/config/`)
Configuration files manage application settings. They:
- Load environment variables
- Set up database connections
- Configure external services
- Define application constants

Key config files:
- `database.js`: Database connection and Sequelize setup
- `logger.js`: Logging configuration and formats
- `app.js`: Express application settings
- `auth.js`: Authentication configuration

### Scripts (`src/scripts/`)
Utility scripts automate common tasks. They handle:
- Data imports
- Database operations
- Deployment tasks
- Maintenance operations

Key script categories:
- **Import Scripts** (`scripts/import/`):
  - Amazon data import
  - LS2 file processing
  - Restock data import
  
- **Database Scripts**:
  - Table reset
  - Data seeding
  - Backup/restore

## User System

### User Roles and Permissions
The application implements a flexible role-based access control (RBAC) system:

#### Roles
- **Admin**: Full system access
- **Manager**: Product and vendor management
- **User**: Basic access and viewing rights

#### User Model Features
- Secure password hashing with bcrypt
- Password reset functionality
- JWT-based authentication
- Last login tracking
- Profile management
- Role-based access control

#### User-Role Relationships
- Many-to-many relationship between Users and Roles
- Managed through UserPermission junction table
- Flexible role assignment and revocation
- Role-based middleware for route protection

### Database Schema Updates

#### User Tables
```sql
users
  ├── user_id (PK)
  ├── username (unique)
  ├── email (unique)
  ├── password_hash
  ├── first_name
  ├── last_name
  ├── role (enum: admin, manager, user)
  ├── active
  ├── last_login_at
  ├── password_reset_token
  ├── password_reset_expires
  ├── created_at
  └── updated_at

user_roles
  ├── role_id (PK)
  ├── role_name (unique)
  ├── active
  ├── created_at
  └── updated_at

user_permissions
  ├── permission_id (PK)
  ├── user_id (FK)
  ├── role_id (FK)
  ├── active
  ├── created_at
  └── updated_at
```

## Services

### Core Services
- **Base Service**: Abstract base class with common functionality
- **Amazon Service**: SP-API integration and marketplace management
- **AmazonDB Service**: Database operations for Amazon data
- **OneDrive Service**: Microsoft Graph API integration

### FTP Services
- **Base FTP Service**: Common FTP operations
- **SFTP Service**: Secure FTP functionality
- **Vendor FTP Service**: Base class for vendor-specific FTP
- **LS2 FTP Service**: LS2-specific file handling
- **PartsUnlimited FTP Service**: PartsUnlimited integration
- **HelmetHouse FTP Service**: HelmetHouse integration

### Import Services
- **Base Importer**: Common import functionality
- **Restock Importer**: Restock-specific import logic

## Testing

### Test Structure
```
tests/
├── unit/           # Unit tests for isolated components
├── integration/    # API and service integration tests
├── e2e/           # End-to-end flow testing
├── performance/    # Load and stress testing
├── real-connections/ # External API connection tests
└── mocks/         # Mock implementations
```

### Test Categories
- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Complete flow testing
- **Performance Tests**: Load and stress testing
- **Connection Tests**: External service connectivity
- **Mock Tests**: Testing with mock data

### Testing Tools
- Jest for unit and integration testing
- Supertest for HTTP endpoint testing
- K6 for performance testing
- Custom utilities for connection testing

## Vendor Integrations

### Supported Vendors
The system currently supports the following vendors:

#### LS2 Helmets
- Integration Type: FTP
- File Format: CSV
- Update Frequency: Daily
- Product Types: Helmets, Accessories
- Status: Active

#### Bell Powersports
- Integration Type: OneDrive
- File Format: Excel (.xlsx)
- Update Frequency: As needed
- Product Types: Helmets, Accessories
- Source Path: `Vendor Files/Bell` (uses first Excel file found in folder)
- Status: Active

#### PartsUnlimited (Placeholder)
- Integration Type: SFTP
- File Format: CSV
- Update Frequency: Daily
- Status: Not Implemented - Basic structure in place for future integration

#### HelmetHouse (Placeholder)
- Integration Type: FTP
- File Format: CSV
- Update Frequency: Daily
- Status: Not Implemented - Basic structure in place for future integration

### Import Process
Each vendor's data is imported through a standardized process:
1. Vendor record creation/verification
2. Brand association
3. Source file detection (first file of correct type in vendor folder)
4. Product import with standardized field mappings
5. Distributor information updates
6. Inventory tracking
7. Price management

### Vendor Data Fields
Standard field mappings across vendors:
- Vendor SKU → vendor_sku
- Manufacturer Part → mfg_part
- Product Name/Description → vendor_product_name
- UPC/EAN → upc
- MSRP → msrp
- MAP Price → map_price
- Cost → cost (in distributor_info)
- Inventory → inventory_east, inventory_midwest, inventory_west

### Vendor-Specific Fields Not Currently Implemented
The following vendor-specific fields are available in source data but not currently imported:

#### Bell Powersports
- MODEL: Product model line (e.g., Broozer, Bullitt)
- COLOR: Product color information

#### LS2
- [List any LS2-specific fields]

#### PartsUnlimited
- [List any PartsUnlimited-specific fields]

### Database Structure
Vendor data is stored across multiple related tables:
- vendors: Core vendor information
- vendor_brands: Brand management
- vendor_products: Product catalog
- vendor_product_attributes: Product characteristics
- vendor_product_dimensions: Physical measurements
- vendor_product_images: Product media
- vendor_product_inventory: Stock levels
- vendor_product_pricing: Pricing information
- vendor_distributor_info: Distributor-specific data
- vendor_vehicle_compatibility: Fitment data

## Data Importers

The application includes several data importers that handle different data sources and formats. Each importer is designed to handle large datasets efficiently through batch processing.

### Importer Architecture

```
BaseImporter
    ├── BellImporter
    ├── RestockImporter
    └── LS2Importer
```

### Common Features
- Batch processing with configurable batch sizes
- Transaction-based database operations
- Error handling and reporting
- Progress tracking
- Vendor and brand validation

### Importer Implementations

#### Bell Importer
- **Source**: Excel files from OneDrive
- **Format**: XLSX with specific column mappings
- **Processing**:
  - Batch size: 5000 records
  - Validates vendor_id and brand_id
  - Creates/updates vendor products
  - Creates/updates distributor info
  - Handles product attributes and pricing

#### LS2 Importer
- **Source**: FTP server
- **Format**: CSV files
- **Processing**:
  - Batch processing for large datasets
  - Handles multiple file types (products, inventory, pricing)
  - Updates existing records
  - Maintains distributor relationships

#### Restock Importer
- **Source**: OneDrive CSV files
- **Format**: CSV with specific column mappings
- **Processing**:
  - Batch size: 5000 records
  - Creates/updates restock vitals
  - Updates restock info and costs
  - Handles status changes

### Batch Processing
The importers use an optimized batch processing approach:
1. **Data Preparation**:
   - Read source files in chunks
   - Validate data format and required fields
   - Transform data to match database schema

2. **Batch Operations**:
   - Group records into configurable batch sizes
   - Process each batch in a transaction
   - Handle errors without failing entire import

3. **Database Operations**:
   - Use bulk create/update operations
   - Maintain referential integrity
   - Handle duplicates through upserts

4. **Progress Tracking**:
   - Monitor success/failure counts
   - Report progress percentage
   - Log errors for review

### Usage Example
```javascript
// Bell Importer
const bellImporter = new BellImporter();
bellImporter.vendor_id = vendorId;
bellImporter.brand_id = brandId;
const result = await bellImporter.importFromOneDrive();

// Results format
{
  total: 240,      // Total records processed
  success: 240,    // Successfully imported
  failed: 0        // Failed records
}
```

### Error Handling
- Individual record failures don't stop the import
- Errors are collected and reported
- Failed records can be reviewed and retried
- Transaction rollback on batch failures

### Best Practices
1. **Memory Management**:
   - Use appropriate batch sizes
   - Process files in chunks
   - Clean up temporary data

2. **Data Validation**:
   - Validate required fields
   - Check data types and formats
   - Verify foreign key relationships

3. **Performance**:
   - Use bulk operations
   - Minimize database transactions
   - Handle large datasets efficiently

4. **Monitoring**:
   - Track progress
   - Log errors
   - Report statistics