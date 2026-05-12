# Bond Sports — Account Management API

NestJS REST API for bank account management. Stack: NestJS 11, Prisma 7, PostgreSQL, Docker Compose.

## Commands

```bash
npm run start:dev          # dev server with watch
npm run build              # compile to dist/
npm run start:prod         # migrate deploy then start (used in Docker)
npm run test               # unit tests (src/**/*.spec.ts)
npm run test:e2e           # e2e tests against real DB
npm run test:cov           # coverage report
npm run lint               # eslint --fix
```

Run a single test file: `npm run test -- --testPathPattern=accounts.service`

## Module Architecture

```
src/
  prisma/        # PrismaModule (global) — PrismaService wraps the Prisma client
  accounts/      # AccountsModule — Account CRUD + block/unblock
  transactions/  # TransactionsModule — deposit, withdraw, statement
  common/        # Global exception filter + ValidationPipe bootstrap
  main.ts
```

**Module boundary rule:** modules import only from `prisma/`. Cross-module imports (e.g., TransactionsModule importing AccountsService) are not allowed — query account existence inside TransactionsService via PrismaService directly.

## Data Model

**Account** — `accountId` (UUID PK), `personId` (string), `balance` (Decimal, default 0), `dailyWithdrawalLimit` (Decimal), `activeFlag` (boolean, default true), `accountType` (Int: 1=Checking, 2=Savings), `createDate` (DateTime, default now()).

**Transaction** — `transactionId` (UUID PK), `accountId` (FK), `value` (Decimal), `type` (enum: DEPOSIT | WITHDRAWAL), `transactionDate` (DateTime, default now()).

**IMPORTANT:** Use `Decimal` — never `Float` — for all monetary fields. Prisma maps these to PostgreSQL `Decimal`.

## Business Rules

These must be enforced in TransactionsService:

| Rule | HTTP status |
|------|-------------|
| Account not found | 404 |
| Withdrawal on blocked account (`activeFlag = false`) | 403 |
| Withdrawal amount > balance | 422 |
| Withdrawal would exceed daily limit | 422 |
| Malformed request / missing fields | 400 |

Daily withdrawal limit check: aggregate `SUM(value)` of all `WITHDRAWAL` transactions for the account where `transactionDate >= start of today (UTC)` at runtime. Do not store a running daily total.

All withdrawal operations (read balance, check daily limit, deduct balance, insert transaction) must run inside a single `prisma.$transaction(...)` call to prevent race conditions.

## Error Response Shape

The global exception filter normalizes all errors to:
```json
{ "statusCode": number, "message": string, "error": string }
```
Never let NestJS's default error shape leak through.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/accounts` | Create account |
| GET | `/accounts/:id` | Get by ID |
| PATCH | `/accounts/:id/block` | Block/unblock `{ active: boolean }` |
| POST | `/accounts/:id/deposit` | Deposit `{ amount }` |
| POST | `/accounts/:id/withdraw` | Withdraw `{ amount }` |
| GET | `/accounts/:id/statement` | History, optional `?from=&to=` (ISO dates) |

Swagger UI lives at `/api/docs`.

## Testing Approach

**Unit tests** (`*.spec.ts` in `src/`): mock `PrismaService` to isolate service logic. Cover: account not found, blocked account withdrawal, insufficient balance, daily limit exceeded, successful deposit, successful withdrawal.

**e2e tests** (`test/*.e2e-spec.ts`): spin up the full NestJS app against a real test database. Cover happy paths (create → deposit → withdraw → statement with date filter) and key error paths. `test:e2e` requires a running PostgreSQL instance (use Docker Compose).

**Testing philosophy:** assert on observable HTTP behavior — status codes, response bodies, database state. Do not assert on which Prisma method was called or how many times.

## Code Style

- Single quotes, trailing commas (enforced by Prettier — run `npm run lint` to fix)
- TypeScript `module: nodenext` — use ES module `import/export`, never `require()`
- DTOs use `class-validator` decorators; enable `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true` in `main.ts`
- `personId` accepts any string — no format validation, no country-specific constraints

## Environment

Copy `.env.example` to `.env`. Required vars: `DATABASE_URL`. PostgreSQL runs via `docker compose up -d`.

`npm run start:prod` runs `prisma migrate deploy && node dist/main` — migrations apply automatically on startup. Never commit `.env`.
