# 🚀 ContaDash - Plan Maestro de Desarrollo

**Sistema de Gestión Financiera Multi-Usuario**  
**Versión:** 1.0.0  
**Fecha:** 29 de Noviembre, 2025  
**Stack:** Next.js 14+ | PostgreSQL | React Native | MUI

---

## 📋 Índice

1. [Visión del Proyecto](#visión-del-proyecto)
2. [Arquitectura Técnica](#arquitectura-técnica)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Modelo de Datos](#modelo-de-datos)
5. [Seguridad y Autenticación](#seguridad-y-autenticación)
6. [Estructura del Proyecto](#estructura-del-proyecto)
7. [Roadmap de Desarrollo](#roadmap-de-desarrollo)
8. [Funcionalidades Core](#funcionalidades-core)
9. [Buenas Prácticas](#buenas-prácticas)
10. [Plan de Testing](#plan-de-testing)
11. [Deployment](#deployment)
12. [Monetización](#monetización)

---

## 🎯 Visión del Proyecto

### Objetivo
Migrar el sistema de control financiero de Google Sheets a una plataforma SaaS multi-tenant, escalable y segura, con capacidades web (Next.js) y móvil (React Native).

### Propuesta de Valor
- **Para usuarios individuales:** Control financiero profesional sin complejidad de Excel/Sheets
- **Para empresas:** Dashboard ejecutivo con KPIs en tiempo real
- **Para freelancers:** Tracking de clientes, proyectos y rentabilidad

### Características Clave
- ✅ Multi-usuario con aislamiento total de datos
- ✅ Gestión de ingresos/egresos en múltiples monedas (ARS/USD)
- ✅ Categorización automática e inteligente
- ✅ Dashboard ejecutivo con KPIs y gráficos
- ✅ Reportes mensuales/anuales automatizados
- ✅ Análisis por cliente/proyecto
- ✅ Sincronización web ↔ móvil en tiempo real
- ✅ Exportación a PDF/Excel
- ✅ API pública para integraciones

---

## 🏗️ Arquitectura Técnica

### Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Web App (Next.js 14)          Mobile App (React Native)    │
│  - SSR/SSG                     - iOS/Android                │
│  - App Router                  - Expo                       │
│  - MUI Components              - React Native Paper         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  Next.js API Routes / tRPC                                  │
│  - RESTful endpoints                                        │
│  - Type-safe APIs                                           │
│  - Rate limiting                                            │
│  - Request validation (Zod)                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  Services & Controllers                                     │
│  - Transaction Service                                      │
│  - Analytics Service                                        │
│  - Report Service                                           │
│  - Currency Service (API externa)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  Prisma ORM                                                 │
│  - Type-safe queries                                        │
│  - Migrations                                               │
│  - Connection pooling                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL 15+                                             │
│  - Row Level Security (RLS)                                 │
│  - Indexes optimizados                                      │
│  - Backups automáticos                                      │
└─────────────────────────────────────────────────────────────┘
```

### Principios Arquitectónicos

1. **Separation of Concerns:** Capas bien definidas
2. **Multi-Tenancy:** Aislamiento total por usuario
3. **Type Safety:** TypeScript end-to-end
4. **Security First:** Autenticación, autorización y validación en cada capa
5. **Scalability:** Diseño para crecer horizontalmente
6. **Testability:** Código testeable con alta cobertura

---

## 🛠️ Stack Tecnológico

### Frontend Web
```json
{
  "framework": "Next.js 14.2+",
  "language": "TypeScript 5.3+",
  "ui": "Material-UI (MUI) v5",
  "styling": "CSS Global + MUI Theme",
  "charts": "Recharts / Chart.js",
  "forms": "React Hook Form + Zod",
  "state": "Zustand / React Query",
  "auth": "NextAuth.js v5"
}
```

### Frontend Mobile
```json
{
  "framework": "React Native 0.73+",
  "platform": "Expo SDK 50+",
  "language": "TypeScript 5.3+",
  "ui": "React Native Paper",
  "navigation": "React Navigation v6",
  "state": "Zustand / React Query",
  "auth": "Expo Auth Session"
}
```

### Backend
```json
{
  "runtime": "Node.js 20 LTS",
  "framework": "Next.js API Routes",
  "orm": "Prisma 5.8+",
  "database": "PostgreSQL 15+",
  "validation": "Zod",
  "api": "tRPC v10 (opcional) / REST",
  "auth": "NextAuth.js + JWT",
  "email": "Resend / SendGrid",
  "storage": "Vercel Blob / AWS S3"
}
```

### DevOps & Tools
```json
{
  "hosting": "Vercel (web) / Expo EAS (mobile)",
  "database": "Supabase / Railway / Neon",
  "ci/cd": "GitHub Actions",
  "monitoring": "Sentry",
  "analytics": "Vercel Analytics / PostHog",
  "testing": "Vitest + Playwright + React Testing Library"
}
```

### Seguridad
```json
{
  "auth": "NextAuth.js + bcrypt",
  "tokens": "JWT (httpOnly cookies)",
  "csrf": "CSRF tokens",
  "rate-limiting": "upstash/ratelimit",
  "validation": "Zod schemas",
  "encryption": "crypto (Node.js)",
  "headers": "Helmet.js"
}
```

---

## 🗄️ Modelo de Datos

### Diagrama ER

```
┌─────────────────┐
│     User        │
├─────────────────┤
│ id (PK)         │
│ email (unique)  │
│ password_hash   │
│ name            │
│ company         │
│ plan            │◄──────────┐
│ created_at      │           │
│ updated_at      │           │
└─────────────────┘           │
         │                    │
         │ 1:N                │
         ▼                    │
┌─────────────────┐           │
│  Transaction    │           │
├─────────────────┤           │
│ id (PK)         │           │
│ user_id (FK)    │───────────┘
│ date            │
│ month           │
│ type            │ (INCOME/EXPENSE)
│ category_id (FK)│──────┐
│ client_id (FK)  │──┐   │
│ description     │  │   │
│ amount_ars      │  │   │
│ amount_usd      │  │   │
│ exchange_rate   │  │   │
│ notes           │  │   │
│ created_at      │  │   │
│ updated_at      │  │   │
└─────────────────┘  │   │
                     │   │
         ┌───────────┘   │
         │               │
         ▼               ▼
┌─────────────────┐ ┌─────────────────┐
│     Client      │ │    Category     │
├─────────────────┤ ├─────────────────┤
│ id (PK)         │ │ id (PK)         │
│ user_id (FK)    │ │ user_id (FK)    │
│ name            │ │ name            │
│ email           │ │ type            │ (INCOME/EXPENSE)
│ phone           │ │ color           │
│ active          │ │ icon            │
│ created_at      │ │ is_default      │
└─────────────────┘ │ created_at      │
                    └─────────────────┘

┌─────────────────┐
│ ExchangeRate    │
├─────────────────┤
│ id (PK)         │
│ date            │
│ currency_from   │
│ currency_to     │
│ rate            │
│ source          │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│   Budget        │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ category_id (FK)│
│ month           │
│ year            │
│ amount_ars      │
│ amount_usd      │
│ created_at      │
└─────────────────┘
```

### Schema Prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum TransactionType {
  INCOME
  EXPENSE
}

enum UserPlan {
  FREE
  PRO
  ENTERPRISE
}

model User {
  id            String        @id @default(cuid())
  email         String        @unique
  passwordHash  String        @map("password_hash")
  name          String
  company       String?
  plan          UserPlan      @default(FREE)
  emailVerified DateTime?     @map("email_verified")
  image         String?
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")
  
  transactions  Transaction[]
  categories    Category[]
  clients       Client[]
  budgets       Budget[]
  
  @@map("users")
}

model Transaction {
  id            String          @id @default(cuid())
  userId        String          @map("user_id")
  date          DateTime
  month         Int
  year          Int
  type          TransactionType
  categoryId    String          @map("category_id")
  clientId      String?         @map("client_id")
  description   String
  amountArs     Decimal         @map("amount_ars") @db.Decimal(15, 2)
  amountUsd     Decimal         @map("amount_usd") @db.Decimal(15, 2)
  exchangeRate  Decimal         @map("exchange_rate") @db.Decimal(10, 4)
  notes         String?
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")
  
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  category      Category        @relation(fields: [categoryId], references: [id])
  client        Client?         @relation(fields: [clientId], references: [id])
  
  @@index([userId, date])
  @@index([userId, type])
  @@index([userId, categoryId])
  @@index([userId, clientId])
  @@map("transactions")
}

model Category {
  id          String          @id @default(cuid())
  userId      String          @map("user_id")
  name        String
  type        TransactionType
  color       String          @default("#3b82f6")
  icon        String          @default("💰")
  isDefault   Boolean         @default(false) @map("is_default")
  createdAt   DateTime        @default(now()) @map("created_at")
  
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  budgets     Budget[]
  
  @@unique([userId, name, type])
  @@index([userId, type])
  @@map("categories")
}

model Client {
  id          String        @id @default(cuid())
  userId      String        @map("user_id")
  name        String
  email       String?
  phone       String?
  active      Boolean       @default(true)
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")
  
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  
  @@unique([userId, name])
  @@index([userId, active])
  @@map("clients")
}

model ExchangeRate {
  id          String   @id @default(cuid())
  date        DateTime @unique
  currencyFrom String  @map("currency_from")
  currencyTo  String   @map("currency_to")
  rate        Decimal  @db.Decimal(10, 4)
  source      String   @default("manual")
  createdAt   DateTime @default(now()) @map("created_at")
  
  @@index([date])
  @@map("exchange_rates")
}

model Budget {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  categoryId  String   @map("category_id")
  month       Int
  year        Int
  amountArs   Decimal  @map("amount_ars") @db.Decimal(15, 2)
  amountUsd   Decimal  @map("amount_usd") @db.Decimal(15, 2)
  createdAt   DateTime @default(now()) @map("created_at")
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category    Category @relation(fields: [categoryId], references: [id])
  
  @@unique([userId, categoryId, month, year])
  @@index([userId, year, month])
  @@map("budgets")
}
```

### Políticas de Seguridad (Row Level Security)

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios datos
CREATE POLICY user_isolation_policy ON transactions
  FOR ALL
  USING (user_id = current_user_id());

CREATE POLICY user_isolation_policy ON categories
  FOR ALL
  USING (user_id = current_user_id());

CREATE POLICY user_isolation_policy ON clients
  FOR ALL
  USING (user_id = current_user_id());

CREATE POLICY user_isolation_policy ON budgets
  FOR ALL
  USING (user_id = current_user_id());
```

---

## 🔐 Seguridad y Autenticación

### Estrategia de Autenticación

**NextAuth.js v5 (Auth.js)**

```typescript
// lib/auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = loginSchema.parse(credentials)
        
        const user = await prisma.user.findUnique({
          where: { email },
        })
        
        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials")
        }
        
        const isValid = await bcrypt.compare(password, user.passwordHash)
        
        if (!isValid) {
          throw new Error("Invalid credentials")
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.plan = user.plan
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.plan = token.plan as string
      }
      return session
    },
  },
})
```

### Middleware de Protección

```typescript
// middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || 
                     req.nextUrl.pathname.startsWith("/register")
  
  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  }
  
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

### Validación de Datos (Zod)

```typescript
// lib/validations/transaction.ts
import { z } from "zod"

export const createTransactionSchema = z.object({
  date: z.date(),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().cuid(),
  clientId: z.string().cuid().optional(),
  description: z.string().min(1).max(255),
  amountArs: z.number().positive().optional(),
  amountUsd: z.number().positive().optional(),
  exchangeRate: z.number().positive(),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => data.amountArs || data.amountUsd,
  { message: "Debe especificar al menos un monto (ARS o USD)" }
)

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
})

// Uso en API routes
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1"
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response("Too Many Requests", { status: 429 })
  }
  
  // ... resto del handler
}
```

### Encriptación de Datos Sensibles

```typescript
// lib/encryption.ts
import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const SECRET_KEY = process.env.ENCRYPTION_KEY! // 32 bytes

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY, "hex"), iv)
  
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`
}

export function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(":")
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(SECRET_KEY, "hex"),
    Buffer.from(ivHex, "hex")
  )
  
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"))
  
  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")
  
  return decrypted
}
```

---

## 📁 Estructura del Proyecto

### Arquitectura Separada (Frontend / Backend / Mobile)

```
contadash/
├── backend/                    # API Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── transactions.controller.ts
│   │   │   ├── categories.controller.ts
│   │   │   ├── clients.controller.ts
│   │   │   ├── analytics.controller.ts
│   │   │   └── reports.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── transaction.service.ts
│   │   │   ├── category.service.ts
│   │   │   ├── client.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── exchange-rate.service.ts
│   │   │   └── email.service.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── transactions.routes.ts
│   │   │   ├── categories.routes.ts
│   │   │   ├── clients.routes.ts
│   │   │   ├── analytics.routes.ts
│   │   │   └── index.ts
│   │   ├── validations/
│   │   │   ├── auth.validation.ts
│   │   │   ├── transaction.validation.ts
│   │   │   ├── category.validation.ts
│   │   │   └── client.validation.ts
│   │   ├── utils/
│   │   │   ├── encryption.ts
│   │   │   ├── jwt.ts
│   │   │   ├── logger.ts
│   │   │   └── errors.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── auth.ts
│   │   │   └── app.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seeds/
│   │       ├── seed.ts
│   │       └── categories.ts
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/                   # Frontend Web (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── register/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── transactions/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── new/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── analytics/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── clients/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── categories/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── settings/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── Modal.tsx
│   │   │   ├── forms/
│   │   │   │   ├── TransactionForm.tsx
│   │   │   │   ├── CategoryForm.tsx
│   │   │   │   └── ClientForm.tsx
│   │   │   ├── charts/
│   │   │   │   ├── IncomeExpenseChart.tsx
│   │   │   │   ├── CategoryChart.tsx
│   │   │   │   └── TrendChart.tsx
│   │   │   ├── layouts/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── DashboardLayout.tsx
│   │   │   └── dashboard/
│   │   │       ├── StatsCard.tsx
│   │   │       └── RecentTransactions.tsx
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   │   ├── client.ts
│   │   │   │   ├── auth.ts
│   │   │   │   ├── transactions.ts
│   │   │   │   ├── categories.ts
│   │   │   │   └── analytics.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useTransactions.ts
│   │   │   │   └── useAnalytics.ts
│   │   │   ├── store/
│   │   │   │   ├── auth.store.ts
│   │   │   │   └── ui.store.ts
│   │   │   ├── theme.ts
│   │   │   └── utils.ts
│   │   ├── styles/
│   │   │   └── globals.css
│   │   └── types/
│   │       └── index.ts
│   ├── public/
│   │   ├── images/
│   │   └── icons/
│   ├── .env.local.example
│   ├── next.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── mobile/                     # Mobile App (React Native + Expo)
│   ├── src/
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   └── RegisterScreen.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardScreen.tsx
│   │   │   ├── transactions/
│   │   │   │   ├── TransactionListScreen.tsx
│   │   │   │   ├── TransactionDetailScreen.tsx
│   │   │   │   └── TransactionFormScreen.tsx
│   │   │   ├── analytics/
│   │   │   │   └── AnalyticsScreen.tsx
│   │   │   └── settings/
│   │   │       └── SettingsScreen.tsx
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── forms/
│   │   │   ├── charts/
│   │   │   └── cards/
│   │   ├── navigation/
│   │   │   ├── AppNavigator.tsx
│   │   │   ├── AuthNavigator.tsx
│   │   │   └── TabNavigator.tsx
│   │   ├── services/
│   │   │   ├── api.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── storage.service.ts
│   │   │   └── sync.service.ts
│   │   ├── store/
│   │   │   ├── auth.store.ts
│   │   │   ├── transactions.store.ts
│   │   │   └── offline.store.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useTransactions.ts
│   │   │   └── useOfflineSync.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── theme/
│   │       └── index.ts
│   ├── assets/
│   │   ├── images/
│   │   └── fonts/
│   ├── app.json
│   ├── eas.json
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── shared/                     # Código compartido entre proyectos
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── transaction.types.ts
│   │   ├── category.types.ts
│   │   ├── client.types.ts
│   │   └── api.types.ts
│   ├── validations/
│   │   ├── auth.validation.ts
│   │   ├── transaction.validation.ts
│   │   ├── category.validation.ts
│   │   └── client.validation.ts
│   ├── constants/
│   │   └── index.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── calculations.ts
│   │   └── date.ts
│   ├── package.json
│   └── tsconfig.json
│
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       ├── frontend-ci.yml
│       ├── mobile-ci.yml
│       └── deploy.yml
│
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
│
├── scripts/
│   ├── setup.sh
│   ├── dev.sh
│   └── deploy.sh
│
├── .gitignore
├── package.json              # Root package.json para scripts globales
└── README.md
```

---

## 🗺️ Roadmap de Desarrollo

### Fase 1: Fundación (Semanas 1-2)

**Sprint 1.1: Setup Inicial**
- [ ] Inicializar monorepo con Turborepo
- [ ] Configurar Next.js 14 con App Router
- [ ] Configurar TypeScript strict mode
- [ ] Setup ESLint + Prettier
- [ ] Configurar Prisma + PostgreSQL
- [ ] Setup NextAuth.js
- [ ] Configurar variables de entorno

**Sprint 1.2: Autenticación**
- [ ] Implementar registro de usuarios
- [ ] Implementar login con email/password
- [ ] Implementar recuperación de contraseña
- [ ] Implementar verificación de email
- [ ] Middleware de protección de rutas
- [ ] Tests de autenticación

**Sprint 1.3: Base de Datos**
- [ ] Definir schema completo en Prisma
- [ ] Crear migraciones iniciales
- [ ] Implementar seeds con datos de ejemplo
- [ ] Configurar Row Level Security
- [ ] Implementar índices optimizados
- [ ] Tests de integridad de datos

### Fase 2: Core Features (Semanas 3-5)

**Sprint 2.1: Transacciones**
- [ ] CRUD de transacciones (API)
- [ ] Formulario de creación/edición
- [ ] Lista de transacciones con filtros
- [ ] Búsqueda y ordenamiento
- [ ] Paginación
- [ ] Validaciones con Zod
- [ ] Tests unitarios

**Sprint 2.2: Categorías y Clientes**
- [ ] CRUD de categorías
- [ ] CRUD de clientes
- [ ] Categorías por defecto en onboarding
- [ ] Gestión de colores e iconos
- [ ] Tests unitarios

**Sprint 2.3: Cotizaciones**
- [ ] Integración con API de cotización (dolarapi.com)
- [ ] Cache de cotizaciones
- [ ] Histórico de cotizaciones
- [ ] Conversión automática ARS ↔ USD
- [ ] Tests de integración

### Fase 3: Analytics & Dashboard (Semanas 6-7)

**Sprint 3.1: Dashboard Principal**
- [ ] KPIs principales (ingresos, egresos, balance)
- [ ] Gráfico de ingresos vs egresos
- [ ] Gráfico de evolución mensual
- [ ] Top 5 categorías
- [ ] Top 5 clientes
- [ ] Responsive design

**Sprint 3.2: Analytics Avanzado**
- [ ] Análisis por cliente
- [ ] Análisis por categoría
- [ ] Análisis por proyecto
- [ ] Margen bruto/neto
- [ ] PnL mensual/anual
- [ ] Tendencias y predicciones

**Sprint 3.3: Reportes**
- [ ] Reporte mensual
- [ ] Reporte anual
- [ ] Exportación a PDF
- [ ] Exportación a Excel
- [ ] Envío por email

### Fase 4: UI/UX (Semanas 8-9)

**Sprint 4.1: Diseño Global**
- [ ] Implementar MUI Theme personalizado
- [ ] Crear componentes reutilizables
- [ ] Implementar dark mode
- [ ] Responsive design completo
- [ ] Animaciones y transiciones

**Sprint 4.2: Optimizaciones**
- [ ] Lazy loading de componentes
- [ ] Optimización de imágenes
- [ ] Code splitting
- [ ] SEO optimization
- [ ] Performance audit

### Fase 5: Mobile App (Semanas 10-12)

**Sprint 5.1: Setup React Native**
- [ ] Inicializar proyecto con Expo
- [ ] Configurar navegación
- [ ] Implementar autenticación
- [ ] Conectar con API
- [ ] Sincronización offline

**Sprint 5.2: Features Mobile**
- [ ] Dashboard móvil
- [ ] CRUD de transacciones
- [ ] Cámara para escanear recibos (OCR)
- [ ] Notificaciones push
- [ ] Biometría (Face ID / Touch ID)

**Sprint 5.3: Testing & Deploy**
- [ ] Tests E2E con Detox
- [ ] Build para iOS
- [ ] Build para Android
- [ ] Deploy a TestFlight
- [ ] Deploy a Google Play (beta)

### Fase 6: Features Avanzadas (Semanas 13-15)

**Sprint 6.1: Multi-Currency**
- [ ] Soporte para múltiples monedas
- [ ] Conversión automática
- [ ] Gráficos multi-moneda

**Sprint 6.2: Presupuestos**
- [ ] CRUD de presupuestos
- [ ] Alertas de presupuesto
- [ ] Comparación presupuesto vs real

**Sprint 6.3: Integraciones**
- [ ] API pública (REST)
- [ ] Webhooks
- [ ] Integración con Mercado Pago
- [ ] Integración con bancos (Open Banking)

### Fase 7: Testing & QA (Semana 16)

- [ ] Tests unitarios (>80% coverage)
- [ ] Tests de integración
- [ ] Tests E2E con Playwright
- [ ] Security audit
- [ ] Performance testing
- [ ] User acceptance testing (UAT)

### Fase 8: Deployment & Launch (Semana 17)

- [ ] Deploy a producción (Vercel)
- [ ] Configurar dominio
- [ ] Configurar SSL
- [ ] Configurar monitoring (Sentry)
- [ ] Configurar analytics
- [ ] Documentación final
- [ ] Launch 🚀

---

## ⚙️ Funcionalidades Core

### 1. Gestión de Transacciones

**Features:**
- Crear ingreso/egreso con formulario intuitivo
- Categorización automática (ML opcional)
- Asignación a cliente/proyecto
- Soporte multi-moneda (ARS/USD)
- Conversión automática con cotización del día
- Adjuntar comprobantes (imágenes/PDFs)
- Notas y etiquetas
- Búsqueda avanzada
- Filtros múltiples
- Exportación masiva

**UI Components:**
```typescript
// components/transactions/TransactionForm.tsx
interface TransactionFormProps {
  type: 'INCOME' | 'EXPENSE'
  initialData?: Transaction
  onSubmit: (data: CreateTransactionInput) => Promise<void>
}

// components/transactions/TransactionList.tsx
interface TransactionListProps {
  filters: TransactionFilters
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}
```

### 2. Dashboard Ejecutivo

**KPIs Principales:**
- Total ingresos (ARS/USD)
- Total egresos (ARS/USD)
- Balance neto
- PnL % mensual/anual
- Margen bruto/neto
- % ingresos dolarizados
- Tasa de conversión

**Gráficos:**
- Ingresos vs Egresos (línea temporal)
- Distribución por categoría (pie chart)
- Top 5 clientes (bar chart)
- Evolución mensual (área chart)
- Cotización del dólar (línea)
- Heatmap de rentabilidad

### 3. Análisis por Cliente

**Features:**
- Ingresos totales por cliente
- Rentabilidad por cliente
- Proyectos activos
- Histórico de transacciones
- Gráfico de evolución
- Comparación entre clientes

### 4. Análisis por Categoría

**Features:**
- Gastos por categoría
- Comparación mensual
- Tendencias
- Presupuesto vs real
- Alertas de sobregasto

### 5. Reportes Automatizados

**Tipos:**
- Reporte mensual (PDF/Excel)
- Reporte anual (PDF/Excel)
- Reporte por cliente
- Reporte por categoría
- Reporte personalizado

**Envío:**
- Email automático mensual
- Descarga manual
- Compartir link público (con expiración)

---

## 🎨 Diseño y UX

### Theme MUI Personalizado

```typescript
// lib/theme.ts
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Blue
      light: '#60a5fa',
      dark: '#1e40af',
    },
    secondary: {
      main: '#10b981', // Green
      light: '#34d399',
      dark: '#059669',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    success: {
      main: '#10b981',
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
})
```

### CSS Global

```css
/* styles/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  font-family: 'Inter', sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```

---

## ✅ Buenas Prácticas

### 1. TypeScript Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 2. Error Handling

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

// Uso en API routes
export async function GET(req: Request) {
  try {
    const data = await fetchData()
    return Response.json(data)
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }
    
    console.error('Unexpected error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 3. Logging

```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
})

// Uso
logger.info({ userId: '123' }, 'User logged in')
logger.error({ error }, 'Failed to create transaction')
```

### 4. API Response Format

```typescript
// lib/api-response.ts
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: any
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

export function successResponse<T>(data: T, meta?: any): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
  }
}

export function errorResponse(
  message: string,
  code?: string,
  details?: any
): ApiResponse {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
  }
}
```

### 5. Database Queries

```typescript
// lib/db/transactions.ts
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export async function getTransactions(
  userId: string,
  filters: TransactionFilters
) {
  const where: Prisma.TransactionWhereInput = {
    userId,
    ...(filters.type && { type: filters.type }),
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(filters.clientId && { clientId: filters.clientId }),
    ...(filters.dateFrom && {
      date: { gte: filters.dateFrom },
    }),
    ...(filters.dateTo && {
      date: { lte: filters.dateTo },
    }),
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: true,
        client: true,
      },
      orderBy: { date: 'desc' },
      skip: filters.skip,
      take: filters.limit,
    }),
    prisma.transaction.count({ where }),
  ])

  return { transactions, total }
}
```

### 6. Environment Variables

```bash
# .env.example
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/contadash"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Encryption
ENCRYPTION_KEY="your-32-byte-hex-key"

# Email
RESEND_API_KEY="re_xxx"
EMAIL_FROM="noreply@contadash.com"

# External APIs
DOLAR_API_URL="https://dolarapi.com/v1"

# Rate Limiting
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# Monitoring
SENTRY_DSN="https://xxx@sentry.io/xxx"

# Storage
BLOB_READ_WRITE_TOKEN="xxx"
```

---

## 🧪 Plan de Testing

### Estructura de Tests

```
tests/
├── unit/
│   ├── lib/
│   ├── components/
│   └── utils/
├── integration/
│   ├── api/
│   └── db/
└── e2e/
    ├── auth.spec.ts
    ├── transactions.spec.ts
    └── dashboard.spec.ts
```

### Unit Tests (Vitest)

```typescript
// tests/unit/lib/calculations.test.ts
import { describe, it, expect } from 'vitest'
import { calculatePnL, convertCurrency } from '@/lib/calculations'

describe('calculatePnL', () => {
  it('should calculate PnL correctly', () => {
    const income = 100000
    const expenses = 60000
    const pnl = calculatePnL(income, expenses)
    
    expect(pnl).toBe(40)
  })

  it('should return 0 when income is 0', () => {
    const pnl = calculatePnL(0, 1000)
    expect(pnl).toBe(0)
  })
})

describe('convertCurrency', () => {
  it('should convert USD to ARS correctly', () => {
    const usd = 100
    const rate = 1000
    const ars = convertCurrency(usd, rate)
    
    expect(ars).toBe(100000)
  })
})
```

### Integration Tests

```typescript
// tests/integration/api/transactions.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { createTransaction } from '@/lib/db/transactions'

describe('Transaction API', () => {
  let userId: string

  beforeAll(async () => {
    // Setup test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'hashed',
        name: 'Test User',
      },
    })
    userId = user.id
  })

  afterAll(async () => {
    // Cleanup
    await prisma.user.delete({ where: { id: userId } })
  })

  it('should create a transaction', async () => {
    const transaction = await createTransaction({
      userId,
      date: new Date(),
      type: 'INCOME',
      categoryId: 'cat-123',
      description: 'Test income',
      amountArs: 10000,
      amountUsd: 10,
      exchangeRate: 1000,
    })

    expect(transaction).toBeDefined()
    expect(transaction.userId).toBe(userId)
    expect(transaction.amountArs).toBe(10000)
  })
})
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/transactions.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Transactions', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should create a new transaction', async ({ page }) => {
    await page.goto('/transactions')
    await page.click('button:has-text("Nueva Transacción")')
    
    await page.fill('[name="description"]', 'Test transaction')
    await page.fill('[name="amountArs"]', '10000')
    await page.selectOption('[name="categoryId"]', 'cat-123')
    
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Test transaction')).toBeVisible()
  })
})
```

### Coverage Goals

- **Unit Tests:** >80% coverage
- **Integration Tests:** >70% coverage
- **E2E Tests:** Critical user flows

---

## 🚀 Deployment

### Vercel (Web App)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables (set in Vercel dashboard)
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
# ... etc
```

### Database (Supabase/Neon)

**Opción 1: Supabase**
- PostgreSQL managed
- Row Level Security built-in
- Backups automáticos
- Free tier generoso

**Opción 2: Neon**
- PostgreSQL serverless
- Branching de databases
- Autoscaling
- Pay-per-use

### Mobile (Expo EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint
        
      - name: Run type check
        run: npm run type-check
        
      - name: Run tests
        run: npm run test
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Build
        run: npm run build
```

### Monitoring (Sentry)

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
})
```

---

## 💰 Monetización

### Planes de Suscripción

**FREE**
- 1 usuario
- 100 transacciones/mes
- 3 clientes
- 5 categorías personalizadas
- Reportes básicos
- Soporte por email

**PRO ($9.99/mes)**
- 1 usuario
- Transacciones ilimitadas
- Clientes ilimitados
- Categorías ilimitadas
- Reportes avanzados
- Exportación PDF/Excel
- Soporte prioritario
- API access

**ENTERPRISE ($29.99/mes)**
- Hasta 5 usuarios
- Todo de PRO +
- Multi-empresa
- Roles y permisos
- Integraciones avanzadas
- Soporte dedicado
- Onboarding personalizado

### Implementación (Stripe)

```typescript
// lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    limits: {
      transactions: 100,
      clients: 3,
      categories: 5,
    },
  },
  PRO: {
    name: 'Pro',
    price: 9.99,
    priceId: 'price_xxx',
    limits: {
      transactions: Infinity,
      clients: Infinity,
      categories: Infinity,
    },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 29.99,
    priceId: 'price_yyy',
    limits: {
      transactions: Infinity,
      clients: Infinity,
      categories: Infinity,
      users: 5,
    },
  },
}
```

---

## 📚 Recursos y Referencias

### Documentación Oficial
- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev)
- [Prisma](https://www.prisma.io/docs)
- [MUI](https://mui.com/material-ui/getting-started/)
- [NextAuth.js](https://next-auth.js.org)
- [React Native](https://reactnative.dev)
- [Expo](https://docs.expo.dev)

### APIs Externas
- [DolarAPI](https://dolarapi.com) - Cotización del dólar
- [Stripe](https://stripe.com/docs) - Pagos
- [Resend](https://resend.com/docs) - Emails

### Tools
- [Vercel](https://vercel.com/docs)
- [Supabase](https://supabase.com/docs)
- [Sentry](https://docs.sentry.io)

---

## 🎯 Métricas de Éxito

### KPIs Técnicos
- **Performance:** Lighthouse score >90
- **SEO:** Lighthouse SEO score >95
- **Accessibility:** WCAG 2.1 AA compliant
- **Test Coverage:** >80%
- **Bundle Size:** <200KB (initial load)
- **API Response Time:** <200ms (p95)

### KPIs de Negocio
- **User Retention:** >60% (30 días)
- **Conversion Rate:** >5% (free → paid)
- **Churn Rate:** <5% mensual
- **NPS:** >50
- **Support Tickets:** <10/semana

---

## 🔄 Próximos Pasos

1. **Revisar y aprobar este plan**
2. **Setup del proyecto inicial**
3. **Crear repositorio en GitHub**
4. **Configurar entorno de desarrollo**
5. **Comenzar Sprint 1.1**

---

## 📞 Contacto y Soporte

**Documentación:** `/docs`  
**Issues:** GitHub Issues  
**Email:** support@contadash.com  

---

**Última actualización:** 29 de Noviembre, 2025  
**Versión:** 1.0.0  
**Autor:** ContaDash Team
