# API Documentation — Finova

## Base URL

Development: http://localhost:3000

## Authentication
All protected endpoints require: Authorization: Bearer <access_token>

---

## Auth Endpoints

### POST `/auth/register`
Register a new user.

**Request:**
```json
{
  "name": "Angham Abuabed",
  "email": "angham@example.com",
  "phone": "+972599000000",
  "password": "password123"
}
```

**Response `201`:**
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "name": "Angham Abuabed",
    "email": "angham@example.com",
    "phone": "+972599000000"
  }
}
```

---

### POST `/auth/login`
Login with existing credentials.

**Request:**
```json
{
  "email": "angham@example.com",
  "password": "password123"
}
```

**Response `200`:**
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "name": "Angham Abuabed",
    "email": "angham@example.com"
  }
}
```

---

### GET `/auth/me`
  Protected — Get current user info.

**Response `200`:**
```json
{
  "userId": "uuid",
  "email": "angham@example.com"
}
```

---

## ❌ Error Responses

| Status | Meaning |
|--------|---------|
| `400` | Bad Request — missing or invalid fields |
| `401` | Unauthorized — invalid credentials or missing token |
| `409` | Conflict — email or phone already exists |
| `500` | Internal Server Error |



## Account Endpoints

### POST `/accounts`
 Protected — Create a new bank account.

**Request:**
```json
{
  "accountType": "checking",
  "currency": "USD"
}
```

**Account types:** `checking` | `savings`
**Currencies:** `USD` | `EUR`

**Response `201`:**
```json
{
  "id": "uuid",
  "accountType": "checking",
  "accountNumber": "FIN-3D1AB3AD",
  "balance": "0",
  "currency": "USD",
  "isActive": true,
  "createdAt": "2026-05-17T12:46:55.903Z"
}
```

---

### GET `/accounts`
Protected — Get all user accounts.

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "accountType": "checking",
    "accountNumber": "FIN-3D1AB3AD",
    "balance": "0",
    "currency": "USD",
    "isActive": true
  }
]
```

---

### GET `/accounts/:id`
 Protected — Get account by ID.

---

### GET `/accounts/:id/balance`
Protected — Get account balance.

**Response `200`:**
```json
{
  "balance": "0",
  "Currency": "USD"
}
```
