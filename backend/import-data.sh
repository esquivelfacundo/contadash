#!/bin/bash
# Script para importar datos a Railway PostgreSQL

echo "🔄 Importando datos a Railway PostgreSQL..."
psql $DATABASE_URL < data_backup.sql
echo "✅ Datos importados exitosamente"
