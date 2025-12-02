# 🏗️ Arquitectura del Backend - ContaDash

## 🎯 Objetivo

Este documento describe **exhaustivamente** todas las APIs del backend, sus endpoints, parámetros, respuestas, y lógica de negocio. Es esencial para conectar correctamente la app móvil.

---

## 🌐 Información General

### **Base URL**

- **Desarrollo Local**: `http://192.168.0.81:3000/api`
- **Producción**: `https://api.contadash.com/api`

### **Autenticación**

Todas las APIs (excepto auth) requieren token JWT en el header:

```
Authorization: Bearer <token>
```

### **Formato de Respuestas**

**Éxito**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Error**:
```json
{
  "success": false,
  "error": "Mensaje de error"
}
```

---

## 📚 Módulos de API

### **1. 🔐 Autenticación (`/api/auth`)**

#### **1.1 Login**

**Endpoint**: `POST /api/auth/login`

**Body**:
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx123abc",
    "email": "usuario@ejemplo.com",
    "name": "Usuario Ejemplo",
    "plan": "FREE"
  }
}
```

**Errores**:
- `401`: Credenciales inválidas
- `400`: Email o password faltante

#### **1.2 Register**

**Endpoint**: `POST /api/auth/register`

**Body**:
```json
{
  "name": "Usuario Nuevo",
  "email": "nuevo@ejemplo.com",
  "password": "contraseña123"
}
```

**Response**:
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "clx123abc",
    "email": "nuevo@ejemplo.com",
    "name": "Usuario Nuevo"
  }
}
```

**Validaciones**:
- Email único
- Password mínimo 8 caracteres
- Nombre mínimo 2 caracteres

#### **1.3 Forgot Password**

**Endpoint**: `POST /api/auth/forgot-password`

**Body**:
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response**:
```json
{
  "message": "Email de recuperación enviado"
}
```

#### **1.4 Reset Password**

**Endpoint**: `POST /api/auth/reset-password`

**Body**:
```json
{
  "token": "reset-token-123",
  "password": "nuevaContraseña123"
}
```

**Response**:
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

#### **1.5 Verify Email**

**Endpoint**: `POST /api/auth/verify-email`

**Body**:
```json
{
  "token": "verify-token-123"
}
```

**Response**:
```json
{
  "message": "Email verificado exitosamente"
}
```

---

### **2. 💰 Transacciones (`/api/transactions`)**

#### **2.1 Listar Transacciones**

**Endpoint**: `GET /api/transactions`

**Query Params**:
```
?month=12
&year=2025
&type=INCOME
&categoryId=cat123
&clientId=cli123
&creditCardId=card123
&paymentMethod=CASH
&startDate=2025-01-01
&endDate=2025-12-31
&search=descripcion
&minAmount=1000
&maxAmount=50000
&page=1
&limit=50
```

**Response**:
```json
{
  "transactions": [
    {
      "id": "trx123",
      "date": "2025-12-01T10:00:00Z",
      "type": "INCOME",
      "categoryId": "cat123",
      "category": {
        "id": "cat123",
        "name": "Salario",
        "icon": "💰",
        "color": "#10B981"
      },
      "clientId": "cli123",
      "client": {
        "id": "cli123",
        "company": "Empresa SA"
      },
      "description": "Pago mensual",
      "amountArs": 150000,
      "amountUsd": 104.17,
      "exchangeRate": 1440,
      "paymentMethod": "BANK_ACCOUNT",
      "bankAccountId": "bank123",
      "notes": "Notas adicionales",
      "attachmentUrl": "https://...",
      "isPaid": true,
      "month": 12,
      "year": 2025,
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2025-12-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

#### **2.2 Obtener Transacción por ID**

**Endpoint**: `GET /api/transactions/:id`

**Response**:
```json
{
  "transaction": { /* igual que arriba */ }
}
```

#### **2.3 Crear Transacción**

**Endpoint**: `POST /api/transactions`

**Body**:
```json
{
  "date": "2025-12-01",
  "type": "INCOME",
  "categoryId": "cat123",
  "clientId": "cli123",
  "description": "Descripción",
  "amountArs": 150000,
  "amountUsd": 104.17,
  "exchangeRate": 1440,
  "paymentMethod": "BANK_ACCOUNT",
  "bankAccountId": "bank123",
  "notes": "Notas opcionales"
}
```

**Response**:
```json
{
  "transaction": { /* transacción creada */ }
}
```

**Validaciones**:
- `date`: Requerido, formato YYYY-MM-DD
- `type`: Requerido, INCOME o EXPENSE
- `categoryId`: Requerido, debe existir
- `description`: Requerido, máximo 200 caracteres
- `amountArs`: Requerido, > 0
- `exchangeRate`: Requerido, > 0
- `amountUsd`: Calculado automáticamente si no se provee

**Lógica Automática**:
```typescript
// Backend calcula month y year automáticamente
const date = new Date(body.date)
const month = date.getMonth() + 1
const year = date.getFullYear()

// Si no se provee amountUsd, se calcula
if (!body.amountUsd) {
  body.amountUsd = body.amountArs / body.exchangeRate
}
```

#### **2.4 Actualizar Transacción**

**Endpoint**: `PUT /api/transactions/:id`

**Body**: (Campos opcionales)
```json
{
  "description": "Nueva descripción",
  "amountArs": 160000,
  "notes": "Notas actualizadas"
}
```

**Response**:
```json
{
  "transaction": { /* transacción actualizada */ }
}
```

#### **2.5 Eliminar Transacción**

**Endpoint**: `DELETE /api/transactions/:id`

**Response**:
```json
{
  "message": "Transacción eliminada exitosamente"
}
```

#### **2.6 Estadísticas**

**Endpoint**: `GET /api/transactions/stats`

**Query Params**:
```
?month=12
&year=2025
```

**Response**:
```json
{
  "stats": {
    "income": {
      "ars": 500000,
      "usd": 347.22
    },
    "expense": {
      "ars": 350000,
      "usd": 243.06
    },
    "balance": {
      "ars": 150000,
      "usd": 104.17
    },
    "count": 45
  }
}
```

**Lógica**:
- Si `month` y `year`: Estadísticas del mes
- Si solo `year`: Estadísticas del año completo
- Si ninguno: Estadísticas de todos los tiempos

#### **2.7 Transacciones con Tarjetas**

**Endpoint**: `GET /api/transactions/monthly-with-cards`

**Query Params**:
```
?month=12
&year=2025
```

**Response**:
```json
{
  "transactions": [ /* lista de transacciones */ ],
  "creditCardPlaceholders": [
    {
      "id": "placeholder-card123-2025-12",
      "creditCardId": "card123",
      "creditCard": {
        "id": "card123",
        "name": "Visa Gold",
        "bank": "Santander",
        "lastFourDigits": "4532"
      },
      "month": 12,
      "year": 2025,
      "closingDate": "2025-12-15",
      "dueDate": "2026-01-10",
      "totalAmount": 0,
      "isPaid": false
    }
  ]
}
```

**Descripción**: Devuelve transacciones del mes más placeholders para tarjetas de crédito (para mostrar resúmenes de cierre).

---

### **3. 📁 Categorías (`/api/categories`)**

#### **3.1 Listar Categorías**

**Endpoint**: `GET /api/categories`

**Query Params**:
```
?type=INCOME
```

**Response**:
```json
{
  "categories": [
    {
      "id": "cat123",
      "name": "Salario",
      "type": "INCOME",
      "color": "#10B981",
      "icon": "💰",
      "isDefault": false,
      "userId": "user123",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### **3.2 Crear Categoría**

**Endpoint**: `POST /api/categories`

**Body**:
```json
{
  "name": "Nueva Categoría",
  "type": "INCOME",
  "color": "#3B82F6",
  "icon": "📊"
}
```

**Response**:
```json
{
  "category": { /* categoría creada */ }
}
```

**Validaciones**:
- Nombre único por usuario y tipo
- Color en formato hex
- Tipo: INCOME o EXPENSE

#### **3.3 Actualizar Categoría**

**Endpoint**: `PUT /api/categories/:id`

**Body**:
```json
{
  "name": "Nombre Actualizado",
  "color": "#EF4444",
  "icon": "🎯"
}
```

#### **3.4 Eliminar Categoría**

**Endpoint**: `DELETE /api/categories/:id`

**Validación**: No se puede eliminar si tiene transacciones asociadas.

---

### **4. 👥 Clientes (`/api/clients`)**

#### **4.1 Listar Clientes**

**Endpoint**: `GET /api/clients`

**Query Params**:
```
?active=true
```

**Response**:
```json
{
  "clients": [
    {
      "id": "cli123",
      "company": "Empresa SA",
      "email": "contacto@empresa.com",
      "phone": "+54 11 1234-5678",
      "responsible": "Juan Pérez",
      "active": true,
      "userId": "user123",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### **4.2 Crear Cliente**

**Endpoint**: `POST /api/clients`

**Body**:
```json
{
  "company": "Nueva Empresa",
  "email": "contacto@nueva.com",
  "phone": "+54 11 9876-5432",
  "responsible": "María García"
}
```

**Validaciones**:
- Company único por usuario
- Email formato válido (opcional)

#### **4.3 Actualizar Cliente**

**Endpoint**: `PUT /api/clients/:id`

#### **4.4 Eliminar Cliente**

**Endpoint**: `DELETE /api/clients/:id`

---

### **5. 💳 Tarjetas de Crédito (`/api/credit-cards`)**

#### **5.1 Listar Tarjetas**

**Endpoint**: `GET /api/credit-cards`

**Response**:
```json
{
  "creditCards": [
    {
      "id": "card123",
      "name": "Visa Gold",
      "bank": "Santander",
      "lastFourDigits": "4532",
      "creditLimit": 500000,
      "closingDay": 15,
      "dueDay": 10,
      "isActive": true,
      "userId": "user123",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### **5.2 Crear Tarjeta**

**Endpoint**: `POST /api/credit-cards`

**Body**:
```json
{
  "name": "Mastercard Black",
  "bank": "BBVA",
  "lastFourDigits": "8765",
  "creditLimit": 800000,
  "closingDay": 20,
  "dueDay": 15
}
```

**Validaciones**:
- lastFourDigits: 4 dígitos
- closingDay: 1-31
- dueDay: 1-31
- Combinación bank + lastFourDigits única por usuario

---

### **6. 🏦 Cuentas Bancarias (`/api/bank-accounts`)**

#### **6.1 Listar Cuentas**

**Endpoint**: `GET /api/bank-accounts`

**Query Params**:
```
?currency=ARS
```

**Response**:
```json
{
  "bankAccounts": [
    {
      "id": "bank123",
      "name": "Cuenta Corriente",
      "bank": "Banco Nación",
      "accountType": "CHECKING",
      "accountNumber": "1234567890",
      "currency": "ARS",
      "balance": 250000,
      "isActive": true,
      "userId": "user123",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### **6.2 Crear Cuenta**

**Endpoint**: `POST /api/bank-accounts`

**Body**:
```json
{
  "name": "Caja de Ahorro USD",
  "bank": "Banco Galicia",
  "accountType": "SAVINGS",
  "accountNumber": "0987654321",
  "currency": "USD",
  "balance": 5000
}
```

**Validaciones**:
- accountType: SAVINGS, CHECKING, INVESTMENT
- currency: ARS, USD
- Combinación bank + accountNumber única por usuario

---

### **7. 💰 Presupuestos (`/api/budgets`)**

#### **7.1 Listar Presupuestos**

**Endpoint**: `GET /api/budgets`

**Query Params**:
```
?month=12
&year=2025
```

**Response**:
```json
{
  "budgets": [
    {
      "id": "bud123",
      "categoryId": "cat123",
      "category": {
        "id": "cat123",
        "name": "Supermercado",
        "icon": "🛒",
        "color": "#EF4444"
      },
      "month": 12,
      "year": 2025,
      "amountArs": 100000,
      "amountUsd": 69.44,
      "spent": 75000,
      "remaining": 25000,
      "percentage": 75,
      "userId": "user123",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

**Nota**: `spent`, `remaining`, y `percentage` se calculan en el backend basándose en las transacciones del mes.

#### **7.2 Crear Presupuesto**

**Endpoint**: `POST /api/budgets`

**Body**:
```json
{
  "categoryId": "cat123",
  "month": 12,
  "year": 2025,
  "amountArs": 100000,
  "amountUsd": 69.44
}
```

**Validaciones**:
- No duplicar presupuesto para misma categoría/mes/año
- Categoría debe ser de tipo EXPENSE

---

### **8. 🔄 Transacciones Recurrentes (`/api/recurring-transactions`)**

#### **8.1 Listar Recurrentes**

**Endpoint**: `GET /api/recurring-transactions`

**Response**:
```json
{
  "recurringTransactions": [
    {
      "id": "rec123",
      "type": "EXPENSE",
      "categoryId": "cat123",
      "category": {
        "id": "cat123",
        "name": "Alquiler",
        "icon": "🏠",
        "color": "#EF4444"
      },
      "description": "Alquiler mensual",
      "amountArs": 80000,
      "amountUsd": 55.56,
      "exchangeRate": 1440,
      "frequency": "MONTHLY",
      "dayOfMonth": 10,
      "startDate": "2025-01-01",
      "endDate": null,
      "isActive": true,
      "paymentMethod": "BANK_ACCOUNT",
      "bankAccountId": "bank123",
      "notes": "Pago automático",
      "userId": "user123",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### **8.2 Crear Recurrente**

**Endpoint**: `POST /api/recurring-transactions`

**Body**:
```json
{
  "type": "EXPENSE",
  "categoryId": "cat123",
  "description": "Netflix",
  "amountArs": 5000,
  "amountUsd": 3.47,
  "exchangeRate": 1440,
  "frequency": "MONTHLY",
  "dayOfMonth": 5,
  "startDate": "2025-01-01",
  "endDate": null,
  "paymentMethod": "MERCADOPAGO"
}
```

**Validaciones**:
- frequency: DAILY, WEEKLY, MONTHLY, YEARLY
- dayOfMonth: Requerido si frequency es MONTHLY (1-31)
- startDate: Requerido
- endDate: Opcional

**Lógica de Generación**:
Las transacciones recurrentes se generan automáticamente cuando se consulta un mes específico. El backend verifica si ya existe una transacción generada para ese período y la crea si no existe.

---

### **9. 📊 Analytics (`/api/analytics`)**

#### **9.1 Dashboard**

**Endpoint**: `GET /api/analytics/dashboard`

**Response**:
```json
{
  "currentMonth": {
    "income": { "ars": 500000, "usd": 347.22 },
    "expense": { "ars": 350000, "usd": 243.06 },
    "balance": { "ars": 150000, "usd": 104.17 },
    "transactionCount": 45
  },
  "previousMonth": {
    "income": { "ars": 450000, "usd": 312.50 },
    "expense": { "ars": 320000, "usd": 222.22 }
  },
  "percentageChange": {
    "income": 11.11,
    "expense": 9.38,
    "balance": 44.23
  }
}
```

#### **9.2 Evolución Mensual**

**Endpoint**: `GET /api/analytics/monthly-evolution`

**Query Params**:
```
?year=2025
```

**Response**:
```json
{
  "months": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  "income": [450000, 480000, 500000, 520000, 510000, 530000, 540000, 550000, 560000, 570000, 580000, 590000],
  "expense": [320000, 330000, 340000, 350000, 360000, 370000, 380000, 390000, 400000, 410000, 420000, 430000],
  "balance": [130000, 150000, 160000, 170000, 150000, 160000, 160000, 160000, 160000, 160000, 160000, 160000]
}
```

#### **9.3 Evolución por Categorías**

**Endpoint**: `GET /api/analytics/category-evolution`

**Query Params**:
```
?period=12
```

**Response**:
```json
{
  "labels": ["Ene 2025", "Feb 2025", "Mar 2025", ...],
  "datasets": [
    {
      "label": "Salario (Ingresos)",
      "data": [150000, 150000, 150000, ...],
      "borderColor": "#10B981",
      "type": "INCOME"
    },
    {
      "label": "Supermercado (Egresos)",
      "data": [80000, 85000, 90000, ...],
      "borderColor": "#EF4444",
      "type": "EXPENSE"
    }
  ]
}
```

#### **9.4 Ingresos por Clientes**

**Endpoint**: `GET /api/analytics/client-income`

**Query Params**:
```
?period=12
```

**Response**:
```json
{
  "labels": ["Ene 2025", "Feb 2025", ...],
  "datasets": [
    {
      "label": "Empresa SA",
      "data": [200000, 220000, 210000, ...]
    },
    {
      "label": "Consultoría SRL",
      "data": [150000, 160000, 155000, ...]
    }
  ]
}
```

#### **9.5 Consumos por Tarjetas**

**Endpoint**: `GET /api/analytics/card-spending`

**Query Params**:
```
?period=12
```

**Response**:
```json
{
  "labels": ["Ene 2025", "Feb 2025", ...],
  "datasets": [
    {
      "label": "Visa Gold",
      "data": [120000, 130000, 125000, ...]
    },
    {
      "label": "Mastercard Black",
      "data": [80000, 85000, 90000, ...]
    }
  ]
}
```

#### **9.6 Comparación Anual**

**Endpoint**: `GET /api/analytics/year-comparison`

**Query Params**:
```
?year=2025
```

**Response**:
```json
{
  "currentYear": {
    "months": ["Ene", "Feb", ...],
    "income": [500000, 520000, ...],
    "expense": [350000, 360000, ...]
  },
  "previousYear": {
    "months": ["Ene", "Feb", ...],
    "income": [450000, 470000, ...],
    "expense": [320000, 330000, ...]
  },
  "growth": {
    "income": [11.11, 10.64, ...],
    "expense": [9.38, 9.09, ...]
  }
}
```

#### **9.7 Anomalías**

**Endpoint**: `GET /api/analytics/anomalies`

**Query Params**:
```
?period=12
```

**Response**:
```json
{
  "anomalies": [
    {
      "id": "trx789",
      "date": "2025-11-15",
      "type": "EXPENSE",
      "categoryName": "Supermercado",
      "description": "Compra inusual",
      "amount": 50000,
      "severity": "high",
      "reason": "Monto 3.5x mayor al promedio",
      "suggestion": "Revisar transacción"
    }
  ]
}
```

---

### **10. 📄 Reportes (`/api/reports`)**

#### **10.1 Generar Reporte**

**Endpoint**: `POST /api/reports/generate`

**Body**:
```json
{
  "type": "income",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "filters": {
    "categoryId": "cat123",
    "clientId": "cli123"
  },
  "format": "pdf"
}
```

**Response**:
```json
{
  "url": "https://storage.contadash.com/reports/report-123.pdf",
  "filename": "reporte-ingresos-2025.pdf",
  "size": 245678
}
```

**Tipos de Reporte**:
- `income`: Reporte de ingresos
- `expense`: Reporte de egresos
- `balance`: Reporte de balance
- `tax`: Reporte de impuestos

**Formatos**:
- `pdf`: PDF descargable
- `excel`: Excel (.xlsx)
- `csv`: CSV

---

### **11. 💱 Exchange Rates (`/api/exchange`)**

#### **11.1 Cotización Actual**

**Endpoint**: `GET /api/exchange/dolar-blue`

**Response**:
```json
{
  "rate": 1435.50,
  "date": "2025-12-01",
  "source": "dolarapi.com"
}
```

#### **11.2 Cotización Histórica**

**Endpoint**: `GET /api/exchange/dolar-blue/date/:date`

**Params**:
- `date`: Fecha en formato YYYY-MM-DD

**Response**:
```json
{
  "rate": 1350.00,
  "date": "2025-10-31",
  "source": "database"
}
```

---

### **12. 👤 Usuario (`/api/users`)**

#### **12.1 Perfil**

**Endpoint**: `GET /api/users/profile`

**Response**:
```json
{
  "user": {
    "id": "user123",
    "email": "usuario@ejemplo.com",
    "name": "Usuario Ejemplo",
    "company": "Mi Empresa",
    "plan": "FREE",
    "image": "https://...",
    "emailVerified": true,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

#### **12.2 Actualizar Perfil**

**Endpoint**: `PUT /api/users/profile`

**Body**:
```json
{
  "name": "Nuevo Nombre",
  "company": "Nueva Empresa",
  "image": "https://..."
}
```

#### **12.3 Cambiar Contraseña**

**Endpoint**: `PUT /api/users/change-password`

**Body**:
```json
{
  "currentPassword": "contraseñaActual",
  "newPassword": "nuevaContraseña123"
}
```

---

## 🔒 Seguridad

### **Autenticación JWT**

**Token Structure**:
```json
{
  "userId": "user123",
  "email": "usuario@ejemplo.com",
  "iat": 1701432000,
  "exp": 1702036800
}
```

**Expiración**: 7 días

**Refresh**: No implementado (usar re-login)

### **Rate Limiting**

- **Global**: 100 requests / 15 minutos
- **Login**: 5 intentos / 15 minutos
- **Register**: 3 intentos / hora

### **CORS**

**Orígenes permitidos**:
- `http://localhost:3001`
- `http://192.168.0.81:3001`
- Redes locales privadas (192.168.x.x, 10.x.x.x)

---

## 🎯 Códigos de Error

| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validación) |
| 401 | Unauthorized (sin token o inválido) |
| 403 | Forbidden (sin permisos) |
| 404 | Not Found |
| 409 | Conflict (duplicado) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

---

## 📊 Modelos de Datos

### **User**
```typescript
{
  id: string
  email: string
  passwordHash: string
  name: string
  company?: string
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
  emailVerified?: Date
  image?: string
  createdAt: Date
  updatedAt: Date
}
```

### **Transaction**
```typescript
{
  id: string
  userId: string
  date: Date
  month: number
  year: number
  type: 'INCOME' | 'EXPENSE'
  categoryId: string
  clientId?: string
  description: string
  amountArs: number
  amountUsd: number
  exchangeRate: number
  notes?: string
  attachmentUrl?: string
  creditCardId?: string
  paymentMethod?: 'CASH' | 'MERCADOPAGO' | 'BANK_ACCOUNT' | 'CRYPTO'
  bankAccountId?: string
  isPaid: boolean
  recurringTransactionId?: string
  createdAt: Date
  updatedAt: Date
}
```

### **Category**
```typescript
{
  id: string
  userId: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  color: string
  icon: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}
```

### **Client**
```typescript
{
  id: string
  userId: string
  company: string
  email?: string
  phone?: string
  responsible?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}
```

### **CreditCard**
```typescript
{
  id: string
  userId: string
  name: string
  bank: string
  lastFourDigits: string
  creditLimit?: number
  closingDay: number
  dueDay: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### **BankAccount**
```typescript
{
  id: string
  userId: string
  name: string
  bank: string
  accountType: 'SAVINGS' | 'CHECKING' | 'INVESTMENT'
  accountNumber: string
  currency: 'ARS' | 'USD'
  balance?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### **Budget**
```typescript
{
  id: string
  userId: string
  categoryId: string
  month: number
  year: number
  amountArs: number
  amountUsd: number
  createdAt: Date
  updatedAt: Date
}
```

### **RecurringTransaction**
```typescript
{
  id: string
  userId: string
  type: 'INCOME' | 'EXPENSE'
  categoryId: string
  clientId?: string
  creditCardId?: string
  description: string
  amountArs: number
  amountUsd: number
  exchangeRate: number
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  startDate: Date
  endDate?: Date
  dayOfMonth?: number
  isActive: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

### **ExchangeRate**
```typescript
{
  id: string
  date: Date
  currencyFrom: string
  currencyTo: string
  rate: number
  source: string
  createdAt: Date
}
```

---

## 🔗 Relaciones

```
User
├── Transactions (1:N)
├── Categories (1:N)
├── Clients (1:N)
├── CreditCards (1:N)
├── BankAccounts (1:N)
├── Budgets (1:N)
└── RecurringTransactions (1:N)

Transaction
├── Category (N:1)
├── Client (N:1)
├── CreditCard (N:1)
├── BankAccount (N:1)
└── RecurringTransaction (N:1)

Budget
└── Category (N:1)

RecurringTransaction
├── Category (N:1)
├── Client (N:1)
└── CreditCard (N:1)
```

---

## 📝 Notas Importantes

1. **Todas las APIs requieren autenticación** excepto las de `/api/auth`
2. **Los montos se guardan como Decimal** en la base de datos
3. **Las fechas se devuelven en ISO 8601** format
4. **La paginación es opcional** en la mayoría de endpoints
5. **Los filtros son acumulativos** (AND lógico)
6. **El userId se extrae del token JWT** automáticamente
7. **No se pueden ver/modificar datos de otros usuarios**

---

**Última actualización**: 1 de Diciembre, 2025  
**Versión**: 1.0.0
