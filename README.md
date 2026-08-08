# Rental Management System

## Overview
A production-quality rental management business system designed with a frozen application architecture, strict tenant isolation, and atomic transactional integrity.

## Core Features
- Strict multi-tenant data isolation.
- Complete master data management for customers, products, variants, and assets.
- Asset lifecycle tracking (Available, Allocated, Rented, Returned, Maintenance).
- End-to-end rental transactions including allocations, fulfillment, and returns.
- Concurrency control (allocations safely lock assets using `FOR UPDATE SKIP LOCKED`).
- Inspection and adjustments integration.

## Architecture
- **Layered Architecture:** Routes -> Controllers -> Services (Orchestration/Business Rules) -> Repositories (Data Access).
- **Tenant Isolation:** Enforced dynamically via Express middleware injected into all domain routes (`requireTenantContext`).
- **Validation:** Strict DTO validation and application invariants enforced at the Service layer.

## Technology Stack
- **Backend:** Node.js, TypeScript, Express.
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Axios.
- **Database:** MySQL 8+.

## Database Design
- Native MySQL schema utilizing raw SQL queries (`mysql2` connection pool).
- Idempotent migration system executing sequential `.sql` migration files.
- Concurrency controlled natively at the database level.
- UUIDs (`VARCHAR(36)`) heavily utilized for primary and foreign keys.

## Rental Lifecycle
1. **Creation:** Draft transaction created with lines linking to product variants and rental periods.
2. **Confirmation:** Pricing snapshot committed, status updated to `CONFIRMED`.
3. **Allocation:** System attempts to allocate available physical assets for requested variants.
4. **Fulfillment:** Assets deployed to customer (`RENTED`).
5. **Return:** Assets checked back into inventory (`RETURNED`).
6. **Inspection:** Assets inspected for condition (`AVAILABLE`, `DAMAGED`, etc.).
7. **Adjustment:** Damage or late fees applied based on inspection.
8. **Completion:** Transaction finalised (`COMPLETED`).

## Key Business Rules
- **No Over-Allocation:** An asset can never be allocated to multiple active transactions simultaneously.
- **Tenant Ownership:** A user from Tenant A cannot view or manipulate Tenant B's data under any circumstances.
- **Immutable Financials:** Once confirmed, rental transaction financial snapshots cannot be altered directly.

## Frontend
- React SPA scaffolded with Vite.
- Centrally configured `Axios` interceptors inject authentication headers dynamically (`x-organization-id`, `x-user-id`).
- Styling leverages `Tailwind CSS v4`.

## Backend API
- RESTful HTTP API.
- Unified response/error envelope structure.
- Environment-configured startup natively on port `3000`.

## Demo Data
- Automated seeder initializes a clean Demo Organization, Customer, Product, Variant, Asset, and Pricing structure.

## Local Setup
1. Clone the repository.
2. Initialize and configure the MySQL instance.
3. Install dependencies in root: `npm install`
4. Install dependencies in frontend: `cd client && npm install`

## Environment Variables
Create a `.env` in the backend root containing:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_CONNECTION_LIMIT`
- `DB_SOCKET` (optional)
- `PORT`

## Running the Project
**Backend:**
```bash
npm run build
node dist/server.js
```

**Frontend:**
```bash
cd client
npm run dev
```

## Database Migration
Execute strictly from the backend root directory (creates schema up to 028 idempotently):
```bash
npm run db:migrate
```

## Demo Workflow
1. Initialize the demo dataset: `npx ts-node src/scripts/seed-demo.ts`
2. Start both Frontend and Backend servers.
3. Utilize the frontend application or the unified API testing script to verify the lifecycle.
To automatically verify the end-to-end flow:
```bash
npx ts-node src/scripts/e2e-smoke.ts
```

## Validation / QA Status
- DB Schema: FROZEN & VERIFIED
- Migrations: VERIFIED IDEMPOTENT
- Architecture: FROZEN
- Integration: PASSED
- E2E Smoke Test: PASSED

## Project Structure
```text
Rental-management-system/
├── client/          # Vite + React Frontend
├── src/             # Backend Source Code
│   ├── controllers/ # HTTP Handlers
│   ├── db/          # Migrations & Pool Config
│   ├── middleware/  # Error & Auth/Tenant Interceptors
│   ├── repositories/# Raw SQL Queries
│   ├── routes/      # Express API Routes
│   ├── scripts/     # CLI Scripts (Migrate, Seed, E2E)
│   ├── services/    # Business Logic & Orchestration
│   └── types/       # Global Typings
├── package.json
└── tsconfig.json
```
