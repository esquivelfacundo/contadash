# 📚 Complete API Documentation - ContaDash

**Base URL:** `http://localhost:4000/api`

---

## 🔐 Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication.

**Header:**
```
Authorization: Bearer <token>
```

---

## 📋 Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Transactions](#transactions-endpoints)
3. [Categories](#categories-endpoints)
4. [Clients](#clients-endpoints)
5. [Analytics](#analytics-endpoints)

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "company": "Acme Inc" // optional
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "company": "Acme Inc",
    "plan": "FREE",
    "createdAt": "2025-11-29T..."
  },
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "demo@contadash.com",
  "password": "demo123456"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {...},
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### GET /api/auth/profile
Get current user profile.

**Response (200):**
```json
{
  "user": {
    "id": "...",
    "email": "demo@contadash.com",
    "name": "Demo User",
    "company": "Demo Company",
    "plan": "PRO",
    "emailVerified": "2025-11-29T...",
    "createdAt": "2025-11-29T...",
    "updatedAt": "2025-11-29T..."
  }
}
```

### POST /api/auth/logout
Logout (client-side token removal).

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

## Transactions Endpoints

### GET /api/transactions
List transactions with filters and pagination.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50, max: 100)
- `type` (INCOME | EXPENSE)
- `categoryId`
- `clientId`
- `startDate` (ISO 8601)
- `endDate` (ISO 8601)
- `month` (1-12)
- `year`
- `search` (searches in description and notes)

**Example:**
```bash
GET /api/transactions?type=INCOME&month=11&year=2025&page=1&limit=20
```

**Response (200):**
```json
{
  "transactions": [
    {
      "id": "...",
      "date": "2025-11-29T12:00:00.000Z",
      "type": "INCOME",
      "description": "Proyecto Web",
      "amountArs": "500000",
      "amountUsd": "500",
      "exchangeRate": "1000",
      "notes": null,
      "category": {
        "id": "...",
        "name": "Ads",
        "type": "INCOME",
        "color": "#10b981",
        "icon": "📢"
      },
      "client": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### POST /api/transactions
Create a new transaction.

**Request:**
```json
{
  "date": "2025-11-29T12:00:00Z",
  "type": "INCOME",
  "categoryId": "...",
  "clientId": "...", // optional
  "description": "Proyecto Web",
  "amountArs": 500000,
  "amountUsd": 500,
  "exchangeRate": 1000,
  "notes": "Pago inicial" // optional
}
```

**Response (201):**
```json
{
  "message": "Transaction created successfully",
  "transaction": {...}
}
```

### GET /api/transactions/:id
Get a single transaction by ID.

**Response (200):**
```json
{
  "transaction": {...}
}
```

### PUT /api/transactions/:id
Update a transaction.

**Request:**
```json
{
  "description": "Proyecto Web - Actualizado",
  "amountArs": 550000
  // All fields are optional
}
```

**Response (200):**
```json
{
  "message": "Transaction updated successfully",
  "transaction": {...}
}
```

### DELETE /api/transactions/:id
Delete a transaction.

**Response (200):**
```json
{
  "message": "Transaction deleted successfully"
}
```

### GET /api/transactions/stats
Get transaction statistics.

**Query Parameters:**
- `month` (optional)
- `year` (optional)

**Response (200):**
```json
{
  "stats": {
    "income": {
      "ars": 500000,
      "usd": 500
    },
    "expense": {
      "ars": 0,
      "usd": 0
    },
    "balance": {
      "ars": 500000,
      "usd": 500
    },
    "count": 1
  }
}
```

---

## Categories Endpoints

### GET /api/categories
List all categories.

**Query Parameters:**
- `type` (INCOME | EXPENSE) - optional

**Response (200):**
```json
{
  "categories": [
    {
      "id": "...",
      "name": "Ads",
      "type": "INCOME",
      "color": "#10b981",
      "icon": "📢",
      "isDefault": true,
      "createdAt": "2025-11-29T...",
      "updatedAt": "2025-11-29T..."
    }
  ]
}
```

### POST /api/categories
Create a new category.

**Request:**
```json
{
  "name": "Freelance",
  "type": "INCOME",
  "color": "#3b82f6", // optional, default: #3b82f6
  "icon": "💼" // optional, default: 💰
}
```

**Response (201):**
```json
{
  "message": "Category created successfully",
  "category": {...}
}
```

### GET /api/categories/:id
Get a single category.

**Response (200):**
```json
{
  "category": {...}
}
```

### PUT /api/categories/:id
Update a category (cannot update default categories).

**Request:**
```json
{
  "name": "Freelance Projects",
  "color": "#6366f1",
  "icon": "💻"
}
```

**Response (200):**
```json
{
  "message": "Category updated successfully",
  "category": {...}
}
```

### DELETE /api/categories/:id
Delete a category (cannot delete default categories or categories with transactions).

**Response (200):**
```json
{
  "message": "Category deleted successfully"
}
```

---

## Clients Endpoints

### GET /api/clients
List all clients.

**Query Parameters:**
- `active` (true | false) - optional, filter by active status

**Response (200):**
```json
{
  "clients": [
    {
      "id": "...",
      "name": "Acme Corp",
      "email": "contact@acme.com",
      "phone": "+1234567890",
      "company": "Acme Corporation",
      "active": true,
      "createdAt": "2025-11-29T...",
      "updatedAt": "2025-11-29T..."
    }
  ]
}
```

### POST /api/clients
Create a new client.

**Request:**
```json
{
  "name": "Acme Corp",
  "email": "contact@acme.com", // optional
  "phone": "+1234567890", // optional
  "company": "Acme Corporation" // optional
}
```

**Response (201):**
```json
{
  "message": "Client created successfully",
  "client": {...}
}
```

### GET /api/clients/:id
Get a single client with transaction count.

**Response (200):**
```json
{
  "client": {
    "id": "...",
    "name": "Acme Corp",
    "email": "contact@acme.com",
    "phone": "+1234567890",
    "company": "Acme Corporation",
    "active": true,
    "_count": {
      "transactions": 5
    },
    "createdAt": "2025-11-29T...",
    "updatedAt": "2025-11-29T..."
  }
}
```

### PUT /api/clients/:id
Update a client.

**Request:**
```json
{
  "name": "Acme Corporation",
  "email": "info@acme.com",
  "active": false
}
```

**Response (200):**
```json
{
  "message": "Client updated successfully",
  "client": {...}
}
```

### DELETE /api/clients/:id
Delete a client (cannot delete clients with transactions).

**Response (200):**
```json
{
  "message": "Client deleted successfully"
}
```

### GET /api/clients/:id/stats
Get financial statistics for a client.

**Response (200):**
```json
{
  "stats": {
    "income": {
      "ars": 500000,
      "usd": 500
    },
    "expense": {
      "ars": 50000,
      "usd": 50
    },
    "balance": {
      "ars": 450000,
      "usd": 450
    },
    "transactionCount": 10
  }
}
```

---

## Analytics Endpoints

### GET /api/analytics/dashboard
Get comprehensive dashboard data.

**Response (200):**
```json
{
  "currentMonth": {
    "month": 11,
    "year": 2025,
    "income": {
      "ars": 500000,
      "usd": 500,
      "count": 1
    },
    "expense": {
      "ars": 0,
      "usd": 0,
      "count": 0
    },
    "balance": {
      "ars": 500000,
      "usd": 500
    },
    "profitMargin": 100,
    "incomeGrowth": 100,
    "expenseGrowth": 0
  },
  "previousMonth": {...},
  "year": {...},
  "recentTransactions": [...],
  "topCategories": [...],
  "topClients": [...]
}
```

### GET /api/analytics/trend
Get monthly trend data.

**Query Parameters:**
- `year` (default: current year)
- `months` (default: 12, max: 24)

**Response (200):**
```json
{
  "trend": [
    {
      "month": 1,
      "year": 2025,
      "income": {...},
      "expense": {...},
      "balance": {...},
      "profitMargin": 45.5
    }
  ]
}
```

### GET /api/analytics/category-breakdown
Get category breakdown by type.

**Query Parameters:**
- `type` (INCOME | EXPENSE) - required
- `month` (optional)
- `year` (optional)

**Response (200):**
```json
{
  "breakdown": [
    {
      "categoryId": "...",
      "categoryName": "Ads",
      "categoryColor": "#10b981",
      "categoryIcon": "📢",
      "totalArs": 500000,
      "totalUsd": 500,
      "count": 1,
      "percentage": 100
    }
  ]
}
```

### GET /api/analytics/client/:clientId
Get detailed analysis for a specific client.

**Response (200):**
```json
{
  "analysis": {
    "income": {...},
    "expense": {...},
    "balance": {...},
    "profitMargin": 90,
    "monthlyTrend": [...],
    "categoryBreakdown": [...]
  }
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "error": "Validation error",
  "details": {
    "fieldErrors": {
      "email": ["Invalid email format"]
    }
  }
}
```

### 401 - Unauthorized
```json
{
  "error": "No token provided"
}
```

### 403 - Forbidden
```json
{
  "error": "Access denied",
  "code": "FORBIDDEN"
}
```

### 404 - Not Found
```json
{
  "error": "Transaction not found",
  "code": "NOT_FOUND"
}
```

### 409 - Conflict
```json
{
  "error": "Email already registered",
  "code": "CONFLICT"
}
```

### 500 - Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Response Codes Summary

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Not authorized |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 500 | Server Error | Internal error |

---

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per window
- **Headers:**
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

---

## Testing

**Demo Credentials:**
```json
{
  "email": "demo@contadash.com",
  "password": "demo123456"
}
```

**Quick Test Flow:**
```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@contadash.com","password":"demo123456"}' \
  -s | jq -r '.token')

# 2. Get categories
curl http://localhost:4000/api/categories \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Create transaction
curl -X POST http://localhost:4000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-11-29T12:00:00Z",
    "type": "INCOME",
    "categoryId": "...",
    "description": "Test",
    "amountArs": 10000,
    "amountUsd": 10,
    "exchangeRate": 1000
  }' | jq

# 4. Get dashboard
curl http://localhost:4000/api/analytics/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

**Last Updated:** November 29, 2025  
**API Version:** 1.0.0
