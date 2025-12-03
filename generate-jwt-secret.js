#!/usr/bin/env node

/**
 * Script para generar un JWT_SECRET seguro
 * Uso: node generate-jwt-secret.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generando JWT_SECRET seguro...\n');

const secret = crypto.randomBytes(32).toString('base64');

console.log('Tu JWT_SECRET es:');
console.log('━'.repeat(60));
console.log(secret);
console.log('━'.repeat(60));
console.log('\n✅ Copia este secret y úsalo en Railway como JWT_SECRET\n');
console.log('⚠️  IMPORTANTE: Guarda este secret de forma segura y NO lo subas a Git\n');
