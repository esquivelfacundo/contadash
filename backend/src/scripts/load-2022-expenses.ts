import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load 2022 expense transactions (April - December) for facundoesquivel01@gmail.com
 * This script runs once to populate all expense data for the year
 */
async function load2022Expenses() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load 2022 Expenses] Loading expense transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load 2022 Expenses] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load 2022 Expenses] Found user: ${user.id} - ${user.name}`)

    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'EXPENSE'
      } 
    })

    console.log(`[Load 2022 Expenses] Found ${categories.length} expense categories`)

    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load 2022 Expenses] No expense category found, creating default...`)
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

    // All 2022 expense transactions (April - December)
    const transactions = [
      // ABRIL 2022
      { description: 'BBVA', amountArs: 23394.52, date: new Date('2022-04-15'), month: 4 },
      { description: 'Naranja', amountArs: 28606.72, date: new Date('2022-04-15'), month: 4 },
      { description: 'Swiss Medical', amountArs: 10055.06, date: new Date('2022-04-15'), month: 4 },
      { description: 'cPanel', amountArs: 7013.73, date: new Date('2022-04-15'), month: 4 },
      { description: 'AFIP', amountArs: 164.00, date: new Date('2022-04-15'), month: 4 },
      { description: 'Egresos corrientes', amountArs: 203400.00, date: new Date('2022-04-15'), month: 4 },

      // MAYO 2022
      { description: 'BBVA', amountArs: 21745.31, date: new Date('2022-05-15'), month: 5 },
      { description: 'Naranja', amountArs: 10035.81, date: new Date('2022-05-15'), month: 5 },
      { description: 'Swiss Medical', amountArs: 10055.06, date: new Date('2022-05-15'), month: 5 },
      { description: 'cPanel', amountArs: 7000.00, date: new Date('2022-05-15'), month: 5 },
      { description: 'Cuota Gym', amountArs: 3500.00, date: new Date('2022-05-15'), month: 5 },

      // JUNIO 2022
      { description: 'BBVA', amountArs: 37712.23, date: new Date('2022-06-15'), month: 6 },
      { description: 'Naranja', amountArs: 51328.90, date: new Date('2022-06-15'), month: 6 },
      { description: 'Swiss Medical', amountArs: 10055.06, date: new Date('2022-06-15'), month: 6 },
      { description: 'cPanel', amountArs: 7000.00, date: new Date('2022-06-15'), month: 6 },
      { description: 'Cuota Gym', amountArs: 3500.00, date: new Date('2022-06-15'), month: 6 },

      // JULIO 2022
      { description: 'BBVA', amountArs: 91524.15, date: new Date('2022-07-15'), month: 7 },
      { description: 'Naranja', amountArs: 7600.00, date: new Date('2022-07-15'), month: 7 },
      { description: 'Swiss Medical', amountArs: 11793.48, date: new Date('2022-07-15'), month: 7 },
      { description: 'cPanel', amountArs: 7000.00, date: new Date('2022-07-15'), month: 7 },
      { description: 'Cuota Gym', amountArs: 3500.00, date: new Date('2022-07-15'), month: 7 },
      { description: 'MercadoPago', amountArs: 33263.11, date: new Date('2022-07-15'), month: 7 },

      // AGOSTO 2022
      { description: 'BBVA', amountArs: 62360.00, date: new Date('2022-08-15'), month: 8 },
      { description: 'Naranja', amountArs: 45560.00, date: new Date('2022-08-15'), month: 8 },
      { description: 'Swiss Medical', amountArs: 11793.48, date: new Date('2022-08-15'), month: 8 },
      { description: 'cPanel', amountArs: 7000.00, date: new Date('2022-08-15'), month: 8 },
      { description: 'Cuota Gym', amountArs: 4000.00, date: new Date('2022-08-15'), month: 8 },
      { description: 'Redactora JFC Tecno', amountArs: 5700.00, date: new Date('2022-08-15'), month: 8 },

      // SEPTIEMBRE 2022
      { description: 'BBVA', amountArs: 87934.45, date: new Date('2022-09-15'), month: 9 },
      { description: 'Naranja', amountArs: 13751.58, date: new Date('2022-09-15'), month: 9 },
      { description: 'Swiss Medical', amountArs: 13130.86, date: new Date('2022-09-15'), month: 9 },
      { description: 'cPanel', amountArs: 10440.00, date: new Date('2022-09-15'), month: 9 },
      { description: 'Cuota Gym', amountArs: 4000.00, date: new Date('2022-09-15'), month: 9 },
      { description: 'Redactora JFC Tecno', amountArs: 4930.00, date: new Date('2022-09-15'), month: 9 },
      { description: 'MercadoCrédito', amountArs: 4317.10, date: new Date('2022-09-15'), month: 9 },

      // OCTUBRE 2022
      { description: 'BBVA - Crédito', amountArs: 114934.86, date: new Date('2022-10-15'), month: 10 },
      { description: 'Naranja - Crédito', amountArs: 32647.55, date: new Date('2022-10-15'), month: 10 },
      { description: 'FOX Training Center - Cuota', amountArs: 4500.00, date: new Date('2022-10-15'), month: 10 },
      { description: 'JFC Tecno - Redactora', amountArs: 4930.00, date: new Date('2022-10-15'), month: 10 },

      // NOVIEMBRE 2022
      { description: 'BBVA / Naranja', amountArs: 154597.41, date: new Date('2022-11-15'), month: 11 },
      { description: 'cPanel / FOX Training / Redactora', amountArs: 19976.00, date: new Date('2022-11-15'), month: 11 },
      { description: 'TV Samsung 1/12 / Heladera 1/6', amountArs: 54863.83, date: new Date('2022-11-15'), month: 11 },
      { description: 'Comida / Viaje BA / Sherwood', amountArs: 115180.00, date: new Date('2022-11-15'), month: 11 },
      { description: 'Servicios (Fibertel/Personal)', amountArs: 3040.00, date: new Date('2022-11-15'), month: 11 },

      // DICIEMBRE 2022
      { description: 'BBVA', amountArs: 136896.91, date: new Date('2022-12-15'), month: 12 },
      { description: 'Redactora JFC Tecno', amountArs: 5440.00, date: new Date('2022-12-15'), month: 12 },
      { description: 'Naranja', amountArs: 13195.28, date: new Date('2022-12-15'), month: 12 },
      { description: 'cPanel', amountArs: 7000.00, date: new Date('2022-12-15'), month: 12 },
      { description: 'Cuota Gym', amountArs: 4500.00, date: new Date('2022-12-15'), month: 12 },
      { description: 'TV Samsung 1/12 (VISA CTES)', amountArs: 17397.33, date: new Date('2022-12-15'), month: 12 },
      { description: 'Heladera Samsung 1/6 (VISA GAL)', amountArs: 37466.50, date: new Date('2022-12-15'), month: 12 },
      { description: 'Fibertel - Internet 300MB', amountArs: 1390.00, date: new Date('2022-12-15'), month: 12 },
      { description: 'Personal - Linea movil', amountArs: 1650.00, date: new Date('2022-12-15'), month: 12 },
      { description: 'MercadoPrestamos', amountArs: 5959.80, date: new Date('2022-12-15'), month: 12 },
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
            year: 2022,
            exchangeRate: 120 + (tx.month * 5), // Approximate progressive rate for 2022
          },
        })

        monthStats[tx.month] = (monthStats[tx.month] || 0) + 1
        created++
      } catch (error) {
        console.error(`[Load 2022 Expenses] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load 2022 Expenses] ========================================`)
    console.log(`[Load 2022 Expenses] SUMMARY`)
    console.log(`[Load 2022 Expenses] ========================================`)
    console.log(`[Load 2022 Expenses] Total transactions created: ${created}`)
    console.log(`[Load 2022 Expenses] Total transactions skipped: ${skipped}`)
    console.log(`[Load 2022 Expenses] Period: April - December 2022`)
    console.log(`\n[Load 2022 Expenses] BY MONTH:`)
    Object.keys(monthStats).sort((a, b) => Number(a) - Number(b)).forEach(month => {
      const monthName = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][Number(month)]
      console.log(`[Load 2022 Expenses]   ${monthName}: ${monthStats[Number(month)]} transactions`)
    })
    console.log(`[Load 2022 Expenses] ========================================`)

  } catch (error) {
    console.error('[Load 2022 Expenses] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

load2022Expenses()
  .then(() => {
    console.log('[Load 2022 Expenses] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load 2022 Expenses] Failed:', error)
    process.exit(1)
  })
