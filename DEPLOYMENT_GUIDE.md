# 🚀 Guía de Deployment - ContaDash

## 📋 Requisitos Previos

- Cuenta en [Railway](https://railway.app)
- Cuenta en [Vercel](https://vercel.com)
- Repositorio Git (GitHub, GitLab, o Bitbucket)

---

## 🗄️ PASO 1: Deployment del Backend en Railway

### 1.1 Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app) e inicia sesión
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a tu repositorio
5. Selecciona el repositorio `contadash`
6. Railway detectará automáticamente el backend

### 1.2 Agregar Base de Datos PostgreSQL

1. En tu proyecto de Railway, click en **"+ New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway creará automáticamente la base de datos
4. La variable `DATABASE_URL` se configurará automáticamente

### 1.3 Configurar Variables de Entorno

En el dashboard de Railway, ve a tu servicio backend → **"Variables"** y agrega:

```env
NODE_ENV=production
PORT=4000
JWT_SECRET=GENERA_UNA_CLAVE_SUPER_SEGURA_AQUI_DE_AL_MENOS_32_CARACTERES
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=https://tu-app.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**IMPORTANTE:** 
- `DATABASE_URL` ya está configurada automáticamente por Railway
- Genera un `JWT_SECRET` seguro (puedes usar: `openssl rand -base64 32`)
- Reemplaza `https://tu-app.vercel.app` con tu dominio de Vercel (lo obtendrás en el PASO 2)

### 1.4 Configurar Root Directory

1. En Railway, ve a **"Settings"**
2. En **"Root Directory"**, escribe: `backend`
3. En **"Build Command"**, escribe: `npm install && npx prisma generate && npm run build`
4. En **"Start Command"**, escribe: `npm start`

### 1.5 Ejecutar Migraciones

Una vez que el backend esté desplegado:

1. Ve a tu proyecto en Railway
2. Click en el servicio backend
3. Ve a la pestaña **"Deployments"**
4. Click en los 3 puntos del deployment activo → **"View Logs"**
5. Abre una terminal en Railway (icono de terminal en la esquina superior derecha)
6. Ejecuta:
```bash
npx prisma migrate deploy
```

### 1.6 Crear Usuario Inicial (Opcional)

Si quieres crear un usuario inicial:

```bash
npx tsx scripts/create-production-user.ts
```

O manualmente con las credenciales que prefieras.

### 1.7 Obtener URL del Backend

1. En Railway, ve a tu servicio backend
2. Ve a **"Settings"** → **"Networking"**
3. Click en **"Generate Domain"**
4. Copia la URL generada (ej: `https://contadash-backend-production.up.railway.app`)
5. **GUARDA ESTA URL** - la necesitarás para el frontend

---

## 🌐 PASO 2: Deployment del Frontend en Vercel

### 2.1 Crear Proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en **"Add New..."** → **"Project"**
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Next.js

### 2.2 Configurar Root Directory

1. En la configuración del proyecto, expande **"Build and Output Settings"**
2. En **"Root Directory"**, click en **"Edit"**
3. Escribe: `frontend`
4. Click en **"Continue"**

### 2.3 Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega:

```env
NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app/api
```

**IMPORTANTE:** Reemplaza `https://tu-backend.up.railway.app` con la URL que obtuviste en el PASO 1.7

### 2.4 Deploy

1. Click en **"Deploy"**
2. Espera a que termine el build (2-5 minutos)
3. Una vez completado, Vercel te dará una URL (ej: `https://contadash.vercel.app`)

### 2.5 Actualizar CORS en Railway

**MUY IMPORTANTE:** Ahora que tienes la URL de Vercel, debes actualizar el backend:

1. Ve a Railway → tu servicio backend → **"Variables"**
2. Edita `ALLOWED_ORIGINS` y agrega tu URL de Vercel:
```env
ALLOWED_ORIGINS=https://contadash.vercel.app,https://www.tu-dominio.com
```
3. El backend se redesplegará automáticamente

---

## ✅ PASO 3: Verificación

### 3.1 Verificar Backend

1. Abre tu navegador y ve a: `https://tu-backend.up.railway.app/api/health`
2. Deberías ver: `{"status":"ok","timestamp":"..."}`

### 3.2 Verificar Frontend

1. Abre tu app en Vercel: `https://contadash.vercel.app`
2. Intenta hacer login o registrarte
3. Verifica que puedas crear transacciones y ver el dashboard

### 3.3 Verificar Base de Datos

En Railway, puedes conectarte a la base de datos:

```bash
railway run npx prisma studio
```

---

## 🔧 Comandos Útiles

### Railway (Backend)

```bash
# Ver logs en tiempo real
railway logs

# Ejecutar comandos en producción
railway run [comando]

# Ejecutar migraciones
railway run npx prisma migrate deploy

# Ver base de datos
railway run npx prisma studio

# Crear usuario
railway run npx tsx scripts/create-production-user.ts
```

### Vercel (Frontend)

```bash
# Ver logs
vercel logs

# Redeployar
vercel --prod

# Ver variables de entorno
vercel env ls
```

---

## 🐛 Troubleshooting

### Error: "CORS policy"
- Verifica que `ALLOWED_ORIGINS` en Railway incluya tu URL de Vercel
- Asegúrate de que no haya espacios extras en la variable

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` esté configurada en Railway
- Ejecuta `railway run npx prisma migrate deploy`

### Error: "API not responding"
- Verifica los logs en Railway: `railway logs`
- Asegúrate de que el backend esté corriendo en el puerto correcto

### Frontend no se conecta al backend
- Verifica que `NEXT_PUBLIC_API_URL` en Vercel apunte a tu backend de Railway
- Asegúrate de incluir `/api` al final de la URL

---

## 🔐 Seguridad

### Antes de ir a producción:

1. ✅ Cambia `JWT_SECRET` por una clave segura única
2. ✅ Configura `ALLOWED_ORIGINS` correctamente
3. ✅ Revisa los límites de rate limiting
4. ✅ Habilita HTTPS (Railway y Vercel lo hacen automáticamente)
5. ✅ No subas archivos `.env` a Git (ya están en `.gitignore`)

---

## 📝 Notas Importantes

- **Railway** ofrece $5 de crédito gratis al mes
- **Vercel** ofrece hosting gratuito para proyectos personales
- Las migraciones de Prisma deben ejecutarse manualmente en producción
- Los logs están disponibles en tiempo real en ambas plataformas
- Puedes configurar dominios personalizados en ambas plataformas

---

## 🎉 ¡Listo!

Tu aplicación ContaDash ahora está en producción. Puedes compartir la URL de Vercel con tus usuarios.

Para actualizaciones futuras, simplemente haz `git push` y tanto Railway como Vercel se redesplegarán automáticamente.
