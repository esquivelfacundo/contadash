#!/bin/bash

# Script para probar la API desde la línea de comandos

API_URL="http://192.168.0.81:3000/api"

echo "🧪 Probando conexión a la API..."
echo ""

# Test 1: Verificar que el servidor responde
echo "1️⃣ Test de conectividad básica:"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$API_URL" || echo "❌ No se pudo conectar"
echo ""

# Test 2: Probar endpoint de auth
echo "2️⃣ Test de endpoint /auth/login (debería dar 400 sin credenciales):"
curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" || echo "❌ Error en la petición"
echo ""

# Test 3: Probar con credenciales de ejemplo
echo "3️⃣ Test de login con credenciales de ejemplo:"
echo "Email: admin@contadash.com"
echo "Password: admin123"
curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@contadash.com","password":"admin123"}' \
  -w "\nStatus: %{http_code}\n"
echo ""

echo "✅ Tests completados"
echo ""
echo "📝 Si el Status es 200, el login funcionó"
echo "📝 Si el Status es 401, las credenciales son incorrectas"
echo "📝 Si el Status es 400, falta algún campo"
echo "📝 Si no hay Status, hay problema de red"
