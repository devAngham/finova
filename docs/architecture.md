# Architecture — Finova
 
## System Overview
 
Finova follows NestJS **modular architecture** with clear separation of concerns.
 
---
 
## Architecture Layers
 
```
┌─────────────────────────────────────┐
│         Client (HTTP / WebSocket)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│           Controllers               │  ← Handle HTTP requests
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│             Guards                  │  ← JWT Auth verification
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│             Services                │  ← Business logic
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼───┐           ┌─────▼─────┐
│TypeORM│           │   Redis   │
│  ORM  │           │  Cache    │
└───┬───┘           └───────────┘
    │
┌───▼──────┐
│PostgreSQL│
└──────────┘
```
 
---
 
## Module Structure
 
```
src/
├── auth/                    ← Authentication & Authorization
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   └── login.dto.ts
│   └── strategies/
│       ├── jwt.strategy.ts
│       └── jwt-refresh.strategy.ts
│
├── accounts/                ← Bank Account Management
│   ├── accounts.module.ts
│   ├── accounts.controller.ts
│   ├── accounts.service.ts
│   ├── dto/
│   │   └── create-account.dto.ts
│   └── entities/
│       └── account.entity.ts
│
├── transactions/            ← Money Transfers
│   ├── transactions.module.ts
│   ├── transactions.controller.ts
│   ├── transactions.service.ts
│   ├── dto/
│   │   ├── internal-transfer.dto.ts
│   │   └── external-transfer.dto.ts
│   └── entities/
│       └── transaction.entity.ts
│
├── bills/                   ← Bill Payments
│   ├── bills.module.ts
│   ├── bills.controller.ts
│   ├── bills.service.ts
│   └── entities/
│       └── bill.entity.ts
│
├── notifications/           ← Real-time Notifications
│   ├── notifications.module.ts
│   ├── notifications.controller.ts
│   ├── notifications.service.ts
│   └── entities/
│       └── notification.entity.ts
│
├── advisor/                 ← AI Agent
│   ├── advisor.module.ts
│   ├── advisor.controller.ts
│   ├── advisor.service.ts
│   ├── ai.service.ts        ← Groq API integration
│   └── tools/
│       └── banking.tools.ts ← MCP Tool definitions
│
├── websocket/               ← Real-time Events
│   └── events.gateway.ts
│
├── users/                   ← User Management
│   ├── users.module.ts
│   ├── users.service.ts
│   └── entities/
│       └── user.entity.ts
│
├── common/                  ← Shared utilities
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   └── interceptors/
│       └── response.interceptor.ts
│
└── database/                ← Database configuration
    └── database.module.ts
```
 
---
 
## Key Design Decisions
 
| Decision | Choice | Reason |
|----------|--------|--------|
| Framework | NestJS | Modular, scalable, enterprise-ready |
| ORM | TypeORM | Native NestJS integration, decorators |
| Database | PostgreSQL | ACID compliance for financial data |
| Cache | Redis | Fast balance lookups, session storage |
| Real-time | WebSocket | Instant transaction notifications |
| AI | Groq LLaMA | Fast inference, free tier available |
| ID Type | UUID | Security — no sequential IDs exposed |
 
---
 
## Real-time Flow (WebSocket)
 
```
Transaction Executed
        ↓
TransactionsService emits event
        ↓
EventsGateway receives event
        ↓
Sends to specific user room
        ↓
Client receives real-time notification
```
 
---
 
## AI Agent Flow (MCP)
 
```
User sends message
        ↓
AdvisorController → AdvisorService
        ↓
Fetch user accounts from DB
        ↓
Build system prompt with financial context
        ↓
Send message + tools to Groq
        ↓
Groq decides: text response or tool call?
        ↓
Tool call → Execute in DB → Return result
Text     → Return directly to user
        ↓
Save conversation to DB
        ↓
Return response to user
```
 
---
 
## Security
 
```
✅ JWT Access Token (15 minutes)
✅ Refresh Token (7 days) stored hashed
✅ Passwords hashed with bcrypt
✅ UUID for all IDs (no sequential exposure)
✅ User can only access their own data
✅ Atomic transactions (no partial transfers)
```