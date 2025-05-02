# Getting Started

Welcome to your new project.

It contains these folders and files, following our recommended project layout:

File or Folder | Purpose
---------|----------
`app/` | content for UI frontends goes here
`db/` | your domain models and data go here
`srv/` | your service models and code go here
`package.json` | project metadata and configuration
`readme.md` | this getting started guide


## Next Steps

- Open a new terminal and run `cds watch`
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)
- Start adding content, for example, a [db/schema.cds](db/schema.cds).


## Learn More

Learn more at https://cap.cloud.sap/docs/get-started/.


# Order Management System

A cloud-based Order Management System built with SAP CAP, Fiori Elements, and TypeScript.

## Project Overview
This system enables users to manage products, customers, and orders with CRUD functionality, analytics, and custom UI components.

## Week 1: Backend with SAP CAP
- Data model definitions using CDS
- Business logic implementation with TypeScript
- CRUD operations for Products, Customers, Orders, and OrderItems

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
