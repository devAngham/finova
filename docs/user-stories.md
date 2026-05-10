# User Stories — Finova
 
## Overview
 
Finova serves individual users who want to manage their finances through an intelligent AI-powered banking assistant.
 
---
 
## User Types
 
| Type | Description |
|------|-------------|
| **New User** | Just registered, setting up their account |
| **Regular User** | Active user managing daily finances |
| **Power User** | Uses AI advisor for financial planning |
 
---
 
## Authentication
 
### US-001 — Register
> As a **new user**, I want to create an account so that I can access the banking platform.
 
**Acceptance Criteria:**
- User provides name, email, phone, and password
- Password is securely hashed before storage
- System returns access token and refresh token
- Email must be unique
---
 
### US-002 — Login
> As a **returning user**, I want to login so that I can access my accounts and transactions.
 
**Acceptance Criteria:**
- User provides email and password
- System returns JWT access token (15min) and refresh token (7 days)
- Invalid credentials return 401
---
 
### US-003 — Refresh Token
> As a **user**, I want to refresh my session so that I don't have to login repeatedly.
 
**Acceptance Criteria:**
- User sends refresh token
- System returns new access token
- Expired refresh token returns 401
---
 
### US-004 — Logout
> As a **user**, I want to logout so that my session is securely terminated.
 
**Acceptance Criteria:**
- Refresh token is invalidated
- User must login again to access protected routes
---
 
## Accounts
 
### US-005 — View Accounts
> As a **user**, I want to see all my bank accounts so that I have an overview of my finances.
 
**Acceptance Criteria:**
- Returns list of all user accounts
- Each account shows: type, balance, account number, currency
- Account types: `checking` | `savings`
---
 
### US-006 — Create Account
> As a **user**, I want to open a new bank account so that I can organize my money.
 
**Acceptance Criteria:**
- User selects account type (checking or savings)
- User selects currency (USD, JOD, SAR, EUR)
- System generates unique account number
- Initial balance is 0
---
 
### US-007 — View Account Details
> As a **user**, I want to see details of a specific account including transaction history.
 
**Acceptance Criteria:**
- Returns account info and recent transactions
- User can only access their own accounts
---
 
### US-008 — Check Balance
> As a **user**, I want to quickly check my account balance.
 
**Acceptance Criteria:**
- Returns current balance and currency
- Response cached in Redis for performance
---
 
## Transactions
 
### US-009 — Internal Transfer (Same User)
> As a **user**, I want to transfer money between my own accounts.
 
**Acceptance Criteria:**
- User selects source and destination account
- Sufficient balance required
- Both balances updated atomically
- Real-time notification sent via WebSocket
---
 
### US-010 — Internal Transfer (Another User)
> As a **user**, I want to transfer money to another Finova user.
 
**Acceptance Criteria:**
- User provides recipient account number
- Recipient must exist in the system
- Transaction recorded for both parties
- Both users notified via WebSocket
---
 
### US-011 — External Transfer (IBAN)
> As a **user**, I want to transfer money to an account at another bank using IBAN.
 
**Acceptance Criteria:**
- User provides IBAN and recipient name
- IBAN format validated
- Transaction status starts as `pending`
- User notified when completed or failed
---
 
### US-012 — View Transactions
> As a **user**, I want to see all my transaction history.
 
**Acceptance Criteria:**
- Returns paginated list of transactions
- Filterable by date, type, account
- Sorted by most recent first
---
 
## Bills
 
### US-013 — View Bills
> As a **user**, I want to see my pending and paid bills.
 
**Acceptance Criteria:**
- Returns all bills with status (paid/unpaid)
- Bill types: electricity, water, internet, phone
---
 
### US-014 — Pay Bill
> As a **user**, I want to pay a bill directly from my account.
 
**Acceptance Criteria:**
- User selects bill and account to pay from
- Sufficient balance required
- Bill status updated to `paid`
- Notification sent via WebSocket
---
 
## Notifications
 
### US-015 — Receive Real-time Notifications
> As a **user**, I want to receive instant notifications for every financial event.
 
**Acceptance Criteria:**
- WebSocket connection established on login
- Notification sent on: transfer completed/failed, bill paid, balance updated
- Notifications stored in database
---
 
### US-016 — View Notifications
> As a **user**, I want to see all my past notifications.
 
**Acceptance Criteria:**
- Returns all notifications sorted by date
- Shows read/unread status
---
 
### US-017 — Mark Notification as Read
> As a **user**, I want to mark notifications as read.
 
**Acceptance Criteria:**
- Updates notification status to read
- User can only update their own notifications
---
 
## AI Advisor
 
### US-018 — Chat with AI Advisor
> As a **user**, I want to manage my finances through natural language conversation.
 
**Acceptance Criteria:**
- AI detects user language automatically
- AI can execute: transfers, balance checks, transaction history
- AI responds in the same language as the user
- Conversation history maintained across sessions
---
 
### US-019 — Spending Analysis
> As a **user**, I want the AI to analyze my spending patterns.
 
**Acceptance Criteria:**
- AI analyzes last 30 days of transactions
- Returns breakdown by category
- Identifies top spending areas
- Provides personalized recommendations
---
 
### US-020 — Savings Plan
> As a **user**, I want the AI to create a personalized savings plan.
 
**Acceptance Criteria:**
- AI analyzes income and spending
- Suggests realistic monthly savings amount
- Provides step-by-step savings strategy
---
 
## Priority Matrix
 
| Story | Priority | Sprint |
|-------|----------|--------|
| US-001 Register | 🔴 High | 1 |
| US-002 Login | 🔴 High | 1 |
| US-003 Refresh Token | 🔴 High | 1 |
| US-005 View Accounts | 🔴 High | 1 |
| US-006 Create Account | 🔴 High | 1 |
| US-009 Internal Transfer | 🔴 High | 2 |
| US-012 View Transactions | 🔴 High | 2 |
| US-015 Real-time Notifications | 🟡 Medium | 2 |
| US-013 View Bills | 🟡 Medium | 3 |
| US-014 Pay Bill | 🟡 Medium | 3 |
| US-018 AI Chat | 🔴 High | 3 |
| US-019 Spending Analysis | 🟡 Medium | 4 |
| US-020 Savings Plan | 🟡 Medium | 4 |
| US-011 External Transfer | 🟢 Low | 4 |
 