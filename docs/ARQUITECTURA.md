# 🏗️ Arquitectura de ContaDash

## Visión General

ContaDash sigue una arquitectura de **3 capas** con separación clara de responsabilidades:

```
┌─────────────────────────────────────────┐
│           FRONTEND (Next.js)            │
│  - UI Components (React + MUI)         │
│  - State Management (Context)          │
│  - Form Validation (Zod)               │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST
                  │ (Axios)
┌─────────────────▼───────────────────────┐
│          BACKEND (Express)              │
│  - Controllers (Rutas)                  │
│  - Services (Lógica de negocio)        │
│  - Middleware (Auth, Validación)       │
└─────────────────┬───────────────────────┘
                  │ Prisma ORM
                  │
┌─────────────────▼───────────────────────┐
│       BASE DE DATOS (PostgreSQL)        │
│  - 12 tablas relacionales              │
│  - Índices optimizados                 │
│  - Constraints de integridad           │
└─────────────────────────────────────────┘
```

---

## 🎯 Backend (Express + TypeScript)

### Estructura de Carpetas

```
backend/src/
├── controllers/        # Manejo de requests/responses
│   ├── auth.controller.ts
│   ├── transactions.controller.ts
│   ├── categories.controller.ts
│   └── ...
├── services/          # Lógica de negocio
│   ├── transaction.service.ts
│   ├── exchange-rate.service.ts
│   ├── pdf.service.ts
│   └── ...
├── middleware/        # Interceptores
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   └── security.middleware.ts
├── routes/           # Definición de rutas
│   ├── auth.routes.ts
│   ├── transactions.routes.ts
│   └── ...
├── config/           # Configuración
│   ├── database.ts
│   ├── email.ts
│   └── ...
└── server.ts         # Punto de entrada
```

### Flujo de una Request

```
1. Request HTTP → Express
2. Middleware de seguridad (Helmet, CORS, Rate Limit)
3. Middleware de autenticación (JWT)
4. Middleware de validación (Zod)
5. Controller (extrae datos, llama service)
6. Service (lógica de negocio, acceso a BD)
7. Response HTTP ← Express
```

### Capas y Responsabilidades

#### Controllers
- Reciben requests HTTP
- Extraen parámetros y body
- Llaman a services
- Devuelven responses HTTP
- **NO contienen lógica de negocio**

```typescript
// Ejemplo: transactions.controller.ts
export async function createTransaction(req: Request, res: Response) {
  const userId = req.user!.id
  const data = req.body
  
  const transaction = await transactionService.create(userId, data)
  
  res.status(201).json(transaction)
}
```

#### Services
- Contienen toda la lógica de negocio
- Acceden a la base de datos (Prisma)
- Realizan cálculos y validaciones
- Pueden llamar a otros services
- **NO conocen HTTP**

```typescript
// Ejemplo: transaction.service.ts
export async function create(userId: string, data: TransactionData) {
  // Validaciones de negocio
  // Cálculos
  // Acceso a BD
  return await prisma.transaction.create({ ... })
}
```

#### Middleware
- Interceptan requests antes de llegar al controller
- Autenticación, validación, logging, etc.
- Pueden modificar req/res o terminar la request

```typescript
// Ejemplo: auth.middleware.ts
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'No token' })
  }
  
  const decoded = jwt.verify(token, JWT_SECRET)
  req.user = decoded
  next()
}
```

---

## 🎨 Frontend (Next.js 14)

### Estructura de Carpetas

```
frontend/src/
├── app/                    # App Router (Next.js 14)
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Home
│   ├── monthly/           # Movimientos
│   ├── recurring/         # Transacciones recurrentes
│   ├── analytics/         # Analytics
│   └── ...
├── components/            # Componentes reutilizables
│   ├── TransactionFormDialog.tsx
│   ├── AttachmentUploader.tsx
│   ├── DocumentViewer.tsx
│   └── ...
├── lib/                   # Utilidades
│   ├── api/              # Cliente API
│   │   ├── client.ts
│   │   ├── transactions.ts
│   │   └── ...
│   └── utils.ts
└── contexts/             # Contextos de React
    └── AuthContext.tsx
```

### Flujo de Datos

```
1. Usuario interactúa con UI
2. Componente maneja evento
3. Llama a API client (axios)
4. Request HTTP → Backend
5. Response ← Backend
6. Actualiza estado local
7. Re-render de componente
```

### Patrones Utilizados

#### Formularios con React Hook Form + Zod
```typescript
const schema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
})

const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema),
})
```

#### API Client Centralizado
```typescript
// lib/api/client.ts
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

#### Componentes Controlados
```typescript
<Controller
  name="amount"
  control={control}
  render={({ field }) => (
    <TextField
      {...field}
      label="Monto"
      type="number"
    />
  )}
/>
```

---

## 🗄️ Base de Datos (PostgreSQL + Prisma)

### Modelo de Datos

```prisma
model User {
  id            String        @id @default(uuid())
  email         String        @unique
  password      String
  name          String
  transactions  Transaction[]
  categories    Category[]
  // ...
}

model Transaction {
  id            String    @id @default(uuid())
  userId        String    @map("user_id")
  date          DateTime
  type          TransactionType
  categoryId    String    @map("category_id")
  description   String
  amountArs     Decimal   @map("amount_ars")
  amountUsd     Decimal   @map("amount_usd")
  exchangeRate  Decimal   @map("exchange_rate")
  attachmentUrl String?   @map("attachment_url")
  // ...
  
  user          User      @relation(fields: [userId], references: [id])
  category      Category  @relation(fields: [categoryId], references: [id])
}
```

### Relaciones

```
User 1──────* Transaction
User 1──────* Category
User 1──────* Client
User 1──────* CreditCard
User 1──────* Budget
User 1──────* RecurringTransaction

Transaction *──────1 Category
Transaction *──────1 Client (opcional)
Transaction *──────1 CreditCard (opcional)
Transaction *──────1 RecurringTransaction (opcional)

Budget *──────1 Category
```

### Índices Importantes

```sql
-- Búsquedas frecuentes
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_exchange_rates_date ON exchange_rates(date);
```

---

## 🔄 Procesos Asíncronos

### Cron Jobs (node-cron)

#### Actualización de Cotizaciones (Diario 9 AM)
```typescript
cron.schedule('0 9 * * *', async () => {
  await updateExchangeRate()
})
```

#### Reportes Mensuales (Día 1 de cada mes)
```typescript
cron.schedule('0 0 1 * *', async () => {
  await sendMonthlyReports()
})
```

### Generación de PDFs (Puppeteer)
```typescript
const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.setContent(htmlContent)
const pdf = await page.pdf({ format: 'A4' })
await browser.close()
```

---

## 🔐 Seguridad

### Capas de Seguridad

1. **HTTP Headers** (Helmet.js)
   - X-Content-Type-Options
   - X-Frame-Options
   - X-XSS-Protection
   - Strict-Transport-Security

2. **Rate Limiting**
   - 100 requests por 15 minutos por IP
   - Previene brute force

3. **CORS**
   - Solo frontend autorizado
   - Credentials permitidos

4. **Autenticación JWT**
   - Tokens de corta duración (24h)
   - Verificación en cada request

5. **Validación de Inputs**
   - Zod en frontend y backend
   - Sanitización de datos

6. **Archivos**
   - Validación de tipo MIME
   - Límite de tamaño (10MB)
   - Nombres sanitizados

---

## 📊 Optimizaciones

### Backend
- **Paginación** en listados grandes
- **Índices** en columnas frecuentes
- **Lazy loading** de relaciones
- **Caching** de cotizaciones (en memoria)

### Frontend
- **Code splitting** automático (Next.js)
- **Image optimization** (Next.js)
- **Memoization** de componentes pesados
- **Debounce** en búsquedas

### Base de Datos
- **Connection pooling** (Prisma)
- **Prepared statements** (previene SQL injection)
- **Transacciones** para operaciones críticas

---

## 🚀 Deployment

### Producción Recomendada

```
Frontend: Vercel / Netlify
Backend: Railway / Render / DigitalOcean
Database: Railway / Supabase / AWS RDS
Files: AWS S3 / Cloudinary
```

### Variables de Entorno Requeridas

**Backend:**
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `FRONTEND_URL`
- `SMTP_*` (opcional)

**Frontend:**
- `NEXT_PUBLIC_API_URL`

---

## 📈 Escalabilidad

### Mejoras Futuras

1. **Caché con Redis**
   - Cotizaciones
   - Sesiones de usuario
   - Resultados de queries frecuentes

2. **Queue System (Bull/BullMQ)**
   - Generación de reportes
   - Envío de emails
   - Procesamiento de archivos

3. **CDN para Assets**
   - Archivos estáticos
   - Imágenes optimizadas

4. **Load Balancer**
   - Múltiples instancias de backend
   - Alta disponibilidad

---

**Última actualización:** 30 de Noviembre de 2025
