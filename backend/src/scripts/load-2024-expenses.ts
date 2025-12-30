import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load 2024 expense transactions (January - December) for facundoesquivel01@gmail.com
 * This script runs once to populate all expense data for the year
 */
async function load2024Expenses() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load 2024 Expenses] Loading expense transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load 2024 Expenses] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load 2024 Expenses] Found user: ${user.id} - ${user.name}`)

    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'EXPENSE'
      } 
    })

    console.log(`[Load 2024 Expenses] Found ${categories.length} expense categories`)

    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load 2024 Expenses] No expense category found, creating default...`)
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

    // All 2024 expense transactions (January - December)
    // Excluding $0 values as requested
    const transactions = [
      // ENERO 2024
      { description: 'Alquiler', amountArs: 102000.00, date: new Date('2024-01-15'), month: 1 },
      { description: 'Expensas', amountArs: 27276.14, date: new Date('2024-01-15'), month: 1 },
      { description: 'BBVA', amountArs: 66979.81, date: new Date('2024-01-15'), month: 1 },
      { description: 'HSBC', amountArs: 228239.46, date: new Date('2024-01-15'), month: 1 },
      { description: 'BNA VISA', amountArs: 90372.42, date: new Date('2024-01-15'), month: 1 },
      { description: 'BNA Mastercard', amountArs: 49156.67, date: new Date('2024-01-15'), month: 1 },

      // FEBRERO 2024
      { description: 'Alquiler', amountArs: 102000.00, date: new Date('2024-02-15'), month: 2 },
      { description: 'Expensas', amountArs: 28910.14, date: new Date('2024-02-15'), month: 2 },
      { description: 'BBVA', amountArs: 184935.76, date: new Date('2024-02-15'), month: 2 },
      { description: 'HSBC', amountArs: 145000.00, date: new Date('2024-02-15'), month: 2 },
      { description: 'BNA VISA', amountArs: 51157.76, date: new Date('2024-02-15'), month: 2 },
      { description: 'BNA Mastercard', amountArs: 49156.67, date: new Date('2024-02-15'), month: 2 },

      // MARZO 2024
      { description: 'Alquiler', amountArs: 150000.00, date: new Date('2024-03-15'), month: 3 },
      { description: 'Expensas', amountArs: 35729.14, date: new Date('2024-03-15'), month: 3 },
      { description: 'BBVA', amountArs: 280892.58, date: new Date('2024-03-15'), month: 3 },
      { description: 'HSBC', amountArs: 334987.87, date: new Date('2024-03-15'), month: 3 },
      { description: 'BNA VISA', amountArs: 116270.87, date: new Date('2024-03-15'), month: 3 },
      { description: 'BNA MASTERCARD', amountArs: 49156.67, date: new Date('2024-03-15'), month: 3 },
      { description: 'AFIP', amountArs: 8830.19, date: new Date('2024-03-15'), month: 3 },
      { description: 'CSP', amountArs: 14400.00, date: new Date('2024-03-15'), month: 3 },

      // ABRIL 2024
      { description: 'Alquiler', amountArs: 150000.00, date: new Date('2024-04-15'), month: 4 },
      { description: 'Expensas', amountArs: 40000.00, date: new Date('2024-04-15'), month: 4 },
      { description: 'BBVA', amountArs: 258699.66, date: new Date('2024-04-15'), month: 4 },
      { description: 'HSBC', amountArs: 292165.61, date: new Date('2024-04-15'), month: 4 },
      { description: 'BNA VISA', amountArs: 51157.76, date: new Date('2024-04-15'), month: 4 },
      { description: 'BNA MASTERCARD', amountArs: 49156.67, date: new Date('2024-04-15'), month: 4 },
      { description: 'Mercado Pago', amountArs: 8589.15, date: new Date('2024-04-15'), month: 4 },
      { description: 'AFIP', amountArs: 8830.19, date: new Date('2024-04-15'), month: 4 },
      { description: 'CSP', amountArs: 4800.00, date: new Date('2024-04-15'), month: 4 },

      // MAYO 2024
      { description: 'Alquiler', amountArs: 150000.00, date: new Date('2024-05-15'), month: 5 },
      { description: 'Expensas', amountArs: 48949.14, date: new Date('2024-05-15'), month: 5 },
      { description: 'BBVA', amountArs: 526748.42, date: new Date('2024-05-15'), month: 5 },
      { description: 'HSBC', amountArs: 176766.69, date: new Date('2024-05-15'), month: 5 },
      { description: 'BNA VISA', amountArs: 67938.87, date: new Date('2024-05-15'), month: 5 },
      { description: 'BNA MASTERCARD', amountArs: 49156.67, date: new Date('2024-05-15'), month: 5 },
      { description: 'CSP', amountArs: 4800.00, date: new Date('2024-05-15'), month: 5 },

      // JUNIO 2024
      { description: 'Alquiler', amountArs: 150000.00, date: new Date('2024-06-15'), month: 6 },
      { description: 'Expensas', amountArs: 50992.14, date: new Date('2024-06-15'), month: 6 },
      { description: 'BBVA', amountArs: 488013.72, date: new Date('2024-06-15'), month: 6 },
      { description: 'HSBC', amountArs: 12433.33, date: new Date('2024-06-15'), month: 6 },
      { description: 'BNA VISA', amountArs: 68974.26, date: new Date('2024-06-15'), month: 6 },
      { description: 'BNA MASTERCARD', amountArs: 49156.67, date: new Date('2024-06-15'), month: 6 },
      { description: 'Gimnasio', amountArs: 23000.00, date: new Date('2024-06-15'), month: 6 },
      { description: 'AFIP', amountArs: 3452.09, date: new Date('2024-06-15'), month: 6 },
      { description: 'CSP', amountArs: 4800.00, date: new Date('2024-06-15'), month: 6 },
      { description: 'Gastos Renovación Contrato (Comisión/Sellado/Firmas/Mes)', amountArs: 584000.00, date: new Date('2024-06-15'), month: 6 },

      // JULIO 2024
      { description: 'Expensas', amountArs: 76024.14, date: new Date('2024-07-15'), month: 7 },
      { description: 'BBVA', amountArs: 196385.50, date: new Date('2024-07-15'), month: 7 },
      { description: 'BNA VISA', amountArs: 68974.26, date: new Date('2024-07-15'), month: 7 },
      { description: 'BNA MASTERCARD', amountArs: 49156.67, date: new Date('2024-07-15'), month: 7 },
      { description: 'Gimnasio', amountArs: 23000.00, date: new Date('2024-07-15'), month: 7 },
      { description: 'AFIP', amountArs: 3452.09, date: new Date('2024-07-15'), month: 7 },

      // AGOSTO 2024
      { description: 'Alquiler', amountArs: 220000.00, date: new Date('2024-08-15'), month: 8 },
      { description: 'Expensas', amountArs: 80000.00, date: new Date('2024-08-15'), month: 8 },
      { description: 'BBVA', amountArs: 1525471.63, date: new Date('2024-08-15'), month: 8 },
      { description: 'BNA VISA', amountArs: 210368.51, date: new Date('2024-08-15'), month: 8 },
      { description: 'BNA MASTERCARD', amountArs: 49156.67, date: new Date('2024-08-15'), month: 8 },
      { description: 'Naranja X', amountArs: 21659.39, date: new Date('2024-08-15'), month: 8 },
      { description: 'AFIP', amountArs: 3500.00, date: new Date('2024-08-15'), month: 8 },

      // SEPTIEMBRE 2024
      { description: 'Alquiler', amountArs: 200000.00, date: new Date('2024-09-15'), month: 9 },
      { description: 'Expensas', amountArs: 99591.14, date: new Date('2024-09-15'), month: 9 },
      { description: 'BBVA', amountArs: 507810.08, date: new Date('2024-09-15'), month: 9 },
      { description: 'BNA VISA', amountArs: 43726.55, date: new Date('2024-09-15'), month: 9 },
      { description: 'BNA MASTERCARD', amountArs: 120625.53, date: new Date('2024-09-15'), month: 9 },
      { description: 'Mercado Pago', amountArs: 99869.94, date: new Date('2024-09-15'), month: 9 },
      { description: 'Naranja X', amountArs: 21656.29, date: new Date('2024-09-15'), month: 9 },
      { description: 'Gimnasio', amountArs: 25000.00, date: new Date('2024-09-15'), month: 9 },
      { description: 'AFIP', amountArs: 4000.00, date: new Date('2024-09-15'), month: 9 },

      // OCTUBRE 2024
      { description: 'Alquiler', amountArs: 246400.00, date: new Date('2024-10-15'), month: 10 },
      { description: 'Expensas', amountArs: 80027.14, date: new Date('2024-10-15'), month: 10 },
      { description: 'BBVA', amountArs: 327547.00, date: new Date('2024-10-15'), month: 10 },
      { description: 'BNA VISA', amountArs: 215200.23, date: new Date('2024-10-15'), month: 10 },
      { description: 'BNA MASTERCARD', amountArs: 176657.55, date: new Date('2024-10-15'), month: 10 },
      { description: 'Mercado Pago', amountArs: 90733.66, date: new Date('2024-10-15'), month: 10 },
      { description: 'Naranja X', amountArs: 48032.39, date: new Date('2024-10-15'), month: 10 },
      { description: 'AFIP', amountArs: 4500.00, date: new Date('2024-10-15'), month: 10 },
      { description: 'CSP', amountArs: 4800.00, date: new Date('2024-10-15'), month: 10 },

      // NOVIEMBRE 2024
      { description: 'Alquiler', amountArs: 246400.00, date: new Date('2024-11-15'), month: 11 },
      { description: 'Expensas', amountArs: 89536.14, date: new Date('2024-11-15'), month: 11 },
      { description: 'BBVA', amountArs: 726596.75, date: new Date('2024-11-15'), month: 11 },
      { description: 'BNA VISA', amountArs: 122508.25, date: new Date('2024-11-15'), month: 11 },
      { description: 'Mercado Pago', amountArs: 14862.80, date: new Date('2024-11-15'), month: 11 },
      { description: 'CSP', amountArs: 4800.00, date: new Date('2024-11-15'), month: 11 },

      // DICIEMBRE 2024
      { description: 'Alquiler', amountArs: 246400.00, date: new Date('2024-12-15'), month: 12 },
      { description: 'Expensas', amountArs: 112026.14, date: new Date('2024-12-15'), month: 12 },
      { description: 'BBVA (ARS + US$)', amountArs: 438576.54, date: new Date('2024-12-15'), month: 12 },
      { description: 'BNA VISA', amountArs: 79167.84, date: new Date('2024-12-15'), month: 12 },
      { description: 'CSP', amountArs: 4800.00, date: new Date('2024-12-15'), month: 12 },
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
            year: 2024,
            exchangeRate: 800 + (tx.month * 20), // Approximate progressive rate for 2024
          },
        })

        monthStats[tx.month] = (monthStats[tx.month] || 0) + 1
        created++
      } catch (error) {
        console.error(`[Load 2024 Expenses] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load 2024 Expenses] ========================================`)
    console.log(`[Load 2024 Expenses] SUMMARY`)
    console.log(`[Load 2024 Expenses] ========================================`)
    console.log(`[Load 2024 Expenses] Total transactions created: ${created}`)
    console.log(`[Load 2024 Expenses] Total transactions skipped: ${skipped}`)
    console.log(`[Load 2024 Expenses] Period: January - December 2024`)
    console.log(`\n[Load 2024 Expenses] BY MONTH:`)
    Object.keys(monthStats).sort((a, b) => Number(a) - Number(b)).forEach(month => {
      const monthName = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][Number(month)]
      console.log(`[Load 2024 Expenses]   ${monthName}: ${monthStats[Number(month)]} transactions`)
    })
    console.log(`[Load 2024 Expenses] ========================================`)

  } catch (error) {
    console.error('[Load 2024 Expenses] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

load2024Expenses()
  .then(() => {
    console.log('[Load 2024 Expenses] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load 2024 Expenses] Failed:', error)
    process.exit(1)
  })
