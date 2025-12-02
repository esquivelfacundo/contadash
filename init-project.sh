#!/bin/bash

echo "🚀 Inicializando ContaDash - Proyecto Completo"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Debes ejecutar este script desde la raíz del proyecto ContaDash${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📦 Paso 1: Instalando dependencias del Backend${NC}"
cd backend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error instalando dependencias del backend${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencias del backend instaladas${NC}"

echo ""
echo -e "${BLUE}🗄️  Paso 2: Configurando Base de Datos${NC}"
# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: No existe el archivo .env en backend/${NC}"
    echo "Por favor crea el archivo .env con la configuración de la base de datos"
    exit 1
fi

echo "Generando Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error generando Prisma Client${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Prisma Client generado${NC}"

echo ""
echo "Ejecutando migraciones..."
npx prisma migrate deploy
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error ejecutando migraciones${NC}"
    echo "Intentando crear la base de datos y ejecutar migraciones..."
    npx prisma migrate dev --name init
fi
echo -e "${GREEN}✅ Migraciones ejecutadas${NC}"

echo ""
echo "Ejecutando seeds..."
npm run prisma:seed
if [ $? -ne 0 ]; then
    echo -e "${RED}⚠️  Advertencia: Error ejecutando seeds (puede que ya existan datos)${NC}"
else
    echo -e "${GREEN}✅ Seeds ejecutados${NC}"
fi

echo ""
echo -e "${BLUE}📦 Paso 3: Instalando dependencias del Frontend${NC}"
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error instalando dependencias del frontend${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencias del frontend instaladas${NC}"

echo ""
echo -e "${BLUE}🔧 Paso 4: Verificando configuración${NC}"
# Check if .env.local exists in frontend
if [ ! -f ".env.local" ]; then
    echo "Creando .env.local..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local
    echo -e "${GREEN}✅ Archivo .env.local creado${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}=============================================="
echo "✅ Inicialización Completa!"
echo "=============================================="
echo ""
echo "Para iniciar el proyecto:"
echo ""
echo "1️⃣  Backend:"
echo "   cd backend && npm run dev"
echo "   (Servidor en http://localhost:4000)"
echo ""
echo "2️⃣  Frontend:"
echo "   cd frontend && npm run dev"
echo "   (Aplicación en http://localhost:3000)"
echo ""
echo "3️⃣  Credenciales demo:"
echo "   Email: demo@contadash.com"
echo "   Password: demo123456"
echo ""
echo -e "${BLUE}🎉 ¡Listo para comenzar!${NC}"
