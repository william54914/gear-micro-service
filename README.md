# Express Microservice with Prisma and PostgreSQL

This is a Node.js microservice built with Express, Prisma ORM, and PostgreSQL.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   PORT=3000
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gearhubone?schema=public"
   ```
   Make sure to update the DATABASE_URL with your PostgreSQL credentials.

4. Initialize the database:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

- `GET /health` - Health check endpoint

## Project Structure

```
.
├── src/
│   └── index.js
├── prisma/
│   └── schema.prisma
├── package.json
└── README.md
```

## Database Management

- Generate Prisma Client: `npm run prisma:generate`
- Create migration: `npm run prisma:migrate` 