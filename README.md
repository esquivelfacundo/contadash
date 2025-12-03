# 💰 ContaDash

**Sistema de Gestión Financiera Personal y Empresarial**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

---

## 📖 Descripción

ContaDash es una aplicación web completa para la gestión financiera que permite llevar un control detallado de ingresos, egresos, tarjetas de crédito, presupuestos y análisis financieros. Incluye cotizaciones históricas del dólar blue desde 2020 y generación automática de reportes.

### ✨ Características Principales

- 💳 **Gestión de Transacciones**: Registro completo de ingresos y egresos en ARS y USD
- 🔄 **Transacciones Recurrentes**: Automatización de pagos mensuales y anuales
- 💵 **Cotizaciones Históricas**: Dólar blue desde 2020 con actualización diaria
- 📊 **Analytics y Reportes**: Dashboard interactivo y reportes en PDF
- 🏦 **Tarjetas de Crédito**: Seguimiento de múltiples tarjetas con cierres y vencimientos
- 📁 **Adjuntos**: Subida y visualización de comprobantes (PDFs e imágenes)
- 👥 **Clientes y Categorías**: Organización personalizada
- 💰 **Presupuestos**: Control de gastos por categoría
- 📧 **Reportes Automáticos**: Envío mensual por email
- 🔐 **Seguridad**: Autenticación JWT, rate limiting, validación de inputs

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ y npm
- PostgreSQL 14+
- Git

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/contadash.git
cd contadash
```

2. **Configurar variables de entorno**

Backend (`backend/.env`):
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/contadash"
JWT_SECRET="tu-secret-super-seguro"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Email (opcional, para reportes)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-password-app"
```

Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. **Instalar dependencias**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

4. **Configurar base de datos**
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

5. **Poblar cotizaciones históricas** (opcional pero recomendado)
```bash
npx tsx scripts/populate-exchange-rates.ts
```

6. **Crear usuario inicial**
```bash
npx tsx scripts/create-user.ts
```

7. **Iniciar servicios**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

8. **Acceder a la aplicación**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

---

## 📁 Estructura del Proyecto

```
contadash/
├── backend/                 # API REST con Express + TypeScript
│   ├── src/
│   │   ├── controllers/    # Controladores de rutas
│   │   ├── services/       # Lógica de negocio
│   │   ├── middleware/     # Autenticación, validación, seguridad
│   │   ├── routes/         # Definición de rutas
│   │   ├── config/         # Configuración (DB, email, etc.)
│   │   └── server.ts       # Punto de entrada
│   ├── prisma/
│   │   └── schema.prisma   # Modelo de datos
│   └── scripts/            # Scripts de utilidad
├── frontend/               # Next.js 14 con App Router
│   ├── src/
│   │   ├── app/           # Páginas y layouts
│   │   ├── components/    # Componentes reutilizables
│   │   ├── lib/           # Utilidades y API client
│   │   └── contexts/      # Contextos de React
│   └── public/            # Archivos estáticos
├── docs/                  # Documentación del proyecto
└── guia/                  # Guía de desarrollo original
```

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Express.js** - Framework web
- **TypeScript** - Lenguaje tipado
- **Prisma** - ORM para PostgreSQL
- **JWT** - Autenticación
- **Zod** - Validación de schemas
- **Puppeteer** - Generación de PDFs
- **Nodemailer** - Envío de emails
- **node-cron** - Tareas programadas
- **Helmet** - Seguridad HTTP
- **Axios** - Cliente HTTP

### Frontend
- **Next.js 14** - Framework React con App Router
- **Material-UI (MUI)** - Componentes UI
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de formularios
- **Axios** - Cliente HTTP
- **date-fns** - Manejo de fechas

### Base de Datos
- **PostgreSQL** - Base de datos relacional
- **Prisma** - ORM y migraciones

---

## 📊 Modelo de Datos

El sistema cuenta con 12 tablas principales:

- `users` - Usuarios del sistema
- `transactions` - Transacciones (ingresos/egresos)
- `recurring_transactions` - Transacciones recurrentes
- `categories` - Categorías de transacciones
- `clients` - Clientes/proveedores
- `credit_cards` - Tarjetas de crédito
- `budgets` - Presupuestos mensuales
- `exchange_rates` - Cotizaciones históricas
- `scheduled_reports` - Configuración de reportes
- Y más...

Ver [docs/DATABASE.md](docs/DATABASE.md) para el esquema completo.

---

## 🔐 Seguridad

El sistema implementa múltiples capas de seguridad:

- ✅ Autenticación JWT con tokens de corta duración
- ✅ Rate limiting (100 requests/15 minutos)
- ✅ Helmet.js para headers de seguridad
- ✅ CORS configurado
- ✅ Validación de inputs con Zod
- ✅ Sanitización de archivos subidos
- ✅ Passwords hasheados con bcrypt
- ✅ Variables de entorno para secrets

---

## 📈 Características Avanzadas

### Cotizaciones Automáticas
- Actualización diaria a las 9 AM (cron job)
- Histórico completo 2020-2025 (1,826 días)
- Fallback a API externa si falla la BD
- Cotización congelada por mes (último día)

### Transacciones Recurrentes
- Generación automática mensual/anual
- Selector de fecha de inicio para histórico
- Asociación con transacciones generadas

### Reportes Automáticos
- Generación mensual de PDFs
- Envío automático por email
- Personalización por usuario

### Sistema de Adjuntos
- Subida de PDFs e imágenes (hasta 10MB)
- Visualizador integrado en modal
- Almacenamiento seguro en servidor

---

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test

# Coverage
npm run test:coverage
```

---

## 📝 Scripts Útiles

```bash
# Backend
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm start            # Producción
npm run migrate      # Ejecutar migraciones

# Frontend
npm run dev          # Desarrollo
npm run build        # Build de producción
npm start            # Servidor de producción
npm run lint         # Linter
```

---

## 📚 Documentación

### Deployment
- [🚀 Guía Rápida de Deployment](DEPLOY_QUICK_START.md) - Deploy en 15 minutos
- [📊 Deployment Completo](docs/DEPLOYMENT_GRATUITO.md) - Guía detallada y opciones
- [📋 Resumen de Deployment](DEPLOYMENT_SUMMARY.md) - Análisis y recomendaciones
- [🛠️ Comandos Útiles](DEPLOYMENT_COMMANDS.md) - Referencia de comandos

### Desarrollo
- [Estado del Proyecto](docs/ESTADO_PROYECTO.md) - Comparación con guía original
- [Guía de Desarrollo](guia/README.md) - Documentación técnica completa
- [API Documentation](guia/API_DOCUMENTATION.md) - Endpoints y ejemplos
- [Arquitectura](docs/ARQUITECTURA.md) - Diseño del sistema
- [Seguridad](guia/SECURITY.md) - Prácticas de seguridad

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado y propietario.

---

## 👤 Autor

**Lidius**

---

## 🙏 Agradecimientos

- [ArgentinaDatos API](https://argentinadatos.com/) - Cotizaciones del dólar
- Material-UI por los componentes
- La comunidad de Next.js y Express

---

## 📞 Soporte

Para reportar bugs o solicitar features, por favor abre un issue en GitHub.

---

**⭐ Si te gusta este proyecto, dale una estrella en GitHub!**
