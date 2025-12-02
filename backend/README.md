# ContaDash Backend

API REST para ContaDash - Sistema de Gestión Financiera

## 🚀 Quick Start

### Prerrequisitos

- Node.js 20 LTS
- PostgreSQL 15+
- npm

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Generar Prisma Client
npx prisma generate

# Crear base de datos y ejecutar migraciones
npx prisma migrate dev --name init

# Ejecutar seeds
npx prisma db seed

# Iniciar servidor de desarrollo
npm run dev
```

El servidor estará corriendo en `http://localhost:4000`

## 📁 Estructura

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Lógica de negocio
│   ├── middleware/      # Auth, validation, etc
│   ├── routes/          # Definición de rutas
│   ├── validations/     # Schemas Zod
│   ├── utils/           # Utilidades
│   ├── config/          # Configuración
│   ├── app.ts           # Express app
│   └── server.ts        # Entry point
├── prisma/
│   ├── schema.prisma    # Schema de base de datos
│   ├── migrations/      # Migraciones
│   └── seeds/           # Seeds
└── tests/               # Tests
```

## 🔧 Scripts Disponibles

```bash
npm run dev              # Desarrollo con hot reload
npm run build            # Build para producción
npm start                # Iniciar en producción
npm test                 # Ejecutar tests
npm run prisma:generate  # Generar Prisma Client
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:seed      # Ejecutar seeds
npm run prisma:studio    # Abrir Prisma Studio
```

## 🗄️ Base de Datos

### Crear base de datos

```bash
# PostgreSQL
createdb contadash

# O con psql
psql -U postgres
CREATE DATABASE contadash;
```

### Migraciones

```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Reset database (⚠️ borra todos los datos)
npx prisma migrate reset
```

### Seeds

```bash
# Ejecutar seeds
npx prisma db seed
```

Esto creará:
- Usuario demo: `demo@contadash.com` / `demo123456`
- Categorías por defecto (ingresos y egresos)
- Cotizaciones de ejemplo (últimos 30 días)

## 🔐 Autenticación

El backend usa JWT para autenticación.

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "demo@contadash.com",
  "password": "demo123456"
}
```

Respuesta:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "demo@contadash.com",
    "name": "Demo User"
  }
}
```

### Usar token

```bash
GET /api/transactions
Authorization: Bearer eyJhbGc...
```

## 📡 Endpoints

### Health Check

```bash
GET /health
```

### API Info

```bash
GET /api
```

### Auth (próximamente)

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Transactions (próximamente)

- `GET /api/transactions` - Listar transacciones
- `POST /api/transactions` - Crear transacción
- `GET /api/transactions/:id` - Obtener transacción
- `PUT /api/transactions/:id` - Actualizar transacción
- `DELETE /api/transactions/:id` - Eliminar transacción

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en watch mode
npm test -- --watch
```

## 🔒 Seguridad

- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ JWT con httpOnly (próximamente)
- ✅ Validación con Zod
- ✅ Bcrypt para passwords (12 rounds)
- ✅ Row Level Security en PostgreSQL

## 📝 Variables de Entorno

Ver `.env.example` para todas las variables disponibles.

Principales:
- `PORT` - Puerto del servidor (default: 4000)
- `DATABASE_URL` - URL de PostgreSQL
- `JWT_SECRET` - Secret para JWT
- `ALLOWED_ORIGINS` - Orígenes permitidos para CORS

## 🚀 Deployment

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Render

1. Conectar repositorio
2. Build command: `npm install && npx prisma generate`
3. Start command: `npm start`

## 📚 Documentación

Ver `/guia` en la raíz del proyecto para documentación completa.

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

Verificar que PostgreSQL esté corriendo:
```bash
pg_isready
```

Verificar DATABASE_URL en `.env`

### Error: "Prisma Client not generated"

```bash
npx prisma generate
```

### Puerto 4000 en uso

Cambiar `PORT` en `.env` o:
```bash
PORT=4001 npm run dev
```

## 📄 Licencia

Proprietary - Todos los derechos reservados © 2025 ContaDash
