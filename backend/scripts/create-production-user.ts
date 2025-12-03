#!/usr/bin/env tsx
/**
 * Script para crear usuario inicial en producción
 * Uso: railway run npx tsx scripts/create-production-user.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createProductionUser() {
  try {
    console.log('🚀 Creando usuario inicial en producción...\n')

    // Datos del usuario (puedes cambiarlos aquí o usar variables de entorno)
    const email = process.env.ADMIN_EMAIL || 'admin@contadash.com'
    const password = process.env.ADMIN_PASSWORD || 'Admin123!'
    const name = process.env.ADMIN_NAME || 'Administrador'
    const company = process.env.ADMIN_COMPANY || 'ContaDash'

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log(`⚠️  El usuario ${email} ya existe`)
      console.log(`   ID: ${existingUser.id}`)
      console.log(`   Nombre: ${existingUser.name}`)
      console.log(`   Empresa: ${existingUser.company || 'N/A'}`)
      return
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        company,
        plan: 'FREE',
        emailVerified: new Date()
      }
    })

    console.log('✅ Usuario creado exitosamente!\n')
    console.log('📧 Email:', email)
    console.log('🔑 Contraseña:', password)
    console.log('👤 Nombre:', name)
    console.log('🏢 Empresa:', company || 'N/A')
    console.log('🆔 ID:', user.id)
    console.log('\n⚠️  IMPORTANTE: Guarda estas credenciales en un lugar seguro!')
    console.log('⚠️  Cambia la contraseña después del primer login!')

  } catch (error) {
    console.error('❌ Error al crear usuario:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createProductionUser()
