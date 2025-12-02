# 🗄️ Diseño de Base de Datos - ContaDash

## Índice
1. [Filosofía de Diseño](#filosofía-de-diseño)
2. [Diagrama ER Completo](#diagrama-er-completo)
3. [Tablas Detalladas](#tablas-detalladas)
4. [Índices y Performance](#índices-y-performance)
5. [Queries Optimizadas](#queries-optimizadas)
6. [Migraciones](#migraciones)
7. [Seeds](#seeds)

---

## Filosofía de Diseño

### Principios

1. **Normalización:** 3NF (Third Normal Form)
2. **Multi-Tenancy:** Aislamiento total por usuario
3. **Soft Deletes:** Mantener histórico
4. **Audit Trail:** Timestamps en todas las tablas
5. **Type Safety:** Enums para valores fijos
6. **Performance:** Índices estratégicos

### Decisiones Clave

**¿Por qué Prisma?**
- Type-safe queries
- Migraciones automáticas
- Excelente DX (Developer Experience)
- Soporte para PostgreSQL features

**¿Por qué PostgreSQL?**
- Row Level Security (RLS)
- JSON support (para metadata flexible)
- Excelente performance
- ACID compliance
- Mature ecosystem

---

## Diagrama ER Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                          USERS                                  │
├─────────────────────────────────────────────────────────────────┤
│ id                    String (cuid)     PK                      │
│ email                 String            UNIQUE                  │
│ password_hash         String                                    │
│ name                  String                                    │
│ company               String?                                   │
│ plan                  UserPlan          DEFAULT 'FREE'          │
│ email_verified        DateTime?                                 │
│ image                 String?                                   │
│ mfa_enabled           Boolean           DEFAULT false           │
│ mfa_secret            String?                                   │
│ deleted_at            DateTime?                                 │
│ created_at            DateTime          DEFAULT now()           │
│ updated_at            DateTime          @updatedAt              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       TRANSACTIONS                              │
├─────────────────────────────────────────────────────────────────┤
│ id                    String (cuid)     PK                      │
│ user_id               String            FK → users.id           │
│ date                  DateTime                                  │
│ month                 Int               (1-12)                  │
│ year                  Int                                       │
│ type                  TransactionType   (INCOME/EXPENSE)        │
│ category_id           String            FK → categories.id      │
│ client_id             String?           FK → clients.id         │
│ description           String                                    │
│ amount_ars            Decimal(15,2)                             │
│ amount_usd            Decimal(15,2)                             │
│ exchange_rate         Decimal(10,4)                             │
│ notes                 String?                                   │
│ attachment_url        String?                                   │
│ tags                  String[]          (array)                 │
│ metadata              Json?             (flexible data)         │
│ created_at            DateTime          DEFAULT now()           │
│ updated_at            DateTime          @updatedAt              │
└─────────────────────────────────────────────────────────────────┘
         │                              │
         │                              │
         ▼                              ▼
┌──────────────────────┐      ┌──────────────────────┐
│     CATEGORIES       │      │      CLIENTS         │
├──────────────────────┤      ├──────────────────────┤
│ id           PK      │      │ id           PK      │
│ user_id      FK      │      │ user_id      FK      │
│ name                 │      │ name                 │
│ type                 │      │ email                │
│ color                │      │ phone                │
│ icon                 │      │ company              │
│ is_default           │      │ active               │
│ created_at           │      │ created_at           │
│ updated_at           │      │ updated_at           │
└──────────────────────┘      └──────────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────────┐
│      BUDGETS         │
├──────────────────────┤
│ id           PK      │
│ user_id      FK      │
│ category_id  FK      │
│ month                │
│ year                 │
│ amount_ars           │
│ amount_usd           │
│ alert_threshold      │
│ created_at           │
│ updated_at           │
└──────────────────────┘

┌──────────────────────┐
│   EXCHANGE_RATES     │
├──────────────────────┤
│ id           PK      │
│ date         UNIQUE  │
│ currency_from        │
│ currency_to          │
│ rate                 │
│ source               │
│ created_at           │
└──────────────────────┘

┌──────────────────────┐
│   RECURRING_TRANS    │
├──────────────────────┤
│ id           PK      │
│ user_id      FK      │
│ template_id  FK      │
│ frequency            │
│ next_date            │
│ active               │
│ created_at           │
│ updated_at           │
└──────────────────────┘
```

---

## Tablas Detalladas

### Users

```prisma
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  passwordHash  String        @map("password_hash")
  name          String
  company       String?
  plan          UserPlan      @default(FREE)
  emailVerified DateTime?     @map("email_verified")
  image         String?
  mfaEnabled    Boolean       @default(false) @map("mfa_enabled")
  mfaSecret     String?       @map("mfa_secret")
  deletedAt     DateTime?     @map("deleted_at")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")
  
  // Relations
  transactions  Transaction[]
  categories    Category[]
  clients       Client[]
  budgets       Budget[]
  recurringTransactions RecurringTransaction[]
  
  @@index([email])
  @@index([plan])
  @@map("users")
}

enum UserPlan {
  FREE
  PRO
  ENTERPRISE
}
```

**Campos importantes:**
- `passwordHash`: bcrypt hash (12 rounds)
- `mfaSecret`: TOTP secret (encriptado)
- `deletedAt`: Soft delete (GDPR compliance)
- `plan`: Para feature gating

### Transactions

```prisma
model Transaction {
  id            String          @id @default(cuid())
  userId        String          @map("user_id")
  date          DateTime
  month         Int             // 1-12
  year          Int
  type          TransactionType
  categoryId    String          @map("category_id")
  clientId      String?         @map("client_id")
  description   String
  amountArs     Decimal         @map("amount_ars") @db.Decimal(15, 2)
  amountUsd     Decimal         @map("amount_usd") @db.Decimal(15, 2)
  exchangeRate  Decimal         @map("exchange_rate") @db.Decimal(10, 4)
  notes         String?         @db.Text
  attachmentUrl String?         @map("attachment_url")
  tags          String[]
  metadata      Json?           // Flexible data (ej: invoice_number, etc)
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")
  
  // Relations
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  category      Category        @relation(fields: [categoryId], references: [id])
  client        Client?         @relation(fields: [clientId], references: [id])
  
  // Indexes para queries comunes
  @@index([userId, date(sort: Desc)])
  @@index([userId, type])
  @@index([userId, categoryId])
  @@index([userId, clientId])
  @@index([userId, year, month])
  @@map("transactions")
}

enum TransactionType {
  INCOME
  EXPENSE
}
```

**Campos importantes:**
- `month` y `year`: Desnormalizados para queries rápidas
- `amountArs` y `amountUsd`: Siempre ambos (conversión automática)
- `exchangeRate`: Snapshot del rate en el momento de la transacción
- `tags`: Array de strings para categorización flexible
- `metadata`: JSON para datos custom (invoice_number, payment_method, etc)

**¿Por qué Decimal y no Float?**
- Precisión exacta para dinero
- No hay errores de redondeo
- ACID compliance

### Categories

```prisma
model Category {
  id          String          @id @default(cuid())
  userId      String          @map("user_id")
  name        String
  type        TransactionType
  color       String          @default("#3b82f6")
  icon        String          @default("💰")
  isDefault   Boolean         @default(false) @map("is_default")
  order       Int             @default(0) // Para ordenamiento custom
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")
  
  // Relations
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  budgets     Budget[]
  
  @@unique([userId, name, type])
  @@index([userId, type])
  @@map("categories")
}
```

**Categorías por defecto (seeds):**

**Ingresos:**
- Ads
- Desarrollo
- Mantenimiento
- Consultoría
- Proyectos
- Otros

**Egresos:**
- Administración
- Publicidad
- Impuestos
- Servicios
- Freelancers
- Software
- Equipamiento
- Caja chica
- Otros

### Clients

```prisma
model Client {
  id          String        @id @default(cuid())
  userId      String        @map("user_id")
  name        String
  email       String?
  phone       String?
  company     String?
  taxId       String?       @map("tax_id") // CUIT/CUIL
  address     String?
  notes       String?       @db.Text
  active      Boolean       @default(true)
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")
  
  // Relations
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  
  @@unique([userId, name])
  @@index([userId, active])
  @@map("clients")
}
```

### Budgets

```prisma
model Budget {
  id            String   @id @default(cuid())
  userId        String   @map("user_id")
  categoryId    String   @map("category_id")
  month         Int      // 1-12
  year          Int
  amountArs     Decimal  @map("amount_ars") @db.Decimal(15, 2)
  amountUsd     Decimal  @map("amount_usd") @db.Decimal(15, 2)
  alertThreshold Decimal @map("alert_threshold") @db.Decimal(5, 2) @default(0.80) // 80%
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category    Category @relation(fields: [categoryId], references: [id])
  
  @@unique([userId, categoryId, month, year])
  @@index([userId, year, month])
  @@map("budgets")
}
```

### Exchange Rates

```prisma
model ExchangeRate {
  id          String   @id @default(cuid())
  date        DateTime @unique
  currencyFrom String  @map("currency_from") @default("USD")
  currencyTo  String   @map("currency_to") @default("ARS")
  rate        Decimal  @db.Decimal(10, 4)
  source      String   @default("dolarapi") // API source
  createdAt   DateTime @default(now()) @map("created_at")
  
  @@index([date])
  @@index([currencyFrom, currencyTo, date])
  @@map("exchange_rates")
}
```

**Fuentes de cotización:**
- [DolarAPI](https://dolarapi.com) - Gratis, confiable
- Manual override (admin)

### Recurring Transactions

```prisma
model RecurringTransaction {
  id          String          @id @default(cuid())
  userId      String          @map("user_id")
  type        TransactionType
  categoryId  String          @map("category_id")
  clientId    String?         @map("client_id")
  description String
  amountArs   Decimal         @map("amount_ars") @db.Decimal(15, 2)
  amountUsd   Decimal         @map("amount_usd") @db.Decimal(15, 2)
  frequency   Frequency
  nextDate    DateTime        @map("next_date")
  active      Boolean         @default(true)
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")
  
  // Relations
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, active, nextDate])
  @@map("recurring_transactions")
}

enum Frequency {
  DAILY
  WEEKLY
  MONTHLY
  QUARTERLY
  YEARLY
}
```

---

## Índices y Performance

### Estrategia de Indexación

**Principios:**
1. Indexar foreign keys
2. Indexar campos usados en WHERE
3. Indexar campos usados en ORDER BY
4. Composite indexes para queries comunes
5. No sobre-indexar (afecta writes)

### Índices Críticos

```sql
-- Transactions: Query por usuario y fecha (dashboard)
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);

-- Transactions: Filtro por tipo
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);

-- Transactions: Análisis por categoría
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category_id);

-- Transactions: Análisis por cliente
CREATE INDEX idx_transactions_user_client ON transactions(user_id, client_id);

-- Transactions: Reportes mensuales
CREATE INDEX idx_transactions_user_year_month ON transactions(user_id, year, month);

-- Categories: Listado por usuario
CREATE INDEX idx_categories_user_type ON categories(user_id, type);

-- Clients: Listado activos
CREATE INDEX idx_clients_user_active ON clients(user_id, active);

-- Budgets: Query mensual
CREATE INDEX idx_budgets_user_year_month ON budgets(user_id, year, month);

-- Exchange Rates: Lookup por fecha
CREATE INDEX idx_exchange_rates_date ON exchange_rates(date);
```

### Query Performance

**EXPLAIN ANALYZE para optimizar:**
```sql
EXPLAIN ANALYZE
SELECT t.*, c.name as category_name, cl.name as client_name
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN clients cl ON t.client_id = cl.id
WHERE t.user_id = 'user_123'
  AND t.date >= '2025-01-01'
  AND t.date < '2025-02-01'
ORDER BY t.date DESC
LIMIT 50;
```

**Objetivo:** <50ms para queries comunes

---

## Queries Optimizadas

### Dashboard Principal

```typescript
// lib/db/analytics.ts
export async function getDashboardData(userId: string, month: number, year: number) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)
  
  // Parallel queries para performance
  const [
    totalIncome,
    totalExpenses,
    topCategories,
    topClients,
    monthlyTrend
  ] = await Promise.all([
    // Total income
    prisma.transaction.aggregate({
      where: {
        userId,
        type: 'INCOME',
        date: { gte: startDate, lte: endDate }
      },
      _sum: {
        amountArs: true,
        amountUsd: true,
      }
    }),
    
    // Total expenses
    prisma.transaction.aggregate({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startDate, lte: endDate }
      },
      _sum: {
        amountArs: true,
        amountUsd: true,
      }
    }),
    
    // Top 5 categories
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startDate, lte: endDate }
      },
      _sum: {
        amountArs: true,
      },
      orderBy: {
        _sum: {
          amountArs: 'desc'
        }
      },
      take: 5,
    }),
    
    // Top 5 clients
    prisma.transaction.groupBy({
      by: ['clientId'],
      where: {
        userId,
        type: 'INCOME',
        date: { gte: startDate, lte: endDate },
        clientId: { not: null }
      },
      _sum: {
        amountArs: true,
      },
      orderBy: {
        _sum: {
          amountArs: 'desc'
        }
      },
      take: 5,
    }),
    
    // Monthly trend (last 12 months)
    prisma.$queryRaw`
      SELECT 
        year,
        month,
        type,
        SUM(amount_ars) as total_ars,
        SUM(amount_usd) as total_usd
      FROM transactions
      WHERE user_id = ${userId}
        AND date >= ${new Date(year - 1, month - 1, 1)}
      GROUP BY year, month, type
      ORDER BY year, month
    `
  ])
  
  return {
    income: totalIncome._sum,
    expenses: totalExpenses._sum,
    balance: {
      ars: (totalIncome._sum.amountArs || 0) - (totalExpenses._sum.amountArs || 0),
      usd: (totalIncome._sum.amountUsd || 0) - (totalExpenses._sum.amountUsd || 0),
    },
    topCategories,
    topClients,
    monthlyTrend,
  }
}
```

### Análisis por Cliente

```typescript
export async function getClientAnalytics(userId: string, clientId: string, year: number) {
  const [totalIncome, monthlyBreakdown, categoryBreakdown] = await Promise.all([
    // Total income from client
    prisma.transaction.aggregate({
      where: {
        userId,
        clientId,
        type: 'INCOME',
        year,
      },
      _sum: {
        amountArs: true,
        amountUsd: true,
      },
      _count: true,
    }),
    
    // Monthly breakdown
    prisma.transaction.groupBy({
      by: ['month'],
      where: {
        userId,
        clientId,
        type: 'INCOME',
        year,
      },
      _sum: {
        amountArs: true,
        amountUsd: true,
      },
      orderBy: {
        month: 'asc'
      }
    }),
    
    // Category breakdown
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        clientId,
        type: 'INCOME',
        year,
      },
      _sum: {
        amountArs: true,
      },
      orderBy: {
        _sum: {
          amountArs: 'desc'
        }
      }
    }),
  ])
  
  return {
    total: totalIncome._sum,
    transactionCount: totalIncome._count,
    monthlyBreakdown,
    categoryBreakdown,
  }
}
```

---

## Migraciones

### Workflow

```bash
# 1. Modificar schema.prisma
# 2. Crear migración
npx prisma migrate dev --name add_recurring_transactions

# 3. Aplicar en producción
npx prisma migrate deploy

# 4. Generar Prisma Client
npx prisma generate
```

### Migración Inicial

```sql
-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE "Frequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "plan" "UserPlan" NOT NULL DEFAULT 'FREE',
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "mfa_secret" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "category_id" TEXT NOT NULL,
    "client_id" TEXT,
    "description" TEXT NOT NULL,
    "amount_ars" DECIMAL(15,2) NOT NULL,
    "amount_usd" DECIMAL(15,2) NOT NULL,
    "exchange_rate" DECIMAL(10,4) NOT NULL,
    "notes" TEXT,
    "attachment_url" TEXT,
    "tags" TEXT[],
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "icon" TEXT NOT NULL DEFAULT '💰',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "tax_id" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount_ars" DECIMAL(15,2) NOT NULL,
    "amount_usd" DECIMAL(15,2) NOT NULL,
    "alert_threshold" DECIMAL(5,2) NOT NULL DEFAULT 0.80,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "currency_from" TEXT NOT NULL DEFAULT 'USD',
    "currency_to" TEXT NOT NULL DEFAULT 'ARS',
    "rate" DECIMAL(10,4) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'dolarapi',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_plan_idx" ON "users"("plan");

-- CreateIndex
CREATE INDEX "transactions_user_id_date_idx" ON "transactions"("user_id", "date" DESC);
CREATE INDEX "transactions_user_id_type_idx" ON "transactions"("user_id", "type");
CREATE INDEX "transactions_user_id_category_id_idx" ON "transactions"("user_id", "category_id");
CREATE INDEX "transactions_user_id_client_id_idx" ON "transactions"("user_id", "client_id");
CREATE INDEX "transactions_user_id_year_month_idx" ON "transactions"("user_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "categories_user_id_name_type_key" ON "categories"("user_id", "name", "type");
CREATE INDEX "categories_user_id_type_idx" ON "categories"("user_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "clients_user_id_name_key" ON "clients"("user_id", "name");
CREATE INDEX "clients_user_id_active_idx" ON "clients"("user_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_user_id_category_id_month_year_key" ON "budgets"("user_id", "category_id", "month", "year");
CREATE INDEX "budgets_user_id_year_month_idx" ON "budgets"("user_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_date_key" ON "exchange_rates"("date");
CREATE INDEX "exchange_rates_date_idx" ON "exchange_rates"("date");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

---

## Seeds

### Default Categories

```typescript
// prisma/seeds/categories.ts
import { PrismaClient, TransactionType } from '@prisma/client'

const prisma = new PrismaClient()

export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Ads', icon: '📢', color: '#10b981' },
  { name: 'Desarrollo', icon: '💻', color: '#3b82f6' },
  { name: 'Mantenimiento', icon: '🔧', color: '#8b5cf6' },
  { name: 'Consultoría', icon: '💡', color: '#f59e0b' },
  { name: 'Proyectos', icon: '📁', color: '#ec4899' },
  { name: 'Otros', icon: '💰', color: '#6b7280' },
]

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Administración', icon: '📋', color: '#ef4444' },
  { name: 'Publicidad', icon: '📣', color: '#f97316' },
  { name: 'Impuestos', icon: '🏛️', color: '#dc2626' },
  { name: 'Servicios', icon: '⚙️', color: '#7c3aed' },
  { name: 'Freelancers', icon: '👥', color: '#2563eb' },
  { name: 'Software', icon: '💿', color: '#0891b2' },
  { name: 'Equipamiento', icon: '🖥️', color: '#059669' },
  { name: 'Caja chica', icon: '💵', color: '#65a30d' },
  { name: 'Otros', icon: '📦', color: '#6b7280' },
]

export async function seedDefaultCategories(userId: string) {
  // Income categories
  for (const cat of DEFAULT_INCOME_CATEGORIES) {
    await prisma.category.create({
      data: {
        userId,
        name: cat.name,
        type: 'INCOME',
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      },
    })
  }
  
  // Expense categories
  for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
    await prisma.category.create({
      data: {
        userId,
        name: cat.name,
        type: 'EXPENSE',
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      },
    })
  }
}
```

### Seed Script

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { seedDefaultCategories } from './seeds/categories'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@contadash.com' },
    update: {},
    create: {
      email: 'demo@contadash.com',
      passwordHash: await bcrypt.hash('demo123456', 12),
      name: 'Demo User',
      company: 'Demo Company',
      plan: 'PRO',
      emailVerified: new Date(),
    },
  })
  
  console.log('✅ Created demo user:', demoUser.email)
  
  // Seed default categories
  await seedDefaultCategories(demoUser.id)
  console.log('✅ Seeded default categories')
  
  // Seed exchange rates (last 30 days)
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    await prisma.exchangeRate.upsert({
      where: { date },
      update: {},
      create: {
        date,
        currencyFrom: 'USD',
        currencyTo: 'ARS',
        rate: 1000 + Math.random() * 50, // Mock rate
        source: 'seed',
      },
    })
  }
  
  console.log('✅ Seeded exchange rates')
  
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Ejecutar seeds:**
```bash
npx prisma db seed
```

---

**Última actualización:** 29 de Noviembre, 2025  
**Versión:** 1.0.0
