# Inventory Management System - Backend

NestJS backend for the Inventory Management System with MySQL and TypeORM.

## Features

- **Ledger-Based Inventory**: All stock movements tracked as transactions
- **JWT Authentication**: Stateless authentication with roles (ADMIN/USER)
- **Transaction Types**: INITIAL, IN, OUT operations
- **Comprehensive Reports**: Stock reports, product-to-person tracking, price history
- **Type Safety**: Full TypeScript implementation
- **Database**: MySQL with TypeORM

## Tech Stack

- **Framework**: NestJS
- **Database**: MySQL
- **ORM**: TypeORM
- **Authentication**: JWT (Passport)
- **Validation**: class-validator, class-transformer
- **Password Hashing**: bcrypt

## Prerequisites

- Node.js 18+ or 20+
- MySQL 8.0+
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your database credentials
```

## Environment Variables

Create a `.env` file with the following:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=inventory_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
NODE_ENV=development
```

## Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE inventory_db;
```

2. Run the application - TypeORM will automatically create tables in development mode:
```bash
npm run start:dev
```

## Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Products
- `GET /api/products` - Get all products with stock
- `GET /api/products/:id` - Get product by ID with stock
- `POST /api/products` - Create product (Admin only)
- `PATCH /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Inventory (Admin only)
- `POST /api/inventory/in` - Record incoming shipment
- `POST /api/inventory/out` - Record outgoing dispatch
- `GET /api/inventory/transactions` - Get all transactions
- `GET /api/inventory/transactions/product/:id` - Get transactions by product
- `GET /api/inventory/transactions/recipient/:id` - Get transactions by recipient

### Reports
- `GET /api/reports/stock` - Overall stock report
- `GET /api/reports/product-to-person` - Product to person distribution
- `GET /api/reports/price-history` - Price history for purchases
- `GET /api/reports/product/:id/detailed` - Detailed product report with running stock

## Project Structure

```
src/
├── auth/                  # Authentication module (JWT, guards, strategies)
├── users/                 # User management module
├── products/              # Product management module
├── inventory/             # Inventory transactions module
├── reports/               # Reporting module
├── entities/              # TypeORM entities
├── common/                # Common enums and utilities
├── app.module.ts          # Main application module
└── main.ts                # Application entry point
```

## Core Design Principles

1. **Ledger-Based System**: Stock is never updated directly; always derived from transactions
2. **Audit Trail**: Complete history of all inventory movements
3. **Transaction Types**: 
   - INITIAL: Initial stock when product is created
   - IN: Incoming shipment with price and vendor
   - OUT: Product sent to user
4. **Role-Based Access**: ADMIN can manage inventory, USER can only receive items

## Stock Calculation Formula

```
current_stock = initial_balance + SUM(IN quantities) - SUM(OUT quantities)
```

## Development

```bash
# Run linter
npm run lint

# Format code
npm run format

# Build
npm run build
```

## Docker Support

```bash
# Build image
docker build -t inventory-backend .

# Run container
docker run -p 3000:3000 --env-file .env inventory-backend
```

## License

MIT
