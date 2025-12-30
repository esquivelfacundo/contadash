import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load 2023 expense transactions (January - December) for facundoesquivel01@gmail.com
 * This script runs once to populate all expense data for the year
 */
async function load2023Expenses() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load 2023 Expenses] Loading expense transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load 2023 Expenses] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load 2023 Expenses] Found user: ${user.id} - ${user.name}`)

    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'EXPENSE'
      } 
    })

    console.log(`[Load 2023 Expenses] Found ${categories.length} expense categories`)

    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load 2023 Expenses] No expense category found, creating default...`)
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

    // All 2023 expense transactions (January - December)
    const transactions = [
      // ENERO 2023
      { description: 'BBVA', amountArs: 103576.11, date: new Date('2023-01-15'), month: 1 },
      { description: 'Naranja', amountArs: 13195.29, date: new Date('2023-01-15'), month: 1 },
      { description: 'cPanel', amountArs: 7000.00, date: new Date('2023-01-15'), month: 1 },
      { description: 'Cuota Gym', amountArs: 4500.00, date: new Date('2023-01-15'), month: 1 },
      { description: 'TV Samsung 1/12 (VISA CTES)', amountArs: 17397.33, date: new Date('2023-01-15'), month: 1 },
      { description: 'Heladera Samsung 1/6 (VISA GA)', amountArs: 37466.50, date: new Date('2023-01-15'), month: 1 },
      { description: 'Fibertel - Internet 300MB', amountArs: 1390.00, date: new Date('2023-01-15'), month: 1 },
      { description: 'Personal - Linea movil', amountArs: 1650.00, date: new Date('2023-01-15'), month: 1 },
      { description: 'MercadoPago', amountArs: 85526.30, date: new Date('2023-01-15'), month: 1 },
      { description: 'MailChimp', amountArs: 6519.88, date: new Date('2023-01-15'), month: 1 },
      { description: 'Perdida SL', amountArs: 3000.00, date: new Date('2023-01-15'), month: 1 },

      // FEBRERO 2023
      { description: 'BBVA', amountArs: 103576.11, date: new Date('2023-02-15'), month: 2 },
      { description: 'Redactora JFC Tecno', amountArs: 6018.00, date: new Date('2023-02-15'), month: 2 },
      { description: 'Naranja', amountArs: 13195.29, date: new Date('2023-02-15'), month: 2 },
      { description: 'cPanel', amountArs: 7000.00, date: new Date('2023-02-15'), month: 2 },
      { description: 'Cuota Gym', amountArs: 4500.00, date: new Date('2023-02-15'), month: 2 },
      { description: 'TV Samsung 1/12 (VISA CTES)', amountArs: 17397.33, date: new Date('2023-02-15'), month: 2 },
      { description: 'Heladera Samsung 1/6 (VISA GA)', amountArs: 37466.50, date: new Date('2023-02-15'), month: 2 },
      { description: 'Fibertel - Internet 300MB', amountArs: 1390.00, date: new Date('2023-02-15'), month: 2 },
      { description: 'Personal - Línea móvil', amountArs: 1650.00, date: new Date('2023-02-15'), month: 2 },
      { description: 'MercadoPago', amountArs: 33848.68, date: new Date('2023-02-15'), month: 2 },

      // MARZO 2023
      { description: 'BBVA', amountArs: 40000.00, date: new Date('2023-03-15'), month: 3 },
      { description: 'Naranja', amountArs: 18626.04, date: new Date('2023-03-15'), month: 3 },
      { description: 'MercadoPago', amountArs: 78106.73, date: new Date('2023-03-15'), month: 3 },
      { description: 'Heladera Samsung 5/6 (VISA GA)', amountArs: 37466.50, date: new Date('2023-03-15'), month: 3 },
      { description: 'Fibertel - Internet 300MB', amountArs: 1390.00, date: new Date('2023-03-15'), month: 3 },
      { description: 'Personal - Línea móvil', amountArs: 1650.00, date: new Date('2023-03-15'), month: 3 },

      // ABRIL 2023
      { description: 'BBVA', amountArs: 38944.89, date: new Date('2023-04-15'), month: 4 },
      { description: 'Heladera (6/6)', amountArs: 37446.50, date: new Date('2023-04-15'), month: 4 },
      { description: 'Naranja', amountArs: 51181.50, date: new Date('2023-04-15'), month: 4 },
      { description: 'Personal', amountArs: 3040.00, date: new Date('2023-04-15'), month: 4 },
      { description: 'HSBC', amountArs: 120603.34, date: new Date('2023-04-15'), month: 4 },

      // MAYO 2023
      { description: 'BBVA', amountArs: 10306.41, date: new Date('2023-05-15'), month: 5 },
      { description: 'Naranja', amountArs: 4064.84, date: new Date('2023-05-15'), month: 5 },
      { description: 'Personal', amountArs: 3040.00, date: new Date('2023-05-15'), month: 5 },

      // JUNIO 2023
      { description: 'BBVA', amountArs: 43353.85, date: new Date('2023-06-15'), month: 6 },
      { description: 'HSBC', amountArs: 129605.25, date: new Date('2023-06-15'), month: 6 },
      { description: 'Naranja', amountArs: 5668.09, date: new Date('2023-06-15'), month: 6 },
      { description: 'MercadoPago', amountArs: 25229.34, date: new Date('2023-06-15'), month: 6 },
      { description: 'MercadoPago - Credito mama', amountArs: 118100.00, date: new Date('2023-06-15'), month: 6 },

      // JULIO 2023
      { description: 'BBVA', amountArs: 57952.64, date: new Date('2023-07-15'), month: 7 },
      { description: 'HSBC', amountArs: 182000.00, date: new Date('2023-07-15'), month: 7 },
      { description: 'Fibertel', amountArs: 4000.00, date: new Date('2023-07-15'), month: 7 },
      { description: 'Gym', amountArs: 7000.00, date: new Date('2023-07-15'), month: 7 },
      { description: 'Expensas', amountArs: 15000.00, date: new Date('2023-07-15'), month: 7 },

      // AGOSTO 2023
      { description: 'BBVA', amountArs: 101076.61, date: new Date('2023-08-15'), month: 8 },
      { description: 'HSBC', amountArs: 140000.00, date: new Date('2023-08-15'), month: 8 },
      { description: 'Naranja X', amountArs: 8195.80, date: new Date('2023-08-15'), month: 8 },
      { description: 'Nacion', amountArs: 39214.70, date: new Date('2023-08-15'), month: 8 },
      { description: 'Cuota Gym', amountArs: 7000.00, date: new Date('2023-08-15'), month: 8 },
      { description: 'Alquiler', amountArs: 68000.00, date: new Date('2023-08-15'), month: 8 },
      { description: 'Expensas', amountArs: 18978.08, date: new Date('2023-08-15'), month: 8 },
      { description: 'Fibertel - Internet 300MB', amountArs: 1390.00, date: new Date('2023-08-15'), month: 8 },
      { description: 'Personal - Linea movil', amountArs: 1650.00, date: new Date('2023-08-15'), month: 8 },

      // SEPTIEMBRE 2023
      { description: 'BBVA', amountArs: 103576.11, date: new Date('2023-09-15'), month: 9 },
      { description: 'Redactora', amountArs: 6018.00, date: new Date('2023-09-15'), month: 9 },
      { description: 'Naranja', amountArs: 13195.29, date: new Date('2023-09-15'), month: 9 },
      { description: 'cPanel', amountArs: 13806.00, date: new Date('2023-09-15'), month: 9 },
      { description: 'Cuota Gym', amountArs: 4500.00, date: new Date('2023-09-15'), month: 9 },
      { description: 'TV Samsung 1/12', amountArs: 17397.33, date: new Date('2023-09-15'), month: 9 },
      { description: 'Heladera Samsung 1/6', amountArs: 37466.50, date: new Date('2023-09-15'), month: 9 },
      { description: 'Servicios (Fibertel/Personal)', amountArs: 3040.00, date: new Date('2023-09-15'), month: 9 },
      { description: 'MercadoPago', amountArs: 33848.68, date: new Date('2023-09-15'), month: 9 },

      // OCTUBRE 2023
      { description: 'BBVA', amountArs: 103576.11, date: new Date('2023-10-15'), month: 10 },
      { description: 'Redactora', amountArs: 6018.00, date: new Date('2023-10-15'), month: 10 },
      { description: 'Naranja', amountArs: 13195.29, date: new Date('2023-10-15'), month: 10 },
      { description: 'cPanel', amountArs: 13806.00, date: new Date('2023-10-15'), month: 10 },
      { description: 'Cuota Gym', amountArs: 4500.00, date: new Date('2023-10-15'), month: 10 },
      { description: 'TV Samsung 1/12', amountArs: 17397.33, date: new Date('2023-10-15'), month: 10 },
      { description: 'Heladera Samsung 1/6', amountArs: 37466.50, date: new Date('2023-10-15'), month: 10 },
      { description: 'Servicios', amountArs: 3040.00, date: new Date('2023-10-15'), month: 10 },
      { description: 'MercadoPago', amountArs: 33848.68, date: new Date('2023-10-15'), month: 10 },

      // NOVIEMBRE 2023
      { description: 'BBVA', amountArs: 103576.11, date: new Date('2023-11-15'), month: 11 },
      { description: 'Redactora', amountArs: 6018.00, date: new Date('2023-11-15'), month: 11 },
      { description: 'Naranja', amountArs: 13195.29, date: new Date('2023-11-15'), month: 11 },
      { description: 'cPanel', amountArs: 13806.00, date: new Date('2023-11-15'), month: 11 },
      { description: 'Cuota Gym', amountArs: 4500.00, date: new Date('2023-11-15'), month: 11 },
      { description: 'TV Samsung 1/12', amountArs: 17397.33, date: new Date('2023-11-15'), month: 11 },
      { description: 'Heladera Samsung 1/6', amountArs: 37466.50, date: new Date('2023-11-15'), month: 11 },
      { description: 'Servicios', amountArs: 3040.00, date: new Date('2023-11-15'), month: 11 },
      { description: 'MercadoPago', amountArs: 33848.68, date: new Date('2023-11-15'), month: 11 },

      // DICIEMBRE 2023
      { description: 'BBVA', amountArs: 103576.11, date: new Date('2023-12-15'), month: 12 },
      { description: 'Redactora', amountArs: 6018.00, date: new Date('2023-12-15'), month: 12 },
      { description: 'Naranja', amountArs: 13195.29, date: new Date('2023-12-15'), month: 12 },
      { description: 'cPanel', amountArs: 13806.00, date: new Date('2023-12-15'), month: 12 },
      { description: 'Cuota Gym', amountArs: 4500.00, date: new Date('2023-12-15'), month: 12 },
      { description: 'TV Samsung 1/12', amountArs: 17397.33, date: new Date('2023-12-15'), month: 12 },
      { description: 'Heladera Samsung 1/6', amountArs: 37466.50, date: new Date('2023-12-15'), month: 12 },
      { description: 'Servicios', amountArs: 3040.00, date: new Date('2023-12-15'), month: 12 },
      { description: 'MercadoPago', amountArs: 33848.68, date: new Date('2023-12-15'), month: 12 },
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
            year: 2023,
            exchangeRate: 200 + (tx.month * 10), // Approximate progressive rate for 2023
          },
        })

        monthStats[tx.month] = (monthStats[tx.month] || 0) + 1
        created++
      } catch (error) {
        console.error(`[Load 2023 Expenses] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load 2023 Expenses] ========================================`)
    console.log(`[Load 2023 Expenses] SUMMARY`)
    console.log(`[Load 2023 Expenses] ========================================`)
    console.log(`[Load 2023 Expenses] Total transactions created: ${created}`)
    console.log(`[Load 2023 Expenses] Total transactions skipped: ${skipped}`)
    console.log(`[Load 2023 Expenses] Period: January - December 2023`)
    console.log(`\n[Load 2023 Expenses] BY MONTH:`)
    Object.keys(monthStats).sort((a, b) => Number(a) - Number(b)).forEach(month => {
      const monthName = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][Number(month)]
      console.log(`[Load 2023 Expenses]   ${monthName}: ${monthStats[Number(month)]} transactions`)
    })
    console.log(`[Load 2023 Expenses] ========================================`)

  } catch (error) {
    console.error('[Load 2023 Expenses] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

load2023Expenses()
  .then(() => {
    console.log('[Load 2023 Expenses] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load 2023 Expenses] Failed:', error)
    process.exit(1)
  })
