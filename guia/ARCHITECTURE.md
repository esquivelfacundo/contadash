# 🏗️ Arquitectura del Proyecto - ContaDash

## Índice
1. [Visión General](#visión-general)
2. [Arquitectura de 3 Capas](#arquitectura-de-3-capas)
3. [Backend (API)](#backend-api)
4. [Frontend (Web)](#frontend-web)
5. [Mobile (App)](#mobile-app)
6. [Shared (Código Compartido)](#shared-código-compartido)
7. [Flujo de Datos](#flujo-de-datos)
8. [Comunicación entre Capas](#comunicación-entre-capas)

---

## Visión General

ContaDash utiliza una **arquitectura de 3 capas separadas**:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
│                    MOBILE (React Native)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Node.js + Express)                 │
│                    API REST + Prisma ORM                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQL
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                     │
│                   Row Level Security                        │
└─────────────────────────────────────────────────────────────┘
```

### Ventajas de esta Arquitectura

✅ **Separación de Responsabilidades**
- Backend: Lógica de negocio y acceso a datos
- Frontend: UI/UX y experiencia web
- Mobile: Experiencia móvil nativa

✅ **Escalabilidad Independiente**
- Cada capa puede escalar por separado
- Backend puede servir múltiples clientes

✅ **Desarrollo Paralelo**
- Equipos pueden trabajar independientemente
- Frontend/Mobile comparten el mismo backend

✅ **Reutilización de Código**
- Carpeta `shared/` con tipos y validaciones
- Un solo backend para web y mobile

✅ **Deployment Independiente**
- Backend en Railway/Render
- Frontend en Vercel
- Mobile en Expo EAS

---

## Arquitectura de 3 Capas

### 1. Backend (API)
**Tecnología:** Node.js + Express + TypeScript  
**Puerto:** 4000  
**URL:** `http://localhost:4000/api`

**Responsabilidades:**
- Autenticación y autorización
- Lógica de negocio
- Acceso a base de datos
- Validación de datos
- Rate limiting
- Logging y monitoring

### 2. Frontend (Web)
**Tecnología:** Next.js 14 + TypeScript  
**Puerto:** 3000  
**URL:** `http://localhost:3000`

**Responsabilidades:**
- UI/UX web
- Server-side rendering (SSR)
- Consumo de API backend
- State management
- Routing

### 3. Mobile (App)
**Tecnología:** React Native + Expo  
**Puerto:** Expo Dev Server  

**Responsabilidades:**
- UI/UX móvil nativa
- Consumo de API backend
- Sincronización offline
- Notificaciones push
- Biometría

---

## Backend (API)

### Estructura

```
backend/
├── src/
│   ├── controllers/          # Controladores (request handlers)
│   ├── services/             # Lógica de negocio
│   ├── middleware/           # Middlewares (auth, validation, etc)
│   ├── routes/               # Definición de rutas
│   ├── validations/          # Schemas de validación (Zod)
│   ├── utils/                # Utilidades
│   ├── config/               # Configuración
│   ├── types/                # Types específicos del backend
│   ├── app.ts                # Configuración de Express
│   └── server.ts             # Entry point
├── prisma/
│   ├── schema.prisma         # Schema de base de datos
│   ├── migrations/           # Migraciones
│   └── seeds/                # Seeds
├── tests/
├── .env.example
├── package.json
└── tsconfig.json
```

### Patrón MVC (Modelo-Vista-Controlador)

```typescript
// routes/transactions.routes.ts
router.post('/transactions', 
  authMiddleware,
  validateRequest(createTransactionSchema),
  transactionController.create
)

// controllers/transactions.controller.ts
export const create = async (req: Request, res: Response) => {
  const transaction = await transactionService.create(req.user.id, req.body)
  res.json(transaction)
}

// services/transaction.service.ts
export const create = async (userId: string, data: CreateTransactionInput) => {
  // Lógica de negocio
  return prisma.transaction.create({ data: { ...data, userId } })
}
```

### Stack Backend

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| Runtime | Node.js 20 | Ejecución de JavaScript |
| Framework | Express.js | API REST |
| Language | TypeScript | Type safety |
| ORM | Prisma | Acceso a base de datos |
| Validation | Zod | Validación de schemas |
| Auth | JWT | Autenticación |
| Security | Helmet, CORS | Headers de seguridad |
| Rate Limiting | express-rate-limit | Prevención de abuso |
| Logging | Winston/Pino | Logs estructurados |

### Endpoints Principales

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout

GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/:id
PUT    /api/transactions/:id
DELETE /api/transactions/:id

GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id

GET    /api/clients
POST   /api/clients
PUT    /api/clients/:id
DELETE /api/clients/:id

GET    /api/analytics/dashboard
GET    /api/analytics/client/:id
GET    /api/analytics/category/:id

GET    /api/exchange-rates/latest
GET    /api/exchange-rates?date=YYYY-MM-DD
```

---

## Frontend (Web)

### Estructura

```
frontend/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/          # Grupo de rutas de auth
│   │   ├── (dashboard)/     # Grupo de rutas de dashboard
│   │   ├── layout.tsx       # Layout raíz
│   │   └── page.tsx         # Página principal
│   ├── components/
│   │   ├── ui/              # Componentes base (Button, Card, etc)
│   │   ├── forms/           # Formularios
│   │   ├── charts/          # Gráficos
│   │   ├── layouts/         # Layouts (Sidebar, Navbar)
│   │   └── dashboard/       # Componentes del dashboard
│   ├── lib/
│   │   ├── api/             # Cliente API (axios)
│   │   ├── hooks/           # Custom hooks
│   │   ├── store/           # State management (Zustand)
│   │   ├── theme.ts         # MUI Theme
│   │   └── utils.ts         # Utilidades
│   ├── styles/
│   │   └── globals.css      # Estilos globales
│   └── types/
│       └── index.ts         # Types del frontend
├── public/
├── .env.local.example
├── next.config.js
└── package.json
```

### Stack Frontend

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| Framework | Next.js 14 | React framework |
| Language | TypeScript | Type safety |
| UI Library | Material-UI | Componentes |
| Styling | CSS Global + MUI | Estilos |
| Charts | Recharts | Gráficos |
| Forms | React Hook Form | Formularios |
| Validation | Zod | Validación |
| State | Zustand | State management |
| Data Fetching | React Query | Cache y sincronización |
| HTTP Client | Axios | Requests HTTP |

### Comunicación con Backend

```typescript
// lib/api/client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
})

// Interceptor para agregar token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// lib/api/transactions.ts
export const getTransactions = async (filters?: TransactionFilters) => {
  const { data } = await apiClient.get('/transactions', { params: filters })
  return data
}

export const createTransaction = async (input: CreateTransactionInput) => {
  const { data } = await apiClient.post('/transactions', input)
  return data
}
```

### Server Components vs Client Components

```typescript
// Server Component (default en Next.js 14)
// app/(dashboard)/dashboard/page.tsx
export default async function DashboardPage() {
  // Fetch directo en el servidor
  const stats = await fetch(`${API_URL}/analytics/dashboard`).then(r => r.json())
  
  return <DashboardStats data={stats} />
}

// Client Component (cuando necesitas interactividad)
// components/forms/TransactionForm.tsx
'use client'

export function TransactionForm() {
  const [amount, setAmount] = useState('')
  
  return (
    <input 
      value={amount} 
      onChange={(e) => setAmount(e.target.value)} 
    />
  )
}
```

---

## Mobile (App)

### Estructura

```
mobile/
├── src/
│   ├── screens/              # Pantallas
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── analytics/
│   │   └── settings/
│   ├── components/           # Componentes reutilizables
│   ├── navigation/           # Navegación
│   ├── services/             # Servicios (API, storage, sync)
│   ├── store/                # State management (Zustand)
│   ├── hooks/                # Custom hooks
│   ├── utils/                # Utilidades
│   ├── types/                # Types
│   └── theme/                # Tema
├── assets/
├── app.json
├── eas.json
└── package.json
```

### Stack Mobile

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| Framework | React Native | Framework móvil |
| Toolchain | Expo | Build y deploy |
| Language | TypeScript | Type safety |
| UI Library | React Native Paper | Componentes |
| Navigation | React Navigation | Navegación |
| State | Zustand | State management |
| Data Fetching | React Query | Cache y sincronización |
| HTTP Client | Axios | Requests HTTP |
| Storage | Expo Secure Store | Almacenamiento seguro |
| Offline | React Query + AsyncStorage | Sincronización offline |

### Comunicación con Backend

```typescript
// services/api.service.ts
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const API_URL = 'https://api.contadash.com/api'

export const apiClient = axios.create({
  baseURL: API_URL,
})

// Interceptor para agregar token
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// services/auth.service.ts
export const login = async (email: string, password: string) => {
  const { data } = await apiClient.post('/auth/login', { email, password })
  await SecureStore.setItemAsync('token', data.token)
  return data
}
```

### Sincronización Offline

```typescript
// hooks/useOfflineSync.ts
import { useNetInfo } from '@react-native-community/netinfo'
import AsyncStorage from '@react-native-async-storage/async-storage'

export function useOfflineSync() {
  const netInfo = useNetInfo()
  
  const syncPendingChanges = async () => {
    if (!netInfo.isConnected) return
    
    const pending = await AsyncStorage.getItem('pending_transactions')
    if (pending) {
      const transactions = JSON.parse(pending)
      for (const t of transactions) {
        await apiClient.post('/transactions', t)
      }
      await AsyncStorage.removeItem('pending_transactions')
    }
  }
  
  useEffect(() => {
    if (netInfo.isConnected) {
      syncPendingChanges()
    }
  }, [netInfo.isConnected])
}
```

---

## Shared (Código Compartido)

### Estructura

```
shared/
├── types/                    # Types compartidos
│   ├── user.types.ts
│   ├── transaction.types.ts
│   ├── category.types.ts
│   ├── client.types.ts
│   └── api.types.ts
├── validations/              # Schemas de validación
│   ├── auth.validation.ts
│   ├── transaction.validation.ts
│   ├── category.validation.ts
│   └── client.validation.ts
├── constants/
│   └── index.ts
├── utils/
│   ├── formatters.ts
│   ├── calculations.ts
│   └── date.ts
├── package.json
└── tsconfig.json
```

### Uso en Backend

```typescript
// backend/src/routes/transactions.routes.ts
import { createTransactionSchema } from '../../../shared/validations/transaction.validation'
import { validateRequest } from '../middleware/validation.middleware'

router.post('/transactions', 
  validateRequest(createTransactionSchema),
  transactionController.create
)
```

### Uso en Frontend

```typescript
// frontend/src/components/forms/TransactionForm.tsx
import { createTransactionSchema } from '../../../shared/validations/transaction.validation'
import type { Transaction } from '../../../shared/types/transaction.types'

export function TransactionForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(createTransactionSchema)
  })
  
  // ...
}
```

### Uso en Mobile

```typescript
// mobile/src/screens/transactions/TransactionFormScreen.tsx
import { createTransactionSchema } from '../../../shared/validations/transaction.validation'
import type { Transaction } from '../../../shared/types/transaction.types'
```

---

## Flujo de Datos

### Crear Transacción (Ejemplo Completo)

```
┌─────────────┐
│   USUARIO   │
└──────┬──────┘
       │ 1. Completa formulario
       ▼
┌─────────────────────────────────┐
│  FRONTEND/MOBILE                │
│  - Validación con Zod           │
│  - createTransaction(data)      │
└──────┬──────────────────────────┘
       │ 2. POST /api/transactions
       │    Authorization: Bearer <token>
       │    Body: { date, type, amount, ... }
       ▼
┌─────────────────────────────────┐
│  BACKEND                        │
│  ┌─────────────────────────┐   │
│  │ Middleware Auth         │   │
│  │ - Verificar JWT         │   │
│  │ - Extraer userId        │   │
│  └─────────┬───────────────┘   │
│            ▼                    │
│  ┌─────────────────────────┐   │
│  │ Middleware Validation   │   │
│  │ - Validar con Zod       │   │
│  └─────────┬───────────────┘   │
│            ▼                    │
│  ┌─────────────────────────┐   │
│  │ Controller              │   │
│  │ - transactionController │   │
│  │   .create()             │   │
│  └─────────┬───────────────┘   │
│            ▼                    │
│  ┌─────────────────────────┐   │
│  │ Service                 │   │
│  │ - Lógica de negocio     │   │
│  │ - Calcular conversión   │   │
│  └─────────┬───────────────┘   │
│            ▼                    │
│  ┌─────────────────────────┐   │
│  │ Prisma ORM              │   │
│  │ - prisma.transaction    │   │
│  │   .create()             │   │
│  └─────────┬───────────────┘   │
└────────────┼───────────────────┘
             │ 3. INSERT INTO transactions
             ▼
┌─────────────────────────────────┐
│  DATABASE (PostgreSQL)          │
│  - Row Level Security           │
│  - Verificar userId             │
│  - Insertar registro            │
└──────┬──────────────────────────┘
       │ 4. Return created transaction
       ▼
┌─────────────────────────────────┐
│  BACKEND                        │
│  - Response 201 Created         │
│  - Body: { id, date, ... }      │
└──────┬──────────────────────────┘
       │ 5. Response JSON
       ▼
┌─────────────────────────────────┐
│  FRONTEND/MOBILE                │
│  - Actualizar cache (React Query)│
│  - Mostrar notificación         │
│  - Redirigir a lista            │
└─────────────────────────────────┘
```

---

## Comunicación entre Capas

### Variables de Entorno

**Backend (.env)**
```bash
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/contadash"

# Auth
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# CORS
ALLOWED_ORIGINS="http://localhost:3000,exp://192.168.1.100:8081"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

**Mobile (.env)**
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000/api
```

### CORS Configuration

```typescript
// backend/src/app.ts
import cors from 'cors'

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
```

---

## Deployment

### Backend
**Opción 1: Railway**
```bash
railway up
```

**Opción 2: Render**
- Conectar repositorio
- Build command: `cd backend && npm install && npx prisma generate`
- Start command: `cd backend && npm start`

### Frontend
**Vercel**
```bash
cd frontend
vercel --prod
```

### Mobile
**Expo EAS**
```bash
cd mobile
eas build --platform all
eas submit --platform all
```

---

## Ventajas de esta Arquitectura

### ✅ Escalabilidad
- Backend puede manejar múltiples clientes
- Frontend y Mobile escalan independientemente
- Database puede escalar verticalmente

### ✅ Mantenibilidad
- Código organizado y separado
- Fácil de entender y modificar
- Tests independientes por capa

### ✅ Seguridad
- Backend como única fuente de verdad
- Validación en múltiples capas
- Secrets solo en backend

### ✅ Performance
- Frontend con SSR (Next.js)
- Mobile con sincronización offline
- Backend con caching

### ✅ Developer Experience
- Desarrollo paralelo
- Hot reload en todas las capas
- TypeScript end-to-end

---

**Última actualización:** 29 de Noviembre, 2025  
**Versión:** 2.0.0 (Arquitectura Separada)
