# 🚀 Enterprise ERP + CRM Operations Portal

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748.svg)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-06B6D4.svg)](https://tailwindcss.com/)

A modern, full-stack enterprise resource planning (ERP) and customer relationship management (CRM) platform built for wholesale distribution, inventory tracking, and sales delivery operations.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Visual Design & Assets](#-visual-design--assets)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Schema & Data Model](#-database-schema--data-model)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [REST API Reference](#-rest-api-reference)
- [Local Setup & Installation](#-local-setup--installation)
- [Deploying on Render](#-deploying-on-render)
- [Troubleshooting Database Connection](#-troubleshooting-database-connection)
- [Test Credentials](#-test-credentials)

---

## 🌟 Overview

The **Enterprise ERP + CRM Portal** streamlines commercial operations by unifying customer CRM records, product inventory catalogues, stock movement tracking, and sales delivery challans under a secure, role-restricted web platform.

---

## ✨ Key Features

- 🔐 **JWT Authentication & RBAC**: Role-restricted access supporting 4 roles: `ADMIN`, `SALES`, `WAREHOUSE`, and `ACCOUNTS`.
- 👥 **Customer CRM**: Complete customer management with interaction logs, follow-up notes, and order history.
- 📦 **Product Catalog & Inventory**: Real-time stock levels, minimum stock alerts, SKU validation, and stock movement logs (`IN` / `OUT`).
- 📋 **Sales Delivery Challans**: Multi-product draft creation and confirmation workflow with atomic stock deduction via Prisma `$transaction`.
- 📸 **Historical Price Snapshots**: Challan line items store exact product names, SKUs, and unit prices at creation time to preserve historical integrity.
- 🎨 **Modern Glassmorphic UI**: High-tech enterprise UI featuring split-screen login, header topbar, dashboard hero graphics, and visual product thumbnails.

---

## 🎨 Visual Design & Assets

The UI utilizes custom design tokens, dark glassmorphism, responsive navigation, and custom generated image assets stored in `frontend/public/assets/`:

| Asset Name | Path | Description |
|---|---|---|
| **Brand Logo** | `frontend/public/assets/logo.png` | 3D corporate isometric logo mark for sidebar and topbar branding. |
| **Login Hero Banner** | `frontend/public/assets/login_hero.png` | Digital supply chain & logistics 3D illustration featured on split login page. |
| **Dashboard Banner** | `frontend/public/assets/dashboard_banner.png` | Wide panoramic tech graphic header for dashboard welcome section. |
| **Product Placeholder** | `frontend/public/assets/product_placeholder.png` | 3D product package box thumbnail for product catalog table rows. |

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS v3, React Hook Form, React Router v6, Axios, React Hot Toast |
| **Backend** | Node.js, Express, TypeScript, JWT (`jsonwebtoken`), `bcryptjs`, Zod Validation |
| **Database & ORM** | PostgreSQL 14+, Prisma ORM v5 |
| **CI/CD Deployment** | GitHub Actions (`.github/workflows/deploy.yml`) |

---

## 🏗️ System Architecture

```
┌─────────────────────────┐         ┌──────────────────────────┐         ┌────────────────────────┐
│   React 18 + Vite Frontend  │ ──Axios─▶   Express + Node.js API   │ ──Prisma─▶  PostgreSQL Database  │
│   (Port 5173 / GH Pages)│         │     (Port 3001)          │         │      (Port 5432)       │
└─────────────────────────┘         └──────────────────────────┘         └────────────────────────┘
```

---

## 📊 Database Schema & Data Model

Prisma schema defines 7 primary models:

1. **`User`**: System accounts (`email`, `password_hash`, `role`, `name`).
2. **`Customer`**: CRM client database (`company_name`, `contact_person`, `email`, `phone`, `address`).
3. **`CustomerFollowup`**: Interaction history notes linked to customers.
4. **`Product`**: SKU inventory catalogue (`sku`, `product_name`, `category`, `unit_price`, `current_stock`, `minimum_stock`, `warehouse_location`).
5. **`StockMovement`**: Immutable stock log entries (`movement_type`: `IN`/`OUT`, `quantity`, `reference_type`, `reference_id`, `created_by`).
6. **`Challan`**: Delivery challans (`challan_number`, `customer_id`, `status`: `DRAFT`/`CONFIRMED`/`CANCELLED`, `total_amount`, `notes`).
7. **`ChallanItem`**: Line items snapshotting product details (`product_id`, `product_name`, `sku`, `unit_price`, `quantity`, `subtotal`).

---

## 🛡️ Role-Based Access Control (RBAC)

| Module / Action | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|---|:---:|:---:|:---:|:---:|
| **Dashboard** | Full View | Full View | Full View | Full View |
| **Customers** | CRUD | CRUD | Read-Only | Read-Only |
| **Products** | CRUD | Read-Only | CRUD | Read-Only |
| **Inventory & Stock** | CRUD | Read-Only | CRUD | Read-Only |
| **Create Challan** | ✅ | ✅ | ❌ | ❌ |
| **Confirm Challan** | ✅ | ✅ | ✅ | ❌ |
| **User Administration** | CRUD | ❌ | ❌ | ❌ |

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/login` — Authenticate user and issue JWT token.
- `GET /api/auth/me` — Fetch current logged-in user profile.

### Customers (CRM)
- `GET /api/customers` — List customers with search/pagination.
- `POST /api/customers` — Create customer record.
- `GET /api/customers/:id` — View customer detail & follow-up notes.
- `PUT /api/customers/:id` — Update customer details.
- `DELETE /api/customers/:id` — Delete customer (Admin only).

### Products & Inventory
- `GET /api/products` — List products with SKU filter & category filter.
- `POST /api/products` — Create new product (Admin/Warehouse).
- `PUT /api/products/:id` — Update product details.
- `GET /api/inventory/movements` — Query stock movement logs.
- `GET /api/inventory/low-stock` — List items below minimum stock threshold.
- `GET /api/inventory/stats` — Summary metrics for dashboard.

### Delivery Challans
- `GET /api/challans` — Query sales delivery challans.
- `POST /api/challans` — Draft new sales delivery challan.
- `POST /api/challans/:id/confirm` — Confirm challan & execute atomic stock deduction via Prisma `$transaction`.
- `POST /api/challans/:id/cancel` — Cancel draft challan.

### User Management
- `GET /api/users` — List system users (Admin only).
- `POST /api/users` — Create system user (Admin only).

---

## ⚙️ Local Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: v14.0 or higher

### 1. Database Configuration
Create a local PostgreSQL database `erp_crm_db` or use a cloud database string (e.g. Supabase, Neon).

Update `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/erp_crm_db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run db:push
npm run db:seed
npm run dev
```
*Backend API server will run at: `http://localhost:3001`*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend web portal will run at: `http://localhost:5173`*

---

## 🌐 Deploying on Render

This project includes a pre-configured `render.yaml` Blueprint file for automatic 1-click deployment of the entire stack on [Render](https://render.com/).

### Method 1: Automatic Blueprint Deployment (Recommended)

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: add Render deployment blueprint"
   git push origin main
   ```
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Blueprints**.
4. Connect your GitHub repository (`Gagan004-coder/erp`).
5. Render will automatically detect `render.yaml` and provision:
   - **`erp-db`**: PostgreSQL Database instance
   - **`erp-backend`**: Node.js Express Web Service with Prisma migration & seed
   - **`erp-frontend`**: React 18 Static Site with SPA routing
6. Click **Apply**. Render will automatically build, migrate, seed, and deploy all services!

---

## 🔧 Troubleshooting Database Connection

If you encounter `PrismaClientInitializationError: Can't reach database server at localhost:5432`:

1. **Verify PostgreSQL Service is Running**:
   - On Windows: Open `services.msc` and ensure **postgresql-x64-15** (or your version) is `Running`.
   - On Docker: Run `docker run -d --name erp_postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=erp_crm_db -p 5432:5432 postgres:15`
2. **Push Schema & Seed Data**:
   ```bash
   cd backend
   npm run db:push
   npm run db:seed
   ```

---

## 🔑 Test Credentials

| Role | Email | Password | Allowed Scope |
|---|---|---|---|
| **Admin** | `admin@erp.com` | `password123` | Full System Access |
| **Sales** | `sales@erp.com` | `password123` | Customers & Delivery Challans |
| **Warehouse** | `warehouse@erp.com` | `password123` | Stock & Product Management |
| **Accounts** | `accounts@erp.com` | `password123` | Read-only Reports & Audits |

---
© 2026 Enterprise ERP + CRM Systems Inc.
