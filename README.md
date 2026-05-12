# Bond Sports — Account Management API

A REST API for bank account management: create accounts, deposit and withdraw funds with enforced business rules, and query transaction history. Built with NestJS, Prisma, and PostgreSQL.

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or later
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

## Setup

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/MikeCr4ft/bond-sports.git
cd bond-sports
npm install
```

2. Copy the example environment file and configure it:

```bash
cp .env.example .env
```

The default `.env` values work out of the box with the Docker Compose setup. The only required variable is `DATABASE_URL`.

## Start the full stack

```bash
docker compose up -d
```

This starts PostgreSQL on port 5432. Then start the API in development mode:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.

## Run database migrations

Migrations run automatically when starting in production mode (`npm run start:prod`). For development you can apply them manually:

```bash
npx prisma migrate deploy
```

## Run tests

```bash
# Unit tests
npm run test

# End-to-end tests (requires a running PostgreSQL instance)
npm run test:e2e

# Coverage report
npm run test:cov
```

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| POST | `/accounts` | Create a bank account |
| GET | `/accounts/:id` | Get account by ID |
| PATCH | `/accounts/:id/block` | Block or unblock an account |
| POST | `/accounts/:id/deposit` | Deposit funds |
| POST | `/accounts/:id/withdraw` | Withdraw funds |
| GET | `/accounts/:id/statement` | Transaction history (optional `?from=&to=` date filter) |

Interactive API explorer (Swagger UI): **http://localhost:3000/api/docs**

## Entities

- **Account** — holds a person's balance, daily withdrawal limit, account type (Checking or Savings), and active status.
- **Transaction** — records each deposit or withdrawal with its amount and timestamp.
