#!/bin/bash

# Script para crear un hotspot desde Ubuntu

echo "📡 Creando hotspot WiFi..."
echo ""

# Nombre del hotspot
HOTSPOT_NAME="ContaDash-Dev"
HOTSPOT_PASSWORD="contadash123"

# Crear hotspot usando nmcli
nmcli device wifi hotspot ifname wlp3s0 ssid "$HOTSPOT_NAME" password "$HOTSPOT_PASSWORD"

if [ $? -eq 0 ]; then
    echo "✅ Hotspot creado exitosamente!"
    echo ""
    echo "📱 Conecta tu celular a:"
    echo "   SSID: $HOTSPOT_NAME"
    echo "   Password: $HOTSPOT_PASSWORD"
    echo ""
    echo "🔗 La IP del backend será:"
    echo "   http://10.42.0.1:3000/api"
    echo ""
    echo "⚠️  IMPORTANTE: Actualiza la IP en el código mobile:"
    echo "   Archivo: src/constants/api.ts"
    echo "   Cambiar a: export const API_BASE_URL = 'http://10.42.0.1:3000/api'"
else
    echo "❌ Error al crear hotspot"
    echo ""
    echo "💡 Intenta manualmente:"
    echo "1. Abre Configuración de Ubuntu"
    echo "2. Ve a Wi-Fi"
    echo "3. Click en los 3 puntos → 'Turn On Wi-Fi Hotspot'"
fi
