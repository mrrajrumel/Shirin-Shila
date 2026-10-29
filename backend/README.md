# Shirin Shila Portfolio — Backend API

NestJS REST backend service with Prisma ORM and MySQL database support for the Shirin Shila cinematic portfolio press CMS.

## Features
- **Prisma ORM**: Models for `PressCoverage`, `PortfolioProject`, and `AdminUser`.
- **Press API**: `/api/press` endpoints supporting listing, creation, updates, and deletion.
- **CORS enabled**: Configured to interface with Next.js frontend (`http://localhost:3000`).

## Setup & Running

1. Configure environment:
```bash
cp .env.example .env
# Set DATABASE_URL with your MySQL connection string
```

2. Install dependencies & initialize database:
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init_press_cms
```

3. Start development server:
```bash
npm run start:dev
```

> **Security Note**: Before public production deployment, implement an authentication guard (JWT/session-based) on the mutation endpoints (`POST`, `PATCH`, `DELETE`).
