#!/bin/bash

echo "🚀 Configurando ContaDash Mobile..."
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "Instala Node.js desde: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

echo ""
echo "✅ Setup completado!"
echo ""
echo "📱 Para ejecutar la app:"
echo ""
echo "  1. En tu iPhone con Expo Go:"
echo "     npm start"
echo "     Escanea el QR code con la cámara"
echo ""
echo "  2. En el navegador web (Ubuntu):"
echo "     npm run web"
echo ""
echo "  3. En Android Emulator (si tienes instalado):"
echo "     npm run android"
echo ""
