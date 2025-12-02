#!/bin/bash

echo "🔧 PostgreSQL Configuration Helper"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Opción 1: Usar tu usuario actual (lidius)${NC}"
echo "Esta es la opción más simple para desarrollo local"
echo ""
echo "Comandos a ejecutar:"
echo -e "${YELLOW}sudo -u postgres createuser -s lidius${NC}"
echo ""

echo -e "${BLUE}Opción 2: Configurar password para postgres${NC}"
echo "Comandos a ejecutar:"
echo -e "${YELLOW}sudo -u postgres psql${NC}"
echo -e "${YELLOW}ALTER USER postgres PASSWORD 'tu_password';${NC}"
echo -e "${YELLOW}\\q${NC}"
echo ""

echo "=========================================="
echo ""
echo "¿Qué opción prefieres?"
echo "1) Usar mi usuario (lidius) - RECOMENDADO"
echo "2) Configurar password para postgres"
echo "3) Salir"
echo ""
read -p "Selecciona (1/2/3): " option

case $option in
  1)
    echo ""
    echo -e "${GREEN}Creando superusuario 'lidius'...${NC}"
    sudo -u postgres createuser -s lidius 2>/dev/null || echo -e "${YELLOW}Usuario ya existe${NC}"
    
    echo ""
    echo -e "${GREEN}Actualizando .env...${NC}"
    cd ../backend
    
    # Backup del .env actual
    cp .env .env.backup
    
    # Actualizar DATABASE_URL
    sed -i 's|^DATABASE_URL=.*|DATABASE_URL="postgresql:///contadash"|' .env
    
    echo -e "${GREEN}✅ Configuración completada!${NC}"
    echo ""
    echo "DATABASE_URL actualizado a: postgresql:///contadash"
    echo ""
    echo "Ahora ejecuta:"
    echo "  cd backend"
    echo "  npx prisma migrate dev --name init"
    ;;
    
  2)
    echo ""
    echo -e "${YELLOW}Abriendo psql...${NC}"
    echo "Ejecuta estos comandos:"
    echo "  ALTER USER postgres PASSWORD 'tu_password';"
    echo "  \\q"
    echo ""
    sudo -u postgres psql
    
    echo ""
    read -p "¿Qué password configuraste? " password
    
    cd ../backend
    cp .env .env.backup
    
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"postgresql://postgres:${password}@localhost:5432/contadash?schema=public\"|" .env
    
    echo -e "${GREEN}✅ .env actualizado!${NC}"
    ;;
    
  3)
    echo "Saliendo..."
    exit 0
    ;;
    
  *)
    echo -e "${RED}Opción inválida${NC}"
    exit 1
    ;;
esac
