# 💰 ContaDash - Sistema de Gestión Financiera

> Plataforma SaaS multi-tenant para control financiero profesional

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.8-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

---

## 🎯 Visión del Proyecto

ContaDash es una plataforma moderna de gestión financiera que permite a freelancers, emprendedores y pequeñas empresas llevar un control profesional de sus finanzas con la simplicidad de Google Sheets pero con el poder de una aplicación enterprise.

### Características Principales

✅ **Multi-Usuario con Aislamiento Total**  
✅ **Gestión de Ingresos/Egresos Multi-Moneda (ARS/USD)**  
✅ **Dashboard Ejecutivo con KPIs en Tiempo Real**  
✅ **Análisis por Cliente/Proyecto**  
✅ **Reportes Automatizados (PDF/Excel)**  
✅ **App Móvil (iOS/Android)**  
✅ **API Pública para Integraciones**  
✅ **Seguridad Enterprise (Row Level Security)**  

---

## 📚 Documentación

Esta carpeta contiene toda la documentación técnica del proyecto:

### 📖 Guías Principales

1. **[MASTER_PLAN.md](./MASTER_PLAN.md)** - Plan maestro completo del proyecto
   - Visión y arquitectura
   - Stack tecnológico
   - Roadmap de desarrollo
   - Funcionalidades core
   - Monetización

2. **[SECURITY.md](./SECURITY.md)** - Guía de seguridad
   - Autenticación y autorización
   - Protección de datos
   - Row Level Security
   - Compliance (GDPR)
   - Security checklist

3. **[DATABASE_DESIGN.md](./DATABASE_DESIGN.md)** - Diseño de base de datos
   - Diagrama ER completo
   - Schema Prisma
   - Índices y performance
   - Queries optimizadas
   - Migraciones y seeds

4. **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Guía de implementación
   - Setup inicial paso a paso
   - Fase 1: Fundación
   - Fase 2: Core Features
   - Fase 3: Dashboard & Analytics
   - Fase 4: Mobile App
   - Fase 5: Testing & Deploy

5. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Documentación de API
   - Endpoints completos
   - Request/Response examples
   - Error handling
   - Rate limiting
   - Webhooks

---

## 🚀 Quick Start

### Prerrequisitos

- Node.js 20 LTS
- PostgreSQL 15+
- npm/yarn/pnpm
- Git

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/contadash.git
cd contadash

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Setup base de datos
npx prisma migrate dev
npx prisma db seed

# Iniciar desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

**Credenciales demo:**
- Email: `demo@contadash.com`
- Password: `demo123456`

---

## 🏗️ Arquitectura

### Arquitectura de 3 Capas Separadas

```
┌──────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js)          MOBILE (React Native + Expo)   │
│  Puerto: 3000                Expo Dev Server                │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌──────────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express + Prisma)            │
│              Puerto: 4000                                    │
│  ┌────────────┐  ┌──────────┐  ┌──────────┐                │
│  │Controllers │→ │ Services │→ │  Prisma  │                │
│  └────────────┘  └──────────┘  └──────────┘                │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ SQL
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL 15+)                  │
│                   Row Level Security                         │
└──────────────────────────────────────────────────────────────┘
```

**Ventajas:**
- ✅ Separación clara de responsabilidades
- ✅ Backend único para web y mobile
- ✅ Escalabilidad independiente
- ✅ Desarrollo paralelo
- ✅ Deployment independiente

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.3
- **UI Library:** Material-UI (MUI) v5
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **State:** Zustand + React Query

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js
- **Language:** TypeScript 5.3
- **ORM:** Prisma 5.8
- **Database:** PostgreSQL 15
- **Auth:** JWT (jsonwebtoken)
- **Validation:** Zod
- **Security:** Helmet, CORS, Rate Limiting

### Mobile
- **Framework:** React Native + Expo
- **UI:** React Native Paper
- **Navigation:** React Navigation

### DevOps
- **Hosting:** Vercel (web) + Expo EAS (mobile)
- **Database:** Supabase / Neon
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry
- **Analytics:** Vercel Analytics

---

## 📁 Estructura del Proyecto

```
contadash/
├── apps/
│   ├── web/                    # Next.js Web App
│   │   ├── app/
│   │   │   ├── (auth)/        # Autenticación
│   │   │   ├── (dashboard)/   # Dashboard
│   │   │   └── api/           # API Routes
│   │   ├── components/
│   │   ├── lib/
│   │   ├── prisma/
│   │   └── styles/
│   │
│   └── mobile/                 # React Native App
│       ├── src/
│       └── app.json
│
├── packages/
│   ├── shared/                 # Código compartido
│   └── config/                 # Configuraciones
│
├── docs/                       # Documentación
├── .github/                    # CI/CD
└── guia/                       # Esta carpeta
```

---

## 🗺️ Roadmap

### ✅ Fase 1: Fundación (Semanas 1-2)
- [x] Setup inicial del proyecto
- [x] Configuración de base de datos
- [x] Sistema de autenticación
- [x] MUI Theme setup

### 🔄 Fase 2: Core Features (Semanas 3-5)
- [ ] CRUD de transacciones
- [ ] CRUD de categorías y clientes
- [ ] Integración con API de cotización
- [ ] Sistema de búsqueda y filtros

### 📊 Fase 3: Analytics & Dashboard (Semanas 6-7)
- [ ] Dashboard principal con KPIs
- [ ] Análisis por cliente/categoría
- [ ] Reportes mensuales/anuales
- [ ] Exportación PDF/Excel

### 🎨 Fase 4: UI/UX (Semanas 8-9)
- [ ] Diseño responsive completo
- [ ] Dark mode
- [ ] Animaciones y transiciones
- [ ] Optimizaciones de performance

### 📱 Fase 5: Mobile App (Semanas 10-12)
- [ ] Setup React Native
- [ ] Features principales
- [ ] Sincronización offline
- [ ] Deploy a stores

### 🚀 Fase 6: Features Avanzadas (Semanas 13-15)
- [ ] Multi-currency support
- [ ] Presupuestos y alertas
- [ ] API pública
- [ ] Integraciones

### ✅ Fase 7: Testing & QA (Semana 16)
- [ ] Tests unitarios (>80% coverage)
- [ ] Tests E2E
- [ ] Security audit
- [ ] Performance testing

### 🎉 Fase 8: Launch (Semana 17)
- [ ] Deploy a producción
- [ ] Monitoring y analytics
- [ ] Documentación final
- [ ] Marketing y lanzamiento

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage

# Type check
npm run type-check

# Lint
npm run lint
```

---

## 🚢 Deployment

### Web (Vercel)
```bash
vercel --prod
```

### Mobile (Expo EAS)
```bash
eas build --platform all
eas submit --platform all
```

---

## 🔐 Seguridad

- ✅ HTTPS obligatorio
- ✅ JWT con httpOnly cookies
- ✅ Row Level Security (PostgreSQL)
- ✅ Input validation (Zod)
- ✅ Rate limiting
- ✅ CSRF protection
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ Password hashing (bcrypt)
- ✅ MFA support (TOTP)

Ver [SECURITY.md](./SECURITY.md) para detalles completos.

---

## 📊 KPIs de Éxito

### Técnicos
- Lighthouse score >90
- Test coverage >80%
- API response time <200ms (p95)
- Bundle size <200KB

### Negocio
- User retention >60% (30 días)
- Conversion rate >5% (free → paid)
- Churn rate <5% mensual
- NPS >50

---

## 💰 Monetización

### Planes

**FREE**
- 100 transacciones/mes
- 3 clientes
- Reportes básicos

**PRO - $9.99/mes**
- Transacciones ilimitadas
- Clientes ilimitados
- Reportes avanzados
- API access

**ENTERPRISE - $29.99/mes**
- Todo de PRO +
- Multi-empresa
- Soporte dedicado
- Integraciones avanzadas

---

## 🤝 Contribución

Este es un proyecto privado. Para contribuir:

1. Crear branch desde `develop`
2. Hacer cambios
3. Crear Pull Request
4. Code review
5. Merge a `develop`

### Convenciones

- **Commits:** Conventional Commits
- **Branches:** `feature/`, `fix/`, `hotfix/`
- **Code Style:** ESLint + Prettier
- **Tests:** Obligatorios para nuevas features

---

## 📞 Soporte

- **Email:** support@contadash.com
- **Docs:** https://docs.contadash.com
- **Issues:** GitHub Issues (privado)

---

## 📄 Licencia

Proprietary - Todos los derechos reservados © 2025 ContaDash

---

## 👥 Equipo

- **Lead Developer:** [Tu Nombre]
- **UI/UX Designer:** [Nombre]
- **QA Engineer:** [Nombre]

---

## 🙏 Agradecimientos

- Next.js team
- Prisma team
- Vercel
- MUI team
- Open source community

---

**Última actualización:** 29 de Noviembre, 2025  
**Versión:** 1.0.0

---

## 📖 Próximos Pasos

1. ✅ Leer [MASTER_PLAN.md](./MASTER_PLAN.md)
2. ✅ Revisar [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
3. ✅ Estudiar [SECURITY.md](./SECURITY.md)
4. 🔄 Seguir [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
5. 📚 Consultar [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

**¡Comencemos a construir! 🚀**
