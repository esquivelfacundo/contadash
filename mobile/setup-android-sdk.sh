#!/bin/bash

# Script para configurar Android SDK después de instalar Android Studio

set -e

echo "🔧 Configurando Android SDK para EAS Build Local..."

# Detectar Android SDK
ANDROID_SDK_ROOT="$HOME/Android/Sdk"

if [ ! -d "$ANDROID_SDK_ROOT" ]; then
    echo "❌ Android SDK no encontrado en $ANDROID_SDK_ROOT"
    echo ""
    echo "📋 PASOS MANUALES NECESARIOS:"
    echo "1. Abre Android Studio"
    echo "2. Ve a Tools > SDK Manager"
    echo "3. Instala:"
    echo "   - Android SDK Platform 36 (Android 15)"
    echo "   - Android SDK Build-Tools 36.0.0"
    echo "   - Android SDK Command-line Tools"
    echo "   - Android SDK Platform-Tools"
    echo "   - NDK (Side by side) versión 27.1.12297006"
    echo ""
    echo "4. Luego ejecuta este script nuevamente"
    exit 1
fi

echo "✅ Android SDK encontrado en: $ANDROID_SDK_ROOT"

# Configurar variables de entorno
echo ""
echo "📝 Configurando variables de entorno..."

# Agregar al .bashrc si no existe
if ! grep -q "ANDROID_HOME" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Android SDK" >> ~/.bashrc
    echo "export ANDROID_HOME=\$HOME/Android/Sdk" >> ~/.bashrc
    echo "export ANDROID_SDK_ROOT=\$HOME/Android/Sdk" >> ~/.bashrc
    echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> ~/.bashrc
    echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> ~/.bashrc
    echo "export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin" >> ~/.bashrc
    echo "✅ Variables agregadas a ~/.bashrc"
else
    echo "✅ Variables ya configuradas en ~/.bashrc"
fi

# Exportar para la sesión actual
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_SDK_ROOT=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

echo ""
echo "✅ Variables de entorno configuradas para esta sesión"

# Verificar instalación
echo ""
echo "🔍 Verificando componentes instalados..."

if [ -d "$ANDROID_SDK_ROOT/platforms/android-36" ]; then
    echo "✅ Android SDK Platform 36 instalado"
else
    echo "⚠️  Android SDK Platform 36 NO instalado"
fi

if [ -d "$ANDROID_SDK_ROOT/build-tools/36.0.0" ]; then
    echo "✅ Build Tools 36.0.0 instalado"
else
    echo "⚠️  Build Tools 36.0.0 NO instalado"
fi

if [ -d "$ANDROID_SDK_ROOT/ndk" ]; then
    echo "✅ NDK instalado"
else
    echo "⚠️  NDK NO instalado"
fi

echo ""
echo "📋 Resumen de configuración:"
echo "ANDROID_HOME=$ANDROID_HOME"
echo "ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT"
echo ""
echo "✅ Configuración completada!"
echo ""
echo "🚀 Para compilar el APK, ejecuta:"
echo "   source ~/.bashrc"
echo "   cd /home/lidius/Documents/contadash/mobile"
echo "   npx eas-cli build --platform android --profile production --local"
