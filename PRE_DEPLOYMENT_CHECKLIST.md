# ✅ Pre-Deployment Checklist - ContaDash

## 🎯 Resumen Rápido

Antes de subir a Git y hacer deployment, asegúrate de completar estos pasos:

---

## 📦 **1. Archivos de Configuración Creados**

✅ Los siguientes archivos ya están listos:

- `backend/.env.production.example` - Variables de entorno para Railway
- `backend/railway.json` - Configuración de Railway
- `backend/package.json` - Scripts actualizados para producción
- `frontend/.env.production.example` - Variables de entorno para Vercel
- `DEPLOYMENT_GUIDE.md` - Guía completa de deployment
- `.gitignore` - Archivos sensibles excluidos

---

## 🔐 **2. Generar JWT Secret**

Antes de deployar, genera un JWT_SECRET seguro:

```bash
# Opción 1: Con OpenSSL
openssl rand -base64 32

# Opción 2: Con Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**GUARDA ESTE SECRET** - lo necesitarás para Railway.

---

## 🚀 **3. Orden de Deployment**

### **PRIMERO: Backend en Railway**

1. Crea proyecto en Railway
2. Conecta tu repositorio
3. Agrega PostgreSQL
4. Configura variables de entorno:
   - `NODE_ENV=production`
   - `JWT_SECRET=[el que generaste]`
   - `ALLOWED_ORIGINS=` (lo actualizarás después)
5. Configura Root Directory: `backend`
6. Deploy
7. Ejecuta migraciones: `railway run npx prisma migrate deploy`
8. **COPIA LA URL DEL BACKEND** (ej: `https://contadash-backend.up.railway.app`)

### **SEGUNDO: Frontend en Vercel**

1. Crea proyecto en Vercel
2. Conecta tu repositorio
3. Configura Root Directory: `frontend`
4. Configura variable de entorno:
   - `NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app/api`
5. Deploy
6. **COPIA LA URL DEL FRONTEND** (ej: `https://contadash.vercel.app`)

### **TERCERO: Actualizar CORS**

1. Ve a Railway → Variables
2. Actualiza `ALLOWED_ORIGINS` con tu URL de Vercel:
   ```
   ALLOWED_ORIGINS=https://contadash.vercel.app
   ```
3. Railway se redesplegará automáticamente

---

## 📋 **4. Variables de Entorno Necesarias**

### Railway (Backend)
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=[auto-generada por Railway]
JWT_SECRET=[genera uno seguro]
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=[tu URL de Vercel]
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Vercel (Frontend)
```env
NEXT_PUBLIC_API_URL=[tu URL de Railway]/api
```

---

## 🧪 **5. Testing Local Antes de Subir**

Verifica que todo funcione localmente:

```bash
# Backend
cd backend
npm run build
npm start

# Frontend (en otra terminal)
cd frontend
npm run build
npm start
```

Si todo funciona localmente, estás listo para deployar.

---

## 📤 **6. Subir a Git**

Una vez que todo esté configurado:

```bash
# Desde la raíz del proyecto
git add .
git commit -m "feat: Preparar proyecto para deployment en Railway y Vercel"
git push origin main
```

---

## ✅ **7. Verificación Post-Deployment**

Después de deployar, verifica:

1. ✅ Backend responde: `https://tu-backend.up.railway.app/api/health`
2. ✅ Frontend carga: `https://tu-app.vercel.app`
3. ✅ Login funciona
4. ✅ Crear transacciones funciona
5. ✅ Dashboard muestra datos correctamente
6. ✅ Gráficos renderizan correctamente

---

## 🐛 **8. Si Algo Sale Mal**

### Backend no inicia
- Revisa logs en Railway: `railway logs`
- Verifica que `DATABASE_URL` esté configurada
- Ejecuta migraciones: `railway run npx prisma migrate deploy`

### Frontend no se conecta
- Verifica `NEXT_PUBLIC_API_URL` en Vercel
- Asegúrate de incluir `/api` al final
- Verifica CORS en Railway

### Error 500 en el backend
- Revisa logs en Railway
- Verifica que todas las variables de entorno estén configuradas
- Verifica que las migraciones se hayan ejecutado

---

## 📞 **9. Recursos Útiles**

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Deploy Docs](https://www.prisma.io/docs/guides/deployment)
- Guía completa: Ver `DEPLOYMENT_GUIDE.md`

---

## 🎉 **¡Listo para Deployar!**

Si completaste todos los pasos de este checklist, estás listo para:

1. Subir a Git
2. Deployar en Railway (Backend)
3. Deployar en Vercel (Frontend)
4. Actualizar CORS
5. ¡Disfrutar tu app en producción!

---

**Última actualización:** Diciembre 2025
