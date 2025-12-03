#!/usr/bin/env tsx
/**
 * Script para verificar el estado de la base de datos
 * Uso: railway run npx tsx scripts/check-database.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Verificando estado de la base de datos...\n')

    // Test de conexión
    await prisma.$connect()
    console.log('✅ Conexión a la base de datos exitosa')

    // Contar usuarios
    const userCount = await prisma.user.count()
    console.log(`👥 Usuarios: ${userCount}`)

    // Contar transacciones
    const transactionCount = await prisma.transaction.count()
    console.log(`💰 Transacciones: ${transactionCount}`)

    // Contar categorías
    const categoryCount = await prisma.category.count()
    console.log(`📁 Categorías: ${categoryCount}`)

    // Contar clientes
    const clientCount = await prisma.client.count()
    console.log(`👔 Clientes: ${clientCount}`)

    // Contar tarjetas de crédito
    const creditCardCount = await prisma.creditCard.count()
    console.log(`💳 Tarjetas de crédito: ${creditCardCount}`)

    // Contar cotizaciones
    const exchangeRateCount = await prisma.exchangeRate.count()
    console.log(`💵 Cotizaciones históricas: ${exchangeRateCount}`)

    // Última cotización
    const lastExchangeRate = await prisma.exchangeRate.findFirst({
      orderBy: { date: 'desc' }
    })
    if (lastExchangeRate) {
      console.log(`\n📊 Última cotización:`)
      console.log(`   Fecha: ${lastExchangeRate.date.toISOString().split('T')[0]}`)
      console.log(`   Tasa: $${lastExchangeRate.rate}`)
    }

    // Listar usuarios
    if (userCount > 0) {
      console.log('\n👥 Usuarios registrados:')
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          company: true,
          plan: true,
          createdAt: true
        }
      })
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.name}) - Plan: ${user.plan}`)
        console.log(`     ID: ${user.id}`)
        console.log(`     Creado: ${user.createdAt.toISOString().split('T')[0]}`)
      })
    }

    console.log('\n✅ Verificación completada')

  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
