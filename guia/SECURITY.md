# 🔐 Guía de Seguridad - ContaDash

## Índice
1. [Principios de Seguridad](#principios-de-seguridad)
2. [Autenticación](#autenticación)
3. [Autorización](#autorización)
4. [Protección de Datos](#protección-de-datos)
5. [API Security](#api-security)
6. [Database Security](#database-security)
7. [Frontend Security](#frontend-security)
8. [Compliance](#compliance)
9. [Security Checklist](#security-checklist)

---

## Principios de Seguridad

### Defense in Depth
Múltiples capas de seguridad:
1. **Network Layer:** HTTPS, CORS, CSP
2. **Application Layer:** Autenticación, autorización, validación
3. **Data Layer:** Encriptación, RLS, backups
4. **Infrastructure Layer:** Firewalls, rate limiting, monitoring

### Least Privilege
- Usuarios solo acceden a sus propios datos
- API keys con permisos mínimos necesarios
- Database roles con permisos específicos

### Zero Trust
- Nunca confiar, siempre verificar
- Validar en cada capa (frontend, API, database)
- Session management estricto

---

## Autenticación

### Password Security

**Requisitos mínimos:**
```typescript
const passwordSchema = z.string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una minúscula")
  .regex(/[0-9]/, "Debe contener al menos un número")
  .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial")
```

**Hashing con bcrypt:**
```typescript
import bcrypt from 'bcryptjs'

// Al registrar
const SALT_ROUNDS = 12
const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

// Al login
const isValid = await bcrypt.compare(password, user.passwordHash)
```

### Session Management

**JWT Configuration:**
```typescript
// NextAuth.js config
export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
    updateAge: 24 * 60 * 60, // Actualizar cada 24h
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true, // Solo HTTPS
      },
    },
  },
}
```

### Multi-Factor Authentication (MFA)

**Implementación con TOTP:**
```typescript
import * as OTPAuth from "otpauth"

// Generar secret
export function generateMFASecret(email: string) {
  const secret = new OTPAuth.Secret()
  const totp = new OTPAuth.TOTP({
    issuer: "ContaDash",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: secret,
  })
  
  return {
    secret: secret.base32,
    qrCode: totp.toString(),
  }
}

// Verificar código
export function verifyMFACode(secret: string, code: string): boolean {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret),
  })
  
  const delta = totp.validate({ token: code, window: 1 })
  return delta !== null
}
```

### Account Recovery

**Password Reset Flow:**
1. Usuario solicita reset
2. Generar token único (crypto.randomBytes)
3. Guardar hash del token en DB con expiración (1 hora)
4. Enviar email con link
5. Validar token y permitir cambio de password
6. Invalidar token después de uso

```typescript
import crypto from 'crypto'

export function generateResetToken() {
  const token = crypto.randomBytes(32).toString('hex')
  const hash = crypto.createHash('sha256').update(token).digest('hex')
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hora
  
  return { token, hash, expires }
}
```

---

## Autorización

### Row Level Security (RLS)

**PostgreSQL Policies:**
```sql
-- Función helper para obtener user_id del JWT
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS TEXT AS $$
  SELECT current_setting('app.user_id', TRUE)::TEXT;
$$ LANGUAGE SQL STABLE;

-- Policy para transactions
CREATE POLICY "Users can only access their own transactions"
  ON transactions
  FOR ALL
  USING (user_id = auth.user_id());

-- Policy para categories
CREATE POLICY "Users can only access their own categories"
  ON categories
  FOR ALL
  USING (user_id = auth.user_id());

-- Policy para clients
CREATE POLICY "Users can only access their own clients"
  ON clients
  FOR ALL
  USING (user_id = auth.user_id());
```

### API Authorization

**Middleware de autorización:**
```typescript
// lib/auth/middleware.ts
import { auth } from '@/lib/auth'
import { ForbiddenError } from '@/lib/errors'

export async function requireAuth(req: Request) {
  const session = await auth()
  
  if (!session?.user) {
    throw new UnauthorizedError()
  }
  
  return session.user
}

export async function requirePlan(req: Request, plan: UserPlan) {
  const user = await requireAuth(req)
  
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { plan: true },
  })
  
  const planHierarchy = {
    FREE: 0,
    PRO: 1,
    ENTERPRISE: 2,
  }
  
  if (planHierarchy[dbUser!.plan] < planHierarchy[plan]) {
    throw new ForbiddenError('Plan upgrade required')
  }
  
  return user
}

// Uso en API route
export async function POST(req: Request) {
  const user = await requirePlan(req, 'PRO')
  // ... resto del handler
}
```

### Resource Ownership

**Verificar ownership antes de operaciones:**
```typescript
export async function deleteTransaction(userId: string, transactionId: string) {
  // Verificar que la transacción pertenece al usuario
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId: userId, // ← Crítico
    },
  })
  
  if (!transaction) {
    throw new NotFoundError('Transaction not found')
  }
  
  await prisma.transaction.delete({
    where: { id: transactionId },
  })
}
```

---

## Protección de Datos

### Encriptación en Tránsito

**HTTPS Obligatorio:**
```typescript
// middleware.ts
export function middleware(req: NextRequest) {
  // Redirigir HTTP a HTTPS en producción
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers.get('x-forwarded-proto') !== 'https'
  ) {
    return NextResponse.redirect(
      `https://${req.headers.get('host')}${req.nextUrl.pathname}`,
      301
    )
  }
  
  return NextResponse.next()
}
```

**Security Headers:**
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, '')
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

### Encriptación en Reposo

**Datos sensibles encriptados:**
```typescript
// lib/encryption.ts
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex') // 32 bytes

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':')
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(ivHex, 'hex')
  )
  
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// Uso: encriptar datos sensibles antes de guardar
const encryptedNotes = encrypt(transaction.notes)
```

### PII (Personally Identifiable Information)

**Datos que requieren protección especial:**
- Email
- Nombre completo
- Teléfono
- Dirección
- Datos bancarios

**Implementación:**
```typescript
// Nunca loggear PII
logger.info({ 
  userId: user.id, // ✅ OK
  email: user.email // ❌ NO
})

// Enmascarar en logs
logger.info({ 
  email: maskEmail(user.email) // ✅ OK (u***@example.com)
})

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  return `${local[0]}***@${domain}`
}
```

---

## API Security

### Input Validation

**Validar TODO input con Zod:**
```typescript
import { z } from 'zod'

const createTransactionSchema = z.object({
  date: z.coerce.date(),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().cuid(),
  description: z.string().min(1).max(255).trim(),
  amountArs: z.number().positive().optional(),
  amountUsd: z.number().positive().optional(),
}).refine(
  data => data.amountArs || data.amountUsd,
  { message: "Debe especificar al menos un monto" }
)

// En API route
export async function POST(req: Request) {
  const body = await req.json()
  
  // Validar
  const result = createTransactionSchema.safeParse(body)
  
  if (!result.success) {
    return Response.json(
      { error: result.error.flatten() },
      { status: 400 }
    )
  }
  
  // Usar datos validados
  const data = result.data
  // ...
}
```

### Rate Limiting

**Implementación con Upstash:**
```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
})

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1"
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    })
  }
  
  // ... resto del handler
}
```

**Rate limits por endpoint:**
```typescript
const RATE_LIMITS = {
  '/api/auth/login': { requests: 5, window: '15 m' },
  '/api/auth/register': { requests: 3, window: '1 h' },
  '/api/transactions': { requests: 100, window: '1 m' },
  '/api/analytics': { requests: 20, window: '1 m' },
}
```

### CORS Configuration

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: process.env.ALLOWED_ORIGIN || "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ]
  },
}
```

### CSRF Protection

```typescript
// lib/csrf.ts
import { createHash, randomBytes } from 'crypto'

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex')
}

export function validateCSRFToken(token: string, expected: string): boolean {
  return token === expected
}

// Middleware
export async function validateCSRF(req: Request) {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers.get('X-CSRF-Token')
    const session = await auth()
    
    if (!token || !session?.csrfToken || token !== session.csrfToken) {
      throw new ForbiddenError('Invalid CSRF token')
    }
  }
}
```

---

## Database Security

### Connection Security

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Connection string segura:**
```bash
# ✅ Bueno: SSL habilitado
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# ❌ Malo: Sin SSL
DATABASE_URL="postgresql://user:pass@host:5432/db"
```

### SQL Injection Prevention

**Prisma previene SQL injection automáticamente:**
```typescript
// ✅ Seguro (Prisma)
const user = await prisma.user.findUnique({
  where: { email: userInput }
})

// ❌ NUNCA hacer raw queries con input del usuario
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userInput}
` // ← Vulnerable a SQL injection
```

**Si necesitas raw queries:**
```typescript
import { Prisma } from '@prisma/client'

// ✅ Usar parámetros
const users = await prisma.$queryRaw(
  Prisma.sql`SELECT * FROM users WHERE email = ${email}`
)
```

### Database Backups

**Automated backups (Supabase/Neon):**
- Daily automated backups
- Point-in-time recovery
- Backup retention: 30 días

**Manual backup script:**
```bash
#!/bin/bash
# scripts/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_$DATE.sql"

pg_dump $DATABASE_URL > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://contadash-backups/

# Cleanup local
rm $BACKUP_FILE
```

---

## Frontend Security

### XSS Prevention

**React previene XSS por defecto, pero cuidado con:**

```typescript
// ❌ PELIGROSO
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Seguro
<div>{userInput}</div>

// ✅ Si necesitas HTML, sanitiza primero
import DOMPurify from 'dompurify'

<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userInput) 
}} />
```

### Sensitive Data in Frontend

```typescript
// ❌ NUNCA exponer secrets en frontend
const API_KEY = "sk_live_xxx" // ← Visible en bundle

// ✅ Usar variables de entorno del servidor
// .env.local
STRIPE_SECRET_KEY="sk_live_xxx" // ← Solo servidor

// .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xxx" // ← OK para cliente
```

### Local Storage Security

```typescript
// ❌ NO guardar datos sensibles en localStorage
localStorage.setItem('token', jwtToken) // ← Vulnerable a XSS

// ✅ Usar httpOnly cookies (NextAuth.js lo hace automáticamente)
// El token está en cookie httpOnly, inaccesible desde JavaScript
```

---

## Compliance

### GDPR Compliance

**Requisitos:**
1. **Consentimiento explícito** para procesar datos
2. **Derecho al olvido** (delete account)
3. **Portabilidad de datos** (export data)
4. **Transparencia** (privacy policy)

**Implementación:**

```typescript
// Exportar datos del usuario
export async function exportUserData(userId: string) {
  const [user, transactions, categories, clients] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.transaction.findMany({ where: { userId } }),
    prisma.category.findMany({ where: { userId } }),
    prisma.client.findMany({ where: { userId } }),
  ])
  
  return {
    user: {
      email: user!.email,
      name: user!.name,
      createdAt: user!.createdAt,
    },
    transactions,
    categories,
    clients,
  }
}

// Eliminar cuenta y todos los datos
export async function deleteUserAccount(userId: string) {
  // Prisma cascade delete eliminará automáticamente
  // todas las transacciones, categorías, clientes, etc.
  await prisma.user.delete({
    where: { id: userId }
  })
}
```

### Data Retention

**Política de retención:**
- **Datos activos:** Mientras la cuenta esté activa
- **Datos de cuenta eliminada:** 30 días (soft delete)
- **Logs:** 90 días
- **Backups:** 30 días

```typescript
// Soft delete
export async function softDeleteUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      email: `deleted_${userId}@deleted.com`, // Liberar email
    },
  })
}

// Cron job para hard delete después de 30 días
export async function permanentlyDeleteOldAccounts() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  await prisma.user.deleteMany({
    where: {
      deletedAt: {
        lte: thirtyDaysAgo,
      },
    },
  })
}
```

---

## Security Checklist

### Pre-Launch

- [ ] HTTPS habilitado en producción
- [ ] Security headers configurados
- [ ] CORS configurado correctamente
- [ ] Rate limiting implementado
- [ ] Input validation en todas las APIs
- [ ] SQL injection prevention verificado
- [ ] XSS prevention verificado
- [ ] CSRF protection implementado
- [ ] Password hashing con bcrypt (12+ rounds)
- [ ] JWT con httpOnly cookies
- [ ] Row Level Security habilitado
- [ ] Backups automáticos configurados
- [ ] Monitoring y alertas configurados
- [ ] Error logging (sin PII)
- [ ] Secrets en variables de entorno
- [ ] Dependency security audit (`npm audit`)
- [ ] Security testing (OWASP Top 10)
- [ ] Privacy policy publicada
- [ ] Terms of service publicados

### Post-Launch

- [ ] Monitoring activo (Sentry)
- [ ] Security updates automáticos (Dependabot)
- [ ] Penetration testing anual
- [ ] Security audit trimestral
- [ ] Incident response plan documentado
- [ ] Backup restoration testing mensual

---

## Incident Response

### Security Incident Plan

**1. Detección**
- Monitoring automático (Sentry, logs)
- User reports
- Security scans

**2. Contención**
- Identificar scope del incidente
- Aislar sistemas afectados
- Revocar credenciales comprometidas

**3. Erradicación**
- Eliminar vulnerabilidad
- Patch systems
- Deploy fix

**4. Recuperación**
- Restore from backups si necesario
- Verificar integridad de datos
- Monitorear por actividad sospechosa

**5. Post-Mortem**
- Documentar incidente
- Identificar root cause
- Implementar prevenciones

**6. Comunicación**
- Notificar usuarios afectados (GDPR requirement)
- Transparencia sobre el incidente
- Timeline de resolución

---

## Security Resources

### Tools
- **OWASP ZAP:** Security testing
- **Snyk:** Dependency scanning
- **npm audit:** Vulnerability scanning
- **Lighthouse:** Security audit

### References
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/security)

---

**Última actualización:** 29 de Noviembre, 2025  
**Versión:** 1.0.0
