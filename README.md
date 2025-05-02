# Order Management System

A cloud-based Order Management System built with SAP CAP, Fiori Elements, and TypeScript.

## Project Overview
This system enables users to manage products, customers, and orders with CRUD functionality, analytics, and custom UI components.

## Prerequisites
- Node.js (v14 or later)
- SAP Cloud Application Programming Model (CAP) CLI

## Getting Started

### Setup
```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build

# Deploy to local SQLite database
npm run deploy:local

# Run the application
npm start
```

### Testing
```bash
# Run unit tests
npm test
```

## Project Structure
- `db/`: Data models and database configuration
- `srv/`: Service definitions and implementations
- `test/`: Unit tests

## Features
- Product management with stock tracking
- Customer information management
- Order processing with automatic stock validation
- Automatic calculation of order totals
- Basic validation logic

## Development Guidelines
- Use TypeScript for all business logic
- Follow SAP CAP best practices for service design
- Write unit tests for all critical business logic
