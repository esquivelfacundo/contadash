# 📡 API Documentation - ContaDash

## Base URL
```
Production: https://contadash.com/api
Development: http://localhost:3000/api
```

## Authentication
Todas las rutas (excepto `/auth/*`) requieren autenticación via JWT en cookie httpOnly.

---

## Endpoints

### Authentication

#### POST /auth/register
Registrar nuevo usuario.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "company": "ACME Inc" // opcional
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "user": {
    "id": "clx123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST /auth/login
Iniciar sesión (manejado por NextAuth).

---

### Transactions

#### GET /transactions
Listar transacciones del usuario.

**Query Parameters:**
- `page` (number): Página (default: 1)
- `limit` (number): Items por página (default: 50, max: 100)
- `type` (string): INCOME | EXPENSE
- `categoryId` (string): Filtrar por categoría
- `clientId` (string): Filtrar por cliente
- `dateFrom` (ISO date): Fecha desde
- `dateTo` (ISO date): Fecha hasta
- `search` (string): Búsqueda en descripción

**Response:** `200 OK`
```json
{
  "transactions": [
    {
      "id": "clx123",
      "date": "2025-01-15T00:00:00.000Z",
      "type": "INCOME",
      "category": {
        "id": "cat123",
        "name": "Ads",
        "icon": "📢",
        "color": "#10b981"
      },
      "client": {
        "id": "cli123",
        "name": "iCenter"
      },
      "description": "Ads Enero",
      "amountArs": 500000.00,
      "amountUsd": 500.00,
      "exchangeRate": 1000.00,
      "notes": null,
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

#### POST /transactions
Crear transacción.

**Request:**
```json
{
  "date": "2025-01-15",
  "type": "INCOME",
  "categoryId": "cat123",
  "clientId": "cli123", // opcional
  "description": "Ads Enero",
  "amountArs": 500000, // al menos uno requerido
  "amountUsd": 500, // al menos uno requerido
  "exchangeRate": 1000,
  "notes": "Pago recibido" // opcional
}
```

**Response:** `201 Created`
```json
{
  "id": "clx123",
  "date": "2025-01-15T00:00:00.000Z",
  "type": "INCOME",
  "categoryId": "cat123",
  "clientId": "cli123",
  "description": "Ads Enero",
  "amountArs": 500000.00,
  "amountUsd": 500.00,
  "exchangeRate": 1000.00,
  "notes": "Pago recibido",
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

#### GET /transactions/:id
Obtener transacción por ID.

**Response:** `200 OK`
```json
{
  "id": "clx123",
  "date": "2025-01-15T00:00:00.000Z",
  "type": "INCOME",
  "category": { ... },
  "client": { ... },
  "description": "Ads Enero",
  "amountArs": 500000.00,
  "amountUsd": 500.00,
  "exchangeRate": 1000.00
}
```

#### PUT /transactions/:id
Actualizar transacción.

**Request:** (campos a actualizar)
```json
{
  "description": "Ads Enero - Actualizado",
  "amountArs": 550000
}
```

**Response:** `200 OK`

#### DELETE /transactions/:id
Eliminar transacción.

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

### Categories

#### GET /categories
Listar categorías del usuario.

**Query Parameters:**
- `type` (string): INCOME | EXPENSE

**Response:** `200 OK`
```json
{
  "categories": [
    {
      "id": "cat123",
      "name": "Ads",
      "type": "INCOME",
      "icon": "📢",
      "color": "#10b981",
      "isDefault": true
    }
  ]
}
```

#### POST /categories
Crear categoría.

**Request:**
```json
{
  "name": "Consultoría Premium",
  "type": "INCOME",
  "icon": "💎",
  "color": "#8b5cf6"
}
```

**Response:** `201 Created`

#### PUT /categories/:id
Actualizar categoría.

#### DELETE /categories/:id
Eliminar categoría (solo si no tiene transacciones asociadas).

---

### Clients

#### GET /clients
Listar clientes.

**Query Parameters:**
- `active` (boolean): Filtrar por activos

**Response:** `200 OK`
```json
{
  "clients": [
    {
      "id": "cli123",
      "name": "iCenter",
      "email": "contact@icenter.com",
      "phone": "+54911...",
      "company": "iCenter SRL",
      "active": true
    }
  ]
}
```

#### POST /clients
Crear cliente.

**Request:**
```json
{
  "name": "Nuevo Cliente",
  "email": "cliente@example.com",
  "phone": "+54911...",
  "company": "Cliente SA",
  "taxId": "20-12345678-9"
}
```

#### PUT /clients/:id
Actualizar cliente.

#### DELETE /clients/:id
Eliminar cliente.

---

### Analytics

#### GET /analytics/dashboard
Dashboard principal.

**Query Parameters:**
- `month` (number): 1-12
- `year` (number): YYYY

**Response:** `200 OK`
```json
{
  "income": {
    "amountArs": 5000000.00,
    "amountUsd": 5000.00
  },
  "expenses": {
    "amountArs": 3000000.00,
    "amountUsd": 3000.00
  },
  "balance": {
    "ars": 2000000.00,
    "usd": 2000.00
  },
  "pnl": 40.00,
  "topCategories": [...],
  "topClients": [...],
  "monthlyTrend": [...]
}
```

#### GET /analytics/client/:clientId
Análisis por cliente.

**Query Parameters:**
- `year` (number): YYYY

**Response:** `200 OK`
```json
{
  "total": {
    "amountArs": 1500000.00,
    "amountUsd": 1500.00
  },
  "transactionCount": 12,
  "monthlyBreakdown": [...],
  "categoryBreakdown": [...]
}
```

#### GET /analytics/category/:categoryId
Análisis por categoría.

---

### Exchange Rates

#### GET /exchange-rates
Obtener cotizaciones.

**Query Parameters:**
- `date` (ISO date): Fecha específica
- `from` (ISO date): Rango desde
- `to` (ISO date): Rango hasta

**Response:** `200 OK`
```json
{
  "rates": [
    {
      "date": "2025-01-15",
      "currencyFrom": "USD",
      "currencyTo": "ARS",
      "rate": 1000.50,
      "source": "dolarapi"
    }
  ]
}
```

#### GET /exchange-rates/latest
Obtener cotización actual.

**Response:** `200 OK`
```json
{
  "date": "2025-01-15",
  "rate": 1000.50,
  "source": "dolarapi"
}
```

---

### Budgets

#### GET /budgets
Listar presupuestos.

**Query Parameters:**
- `month` (number): 1-12
- `year` (number): YYYY

**Response:** `200 OK`
```json
{
  "budgets": [
    {
      "id": "bud123",
      "category": {
        "id": "cat123",
        "name": "Publicidad"
      },
      "month": 1,
      "year": 2025,
      "amountArs": 500000.00,
      "amountUsd": 500.00,
      "alertThreshold": 0.80,
      "spent": {
        "amountArs": 450000.00,
        "percentage": 90.00
      }
    }
  ]
}
```

#### POST /budgets
Crear presupuesto.

**Request:**
```json
{
  "categoryId": "cat123",
  "month": 1,
  "year": 2025,
  "amountArs": 500000,
  "amountUsd": 500,
  "alertThreshold": 0.80
}
```

---

### Reports

#### GET /reports/monthly
Reporte mensual.

**Query Parameters:**
- `month` (number): 1-12
- `year` (number): YYYY
- `format` (string): json | pdf | excel

**Response:** `200 OK` (JSON) o archivo descargable

#### GET /reports/annual
Reporte anual.

**Query Parameters:**
- `year` (number): YYYY
- `format` (string): json | pdf | excel

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limits

- **Authentication:** 5 requests / 15 minutes
- **Transactions:** 100 requests / minute
- **Analytics:** 20 requests / minute
- **Reports:** 10 requests / minute

---

## Webhooks (Future)

### POST /webhooks
Configurar webhook.

**Request:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["transaction.created", "transaction.updated"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload
```json
{
  "event": "transaction.created",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "data": {
    "id": "clx123",
    "type": "INCOME",
    "amountArs": 500000.00
  }
}
```

---

**Última actualización:** 29 de Noviembre, 2025  
**Versión:** 1.0.0
