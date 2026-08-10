# Mini ERP + CRM Operations Portal

## Overview

A full-stack internal ERP/CRM application for a wholesale/distribution company. Covers customer management, product inventory, sales challans with atomic stock transactions, JWT authentication, and role-based access control.

## Features

- **Authentication** — JWT login, 4 roles (Admin, Sales, Warehouse, Accounts)
- **Customer CRM** — CRUD, search/filter, follow-up notes, challan history
- **Product Management** — CRUD, SKU uniqueness, category filter, low-stock indicator
- **Inventory** — Stock movement log (IN/OUT), low-stock alert panel
- **Sales Challans** — Multi-product draft → confirm flow with atomic stock deduction
- **Challan Snapshot** — Product name/price snapshotted at time of creation
- **Stock Transaction** — Prisma `$transaction` ensures no partial stock updates
- **Role Guards** — API and UI both enforce role-based permissions

## Tech Stack

| Layer    | Technology                                                     |
|----------|----------------------------------------------------------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v3, React Hook Form  |
| Backend  | Node.js, Express, TypeScript, JWT, bcryptjs, Zod              |
| ORM      | Prisma v5                                                      |
| Database | PostgreSQL                                                     |

## Architecture

```
React (Vite :5173)  ──Axios──▶  Express (Node :3001)  ──Prisma──▶  PostgreSQL
```

## Database Schema

Tables: `users`, `customers`, `customer_followups`, `products`, `stock_movements`, `challans`, `challan_items`

## API Documentation

| Method | Endpoint                       | Description              |
|--------|--------------------------------|--------------------------|
| POST   | /api/auth/login                | Login                    |
| GET    | /api/auth/me                   | Current user             |
| GET    | /api/customers                 | List customers           |
| POST   | /api/customers                 | Create customer          |
| GET    | /api/products                  | List products            |
| GET    | /api/inventory/movements       | Stock movement log       |
| GET    | /api/inventory/low-stock       | Low stock products       |
| GET    | /api/inventory/stats           | Dashboard stats          |
| GET    | /api/challans                  | List challans            |
| POST   | /api/challans                  | Create challan (DRAFT)   |
| POST   | /api/challans/:id/confirm      | Confirm + deduct stock   |
| POST   | /api/challans/:id/cancel       | Cancel challan           |
| GET    | /api/users                     | List users (Admin only)  |

## Role Permissions

| Feature   | Admin | Sales       | Warehouse | Accounts |
|-----------|-------|-------------|-----------|----------|
| Dashboard | ✅    | ✅          | ✅        | ✅       |
| Customers | CRUD  | CRUD        | View      | View     |
| Products  | CRUD  | View        | CRUD      | View     |
| Stock     | CRUD  | View        | CRUD      | View     |
| Challans  | CRUD  | Create/View | View      | View     |
| Users     | CRUD  | ❌          | ❌        | ❌       |

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/erp_crm_db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Database Setup
```bash
# Create database
createdb erp_crm_db

# Push schema
cd backend
npm run db:push

# Seed data
npm run db:seed
```

### Running Backend
```bash
cd backend
npm run dev
# Server: http://localhost:3001
```

### Running Frontend
```bash
cd frontend
npm run dev
# App: http://localhost:5173
```

## Test Credentials

| Role      | Email                  | Password    |
|-----------|------------------------|-------------|
| Admin     | admin@erp.com          | password123 |
| Sales     | sales@erp.com          | password123 |
| Warehouse | warehouse@erp.com      | password123 |
| Accounts  | accounts@erp.com       | password123 |

## Key Technical Decisions

### Challan Product Snapshot
`challan_items` stores `product_name`, `sku`, `unit_price` at creation time. If the product is later updated, historical challans still show correct data.

### Atomic Stock Transaction
Confirming a challan uses Prisma's `$transaction` to:
1. Validate all items have sufficient stock
2. Decrement each product's stock
3. Create OUT stock movement records
4. Update challan to CONFIRMED

If any step fails, the entire transaction rolls back — no partial stock updates.

## Known Limitations
- No PDF challan generation (bonus feature)
- No product image upload
- No Docker setup (use local/cloud Postgres)
- No email notifications
