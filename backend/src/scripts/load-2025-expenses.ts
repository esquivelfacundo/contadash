import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load 2025 expense transactions (February - December) for facundoesquivel01@gmail.com
 * This script runs once to populate all expense data for the year
 */
async function load2025Expenses() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load 2025 Expenses] Loading expense transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load 2025 Expenses] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load 2025 Expenses] Found user: ${user.id} - ${user.name}`)

    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'EXPENSE'
      } 
    })

    console.log(`[Load 2025 Expenses] Found ${categories.length} expense categories`)

    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load 2025 Expenses] No expense category found, creating default...`)
      const defaultCategory = await prisma.category.create({
        data: {
          userId: user.id,
          name: 'Gastos',
          type: 'EXPENSE',
          color: '#EF4444',
          icon: '💸',
        },
      })
      categoryId = defaultCategory.id
    }

    // All 2025 expense transactions (February - December)
    // Excluding $0 values as requested
    const transactions = [
      // FEBRERO 2025
      { description: 'Alquiler', amountArs: 275000.00, date: new Date('2025-02-15'), month: 2 },
      { description: 'Expensas', amountArs: 116498.14, date: new Date('2025-02-15'), month: 2 },
      { description: 'CSP', amountArs: 4800.00, date: new Date('2025-02-15'), month: 2 },
      { description: 'AFIP', amountArs: 11871.01, date: new Date('2025-02-15'), month: 2 },
      { description: 'BBVA', amountArs: 673863.11, date: new Date('2025-02-15'), month: 2 },
      { description: 'BNA+ Visa', amountArs: 447059.19, date: new Date('2025-02-15'), month: 2 },
      { description: 'Egresos Corrientes', amountArs: 100000.00, date: new Date('2025-02-15'), month: 2 },

      // MARZO 2025
      { description: 'Alquiler', amountArs: 275000.00, date: new Date('2025-03-15'), month: 3 },
      { description: 'Expensas', amountArs: 123704.14, date: new Date('2025-03-15'), month: 3 },
      { description: 'CSP', amountArs: 4800.00, date: new Date('2025-03-15'), month: 3 },
      { description: 'AFIP', amountArs: 11871.01, date: new Date('2025-03-15'), month: 3 },
      { description: 'BBVA Pesos', amountArs: 450097.58, date: new Date('2025-03-15'), month: 3 },
      { description: 'BBVA Dolares', amountArs: 71500.00, date: new Date('2025-03-15'), month: 3 },
      { description: 'BNA+ Visa', amountArs: 77526.25, date: new Date('2025-03-15'), month: 3 },
      { description: 'Gimnasio', amountArs: 36000.00, date: new Date('2025-03-15'), month: 3 },

      // ABRIL 2025
      { description: 'Alquiler', amountArs: 304800.00, date: new Date('2025-04-15'), month: 4 },
      { description: 'Expensas', amountArs: 127711.14, date: new Date('2025-04-15'), month: 4 },
      { description: 'AFIP', amountArs: 12000.00, date: new Date('2025-04-15'), month: 4 },
      { description: 'BBVA', amountArs: 500027.02, date: new Date('2025-04-15'), month: 4 },
      { description: 'Santander Visa', amountArs: 45832.87, date: new Date('2025-04-15'), month: 4 },
      { description: 'BNA+ Visa', amountArs: 88463.07, date: new Date('2025-04-15'), month: 4 },

      // MAYO 2025
      { description: 'Alquiler', amountArs: 304800.00, date: new Date('2025-05-15'), month: 5 },
      { description: 'Expensas', amountArs: 143858.14, date: new Date('2025-05-15'), month: 5 },
      { description: 'AFIP', amountArs: 12000.00, date: new Date('2025-05-15'), month: 5 },
      { description: 'BBVA', amountArs: 582890.08, date: new Date('2025-05-15'), month: 5 },
      { description: 'Santander Visa', amountArs: 45000.00, date: new Date('2025-05-15'), month: 5 },
      { description: 'BNA+ Visa', amountArs: 62084.96, date: new Date('2025-05-15'), month: 5 },

      // JUNIO 2025
      { description: 'Alquiler', amountArs: 304800.00, date: new Date('2025-06-15'), month: 6 },
      { description: 'Expensas', amountArs: 150000.00, date: new Date('2025-06-15'), month: 6 },
      { description: 'BBVA', amountArs: 581673.74, date: new Date('2025-06-15'), month: 6 },
      { description: 'BBVA USD', amountArs: 136947.21, date: new Date('2025-06-15'), month: 6 },
      { description: 'BNA+ Visa', amountArs: 26077.77, date: new Date('2025-06-15'), month: 6 },
      { description: 'MUD- Comision inmobiliaria', amountArs: 375000.00, date: new Date('2025-06-15'), month: 6 },
      { description: 'MUD- Sellado', amountArs: 60000.00, date: new Date('2025-06-15'), month: 6 },
      { description: 'MUD- Certif. Firmas', amountArs: 50000.00, date: new Date('2025-06-15'), month: 6 },
      { description: 'MUD- 1/2 alquiler', amountArs: 183000.00, date: new Date('2025-06-15'), month: 6 },
      { description: 'MUD- Fletes', amountArs: 100000.00, date: new Date('2025-06-15'), month: 6 },
      { description: 'MUD- Limpieza', amountArs: 11000.00, date: new Date('2025-06-15'), month: 6 },
      { description: 'MUD- Pintura', amountArs: 168678.95, date: new Date('2025-06-15'), month: 6 },
      { description: 'MUD- Aires acondicionados', amountArs: 198000.00, date: new Date('2025-06-15'), month: 6 },
      { description: 'MUD- Sofá', amountArs: 880000.00, date: new Date('2025-06-15'), month: 6 },

      // JULIO 2025
      { description: 'Alquiler', amountArs: 500000.00, date: new Date('2025-07-15'), month: 7 },
      { description: 'BBVA', amountArs: 599308.61, date: new Date('2025-07-15'), month: 7 },
      { description: 'BBVA USD', amountArs: 180104.85, date: new Date('2025-07-15'), month: 7 },
      { description: 'BNA+ Visa', amountArs: 26077.77, date: new Date('2025-07-15'), month: 7 },
      { description: 'Egresos Corrientes', amountArs: 63000.00, date: new Date('2025-07-15'), month: 7 },
      { description: 'Renovación contrato (2/2)', amountArs: 375000.00, date: new Date('2025-07-15'), month: 7 },
      { description: 'Devolución', amountArs: 500000.00, date: new Date('2025-07-15'), month: 7 },
      { description: 'AMEX', amountArs: 76204.33, date: new Date('2025-07-15'), month: 7 },

      // AGOSTO 2025
      { description: 'Alquiler', amountArs: 500000.00, date: new Date('2025-08-15'), month: 8 },
      { description: 'Expensas', amountArs: 82230.00, date: new Date('2025-08-15'), month: 8 },
      { description: 'DPEC', amountArs: 144920.89, date: new Date('2025-08-15'), month: 8 },
      { description: 'AMEX', amountArs: 926038.41, date: new Date('2025-08-15'), month: 8 },
      { description: 'BBVA', amountArs: 756650.25, date: new Date('2025-08-15'), month: 8 },
      { description: 'BNA+ Visa', amountArs: 26077.77, date: new Date('2025-08-15'), month: 8 },

      // SEPTIEMBRE 2025
      { description: 'Alquiler', amountArs: 500000.00, date: new Date('2025-09-15'), month: 9 },
      { description: 'Expensas', amountArs: 78700.00, date: new Date('2025-09-15'), month: 9 },
      { description: 'AMEX', amountArs: 681474.53, date: new Date('2025-09-15'), month: 9 },
      { description: 'BBVA', amountArs: 615605.36, date: new Date('2025-09-15'), month: 9 },
      { description: 'BNA+ Visa', amountArs: 26077.77, date: new Date('2025-09-15'), month: 9 },

      // OCTUBRE 2025
      { description: 'Alquiler', amountArs: 540000.00, date: new Date('2025-10-15'), month: 10 },
      { description: 'Expensas', amountArs: 98710.00, date: new Date('2025-10-15'), month: 10 },
      { description: 'DEPEC', amountArs: 161021.04, date: new Date('2025-10-15'), month: 10 },
      { description: 'AMEX', amountArs: 915815.15, date: new Date('2025-10-15'), month: 10 },
      { description: 'BBVA', amountArs: 705394.97, date: new Date('2025-10-15'), month: 10 },
      { description: 'BNA+ Visa', amountArs: 26077.77, date: new Date('2025-10-15'), month: 10 },
      { description: 'Egresos Corrientes', amountArs: 442513.16, date: new Date('2025-10-15'), month: 10 },

      // NOVIEMBRE 2025
      { description: 'Alquiler', amountArs: 540000.00, date: new Date('2025-11-15'), month: 11 },
      { description: 'Expensas', amountArs: 69360.00, date: new Date('2025-11-15'), month: 11 },
      { description: 'AMEX', amountArs: 720350.05, date: new Date('2025-11-15'), month: 11 },
      { description: 'BBVA', amountArs: 650061.68, date: new Date('2025-11-15'), month: 11 },
      { description: 'BNA+ Visa', amountArs: 26077.77, date: new Date('2025-11-15'), month: 11 },
      { description: 'Egresos Corrientes', amountArs: 120000.00, date: new Date('2025-11-15'), month: 11 },

      // DICIEMBRE 2025
      { description: 'Alquiler', amountArs: 540000.00, date: new Date('2025-12-15'), month: 12 },
      { description: 'Expensas', amountArs: 72530.00, date: new Date('2025-12-15'), month: 12 },
      { description: 'DEPEC', amountArs: 198222.48, date: new Date('2025-12-15'), month: 12 },
      { description: 'AMEX', amountArs: 399885.09, date: new Date('2025-12-15'), month: 12 },
      { description: 'BBVA', amountArs: 545185.20, date: new Date('2025-12-15'), month: 12 },
      { description: 'BNA+ Visa', amountArs: 83191.93, date: new Date('2025-12-15'), month: 12 },
    ]

    let created = 0
    let skipped = 0
    const monthStats: Record<number, number> = {}

    for (const tx of transactions) {
      try {
        await prisma.transaction.create({
          data: {
            user: { connect: { id: user.id } },
            description: tx.description,
            amountArs: tx.amountArs,
            amountUsd: 0,
            type: 'EXPENSE',
            category: { connect: { id: categoryId } },
            date: tx.date,
            month: tx.month,
            year: 2025,
            exchangeRate: 1000 + (tx.month * 50), // Approximate progressive rate
          },
        })

        monthStats[tx.month] = (monthStats[tx.month] || 0) + 1
        created++
      } catch (error) {
        console.error(`[Load 2025 Expenses] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load 2025 Expenses] ========================================`)
    console.log(`[Load 2025 Expenses] SUMMARY`)
    console.log(`[Load 2025 Expenses] ========================================`)
    console.log(`[Load 2025 Expenses] Total transactions created: ${created}`)
    console.log(`[Load 2025 Expenses] Total transactions skipped: ${skipped}`)
    console.log(`[Load 2025 Expenses] Period: February - December 2025`)
    console.log(`\n[Load 2025 Expenses] BY MONTH:`)
    Object.keys(monthStats).sort((a, b) => Number(a) - Number(b)).forEach(month => {
      const monthName = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][Number(month)]
      console.log(`[Load 2025 Expenses]   ${monthName}: ${monthStats[Number(month)]} transactions`)
    })
    console.log(`[Load 2025 Expenses] ========================================`)

  } catch (error) {
    console.error('[Load 2025 Expenses] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

load2025Expenses()
  .then(() => {
    console.log('[Load 2025 Expenses] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load 2025 Expenses] Failed:', error)
    process.exit(1)
  })
