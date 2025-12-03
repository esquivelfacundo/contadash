#!/bin/bash

# Script para compilar APK localmente
# Configuración automática de JAVA_HOME y Android SDK

set -e

echo "🔧 Configurando entorno para build local..."

# Detectar JAVA_HOME
if [ -z "$JAVA_HOME" ]; then
    echo "📦 Configurando JAVA_HOME..."
    
    # Buscar Java instalado
    JAVA_PATH=$(update-alternatives --query java 2>/dev/null | grep 'Value:' | cut -d' ' -f2 || echo "")
    
    if [ -n "$JAVA_PATH" ]; then
        # Extraer JAVA_HOME del path de java
        export JAVA_HOME=$(dirname $(dirname $JAVA_PATH))
        echo "✅ JAVA_HOME configurado: $JAVA_HOME"
    else
        echo "❌ Java no encontrado. Instalando OpenJDK 17..."
        sudo apt update
        sudo apt install -y openjdk-17-jdk
        
        # Reintentar detectar JAVA_HOME
        JAVA_PATH=$(update-alternatives --query java | grep 'Value:' | cut -d' ' -f2)
        export JAVA_HOME=$(dirname $(dirname $JAVA_PATH))
        echo "✅ Java instalado. JAVA_HOME: $JAVA_HOME"
    fi
fi

# Verificar que Java funciona
echo "🔍 Verificando Java..."
java -version

# Configurar Android SDK si no existe
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME no configurado"
    echo "⚠️  El build puede fallar sin Android SDK"
    echo ""
    echo "💡 Opciones:"
    echo "1. Instalar Android Studio y configurar ANDROID_HOME"
    echo "2. Usar build en la nube (sin --local)"
    echo ""
    read -p "¿Continuar de todas formas? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
rm -rf android/

# Instalar dependencias faltantes
echo "📦 Instalando dependencias..."
npm install react-native-worklets --legacy-peer-deps

# Ejecutar build
echo "🚀 Iniciando build local..."
echo "⏱️  Esto puede tomar 10-15 minutos..."
echo ""

npx eas-cli build --platform android --profile production --local

echo ""
echo "✅ Build completado!"
echo "📱 APK generado en el directorio actual"
