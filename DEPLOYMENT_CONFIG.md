# 🚀 Configuración de Deployment - ContaDash

## 📊 **Información del Proyecto**

### Railway (Backend)
- **Project ID:** `ca5ecb5f-0734-46b7-b941-d347bc714162`
- **URL Pública:** `https://contadash-production.up.railway.app`
- **URL Interna:** `contadash.railway.internal`

### Vercel (Frontend)
- **Dominios:**
  - `https://contadash.com` (Principal)
  - `https://www.contadash.com`
  - `https://contadash.vercel.app`

### Email (Hostinger)
- **Email:** `notificaciones@contadash.com`
- **SMTP:** `smtp.hostinger.com:465`

---

## ✅ **BACKEND DEPLOYADO EN RAILWAY**

**URL:** https://contadash-production.up.railway.app
**Status:** ✅ Activo
**Database:** ✅ PostgreSQL conectado
**Migrations:** ✅ 7 migraciones aplicadas

## 🔐 **Variables de Entorno - RAILWAY (Backend)**

```env
NODE_ENV=production
JWT_SECRET=vph8A//7fjGFynL9QlqCJUMs3oTP4L+lyO8XlH5nMGY=
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=https://contadash.com,https://www.contadash.com,https://contadash.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=https://contadash.com
BACKEND_URL=https://contadash-production.up.railway.app
EMAIL_FROM=ContaDash <notificaciones@contadash.com>
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=notificaciones@contadash.com
SMTP_PASS=Lidius@2001
DATABASE_URL=(Generado automáticamente por Railway)
```

**NOTA:** Railway configura automáticamente:
- `PORT` - Asignado automáticamente
- `DATABASE_URL` - Configurado al conectar PostgreSQL

---

## 🌐 **Variables de Entorno - VERCEL (Frontend)**

```env
NEXT_PUBLIC_API_URL=https://contadash-production.up.railway.app/api
```

---

## 📝 **Pasos de Deployment**

### 1️⃣ Railway (Backend)

1. ✅ Código ya está en GitHub
2. ✅ Proyecto conectado a Railway
3. ✅ Variables de entorno configuradas
4. ⏳ Esperar a que termine el build
5. 🔄 Ejecutar migraciones:
   ```bash
   railway run npx prisma migrate deploy
   ```
6. ✅ Verificar que el servicio esté corriendo

### 2️⃣ Vercel (Frontend)

1. Ir a [vercel.com](https://vercel.com)
2. **Import Project** desde GitHub
3. Seleccionar repositorio `contadash`
4. **Root Directory:** `frontend`
5. **Framework:** Next.js (auto-detectado)
6. **Environment Variables:** Agregar `NEXT_PUBLIC_API_URL`
7. Click **Deploy**
8. Configurar dominios personalizados en Settings

### 3️⃣ Verificación

1. ✅ Backend responde en: `https://contadash-production.up.railway.app/api/health`
2. ✅ Frontend carga en: `https://contadash.com`
3. ✅ Login funciona correctamente
4. ✅ Emails se envían desde Hostinger

---

## 🔧 **Comandos Útiles**

### Railway CLI
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link ca5ecb5f-0734-46b7-b941-d347bc714162

# Ver logs
railway logs

# Ejecutar comandos
railway run npx prisma migrate deploy
railway run npx prisma studio
```

### Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy desde local
cd frontend
vercel --prod
```

---

## 🐛 **Troubleshooting**

### Backend no responde
1. Verificar logs en Railway
2. Verificar que DATABASE_URL esté configurada
3. Verificar que las migraciones se ejecutaron

### Frontend no conecta al backend
1. Verificar `NEXT_PUBLIC_API_URL` en Vercel
2. Verificar CORS en Railway (`ALLOWED_ORIGINS`)
3. Verificar que el backend esté corriendo

### Emails no se envían
1. Verificar credenciales de Hostinger
2. Verificar que el puerto 465 esté abierto
3. Revisar logs del backend

---

## 📚 **Recursos**

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)

---

**Última actualización:** 3 de Diciembre, 2025
