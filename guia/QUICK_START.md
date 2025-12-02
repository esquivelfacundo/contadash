# ⚡ Quick Start Guide - ContaDash

## 🎯 Objetivo

Esta guía te llevará de 0 a tener el proyecto funcionando en **menos de 30 minutos**.

---

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Node.js 20 LTS** - [Descargar](https://nodejs.org/)
- ✅ **PostgreSQL 15+** - [Descargar](https://www.postgresql.org/download/) o usar [Supabase](https://supabase.com)
- ✅ **Git** - [Descargar](https://git-scm.com/)
- ✅ **VS Code** (recomendado) - [Descargar](https://code.visualstudio.com/)

**Verificar instalación:**
```bash
node --version  # v20.x.x
npm --version   # 10.x.x
psql --version  # 15.x
git --version   # 2.x.x
```

---

## 🚀 Paso 1: Crear Repositorio y Estructura

```bash
# Crear directorio principal
mkdir contadash
cd contadash

# Inicializar git
git init
git branch -M main

# Crear estructura de carpetas
mkdir -p backend/src/{controllers,services,middleware,routes,validations,utils,config,types}
mkdir -p backend/prisma/{migrations,seeds}
mkdir -p backend/tests/{unit,integration,e2e}
mkdir -p frontend/src/{app,components,lib,styles,types}
mkdir -p frontend/public/{images,icons}
mkdir -p mobile/src/{screens,components,navigation,services,store,hooks,utils,types,theme}
mkdir -p mobile/assets/{images,fonts}
mkdir -p shared/{types,validations,constants,utils}
mkdir -p .github/workflows
mkdir -p docs
mkdir -p scripts

# Crear repositorio en GitHub (opcional)
gh repo create contadash --private --source=. --remote=origin
```

---

## 📦 Paso 2: Setup Backend (Node.js + Express)

```bash
cd backend

# Inicializar package.json
npm init -y

# Instalar dependencias principales
npm install \
  express \
  @prisma/client \
  bcryptjs \
  jsonwebtoken \
  zod \
  cors \
  helmet \
  express-rate-limit \
  dotenv

# Instalar dependencias de desarrollo
npm install -D \
  @types/express \
  @types/bcryptjs \
  @types/jsonwebtoken \
  @types/cors \
  @types/node \
  typescript \
  tsx \
  nodemon \
  prisma \
  vitest

# Inicializar TypeScript
npx tsc --init

cd ..
```

---

## 📦 Paso 3: Setup Frontend (Next.js)

```bash
cd frontend

# Crear app Next.js
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

# Instalar dependencias adicionales
npm install \
  @mui/material \
  @emotion/react \
  @emotion/styled \
  @mui/icons-material \
  recharts \
  date-fns \
  zustand \
  @tanstack/react-query \
  axios

cd ..
```

---

## 📦 Paso 4: Setup Mobile (React Native + Expo)

```bash
cd mobile

# Crear app Expo
npx create-expo-app@latest . --template blank-typescript

# Instalar dependencias
npx expo install \
  react-native-paper \
  @react-navigation/native \
  @react-navigation/native-stack \
  @react-navigation/bottom-tabs \
  @tanstack/react-query \
  zustand \
  axios \
  expo-secure-store \
  react-native-safe-area-context \
  react-native-screens

cd ..
```

---

## 🔧 Paso 3: Instalar Dependencias

```bash
# Dependencias principales
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

# Dependencias de desarrollo
npm install -D \
  prisma \
  @types/bcryptjs \
  @types/node \
  vitest \
  @playwright/test
```

---

## 🗄️ Paso 4: Setup Base de Datos

### Opción A: PostgreSQL Local

```bash
# Crear base de datos
createdb contadash

# URL de conexión
DATABASE_URL="postgresql://usuario:password@localhost:5432/contadash"
```

### Opción B: Supabase (Recomendado)

1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Copiar connection string
4. Usar en `.env.local`

---

## 🔐 Paso 5: Configurar Variables de Entorno

```bash
# Crear archivo .env.local
touch .env.local
```

**Contenido de `.env.local`:**
```bash
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-aqui"

# Encryption
ENCRYPTION_KEY="tu-encryption-key-aqui"
```

**Generar secrets:**
```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# ENCRYPTION_KEY (32 bytes en hex)
openssl rand -hex 32
```

---

## 📊 Paso 6: Setup Prisma

```bash
# Inicializar Prisma
npx prisma init

# Esto crea:
# - prisma/schema.prisma
# - .env (ya lo tenemos en .env.local)
```

**Copiar schema completo:**

Abrir `prisma/schema.prisma` y copiar el contenido de [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) (sección Schema Prisma).

**Crear migración:**
```bash
npx prisma migrate dev --name init
```

**Generar Prisma Client:**
```bash
npx prisma generate
```

---

## 🌱 Paso 7: Seeds

**Crear archivo de seeds:**

```bash
# Crear directorio
mkdir -p prisma/seeds

# Crear archivo principal
touch prisma/seed.ts
```

**Contenido de `prisma/seed.ts`:**
```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // Crear usuario demo
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@contadash.com' },
    update: {},
    create: {
      email: 'demo@contadash.com',
      passwordHash: await bcrypt.hash('demo123456', 12),
      name: 'Demo User',
      plan: 'PRO',
      emailVerified: new Date(),
    },
  })
  
  console.log('✅ Created demo user:', demoUser.email)
  console.log('🎉 Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Configurar en `package.json`:**
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

**Instalar tsx y ejecutar:**
```bash
npm install -D tsx
npx prisma db seed
```

---

## 🎨 Paso 8: Setup MUI Theme

**Crear `lib/theme.ts`:**
```typescript
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#10b981',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
  },
})
```

**Actualizar `app/layout.tsx`:**
```typescript
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

## 🔑 Paso 9: Setup Autenticación

**Crear `lib/auth.ts`:**
```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        
        if (!user) return null
        
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        
        if (!isValid) return null
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
})
```

**Crear `lib/prisma.ts`:**
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Crear API route `app/api/auth/[...nextauth]/route.ts`:**
```typescript
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

---

## 🏠 Paso 10: Crear Página de Login

**Crear `app/(auth)/login/page.tsx`:**
```typescript
'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Box, Button, TextField, Typography } from '@mui/material'

export default function LoginPage() {
  const router = useRouter()
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const result = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    })
    
    if (result?.ok) {
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
          defaultValue="demo@contadash.com"
        />
        
        <TextField
          name="password"
          type="password"
          label="Contraseña"
          fullWidth
          margin="normal"
          defaultValue="demo123456"
        />
        
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
          Ingresar
        </Button>
      </form>
    </Box>
  )
}
```

---

## 📊 Paso 11: Crear Dashboard Básico

**Crear `app/(dashboard)/dashboard/page.tsx`:**
```typescript
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Box, Typography } from '@mui/material'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }
  
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" gutterBottom>
        Dashboard
      </Typography>
      
      <Typography variant="h6">
        Bienvenido, {session.user?.name}!
      </Typography>
    </Box>
  )
}
```

---

## 🚀 Paso 12: Ejecutar Proyecto

```bash
# Iniciar servidor de desarrollo
npm run dev
```

**Abrir en navegador:**
- http://localhost:3000

**Credenciales demo:**
- Email: `demo@contadash.com`
- Password: `demo123456`

---

## ✅ Verificación

Si todo está correcto, deberías poder:

1. ✅ Ver la página de login en http://localhost:3000/login
2. ✅ Iniciar sesión con las credenciales demo
3. ✅ Ver el dashboard básico
4. ✅ No ver errores en la consola

---

## 🎯 Próximos Pasos

Ahora que tienes el proyecto base funcionando:

1. **Leer documentación completa:**
   - [MASTER_PLAN.md](./MASTER_PLAN.md)
   - [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
   - [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)

2. **Comenzar desarrollo:**
   - Seguir [DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md)
   - Implementar CRUD de transacciones
   - Crear componentes del dashboard

3. **Setup adicional:**
   - Configurar ESLint/Prettier
   - Setup testing (Vitest + Playwright)
   - Configurar CI/CD

---

## 🆘 Troubleshooting

### Error: "Cannot connect to database"
```bash
# Verificar que PostgreSQL esté corriendo
pg_isready

# Verificar DATABASE_URL en .env.local
echo $DATABASE_URL
```

### Error: "Module not found"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Prisma Client not generated"
```bash
npx prisma generate
```

### Puerto 3000 en uso
```bash
# Usar otro puerto
PORT=3001 npm run dev
```

---

## 📚 Recursos Útiles

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [MUI Docs](https://mui.com/material-ui/getting-started/)
- [NextAuth.js Docs](https://next-auth.js.org)

---

## 🎉 ¡Listo!

Ahora tienes ContaDash corriendo localmente. 

**Siguiente paso:** Seguir la [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) para implementar las features principales.

---

**Última actualización:** 29 de Noviembre, 2025  
**Versión:** 1.0.0
