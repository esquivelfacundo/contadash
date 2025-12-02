import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setupDemoAccount() {
  console.log('🚀 Iniciando configuración de cuentas...\n')

  try {
    // 1. Limpiar cuenta de Facundo
    console.log('🧹 Limpiando cuenta facundoesquivel01@gmail.com...')
    const facundoUser = await prisma.user.findUnique({
      where: { email: 'facundoesquivel01@gmail.com' }
    })

    if (facundoUser) {
      // Eliminar en orden correcto (respetando foreign keys)
      // 1. Transacciones (dependen de todo)
      await prisma.transaction.deleteMany({
        where: { userId: facundoUser.id }
      })
      
      // 2. Transacciones recurrentes (dependen de categorías, clientes, tarjetas)
      await prisma.recurringTransaction.deleteMany({
        where: { userId: facundoUser.id }
      })
      
      // 3. Presupuestos (dependen de categorías)
      await prisma.budget.deleteMany({
        where: { userId: facundoUser.id }
      })
      
      // 4. Tarjetas de crédito
      await prisma.creditCard.deleteMany({
        where: { userId: facundoUser.id }
      })
      
      // 5. Cuentas bancarias
      await prisma.bankAccount.deleteMany({
        where: { userId: facundoUser.id }
      })
      
      // 6. Categorías
      await prisma.category.deleteMany({
        where: { userId: facundoUser.id }
      })
      
      // 7. Clientes
      await prisma.client.deleteMany({
        where: { userId: facundoUser.id }
      })
      
      console.log('✅ Cuenta de Facundo limpiada completamente\n')
    } else {
      console.log('⚠️  Usuario Facundo no encontrado\n')
    }

    // 2. Crear o actualizar cuenta demo
    console.log('👤 Configurando cuenta demo@contadash.com...')
    
    const hashedPassword = await bcrypt.hash('Momento1234', 10)
    
    // Verificar si ya existe
    let demoUser = await prisma.user.findUnique({
      where: { email: 'demo@contadash.com' }
    })

    if (demoUser) {
      console.log('⚠️  Usuario demo ya existe, eliminando datos antiguos...')
      
      // Eliminar en orden correcto (respetando foreign keys)
      await prisma.transaction.deleteMany({ where: { userId: demoUser.id } })
      await prisma.recurringTransaction.deleteMany({ where: { userId: demoUser.id } })
      await prisma.budget.deleteMany({ where: { userId: demoUser.id } })
      await prisma.creditCard.deleteMany({ where: { userId: demoUser.id } })
      await prisma.bankAccount.deleteMany({ where: { userId: demoUser.id } })
      await prisma.category.deleteMany({ where: { userId: demoUser.id } })
      await prisma.client.deleteMany({ where: { userId: demoUser.id } })
      
      // Actualizar contraseña
      await prisma.user.update({
        where: { id: demoUser.id },
        data: { passwordHash: hashedPassword }
      })
    } else {
      // Crear nuevo usuario
      demoUser = await prisma.user.create({
        data: {
          email: 'demo@contadash.com',
          passwordHash: hashedPassword,
          name: 'Usuario Demo',
        }
      })
    }

    console.log('✅ Usuario demo configurado\n')

    // 3. Crear categorías
    console.log('📁 Creando categorías...')
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Salario',
          type: 'INCOME',
          icon: '💰',
          userId: demoUser.id
        }
      }),
      prisma.category.create({
        data: {
          name: 'Freelance',
          type: 'INCOME',
          icon: '💻',
          userId: demoUser.id
        }
      }),
      prisma.category.create({
        data: {
          name: 'Inversiones',
          type: 'INCOME',
          icon: '📈',
          userId: demoUser.id
        }
      }),
      prisma.category.create({
        data: {
          name: 'Alquiler',
          type: 'EXPENSE',
          icon: '🏠',
          userId: demoUser.id
        }
      }),
      prisma.category.create({
        data: {
          name: 'Servicios',
          type: 'EXPENSE',
          icon: '💡',
          userId: demoUser.id
        }
      }),
      prisma.category.create({
        data: {
          name: 'Supermercado',
          type: 'EXPENSE',
          icon: '🛒',
          userId: demoUser.id
        }
      }),
      prisma.category.create({
        data: {
          name: 'Transporte',
          type: 'EXPENSE',
          icon: '🚗',
          userId: demoUser.id
        }
      }),
      prisma.category.create({
        data: {
          name: 'Entretenimiento',
          type: 'EXPENSE',
          icon: '🎬',
          userId: demoUser.id
        }
      }),
      prisma.category.create({
        data: {
          name: 'Salud',
          type: 'EXPENSE',
          icon: '⚕️',
          userId: demoUser.id
        }
      }),
      prisma.category.create({
        data: {
          name: 'Educación',
          type: 'EXPENSE',
          icon: '📚',
          userId: demoUser.id
        }
      }),
    ])
    console.log(`✅ ${categories.length} categorías creadas\n`)

    // 4. Crear cuentas bancarias
    console.log('🏦 Creando cuentas bancarias...')
    const bankAccounts = await Promise.all([
      prisma.bankAccount.create({
        data: {
          name: 'Cuenta Corriente Banco Nación',
          bank: 'Banco Nación',
          accountType: 'CHECKING',
          accountNumber: '1234567890',
          balance: 250000,
          currency: 'ARS',
          userId: demoUser.id
        }
      }),
      prisma.bankAccount.create({
        data: {
          name: 'Caja de Ahorro USD',
          bank: 'Banco Galicia',
          accountType: 'SAVINGS',
          accountNumber: '0987654321',
          balance: 5000,
          currency: 'USD',
          userId: demoUser.id
        }
      }),
    ])
    console.log(`✅ ${bankAccounts.length} cuentas bancarias creadas\n`)

    // 5. Crear tarjetas de crédito
    console.log('💳 Creando tarjetas de crédito...')
    const creditCards = await Promise.all([
      prisma.creditCard.create({
        data: {
          name: 'Visa Gold',
          lastFourDigits: '4532',
          bank: 'Banco Santander',
          creditLimit: 500000,
          closingDay: 15,
          dueDay: 10,
          userId: demoUser.id
        }
      }),
      prisma.creditCard.create({
        data: {
          name: 'Mastercard Black',
          lastFourDigits: '8765',
          bank: 'Banco BBVA',
          creditLimit: 800000,
          closingDay: 20,
          dueDay: 15,
          userId: demoUser.id
        }
      }),
    ])
    console.log(`✅ ${creditCards.length} tarjetas de crédito creadas\n`)

    // 6. Crear clientes
    console.log('👥 Creando clientes...')
    const clients = await Promise.all([
      prisma.client.create({
        data: {
          company: 'Tech Solutions SA',
          email: 'contacto@techsolutions.com',
          phone: '+54 11 4567-8900',
          userId: demoUser.id
        }
      }),
      prisma.client.create({
        data: {
          company: 'Marketing Digital SRL',
          email: 'info@marketingdigital.com',
          phone: '+54 11 5678-9012',
          userId: demoUser.id
        }
      }),
      prisma.client.create({
        data: {
          company: 'Consultoría Empresarial',
          email: 'admin@consultoria.com',
          phone: '+54 11 6789-0123',
          userId: demoUser.id
        }
      }),
    ])
    console.log(`✅ ${clients.length} clientes creados\n`)

    // 7. Generar transacciones desde enero 2020
    console.log('💸 Generando transacciones desde enero 2020...')
    console.log('⏳ Esto puede tomar unos minutos...\n')

    const endDate = new Date()
    let transactionCount = 0

    // Obtener cotizaciones históricas
    const exchangeRates = await prisma.exchangeRate.findMany({
      orderBy: { date: 'asc' }
    })

    // Función para obtener cotización por fecha
    const getExchangeRate = (date: Date): number => {
      const dateStr = date.toISOString().split('T')[0]
      const rate = exchangeRates.find(r => r.date.toISOString().split('T')[0] === dateStr)
      return rate ? Number(rate.rate) : 1000 // Fallback a 1000
    }

    // Generar transacciones mes por mes
    for (let year = 2020; year <= endDate.getFullYear(); year++) {
      const maxMonth = year === endDate.getFullYear() ? endDate.getMonth() : 11
      
      for (let month = (year === 2020 ? 0 : 0); month <= maxMonth; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        
        // Salario mensual (día 1)
        const salaryDate = new Date(year, month, 1, 10, 0, 0)
        const salaryRate = getExchangeRate(salaryDate)
        const salaryArs = 150000 + (year - 2020) * 30000 + Math.random() * 20000
        
        await prisma.transaction.create({
          data: {
            type: 'INCOME',
            categoryId: categories[0].id,
            description: 'Salario mensual',
            amountArs: salaryArs,
            amountUsd: salaryArs / salaryRate,
            exchangeRate: salaryRate,
            paymentMethod: 'BANK_ACCOUNT',
            bankAccountId: bankAccounts[0].id,
            date: salaryDate,
            month: month + 1,
            year: year,
            userId: demoUser.id
          }
        })
        transactionCount++

        // Freelance (2-3 veces por mes)
        const freelanceCount = Math.floor(Math.random() * 2) + 2
        for (let i = 0; i < freelanceCount; i++) {
          const day = Math.floor(Math.random() * daysInMonth) + 1
          const freelanceDate = new Date(year, month, day, 14, 0, 0)
          const freelanceRate = getExchangeRate(freelanceDate)
          const freelanceArs = 50000 + Math.random() * 100000
          
          await prisma.transaction.create({
            data: {
              type: 'INCOME',
              categoryId: categories[1].id,
              clientId: clients[Math.floor(Math.random() * clients.length)].id,
              description: `Proyecto freelance ${i + 1}`,
              amountArs: freelanceArs,
              amountUsd: freelanceArs / freelanceRate,
              exchangeRate: freelanceRate,
              paymentMethod: 'BANK_ACCOUNT',
              bankAccountId: bankAccounts[0].id,
              date: freelanceDate,
              month: month + 1,
              year: year,
              userId: demoUser.id
            }
          })
          transactionCount++
        }

        // Alquiler (día 10)
        if (10 <= daysInMonth) {
          const rentDate = new Date(year, month, 10, 9, 0, 0)
          const rentRate = getExchangeRate(rentDate)
          const rentArs = 80000 + (year - 2020) * 15000
          
          await prisma.transaction.create({
            data: {
              type: 'EXPENSE',
              categoryId: categories[3].id,
              description: 'Alquiler mensual',
              amountArs: rentArs,
              amountUsd: rentArs / rentRate,
              exchangeRate: rentRate,
              paymentMethod: 'BANK_ACCOUNT',
              bankAccountId: bankAccounts[0].id,
              date: rentDate,
              month: month + 1,
              year: year,
              userId: demoUser.id
            }
          })
          transactionCount++
        }

        // Servicios (varios días)
        const services = [
          { name: 'Luz', amount: 5000 + Math.random() * 3000 },
          { name: 'Gas', amount: 3000 + Math.random() * 2000 },
          { name: 'Internet', amount: 8000 + Math.random() * 2000 },
          { name: 'Agua', amount: 2000 + Math.random() * 1000 },
        ]

        for (const service of services) {
          const day = Math.floor(Math.random() * daysInMonth) + 1
          const serviceDate = new Date(year, month, day, 11, 0, 0)
          const serviceRate = getExchangeRate(serviceDate)
          
          await prisma.transaction.create({
            data: {
              type: 'EXPENSE',
              categoryId: categories[4].id,
              description: service.name,
              amountArs: service.amount,
              amountUsd: service.amount / serviceRate,
              exchangeRate: serviceRate,
              paymentMethod: 'BANK_ACCOUNT',
              bankAccountId: bankAccounts[0].id,
              date: serviceDate,
              month: month + 1,
              year: year,
              userId: demoUser.id
            }
          })
          transactionCount++
        }

        // Supermercado (8-12 veces por mes)
        const supermarketCount = Math.floor(Math.random() * 5) + 8
        for (let i = 0; i < supermarketCount; i++) {
          const day = Math.floor(Math.random() * daysInMonth) + 1
          const superDate = new Date(year, month, day, 18, 0, 0)
          const superRate = getExchangeRate(superDate)
          const superArs = 5000 + Math.random() * 15000
          
          await prisma.transaction.create({
            data: {
              type: 'EXPENSE',
              categoryId: categories[5].id,
              description: 'Compras supermercado',
              amountArs: superArs,
              amountUsd: superArs / superRate,
              exchangeRate: superRate,
              paymentMethod: 'CASH',
              date: superDate,
              month: month + 1,
              year: year,
              userId: demoUser.id
            }
          })
          transactionCount++
        }

        // Transporte (15-20 veces por mes)
        const transportCount = Math.floor(Math.random() * 6) + 15
        for (let i = 0; i < transportCount; i++) {
          const day = Math.floor(Math.random() * daysInMonth) + 1
          const transDate = new Date(year, month, day, 8, 30, 0)
          const transRate = getExchangeRate(transDate)
          const transArs = 500 + Math.random() * 2000
          
          await prisma.transaction.create({
            data: {
              type: 'EXPENSE',
              categoryId: categories[6].id,
              description: Math.random() > 0.5 ? 'Uber' : 'Nafta',
              amountArs: transArs,
              amountUsd: transArs / transRate,
              exchangeRate: transRate,
              paymentMethod: 'CASH',
              date: transDate,
              month: month + 1,
              year: year,
              userId: demoUser.id
            }
          })
          transactionCount++
        }

        // Entretenimiento (3-5 veces por mes)
        const entertainmentCount = Math.floor(Math.random() * 3) + 3
        for (let i = 0; i < entertainmentCount; i++) {
          const day = Math.floor(Math.random() * daysInMonth) + 1
          const entDate = new Date(year, month, day, 20, 0, 0)
          const entRate = getExchangeRate(entDate)
          const entArs = 3000 + Math.random() * 10000
          
          await prisma.transaction.create({
            data: {
              type: 'EXPENSE',
              categoryId: categories[7].id,
              description: ['Cine', 'Restaurant', 'Bar', 'Streaming'][Math.floor(Math.random() * 4)],
              amountArs: entArs,
              amountUsd: entArs / entRate,
              exchangeRate: entRate,
              paymentMethod: 'MERCADOPAGO',
              date: entDate,
              month: month + 1,
              year: year,
              userId: demoUser.id
            }
          })
          transactionCount++
        }

        console.log(`  ✓ ${year}-${String(month + 1).padStart(2, '0')} completado`)
      }
    }

    console.log(`\n✅ ${transactionCount} transacciones generadas\n`)

    console.log('🎉 ¡Configuración completada exitosamente!\n')
    console.log('📊 Resumen:')
    console.log(`  - Usuario demo: demo@contadash.com`)
    console.log(`  - Contraseña: Momento1234`)
    console.log(`  - Categorías: ${categories.length}`)
    console.log(`  - Cuentas bancarias: ${bankAccounts.length}`)
    console.log(`  - Tarjetas de crédito: ${creditCards.length}`)
    console.log(`  - Clientes: ${clients.length}`)
    console.log(`  - Transacciones: ${transactionCount}`)
    console.log(`  - Período: Enero 2020 - ${endDate.toLocaleDateString('es-AR')}`)

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

setupDemoAccount()
  .then(() => {
    console.log('\n✅ Script finalizado correctamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script finalizado con errores:', error)
    process.exit(1)
  })
