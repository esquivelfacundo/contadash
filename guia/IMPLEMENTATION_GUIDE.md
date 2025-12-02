# 🚀 Guía de Implementación - ContaDash

## Índice
1. [Setup Inicial](#setup-inicial)
2. [Fase 1: Fundación](#fase-1-fundación)
3. [Fase 2: Core Features](#fase-2-core-features)
4. [Fase 3: Dashboard & Analytics](#fase-3-dashboard--analytics)
5. [Fase 4: Mobile App](#fase-4-mobile-app)
6. [Fase 5: Testing & Deploy](#fase-5-testing--deploy)

---

## Setup Inicial

### 1. Crear Repositorio

```bash
# Crear directorio del proyecto
mkdir contadash
cd contadash

# Inicializar git
git init
git branch -M main

# Crear repositorio en GitHub
gh repo create contadash --private --source=. --remote=origin
```

### 2. Inicializar Monorepo con Turborepo

```bash
# Instalar Turborepo globalmente
npm install -g turbo

# Crear estructura
npx create-turbo@latest

# Estructura resultante:
# contadash/
# ├── apps/
# │   ├── web/
# │   └── mobile/
# ├── packages/
# │   ├── ui/
# │   ├── shared/
# │   └── config/
# ├── turbo.json
# └── package.json
```

### 3. Setup Next.js (Web App)

```bash
cd apps
npx create-next-app@latest web \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd web
```

**Instalar dependencias:**
```bash
npm install \
  @prisma/client \
  @auth/prisma-adapter \
  next-auth@beta \
  bcryptjs \
  zod \
  @mui/material \
  @emotion/react \
  @emotion/styled \
  @mui/icons-material \
  recharts \
  date-fns \
  zustand \
  @tanstack/react-query

npm install -D \
  prisma \
  @types/bcryptjs \
  @types/node
```

### 4. Setup Prisma

```bash
# Inicializar Prisma
npx prisma init

# Esto crea:
# - prisma/schema.prisma
# - .env
```

**Configurar DATABASE_URL en .env:**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/contadash?schema=public"
```

### 5. Configurar Variables de Entorno

```bash
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
ENCRYPTION_KEY="generate-with-openssl-rand-hex-32"
```

**Generar secrets:**
```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# ENCRYPTION_KEY
openssl rand -hex 32
```

### 6. Estructura de Carpetas

```bash
mkdir -p app/{api,\(auth\),\(dashboard\)}/
mkdir -p components/{ui,forms,charts,layouts}
mkdir -p lib/{auth,db,validations,utils}
mkdir -p styles
mkdir -p prisma/{migrations,seeds}
```

---

## Fase 1: Fundación

### Sprint 1.1: Database Schema

**1. Copiar schema de DATABASE_DESIGN.md a `prisma/schema.prisma`**

**2. Crear migración inicial:**
```bash
npx prisma migrate dev --name init
```

**3. Generar Prisma Client:**
```bash
npx prisma generate
```

**4. Crear seed script:**
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Ver DATABASE_DESIGN.md para código completo
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**5. Ejecutar seeds:**
```bash
npx prisma db seed
```

### Sprint 1.2: Autenticación

**1. Configurar NextAuth.js:**

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
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
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

**2. API Routes:**

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

**3. Middleware de protección:**

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

**4. Páginas de autenticación:**

```typescript
// app/(auth)/login/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, TextField, Box, Typography } from '@mui/material'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const result = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    })
    
    if (result?.error) {
      setError('Credenciales inválidas')
    } else {
      router.push('/dashboard')
    }
  }
  
  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Iniciar Sesión
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <TextField
          name="email"
          type="email"
          label="Email"
          fullWidth
          margin="normal"
          required
        />
        
        <TextField
          name="password"
          type="password"
          label="Contraseña"
          fullWidth
          margin="normal"
          required
        />
        
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
        >
          Ingresar
        </Button>
      </form>
    </Box>
  )
}
```

```typescript
// app/(auth)/register/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, TextField, Box, Typography } from '@mui/material'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
        name: formData.get('name'),
      }),
    })
    
    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
    } else {
      router.push('/login')
    }
  }
  
  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Crear Cuenta
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <TextField
          name="name"
          label="Nombre"
          fullWidth
          margin="normal"
          required
        />
        
        <TextField
          name="email"
          type="email"
          label="Email"
          fullWidth
          margin="normal"
          required
        />
        
        <TextField
          name="password"
          type="password"
          label="Contraseña"
          fullWidth
          margin="normal"
          required
        />
        
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
        >
          Registrarse
        </Button>
      </form>
    </Box>
  )
}
```

**5. API de registro:**

```typescript
// app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { seedDefaultCategories } from '@/prisma/seeds/categories'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name } = registerSchema.parse(body)
    
    // Check if user exists
    const exists = await prisma.user.findUnique({
      where: { email },
    })
    
    if (exists) {
      return NextResponse.json(
        { error: 'Email ya registrado' },
        { status: 400 }
      )
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    })
    
    // Seed default categories for new user
    await seedDefaultCategories(user.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
```

### Sprint 1.3: MUI Theme Setup

```typescript
// lib/theme.ts
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1e40af',
    },
    secondary: {
      main: '#10b981',
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

```typescript
// app/layout.tsx
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from '@/lib/theme'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

## Fase 2: Core Features

### Sprint 2.1: Transacciones CRUD

**1. Validaciones:**

```typescript
// lib/validations/transaction.ts
import { z } from 'zod'

export const createTransactionSchema = z.object({
  date: z.coerce.date(),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().cuid(),
  clientId: z.string().cuid().optional(),
  description: z.string().min(1).max(255),
  amountArs: z.number().positive().optional(),
  amountUsd: z.number().positive().optional(),
  exchangeRate: z.number().positive(),
  notes: z.string().max(1000).optional(),
}).refine(
  data => data.amountArs || data.amountUsd,
  { message: 'Debe especificar al menos un monto' }
)

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
```

**2. API Routes:**

```typescript
// app/api/transactions/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createTransactionSchema } from '@/lib/validations/transaction'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const type = searchParams.get('type')
  const categoryId = searchParams.get('categoryId')
  const clientId = searchParams.get('clientId')
  
  const where = {
    userId: session.user.id,
    ...(type && { type }),
    ...(categoryId && { categoryId }),
    ...(clientId && { clientId }),
  }
  
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: true,
        client: true,
      },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ])
  
  return NextResponse.json({
    transactions,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await req.json()
    const data = createTransactionSchema.parse(body)
    
    // Calculate month and year from date
    const date = new Date(data.date)
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    
    // Calculate missing amount (ARS or USD)
    const amountArs = data.amountArs || (data.amountUsd! * data.exchangeRate)
    const amountUsd = data.amountUsd || (data.amountArs! / data.exchangeRate)
    
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        date,
        month,
        year,
        type: data.type,
        categoryId: data.categoryId,
        clientId: data.clientId,
        description: data.description,
        amountArs,
        amountUsd,
        exchangeRate: data.exchangeRate,
        notes: data.notes,
      },
      include: {
        category: true,
        client: true,
      },
    })
    
    return NextResponse.json(transaction)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
```

```typescript
// app/api/transactions/[id]/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      category: true,
      client: true,
    },
  })
  
  if (!transaction) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  return NextResponse.json(transaction)
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await req.json()
  
  // Verify ownership
  const existing = await prisma.transaction.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  })
  
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  const transaction = await prisma.transaction.update({
    where: { id: params.id },
    data: body,
    include: {
      category: true,
      client: true,
    },
  })
  
  return NextResponse.json(transaction)
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Verify ownership
  const existing = await prisma.transaction.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  })
  
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  await prisma.transaction.delete({
    where: { id: params.id },
  })
  
  return NextResponse.json({ success: true })
}
```

**3. Componente de formulario:**

```typescript
// components/forms/TransactionForm.tsx
'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

interface TransactionFormProps {
  type: 'INCOME' | 'EXPENSE'
  categories: Category[]
  clients: Client[]
  onSubmit: (data: any) => Promise<void>
}

export function TransactionForm({
  type,
  categories,
  clients,
  onSubmit,
}: TransactionFormProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [categoryId, setCategoryId] = useState('')
  const [clientId, setClientId] = useState('')
  const [description, setDescription] = useState('')
  const [amountArs, setAmountArs] = useState('')
  const [amountUsd, setAmountUsd] = useState('')
  const [exchangeRate, setExchangeRate] = useState('1000')
  const [notes, setNotes] = useState('')
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    await onSubmit({
      date,
      type,
      categoryId,
      clientId: clientId || undefined,
      description,
      amountArs: amountArs ? parseFloat(amountArs) : undefined,
      amountUsd: amountUsd ? parseFloat(amountUsd) : undefined,
      exchangeRate: parseFloat(exchangeRate),
      notes: notes || undefined,
    })
  }
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Fecha"
              value={date}
              onChange={(newDate) => setDate(newDate!)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {categories
                  .filter(c => c.type === type)
                  .map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          
          {type === 'INCOME' && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Cliente (opcional)</InputLabel>
                <Select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  <MenuItem value="">Ninguno</MenuItem>
                  {clients.map(client => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <TextField
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="Monto ARS"
              type="number"
              value={amountArs}
              onChange={(e) => setAmountArs(e.target.value)}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="Monto USD"
              type="number"
              value={amountUsd}
              onChange={(e) => setAmountUsd(e.target.value)}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="Cotización"
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Notas (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button type="submit" variant="contained" fullWidth>
              Guardar
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  )
}
```

**Continuar con Categorías, Clientes, etc. siguiendo el mismo patrón...**

---

## Fase 3: Dashboard & Analytics

### Sprint 3.1: Dashboard Principal

```typescript
// app/(dashboard)/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { getDashboardData } from '@/lib/db/analytics'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart'
import { TopCategoriesChart } from '@/components/charts/TopCategoriesChart'
import { TopClientsChart } from '@/components/charts/TopClientsChart'

export default async function DashboardPage() {
  const session = await auth()
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  
  const data = await getDashboardData(
    session!.user.id,
    currentMonth,
    currentYear
  )
  
  return (
    <div>
      <h1>Dashboard</h1>
      
      <DashboardStats data={data} />
      
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <IncomeExpenseChart data={data.monthlyTrend} />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TopCategoriesChart data={data.topCategories} />
        </Grid>
        
        <Grid item xs={12}>
          <TopClientsChart data={data.topClients} />
        </Grid>
      </Grid>
    </div>
  )
}
```

---

## Fase 4: Mobile App

### Setup React Native con Expo

```bash
cd apps
npx create-expo-app mobile --template
cd mobile
```

**Instalar dependencias:**
```bash
npx expo install \
  react-native-paper \
  @react-navigation/native \
  @react-navigation/native-stack \
  @tanstack/react-query \
  zustand \
  axios
```

**Estructura:**
```
mobile/
├── src/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── services/
│   └── store/
├── app.json
└── App.tsx
```

---

## Fase 5: Testing & Deploy

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npx playwright test

# Coverage
npm run test:coverage
```

### Deploy Web (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy Mobile (Expo EAS)

```bash
# Build
eas build --platform all

# Submit
eas submit --platform all
```

---

**Última actualización:** 29 de Noviembre, 2025  
**Versión:** 1.0.0
