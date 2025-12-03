# 🚀 Guía de Deployment Gratuito - ContaDash

**Fecha:** Diciembre 2024  
**Objetivo:** Deployar frontend y backend de forma 100% gratuita y permanente

---

## 📊 Análisis del Proyecto

### Stack Tecnológico

#### Frontend
- **Framework:** Next.js 14 (App Router)
- **Puerto:** 3001 (configurable)
- **Build:** Estático + SSR
- **Dependencias:** React, MUI, Axios, Chart.js
- **Variables de entorno:** `NEXT_PUBLIC_API_URL`

#### Backend
- **Framework:** Express.js + TypeScript
- **Puerto:** 4000 (configurable)
- **Base de datos:** PostgreSQL (Prisma ORM)
- **Dependencias críticas:**
  - `puppeteer` (generación de PDFs) ⚠️
  - `node-cron` (tareas programadas)
  - `nodemailer` (envío de emails)
  - `multer` (upload de archivos)
- **Variables de entorno:**
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `PORT`
  - `ALLOWED_ORIGINS`

#### Base de Datos
- **PostgreSQL 14+**
- **12 tablas principales**
- **1,826+ registros de cotizaciones históricas**
- **Migraciones con Prisma**

---

## ✅ Opciones de Deployment Gratuito

### 🎨 FRONTEND: Vercel (Recomendado)

**✅ Ventajas:**
- ✅ **100% Gratuito para siempre** (plan Hobby)
- ✅ Optimizado para Next.js (es de los creadores)
- ✅ Deploy automático desde Git
- ✅ SSL/HTTPS gratis
- ✅ CDN global
- ✅ Preview deployments
- ✅ 100 GB bandwidth/mes
- ✅ Builds ilimitados

**Límites del plan gratuito:**
- 100 GB bandwidth/mes (más que suficiente)
- 100 GB-hours serverless function execution
- 6,000 minutos de build/mes

**Alternativas:**
- **Netlify:** Similar a Vercel, 100 GB bandwidth/mes
- **Cloudflare Pages:** Bandwidth ilimitado, builds ilimitados
- **GitHub Pages:** Solo para sitios estáticos (no funciona con SSR)

---

### 🔧 BACKEND: Opciones Analizadas

#### ⭐ OPCIÓN 1: Railway (Recomendado)

**✅ Ventajas:**
- ✅ **$5 USD de crédito gratis/mes** (suficiente para uso personal)
- ✅ PostgreSQL incluido (1 GB storage)
- ✅ Deploy desde Git
- ✅ Variables de entorno fáciles
- ✅ Logs en tiempo real
- ✅ Soporta Puppeteer ✅
- ✅ Cron jobs funcionan ✅
- ✅ 500 MB RAM (suficiente)

**⚠️ Consideraciones:**
- Crédito mensual de $5 USD (se renueva cada mes)
- Si excedes, se pausa hasta el próximo mes
- Para uso personal/pequeño es suficiente

**Límites del plan gratuito:**
- $5 USD de crédito/mes (~500 horas de ejecución)
- 500 MB RAM
- 1 GB storage para PostgreSQL
- Shared CPU

**Configuración necesaria:**
```bash
# Agregar en railway.json o configurar en UI
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

---

#### ⭐ OPCIÓN 2: Render.com

**✅ Ventajas:**
- ✅ **100% Gratuito para siempre**
- ✅ PostgreSQL gratuito (90 días, luego se borra)
- ✅ Deploy desde Git
- ✅ SSL gratis
- ✅ Soporta Puppeteer (con configuración)

**❌ Desventajas:**
- ❌ Se "duerme" después de 15 min de inactividad
- ❌ Primer request tarda 30-60 segundos en despertar
- ❌ PostgreSQL gratuito expira cada 90 días ⚠️
- ❌ 750 horas/mes (suficiente pero con sleep)

**⚠️ Problema crítico:**
- La base de datos gratuita se **borra cada 90 días**
- Tendrías que migrar datos cada 3 meses
- **No recomendado para producción**

---

#### ⭐ OPCIÓN 3: Fly.io

**✅ Ventajas:**
- ✅ **Gratuito para siempre** (con límites)
- ✅ 3 VMs pequeñas gratis (256 MB RAM cada una)
- ✅ PostgreSQL gratuito (3 GB storage)
- ✅ No se duerme
- ✅ Soporta Puppeteer

**❌ Desventajas:**
- ❌ 256 MB RAM puede ser justo con Puppeteer
- ❌ Configuración más compleja (Dockerfile)
- ❌ Requiere tarjeta de crédito (no cobra, solo verificación)

**Límites del plan gratuito:**
- 3 shared-cpu-1x VMs (256 MB RAM)
- 3 GB storage PostgreSQL
- 160 GB bandwidth/mes

---

#### ❌ OPCIÓN 4: Heroku

**Estado:** Ya NO es gratuito
- Eliminaron el plan gratuito en 2022
- Mínimo $5-7 USD/mes
- **No recomendado**

---

#### ⭐ OPCIÓN 5: Supabase (Solo Base de Datos)

**Para PostgreSQL:**
- ✅ **Gratuito para siempre**
- ✅ 500 MB storage
- ✅ Backups automáticos
- ✅ No expira (a diferencia de Render)
- ✅ API REST automática

**Uso:**
- Solo para la base de datos
- Backend en Railway/Fly.io
- Frontend en Vercel

**Límites del plan gratuito:**
- 500 MB database space
- 2 GB bandwidth/mes
- 50,000 monthly active users
- Pausa después de 1 semana de inactividad (se reactiva automáticamente)

---

#### ⭐ OPCIÓN 6: Neon.tech (Solo Base de Datos)

**Para PostgreSQL:**
- ✅ **Gratuito para siempre**
- ✅ 3 GB storage
- ✅ Serverless PostgreSQL
- ✅ No se duerme
- ✅ Branching de base de datos

**Límites del plan gratuito:**
- 3 GB storage
- 1 proyecto
- Compute: 191.9 horas/mes activo

---

## 🎯 Recomendación Final

### ✅ ARQUITECTURA RECOMENDADA (100% Gratuita)

```
┌─────────────────────────────────────────┐
│         FRONTEND (Vercel)               │
│  - Next.js 14                           │
│  - Deploy automático desde Git          │
│  - SSL gratis                           │
│  - CDN global                           │
└─────────────────┬───────────────────────┘
                  │ HTTPS
                  │
┌─────────────────▼───────────────────────┐
│         BACKEND (Railway)               │
│  - Express.js + TypeScript              │
│  - Puppeteer funcionando                │
│  - Cron jobs activos                    │
│  - $5 USD crédito/mes (suficiente)      │
└─────────────────┬───────────────────────┘
                  │ Prisma
                  │
┌─────────────────▼───────────────────────┐
│    BASE DE DATOS (Railway PostgreSQL)   │
│  - 1 GB storage (incluido en Railway)   │
│  - Backups automáticos                  │
│  - No expira                            │
└─────────────────────────────────────────┘
```

**Costo total:** $0 USD/mes (Railway ofrece $5 de crédito mensual)

---

### 🔄 ARQUITECTURA ALTERNATIVA (Más Robusta)

```
┌─────────────────────────────────────────┐
│         FRONTEND (Vercel)               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         BACKEND (Fly.io)                │
│  - 256 MB RAM                           │
│  - No se duerme                         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    BASE DE DATOS (Neon.tech)            │
│  - 3 GB storage                         │
│  - Serverless                           │
└─────────────────────────────────────────┘
```

**Costo total:** $0 USD/mes (100% gratuito)

---

## 📝 Pasos de Deployment

### 1️⃣ Preparar el Proyecto

#### Backend: Agregar archivos de configuración

**Crear `backend/Procfile` (para Railway/Render):**
```
web: npm start
```

**Crear `backend/.dockerignore`:**
```
node_modules
npm-debug.log
.env
.git
.gitignore
dist
```

**Actualizar `backend/package.json` - verificar scripts:**
```json
{
  "scripts": {
    "dev": "nodemon --exec tsx src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "postinstall": "prisma generate"
  }
}
```

**Configurar Puppeteer para producción:**

Agregar en `backend/src/services/pdf.service.ts`:
```typescript
const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu'
  ],
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
})
```

---

### 2️⃣ Deploy del Backend (Railway)

1. **Crear cuenta en Railway.app**
   - Ir a https://railway.app
   - Sign up con GitHub

2. **Crear nuevo proyecto**
   - Click en "New Project"
   - Seleccionar "Deploy from GitHub repo"
   - Autorizar acceso a tu repositorio
   - Seleccionar el repositorio de ContaDash

3. **Configurar el servicio**
   - Root Directory: `/backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **Agregar PostgreSQL**
   - Click en "New" → "Database" → "Add PostgreSQL"
   - Railway creará automáticamente la variable `DATABASE_URL`

5. **Configurar variables de entorno**
   ```
   DATABASE_URL=postgresql://... (auto-generada)
   JWT_SECRET=tu-secret-super-seguro-cambialo
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   PORT=4000
   ALLOWED_ORIGINS=https://tu-frontend.vercel.app
   ```

6. **Ejecutar migraciones**
   - En Railway, ir a la terminal del servicio
   - Ejecutar: `npx prisma migrate deploy`
   - Ejecutar: `npx prisma generate`

7. **Poblar datos iniciales** (opcional)
   ```bash
   npx tsx scripts/populate-exchange-rates.ts
   npx tsx scripts/create-user.ts
   ```

8. **Obtener URL del backend**
   - Railway te dará una URL como: `https://tu-app.up.railway.app`

---

### 3️⃣ Deploy del Frontend (Vercel)

1. **Crear cuenta en Vercel**
   - Ir a https://vercel.com
   - Sign up con GitHub

2. **Importar proyecto**
   - Click en "Add New" → "Project"
   - Seleccionar tu repositorio
   - Framework Preset: **Next.js** (auto-detectado)
   - Root Directory: `/frontend`

3. **Configurar variables de entorno**
   ```
   NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app/api
   ```

4. **Deploy**
   - Click en "Deploy"
   - Vercel construirá y desplegará automáticamente
   - Te dará una URL como: `https://tu-app.vercel.app`

5. **Actualizar CORS en backend**
   - Volver a Railway
   - Actualizar variable `ALLOWED_ORIGINS`:
     ```
     ALLOWED_ORIGINS=https://tu-app.vercel.app
     ```

---

### 4️⃣ Verificación Post-Deploy

**Checklist:**
- [ ] Frontend carga correctamente
- [ ] Login funciona
- [ ] Transacciones se crean
- [ ] Cotizaciones se obtienen
- [ ] PDFs se generan (probar reportes)
- [ ] Cron jobs funcionan (revisar logs)
- [ ] Uploads de archivos funcionan

---

## ⚠️ Consideraciones Importantes

### Puppeteer en Producción

**Problema:** Puppeteer requiere Chrome/Chromium instalado

**Solución para Railway:**
```bash
# Railway instala automáticamente las dependencias de Puppeteer
# Asegúrate de tener en package.json:
"puppeteer": "^24.31.0"
```

**Solución para Fly.io (requiere Dockerfile):**
```dockerfile
FROM node:18-slim

# Instalar dependencias de Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 4000
CMD ["npm", "start"]
```

---

### Cron Jobs

**Railway/Fly.io:** ✅ Funcionan sin problemas

**Render (plan gratuito):** ⚠️ No funcionan bien porque el servicio se duerme

**Alternativa:** Usar servicios externos para cron:
- **Cron-job.org** (gratuito)
- **EasyCron** (gratuito hasta 20 jobs)
- Hacer requests HTTP a endpoints específicos

---

### Almacenamiento de Archivos

**Problema:** Railway/Fly.io tienen almacenamiento efímero (se borra en redeploys)

**Solución:** Usar almacenamiento externo gratuito:

1. **Cloudinary** (Recomendado)
   - 25 GB storage gratis
   - 25 GB bandwidth/mes
   - Transformaciones de imágenes
   - API simple

2. **AWS S3** (con Free Tier)
   - 5 GB storage gratis (12 meses)
   - 20,000 GET requests/mes
   - 2,000 PUT requests/mes

3. **Supabase Storage**
   - 1 GB storage gratis
   - Integrado con PostgreSQL

**Implementación con Cloudinary:**
```typescript
// backend/src/config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export default cloudinary
```

---

### Base de Datos: Backups

**Railway:** Backups automáticos incluidos

**Supabase/Neon:** Backups automáticos incluidos

**Recomendación adicional:**
- Hacer backups manuales periódicos
- Exportar datos importantes a CSV/JSON

**Script de backup:**
```bash
# backend/scripts/backup-db.sh
#!/bin/bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

---

## 🔧 Troubleshooting

### Error: "Puppeteer failed to launch"

**Solución:**
```typescript
// Agregar más argumentos a puppeteer.launch()
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--single-process'
]
```

### Error: "Database connection failed"

**Verificar:**
1. Variable `DATABASE_URL` está correcta
2. Base de datos está activa
3. Migraciones ejecutadas: `npx prisma migrate deploy`

### Error: "CORS policy blocked"

**Verificar:**
1. Variable `ALLOWED_ORIGINS` incluye la URL del frontend
2. Frontend usa la URL correcta del backend
3. Protocolo HTTPS en producción

### Frontend no se conecta al backend

**Verificar:**
1. Variable `NEXT_PUBLIC_API_URL` está correcta
2. Backend está activo (no dormido)
3. URL incluye `/api` al final

---

## 📊 Monitoreo y Logs

### Railway
- Logs en tiempo real en el dashboard
- Métricas de CPU/RAM/Network
- Alertas por email

### Vercel
- Analytics incluido
- Logs de builds y runtime
- Error tracking

### Recomendación:
- **Sentry** (gratuito hasta 5,000 eventos/mes) para error tracking
- **Better Stack** (gratuito) para logs centralizados

---

## 💰 Resumen de Costos

| Servicio | Plan | Costo | Límites |
|----------|------|-------|---------|
| **Vercel** | Hobby | $0/mes | 100 GB bandwidth |
| **Railway** | Trial | $0/mes | $5 crédito/mes |
| **Neon** | Free | $0/mes | 3 GB storage |
| **Cloudinary** | Free | $0/mes | 25 GB storage |
| **TOTAL** | - | **$0/mes** | Suficiente para uso personal |

---

## ✅ Checklist Final

### Antes de Deploy
- [ ] Código en GitHub/GitLab
- [ ] Variables de entorno documentadas
- [ ] Scripts de build funcionando localmente
- [ ] Migraciones de BD probadas
- [ ] `.gitignore` configurado (no subir `.env`)

### Durante Deploy
- [ ] Backend desplegado y funcionando
- [ ] Base de datos creada y migrada
- [ ] Frontend desplegado
- [ ] Variables de entorno configuradas
- [ ] CORS configurado correctamente

### Después de Deploy
- [ ] Login funciona
- [ ] CRUD de transacciones funciona
- [ ] Cotizaciones se obtienen
- [ ] PDFs se generan
- [ ] Cron jobs activos
- [ ] Backups configurados

---

## 🎓 Recursos Adicionales

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Fly.io Docs](https://fly.io/docs)
- [Puppeteer en producción](https://pptr.dev/guides/docker)

---

## 🚨 Limitaciones del Plan Gratuito

### Railway ($5 crédito/mes)
- ⚠️ Si tu app consume más de $5/mes, se pausará hasta el próximo mes
- ⚠️ Para uso personal/pequeño es suficiente
- ⚠️ Si creces, considera upgrade a $5-10/mes

### Alternativas si excedes límites:
1. **Optimizar:** Reducir uso de CPU/RAM
2. **Fly.io:** Más generoso con recursos
3. **VPS barato:** DigitalOcean ($4/mes), Linode ($5/mes)

---

**Última actualización:** Diciembre 2024  
**Autor:** Análisis completo del proyecto ContaDash
