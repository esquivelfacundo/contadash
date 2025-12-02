#!/bin/bash

echo "🔄 Limpiando y regenerando Prisma..."

# 1. Eliminar node_modules de Prisma
echo "📦 Eliminando caché de Prisma..."
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma

# 2. Regenerar Prisma Client
echo "🔨 Regenerando Prisma Client..."
npx prisma generate

# 3. Verificar schema
echo "✅ Verificando schema..."
npx prisma validate

echo "🎉 ¡Listo! Reinicia tu servidor de desarrollo."
