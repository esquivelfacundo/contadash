# 🛠️ Comandos Útiles para Deployment

## 📦 Railway CLI

### Instalación
```bash
npm i -g @railway/cli
```

### Comandos Básicos
```bash
# Login
railway login

# Vincular proyecto
railway link

# Ver variables de entorno
railway variables

# Ejecutar comando en Railway
railway run <comando>

# Ver logs en tiempo real
railway logs

# Abrir dashboard
railway open
```

### Comandos para Base de Datos
```bash
# Ejecutar migraciones
railway run npx prisma migrate deploy

# Generar Prisma Client
railway run npx prisma generate

# Abrir Prisma Studio
railway run npx prisma studio

# Poblar cotizaciones históricas
railway run npx tsx scripts/populate-exchange-rates.ts

# Crear usuario inicial
railway run npx tsx scripts/create-production-user.ts

# Verificar estado de la base de datos
railway run npx tsx scripts/check-database.ts

# Backup de base de datos
railway run pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Comandos de Desarrollo
```bash
# Ejecutar comando en contexto de Railway
railway run npm run dev

# Shell interactivo
railway shell

# Conectar a PostgreSQL
railway connect postgres
```

---

## 🚀 Vercel CLI

### Instalación
```bash
npm i -g vercel
```

### Comandos Básicos
```bash
# Login
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod

# Ver logs
vercel logs

# Ver variables de entorno
vercel env ls

# Agregar variable de entorno
vercel env add NEXT_PUBLIC_API_URL

# Abrir dashboard
vercel open
```

### Comandos de Desarrollo
```bash
# Desarrollo local con variables de Vercel
vercel dev

# Pull de variables de entorno
vercel env pull

# Link al proyecto
vercel link
```

---

## 🐳 Docker (Para Fly.io o Local)

### Build y Run Local
```bash
# Build de la imagen
docker build -t contadash-backend ./backend

# Run local
docker run -p 4000:4000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  contadash-backend

# Run con .env file
docker run -p 4000:4000 --env-file ./backend/.env contadash-backend

# Ver logs
docker logs <container-id>

# Entrar al container
docker exec -it <container-id> /bin/bash
```

---

## ✈️ Fly.io CLI

### Instalación
```bash
curl -L https://fly.io/install.sh | sh
```

### Comandos Básicos
```bash
# Login
fly auth login

# Crear app
fly launch

# Deploy
fly deploy

# Ver logs
fly logs

# Abrir app
fly open

# Ver status
fly status

# SSH al container
fly ssh console

# Ejecutar comando
fly ssh console -C "npx prisma migrate deploy"
```

### Comandos de Base de Datos
```bash
# Crear PostgreSQL
fly postgres create

# Attach database
fly postgres attach <postgres-app-name>

# Conectar a PostgreSQL
fly postgres connect -a <postgres-app-name>
```

---

## 🗄️ Prisma

### Comandos de Desarrollo
```bash
# Generar Prisma Client
npx prisma generate

# Crear migración
npx prisma migrate dev --name <nombre>

# Aplicar migraciones
npx prisma migrate deploy

# Reset de base de datos (⚠️ BORRA TODO)
npx prisma migrate reset

# Abrir Prisma Studio
npx prisma studio

# Validar schema
npx prisma validate

# Formatear schema
npx prisma format
```

### Comandos de Producción
```bash
# Solo aplicar migraciones (sin crear)
npx prisma migrate deploy

# Generar client (necesario después de cada deploy)
npx prisma generate

# Seed de base de datos
npx prisma db seed
```

---

## 🔧 Scripts del Proyecto

### Backend
```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start

# Tests
npm test

# Prisma generate
npm run prisma:generate

# Prisma migrate
npm run prisma:migrate

# Prisma studio
npm run prisma:studio
```

### Frontend
```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start

# Lint
npm run lint
```

---

## 📊 Comandos de Monitoreo

### Railway
```bash
# Ver métricas
railway status

# Ver logs en tiempo real
railway logs -f

# Ver deployments
railway deployments
```

### Vercel
```bash
# Ver deployments
vercel ls

# Ver logs de un deployment
vercel logs <deployment-url>

# Inspeccionar deployment
vercel inspect <deployment-url>
```

---

## 🔍 Comandos de Debugging

### Verificar Conexión a Base de Datos
```bash
# Desde Railway
railway run node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('✅ Connected')).catch(e => console.error('❌ Error:', e))"

# Local
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('✅ Connected')).catch(e => console.error('❌ Error:', e))"
```

### Verificar Variables de Entorno
```bash
# Railway
railway run printenv | grep -E "DATABASE_URL|JWT_SECRET|NODE_ENV"

# Vercel
vercel env ls

# Local
printenv | grep -E "DATABASE_URL|JWT_SECRET|NODE_ENV"
```

### Test de API
```bash
# Health check
curl https://tu-backend.railway.app/health

# Test de login
curl -X POST https://tu-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@contadash.com","password":"Admin123!"}'

# Test con token
curl https://tu-backend.railway.app/api/transactions \
  -H "Authorization: Bearer <tu-token>"
```

---

## 🔄 Comandos de Rollback

### Railway
```bash
# Listar deployments
railway deployments

# Rollback al deployment anterior
railway rollback

# Rollback a deployment específico
railway rollback <deployment-id>
```

### Vercel
```bash
# Listar deployments
vercel ls

# Promover deployment anterior a producción
vercel promote <deployment-url>
```

### Prisma (Base de Datos)
```bash
# ⚠️ CUIDADO: Esto puede causar pérdida de datos

# Revertir última migración (desarrollo)
npx prisma migrate resolve --rolled-back <migration-name>

# Aplicar migración específica
npx prisma migrate resolve --applied <migration-name>
```

---

## 🧹 Comandos de Limpieza

### Docker
```bash
# Limpiar containers detenidos
docker container prune

# Limpiar imágenes sin usar
docker image prune

# Limpiar todo
docker system prune -a
```

### Node Modules
```bash
# Backend
cd backend && rm -rf node_modules && npm install

# Frontend
cd frontend && rm -rf node_modules && npm install

# Ambos
rm -rf backend/node_modules frontend/node_modules && npm install
```

### Cache de Build
```bash
# Next.js
rm -rf frontend/.next

# TypeScript
rm -rf backend/dist

# Prisma
rm -rf backend/node_modules/.prisma
```

---

## 🔐 Comandos de Seguridad

### Generar JWT Secret
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Base64
openssl rand -base64 32
```

### Verificar Dependencias
```bash
# Auditoría de seguridad
npm audit

# Fix automático
npm audit fix

# Fix forzado (puede romper cosas)
npm audit fix --force
```

---

## 📦 Comandos de Backup

### Base de Datos (PostgreSQL)
```bash
# Backup completo
railway run pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Backup solo schema
railway run pg_dump --schema-only $DATABASE_URL > schema-backup.sql

# Backup solo datos
railway run pg_dump --data-only $DATABASE_URL > data-backup.sql

# Restaurar backup
railway run psql $DATABASE_URL < backup.sql
```

### Archivos
```bash
# Backup de uploads (si están en servidor)
railway run tar -czf uploads-backup.tar.gz uploads/

# Descargar backup
railway run cat uploads-backup.tar.gz > uploads-backup-local.tar.gz
```

---

## 🚨 Comandos de Emergencia

### Reiniciar Servicios
```bash
# Railway
railway restart

# Fly.io
fly restart

# Docker
docker restart <container-id>
```

### Ver Logs de Error
```bash
# Railway - últimas 100 líneas
railway logs --tail 100

# Railway - filtrar errores
railway logs | grep -i error

# Vercel - últimas 100 líneas
vercel logs --tail 100
```

### Conectar a Base de Datos en Emergencia
```bash
# Railway
railway connect postgres

# Fly.io
fly postgres connect -a <postgres-app-name>

# Directo con psql
psql $DATABASE_URL
```

---

## 📝 Comandos Útiles de Git

### Deploy Manual
```bash
# Commit y push (trigger deploy automático)
git add .
git commit -m "Deploy: descripción del cambio"
git push origin main

# Tag de versión
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
```

### Rollback con Git
```bash
# Ver commits
git log --oneline

# Revertir a commit anterior
git revert <commit-hash>
git push origin main

# Reset hard (⚠️ PELIGROSO)
git reset --hard <commit-hash>
git push origin main --force
```

---

## 🎯 Comandos de Testing

### Backend
```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm run test:coverage
```

### Frontend
```bash
# Run tests
npm test

# E2E tests (si están configurados)
npm run test:e2e
```

---

## 📊 Comandos de Performance

### Análisis de Bundle (Frontend)
```bash
# Next.js bundle analyzer
npm run build
npm run analyze
```

### Benchmark de API
```bash
# Con Apache Bench
ab -n 1000 -c 10 https://tu-backend.railway.app/health

# Con wrk
wrk -t4 -c100 -d30s https://tu-backend.railway.app/health
```

---

**💡 Tip:** Guarda este archivo como referencia rápida durante el deployment y mantenimiento del proyecto.
