# 🧪 API Tests - ContaDash Backend

## Base URL
```
http://localhost:4000
```

---

## ✅ Health Check

### GET /health

```bash
curl http://localhost:4000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-29T18:49:42.577Z"
}
```

---

## 🔐 Authentication

### POST /api/auth/register

Registrar un nuevo usuario.

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "company": "Acme Inc"
  }'
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "cmiknfw350000i0pkkgm2e4ek",
    "email": "user@example.com",
    "name": "John Doe",
    "company": "Acme Inc",
    "plan": "FREE",
    "createdAt": "2025-11-29T18:53:08.273Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Errors (400):**
```json
{
  "error": "Validation error",
  "details": {
    "fieldErrors": {
      "email": ["Invalid email format"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

**Email Already Exists (409):**
```json
{
  "error": "Email already registered",
  "code": "CONFLICT"
}
```

---

### POST /api/auth/login

Iniciar sesión.

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@contadash.com",
    "password": "demo123456"
  }'
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "cmiknaz2s0000etgo30yg4w2n",
    "email": "demo@contadash.com",
    "name": "Demo User",
    "company": "Demo Company",
    "plan": "PRO",
    "createdAt": "2025-11-29T18:49:18.867Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Invalid Credentials (401):**
```json
{
  "error": "Invalid credentials",
  "code": "UNAUTHORIZED"
}
```

---

### GET /api/auth/profile

Obtener perfil del usuario autenticado.

**Requiere:** Token JWT en header `Authorization: Bearer <token>`

```bash
curl http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200):**
```json
{
  "user": {
    "id": "cmiknaz2s0000etgo30yg4w2n",
    "email": "demo@contadash.com",
    "name": "Demo User",
    "company": "Demo Company",
    "plan": "PRO",
    "emailVerified": "2025-11-29T18:49:18.811Z",
    "createdAt": "2025-11-29T18:49:18.867Z",
    "updatedAt": "2025-11-29T18:49:18.867Z"
  }
}
```

**No Token (401):**
```json
{
  "error": "No token provided"
}
```

**Invalid Token (401):**
```json
{
  "error": "Invalid token"
}
```

---

### POST /api/auth/logout

Cerrar sesión (client-side, el servidor solo confirma).

**Requiere:** Token JWT

```bash
curl -X POST http://localhost:4000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

## 📝 Demo Credentials

Para testing rápido:

```json
{
  "email": "demo@contadash.com",
  "password": "demo123456"
}
```

---

## 🧪 Testing Flow

### 1. Register New User

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepass123",
    "name": "New User"
  }' | jq

# Save the token from response
TOKEN="<token_from_response>"
```

### 2. Login

```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@contadash.com",
    "password": "demo123456"
  }' | jq

# Save the token
TOKEN="<token_from_response>"
```

### 3. Access Protected Route

```bash
# Get profile
curl http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 4. Logout

```bash
# Logout
curl -X POST http://localhost:4000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 🔒 Security Notes

1. **Tokens expire in 7 days** (configurable en .env)
2. **Refresh tokens expire in 30 days**
3. **Passwords** se hashean con bcrypt (12 rounds)
4. **JWT Secret** debe ser fuerte en producción
5. **HTTPS** obligatorio en producción

---

## 🐛 Common Errors

### 400 - Validation Error
- Email inválido
- Password muy corto (<8 caracteres)
- Campos requeridos faltantes

### 401 - Unauthorized
- Token no proporcionado
- Token inválido o expirado
- Credenciales incorrectas

### 409 - Conflict
- Email ya registrado

### 500 - Internal Server Error
- Error de base de datos
- Error del servidor

---

## 📊 Response Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Request exitoso |
| 201 | Created | Usuario creado |
| 400 | Bad Request | Validación falló |
| 401 | Unauthorized | No autenticado |
| 403 | Forbidden | No autorizado |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Email duplicado |
| 500 | Server Error | Error interno |

---

## 🎯 Next Steps

Próximos endpoints a implementar:

- [ ] `GET /api/transactions` - Listar transacciones
- [ ] `POST /api/transactions` - Crear transacción
- [ ] `GET /api/transactions/:id` - Obtener transacción
- [ ] `PUT /api/transactions/:id` - Actualizar transacción
- [ ] `DELETE /api/transactions/:id` - Eliminar transacción
- [ ] `GET /api/categories` - Listar categorías
- [ ] `POST /api/categories` - Crear categoría
- [ ] `GET /api/clients` - Listar clientes
- [ ] `POST /api/clients` - Crear cliente
- [ ] `GET /api/analytics/dashboard` - Dashboard data

---

**Última actualización:** 29 de Noviembre, 2025
