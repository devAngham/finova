# Database Schema — Finova
 
## Overview
 
Finova uses **PostgreSQL** as the database, managed through **TypeORM**.
 
---
 
## Entity Relationship
 
```
User (1) ──────── (many) Account
User (1) ──────── (many) Notification
User (1) ──────── (many) Chat
User (1) ──────── (many) Bill
 
Account (1) ──────── (many) Transaction (as sender)
Account (1) ──────── (many) Transaction (as receiver)
Account (1) ──────── (many) Bill
```
 
---
 
## Tables
 
### `users`
 
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `name` | varchar | Required | Full name |
| `email` | varchar | Required, Unique | Login email |
| `phone` | varchar | Required, Unique | Phone number |
| `password` | varchar | Required | Bcrypt hashed |
| `refreshToken` | varchar | Nullable | Current refresh token |
| `createdAt` | timestamp | Default: now() | Registration date |
| `updatedAt` | timestamp | Auto-update | Last update |
 
---
 
### `accounts`
 
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `userId` | UUID | FK → users | Account owner |
| `type` | enum | Required | `checking` or `savings` |
| `accountNumber` | varchar | Unique | Generated account number |
| `balance` | decimal | Default: 0 | Current balance |
| `currency` | enum | Default: USD | `USD`, `JOD`, `SAR`, `EUR` |
| `isActive` | boolean | Default: true | Account status |
| `createdAt` | timestamp | Default: now() | Creation date |
 
---
 
### `transactions`
 
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `fromAccountId` | UUID | FK → accounts | Sender account |
| `toAccountId` | UUID | FK → accounts, Nullable | Receiver account |
| `amount` | decimal | Required | Transfer amount |
| `type` | enum | Required | `internal`, `external`, `bill` |
| `status` | enum | Default: pending | `pending`, `completed`, `failed` |
| `description` | varchar | Nullable | Transfer note |
| `iban` | varchar | Nullable | For external transfers |
| `recipientName` | varchar | Nullable | For external transfers |
| `createdAt` | timestamp | Default: now() | Transaction date |
 
---
 
### `bills`
 
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `userId` | UUID | FK → users | Bill owner |
| `accountId` | UUID | FK → accounts | Payment account |
| `billType` | enum | Required | `electricity`, `water`, `internet`, `phone` |
| `amount` | decimal | Required | Bill amount |
| `status` | enum | Default: unpaid | `paid`, `unpaid` |
| `paidAt` | timestamp | Nullable | Payment date |
| `createdAt` | timestamp | Default: now() | Bill date |
 
---
 
### `notifications`
 
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `userId` | UUID | FK → users | Notification owner |
| `message` | varchar | Required | Notification text |
| `type` | enum | Required | `transfer`, `bill`, `alert` |
| `isRead` | boolean | Default: false | Read status |
| `createdAt` | timestamp | Default: now() | Notification date |
 
---
 
### `chats`
 
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `userId` | UUID | FK → users | Chat owner |
| `messages` | jsonb | Required | Conversation history |
| `createdAt` | timestamp | Default: now() | Chat date |
 
**Messages JSON structure:**
```json
[
  { "role": "user", "content": "Transfer $200 to Ahmed" },
  { "role": "assistant", "content": "Transfer completed successfully!" }
]
```
 
---
 
## TypeORM Entities
 
```typescript
// Account types
enum AccountType { CHECKING = 'checking', SAVINGS = 'savings' }
 
// Transaction types
enum TransactionType { INTERNAL = 'internal', EXTERNAL = 'external', BILL = 'bill' }
 
// Transaction status
enum TransactionStatus { PENDING = 'pending', COMPLETED = 'completed', FAILED = 'failed' }
 
// Currency
enum Currency { USD = 'USD', JOD = 'JOD', SAR = 'SAR', EUR = 'EUR' }
 
// Bill types
enum BillType { ELECTRICITY = 'electricity', WATER = 'water', INTERNET = 'internet', PHONE = 'phone' }
```
 
---
 
## Relationships Summary
 
| Relationship | Type | Description |
|-------------|------|-------------|
| User → Account | One-to-Many | User can have multiple accounts |
| User → Notification | One-to-Many | User receives many notifications |
| User → Chat | One-to-Many | User has many chat sessions |
| User → Bill | One-to-Many | User has many bills |
| Account → Transaction | One-to-Many | Account has many transactions |
 