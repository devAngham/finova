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
