# 🚀 Guía Rápida de Deployment

## Opción Recomendada: Railway + Vercel (100% Gratis)

### ⏱️ Tiempo estimado: 15-20 minutos

---

## 📋 Pre-requisitos

- [ ] Cuenta de GitHub con el proyecto subido
- [ ] Cuenta de Railway.app (sign up con GitHub)
- [ ] Cuenta de Vercel (sign up con GitHub)

---

## 🔧 PASO 1: Deploy del Backend (Railway)

### 1.1 Crear Proyecto en Railway

1. Ve a https://railway.app
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway a acceder a tu GitHub
5. Selecciona el repositorio **contadash**

### 1.2 Configurar el Servicio Backend

1. Root Directory: `/backend`
2. Railway detectará automáticamente que es Node.js
3. El archivo `railway.json` ya está configurado ✅

### 1.3 Agregar PostgreSQL

1. En tu proyecto de Railway, click en **"New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway creará automáticamente la variable `DATABASE_URL`

### 1.4 Configurar Variables de Entorno

En Railway, ve a tu servicio backend → **Variables** y agrega:

```env
DATABASE_URL=postgresql://... (auto-generada por Railway)
JWT_SECRET=cambia-esto-por-un-string-super-seguro-y-aleatorio
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=4000
ALLOWED_ORIGINS=https://tu-app.vercel.app
```

**⚠️ IMPORTANTE:** Cambia `JWT_SECRET` por un string aleatorio y seguro. Puedes generarlo con:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 1.5 Ejecutar Migraciones

1. En Railway, ve a tu servicio backend
2. Click en **"Settings"** → **"Deploy"**
3. Espera a que el deploy termine
4. Ve a la pestaña **"Deployments"** → Click en el último deploy → **"View Logs"**
5. Verifica que no haya errores

**Ejecutar migraciones manualmente:**
1. En Railway, click en tu servicio → **"Settings"** → **"Service Settings"**
2. Busca la opción de **"One-off Command"** o usa la CLI de Railway:

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link al proyecto
railway link

# Ejecutar migraciones
railway run npx prisma migrate deploy
railway run npx prisma generate

# Poblar cotizaciones (opcional)
railway run npx tsx scripts/populate-exchange-rates.ts

# Crear usuario inicial
railway run npx tsx scripts/create-user.ts
```

### 1.6 Obtener URL del Backend

1. En Railway, ve a tu servicio backend
2. Ve a **"Settings"** → **"Networking"**
3. Click en **"Generate Domain"**
4. Copia la URL (ejemplo: `https://contadash-backend-production.up.railway.app`)

---

## 🎨 PASO 2: Deploy del Frontend (Vercel)

### 2.1 Importar Proyecto

1. Ve a https://vercel.com
2. Click en **"Add New"** → **"Project"**
3. Selecciona tu repositorio de GitHub
4. Vercel detectará automáticamente Next.js ✅

### 2.2 Configurar el Proyecto

1. **Framework Preset:** Next.js (auto-detectado)
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build` (auto-detectado)
4. **Output Directory:** `.next` (auto-detectado)

### 2.3 Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega:

```env
NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app/api
```

**⚠️ Reemplaza** `tu-backend.up.railway.app` con la URL real de Railway del paso 1.6

### 2.4 Deploy

1. Click en **"Deploy"**
2. Espera 2-3 minutos
3. Vercel te dará una URL (ejemplo: `https://contadash.vercel.app`)

---

## 🔄 PASO 3: Actualizar CORS en Backend

1. Vuelve a Railway
2. Ve a tu servicio backend → **Variables**
3. Actualiza la variable `ALLOWED_ORIGINS`:

```env
ALLOWED_ORIGINS=https://contadash.vercel.app
```

**⚠️ Reemplaza** con tu URL real de Vercel

4. Railway redesplegará automáticamente

---

## ✅ PASO 4: Verificación

### 4.1 Verificar Backend

Abre en tu navegador:
```
https://tu-backend.up.railway.app/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2024-12-03T04:30:00.000Z"
}
```

### 4.2 Verificar Frontend

1. Abre tu URL de Vercel: `https://contadash.vercel.app`
2. Deberías ver la página de login
3. Intenta hacer login con el usuario que creaste

### 4.3 Checklist Completo

- [ ] Backend responde en `/health`
- [ ] Frontend carga correctamente
- [ ] Login funciona
- [ ] Puedes crear una transacción
- [ ] Las cotizaciones se obtienen
- [ ] Los gráficos se muestran

---

## 🐛 Troubleshooting

### Error: "Failed to fetch" en el frontend

**Causa:** CORS no configurado correctamente

**Solución:**
1. Verifica que `ALLOWED_ORIGINS` en Railway incluya tu URL de Vercel
2. Verifica que `NEXT_PUBLIC_API_URL` en Vercel sea correcta
3. Asegúrate de que ambas URLs usen HTTPS

### Error: "Database connection failed"

**Causa:** Migraciones no ejecutadas

**Solución:**
```bash
railway run npx prisma migrate deploy
railway run npx prisma generate
```

### Error: "Puppeteer failed to launch"

**Causa:** Configuración de Puppeteer

**Solución:** Ya está configurado en el código ✅. Si persiste:
1. Verifica los logs en Railway
2. Asegúrate de tener suficiente RAM (Railway ofrece 500 MB)

### Frontend no se conecta al backend

**Solución:**
1. Verifica que `NEXT_PUBLIC_API_URL` termine en `/api`
2. Ejemplo correcto: `https://backend.railway.app/api`
3. Ejemplo incorrecto: `https://backend.railway.app`

---

## 💰 Costos y Límites

### Railway (Backend + Database)
- **Costo:** $0/mes (incluye $5 de crédito mensual)
- **Límites:**
  - 500 MB RAM
  - 1 GB storage PostgreSQL
  - ~500 horas de ejecución/mes
- **Suficiente para:** Uso personal, 10-50 usuarios

### Vercel (Frontend)
- **Costo:** $0/mes (plan Hobby)
- **Límites:**
  - 100 GB bandwidth/mes
  - Builds ilimitados
  - 100 GB-hours serverless
- **Suficiente para:** Uso personal, cientos de usuarios

---

## 🔄 Actualizaciones Futuras

### Deploy Automático

Ambos servicios (Railway y Vercel) están configurados para **deploy automático**:

1. Haces un commit en GitHub
2. Push a la rama `main`
3. Railway y Vercel detectan el cambio
4. Despliegan automáticamente

### Rollback

Si algo sale mal:

**En Railway:**
1. Ve a **"Deployments"**
2. Selecciona un deploy anterior
3. Click en **"Redeploy"**

**En Vercel:**
1. Ve a **"Deployments"**
2. Selecciona un deploy anterior
3. Click en **"Promote to Production"**

---

## 📊 Monitoreo

### Railway
- **Logs:** En tiempo real en el dashboard
- **Métricas:** CPU, RAM, Network
- **Alertas:** Por email si el servicio falla

### Vercel
- **Analytics:** Incluido en el plan gratuito
- **Logs:** Build y runtime logs
- **Error Tracking:** Integrado

---

## 🎉 ¡Listo!

Tu aplicación está ahora en producción y accesible desde cualquier lugar del mundo.

**URLs importantes:**
- Frontend: `https://tu-app.vercel.app`
- Backend: `https://tu-backend.railway.app`
- Database: Gestionada por Railway

**Próximos pasos:**
1. Configura un dominio personalizado (opcional)
2. Configura backups de la base de datos
3. Configura monitoreo con Sentry (opcional)
4. Invita a usuarios a probar la app

---

## 📚 Recursos

- [Documentación completa de deployment](./docs/DEPLOYMENT_GRATUITO.md)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Troubleshooting avanzado](./docs/DEPLOYMENT_GRATUITO.md#-troubleshooting)

---

**¿Problemas?** Revisa la [guía completa de deployment](./docs/DEPLOYMENT_GRATUITO.md) para más detalles.
