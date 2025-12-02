# 💻 Coding Standards - ContaDash

## Índice
1. [Principios Generales](#principios-generales)
2. [TypeScript](#typescript)
3. [React y Next.js](#react-y-nextjs)
4. [Prisma y Database](#prisma-y-database)
5. [API Routes](#api-routes)
6. [Testing](#testing)
7. [Git Workflow](#git-workflow)
8. [Code Review](#code-review)

---

## Principios Generales

### SOLID Principles
- **S**ingle Responsibility: Una función/clase hace una cosa
- **O**pen/Closed: Abierto a extensión, cerrado a modificación
- **L**iskov Substitution: Subtipos deben ser sustituibles
- **I**nterface Segregation: Interfaces específicas mejor que generales
- **D**ependency Inversion: Depender de abstracciones, no implementaciones

### DRY (Don't Repeat Yourself)
```typescript
// ❌ Malo
function calculateIncomeArs(transactions) {
  return transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amountArs, 0)
}

function calculateExpenseArs(transactions) {
  return transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amountArs, 0)
}

// ✅ Bueno
function calculateTotalByType(
  transactions: Transaction[],
  type: TransactionType,
  currency: 'ARS' | 'USD'
) {
  const field = currency === 'ARS' ? 'amountArs' : 'amountUsd'
  return transactions
    .filter(t => t.type === type)
    .reduce((sum, t) => sum + t[field], 0)
}
```

### KISS (Keep It Simple, Stupid)
```typescript
// ❌ Malo: Sobre-engineered
class TransactionCalculatorFactory {
  createCalculator(type: string) {
    switch(type) {
      case 'sum': return new SumCalculator()
      case 'avg': return new AvgCalculator()
    }
  }
}

// ✅ Bueno: Simple y directo
function sumTransactions(transactions: Transaction[]) {
  return transactions.reduce((sum, t) => sum + t.amountArs, 0)
}

function avgTransactions(transactions: Transaction[]) {
  return sumTransactions(transactions) / transactions.length
}
```

### YAGNI (You Aren't Gonna Need It)
No implementar funcionalidad hasta que sea necesaria.

```typescript
// ❌ Malo: Funcionalidad especulativa
interface Transaction {
  id: string
  amount: number
  // Campos que "tal vez" necesitemos en el futuro
  futureField1?: string
  futureField2?: number
  metadata?: Record<string, any>
}

// ✅ Bueno: Solo lo necesario ahora
interface Transaction {
  id: string
  amount: number
}
```

---

## TypeScript

### Strict Mode
Siempre usar TypeScript strict mode.

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Type vs Interface
- **Interface** para objetos y contratos públicos
- **Type** para unions, intersections, primitives

```typescript
// ✅ Interface para objetos
interface User {
  id: string
  email: string
  name: string
}

// ✅ Type para unions
type TransactionType = 'INCOME' | 'EXPENSE'

// ✅ Type para intersections
type UserWithPlan = User & { plan: UserPlan }
```

### Evitar `any`
```typescript
// ❌ Malo
function processData(data: any) {
  return data.map((item: any) => item.value)
}

// ✅ Bueno
interface DataItem {
  value: number
}

function processData(data: DataItem[]) {
  return data.map(item => item.value)
}

// ✅ Si realmente no sabes el tipo, usa unknown
function processUnknown(data: unknown) {
  if (Array.isArray(data)) {
    // TypeScript sabe que data es array aquí
    return data.length
  }
  return 0
}
```

### Utility Types
```typescript
// Partial: Todos los campos opcionales
type PartialUser = Partial<User>

// Pick: Seleccionar campos
type UserEmail = Pick<User, 'email'>

// Omit: Excluir campos
type UserWithoutPassword = Omit<User, 'passwordHash'>

// Required: Todos los campos requeridos
type RequiredUser = Required<Partial<User>>

// Record: Objeto con keys específicas
type UserById = Record<string, User>
```

### Naming Conventions
```typescript
// Interfaces y Types: PascalCase
interface UserProfile {}
type TransactionType = 'INCOME' | 'EXPENSE'

// Variables y funciones: camelCase
const userName = 'John'
function getUserById(id: string) {}

// Constantes: UPPER_SNAKE_CASE
const MAX_TRANSACTIONS = 100
const API_BASE_URL = 'https://api.example.com'

// Componentes: PascalCase
function TransactionForm() {}

// Archivos: kebab-case
// transaction-form.tsx
// user-service.ts
```

---

## React y Next.js

### Componentes Funcionales
Siempre usar componentes funcionales con hooks.

```typescript
// ✅ Bueno
interface TransactionCardProps {
  transaction: Transaction
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function TransactionCard({ 
  transaction, 
  onEdit, 
  onDelete 
}: TransactionCardProps) {
  return (
    <Card>
      <Typography>{transaction.description}</Typography>
      <Button onClick={() => onEdit(transaction.id)}>Edit</Button>
      <Button onClick={() => onDelete(transaction.id)}>Delete</Button>
    </Card>
  )
}
```

### Props Destructuring
```typescript
// ✅ Bueno: Destructuring en parámetros
function UserCard({ name, email }: { name: string; email: string }) {
  return <div>{name} - {email}</div>
}

// ❌ Malo: Acceso a props.x
function UserCard(props: { name: string; email: string }) {
  return <div>{props.name} - {props.email}</div>
}
```

### Hooks Rules
```typescript
// ✅ Bueno: Hooks al inicio del componente
function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    fetchTransactions()
  }, [])
  
  // ... resto del componente
}

// ❌ Malo: Hooks condicionales
function TransactionList() {
  if (someCondition) {
    const [data, setData] = useState([]) // ❌ NO
  }
}
```

### Custom Hooks
```typescript
// hooks/use-transactions.ts
export function useTransactions(filters?: TransactionFilters) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const data = await getTransactions(filters)
        setTransactions(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [filters])
  
  return { transactions, loading, error }
}

// Uso
function TransactionList() {
  const { transactions, loading, error } = useTransactions()
  
  if (loading) return <Loading />
  if (error) return <Error message={error.message} />
  
  return <List items={transactions} />
}
```

### Server vs Client Components (Next.js 14)
```typescript
// ✅ Server Component (default)
// app/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { getDashboardData } from '@/lib/db/analytics'

export default async function DashboardPage() {
  const session = await auth()
  const data = await getDashboardData(session!.user.id)
  
  return <Dashboard data={data} />
}

// ✅ Client Component (cuando necesitas interactividad)
// components/transaction-form.tsx
'use client'

import { useState } from 'react'

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

### Error Boundaries
```typescript
// components/error-boundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>
    }
    
    return this.props.children
  }
}
```

---

## Prisma y Database

### Queries Eficientes
```typescript
// ❌ Malo: N+1 query problem
async function getTransactionsWithCategories() {
  const transactions = await prisma.transaction.findMany()
  
  for (const t of transactions) {
    t.category = await prisma.category.findUnique({
      where: { id: t.categoryId }
    })
  }
  
  return transactions
}

// ✅ Bueno: Include para eager loading
async function getTransactionsWithCategories() {
  return prisma.transaction.findMany({
    include: {
      category: true,
      client: true,
    }
  })
}
```

### Select Solo Campos Necesarios
```typescript
// ❌ Malo: Traer todos los campos
const users = await prisma.user.findMany()

// ✅ Bueno: Select solo lo necesario
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
  }
})
```

### Transacciones de DB
```typescript
// ✅ Usar transacciones para operaciones atómicas
async function createTransactionWithBudgetUpdate(data: CreateTransactionInput) {
  return prisma.$transaction(async (tx) => {
    // Crear transacción
    const transaction = await tx.transaction.create({ data })
    
    // Actualizar presupuesto
    await tx.budget.update({
      where: { 
        userId_categoryId_month_year: {
          userId: data.userId,
          categoryId: data.categoryId,
          month: data.month,
          year: data.year,
        }
      },
      data: {
        spent: { increment: data.amountArs }
      }
    })
    
    return transaction
  })
}
```

### Índices
```prisma
// Siempre indexar foreign keys y campos usados en WHERE
model Transaction {
  id String @id
  userId String
  categoryId String
  
  @@index([userId, date])
  @@index([userId, categoryId])
}
```

---

## API Routes

### Estructura Consistente
```typescript
// app/api/transactions/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createTransactionSchema } from '@/lib/validations/transaction'
import { AppError } from '@/lib/errors'

export async function GET(req: Request) {
  try {
    // 1. Autenticación
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // 2. Validación de input
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    
    // 3. Business logic
    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      skip: (page - 1) * limit,
      take: limit,
    })
    
    // 4. Response
    return NextResponse.json({ transactions })
    
  } catch (error) {
    // 5. Error handling
    console.error('GET /api/transactions error:', error)
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Validación con Zod
```typescript
// ✅ Siempre validar input
export async function POST(req: Request) {
  const body = await req.json()
  
  const result = createTransactionSchema.safeParse(body)
  
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation error', details: result.error.flatten() },
      { status: 400 }
    )
  }
  
  const data = result.data
  // ... usar data validada
}
```

### Error Handling Consistente
```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

// Uso
if (!session) {
  throw new UnauthorizedError()
}
```

---

## Testing

### Unit Tests
```typescript
// lib/calculations.test.ts
import { describe, it, expect } from 'vitest'
import { calculatePnL } from './calculations'

describe('calculatePnL', () => {
  it('should calculate PnL correctly', () => {
    expect(calculatePnL(100000, 60000)).toBe(40)
  })
  
  it('should return 0 when income is 0', () => {
    expect(calculatePnL(0, 1000)).toBe(0)
  })
  
  it('should handle negative PnL', () => {
    expect(calculatePnL(50000, 100000)).toBe(-100)
  })
})
```

### Integration Tests
```typescript
// tests/integration/transactions.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('Transaction API', () => {
  let userId: string
  
  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'hashed',
        name: 'Test User',
      }
    })
    userId = user.id
  })
  
  afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } })
  })
  
  it('should create transaction', async () => {
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        date: new Date(),
        type: 'INCOME',
        categoryId: 'cat-123',
        description: 'Test',
        amountArs: 10000,
        amountUsd: 10,
        exchangeRate: 1000,
        month: 1,
        year: 2025,
      }
    })
    
    expect(transaction).toBeDefined()
    expect(transaction.userId).toBe(userId)
  })
})
```

### E2E Tests
```typescript
// tests/e2e/transactions.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Transactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })
  
  test('should create transaction', async ({ page }) => {
    await page.goto('/transactions')
    await page.click('button:has-text("Nueva Transacción")')
    
    await page.fill('[name="description"]', 'Test transaction')
    await page.fill('[name="amountArs"]', '10000')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Test transaction')).toBeVisible()
  })
})
```

---

## Git Workflow

### Branch Naming
```bash
# Features
feature/transaction-crud
feature/dashboard-analytics

# Fixes
fix/login-validation
fix/transaction-calculation

# Hotfixes
hotfix/security-patch
hotfix/critical-bug

# Refactor
refactor/api-structure
refactor/database-queries
```

### Commit Messages (Conventional Commits)
```bash
# Format: <type>(<scope>): <subject>

# Types:
feat: Nueva funcionalidad
fix: Bug fix
docs: Documentación
style: Formato (no afecta código)
refactor: Refactoring
test: Tests
chore: Tareas de mantenimiento

# Ejemplos:
feat(transactions): add filter by date range
fix(auth): resolve login redirect issue
docs(api): update transaction endpoints
refactor(dashboard): optimize query performance
test(transactions): add unit tests for calculations
chore(deps): update dependencies
```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
```

---

## Code Review

### Checklist para Reviewer

**Funcionalidad:**
- [ ] El código hace lo que dice que hace
- [ ] No hay bugs obvios
- [ ] Edge cases están manejados

**Código:**
- [ ] Código es legible y mantenible
- [ ] No hay código duplicado
- [ ] Nombres de variables/funciones son descriptivos
- [ ] Complejidad es razonable

**Tests:**
- [ ] Tests cubren funcionalidad nueva
- [ ] Tests son significativos (no solo coverage)
- [ ] Tests pasan

**Seguridad:**
- [ ] Input está validado
- [ ] No hay SQL injection
- [ ] No hay XSS
- [ ] Secrets no están hardcodeados

**Performance:**
- [ ] No hay N+1 queries
- [ ] Queries están optimizadas
- [ ] No hay memory leaks

---

## Best Practices Summary

### ✅ DO
- Usar TypeScript strict mode
- Validar todo input con Zod
- Escribir tests para nueva funcionalidad
- Usar meaningful variable names
- Documentar código complejo
- Manejar errores apropiadamente
- Usar async/await en vez de callbacks
- Hacer commits pequeños y frecuentes

### ❌ DON'T
- Usar `any` sin razón válida
- Hardcodear valores
- Ignorar errores
- Hacer commits gigantes
- Pushear código sin tests
- Dejar console.logs en producción
- Exponer secrets en código
- Hacer queries sin índices

---

**Última actualización:** 29 de Noviembre, 2025  
**Versión:** 1.0.0
