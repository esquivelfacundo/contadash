import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load 2024 income transactions (January - December) for facundoesquivel01@gmail.com
 * This script runs once to populate all income data for the year
 */
async function load2024Income() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load 2024 Income] Loading income transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load 2024 Income] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load 2024 Income] Found user: ${user.id} - ${user.name}`)

    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'INCOME'
      } 
    })

    console.log(`[Load 2024 Income] Found ${categories.length} income categories`)

    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load 2024 Income] No income category found, creating default...`)
      const defaultCategory = await prisma.category.create({
        data: {
          userId: user.id,
          name: 'Ingresos',
          type: 'INCOME',
          color: '#10B981',
          icon: '💰',
        },
      })
      categoryId = defaultCategory.id
    }

    // All 2024 income transactions (January - December)
    const transactions = [
      // ENERO 2024
      { description: 'JFC Tecno – Redes', amountArs: 162000.00, date: new Date('2024-01-15'), month: 1 },
      { description: 'Sanitarios Taragüi – Redes', amountArs: 40000.00, date: new Date('2024-01-15'), month: 1 },
      { description: 'Roadking Autosales – Redes', amountArs: 488000.00, date: new Date('2024-01-15'), month: 1 },
      { description: 'Palermo Market – Redes', amountArs: 152500.00, date: new Date('2024-01-15'), month: 1 },
      { description: 'Intercapital S.A. – Dev', amountArs: 390400.00, date: new Date('2024-01-15'), month: 1 },

      // FEBRERO 2024
      { description: 'JFC Tecno – Ads', amountArs: 162000.00, date: new Date('2024-02-15'), month: 2 },
      { description: 'Palermo Market – Redes', amountArs: 130625.00, date: new Date('2024-02-15'), month: 2 },
      { description: 'Centro Ocular Irigoyen – SW', amountArs: 278400.00, date: new Date('2024-02-15'), month: 2 },
      { description: 'Intercapital S.A. – Dev', amountArs: 167250.00, date: new Date('2024-02-15'), month: 2 },
      { description: 'ESEICA NEA – SW', amountArs: 582163.20, date: new Date('2024-02-15'), month: 2 },
      { description: 'ESEICA NEA – Dev', amountArs: 655000.00, date: new Date('2024-02-15'), month: 2 },
      { description: 'Paraná Lodge – Dev', amountArs: 104500.00, date: new Date('2024-02-15'), month: 2 },
      { description: 'Paraná Lodge – SW', amountArs: 125400.00, date: new Date('2024-02-15'), month: 2 },

      // MARZO 2024
      { description: 'JFC Tecno - Ads', amountArs: 180000.00, date: new Date('2024-03-15'), month: 3 },
      { description: 'Sanitarios Taragui', amountArs: 100000.00, date: new Date('2024-03-15'), month: 3 },
      { description: 'Palermo Market- Redes', amountArs: 126250.00, date: new Date('2024-03-15'), month: 3 },
      { description: 'Gebo Consultores', amountArs: 302000.00, date: new Date('2024-03-15'), month: 3 },
      { description: 'Meros- Dev', amountArs: 488840.00, date: new Date('2024-03-15'), month: 3 },

      // ABRIL 2024
      { description: 'JFC Tecno', amountArs: 410000.00, date: new Date('2024-04-15'), month: 4 },
      { description: 'Sanitarios Taragui', amountArs: 80000.00, date: new Date('2024-04-15'), month: 4 },
      { description: 'Palermo Market', amountArs: 130000.00, date: new Date('2024-04-15'), month: 4 },
      { description: 'VickelBlends - SW', amountArs: 124800.00, date: new Date('2024-04-15'), month: 4 },
      { description: 'Informatico- Dev', amountArs: 326400.00, date: new Date('2024-04-15'), month: 4 },
      { description: 'Informatico- SW', amountArs: 249600.00, date: new Date('2024-04-15'), month: 4 },
      { description: 'San Martín- Dev (1/2)', amountArs: 400000.00, date: new Date('2024-04-15'), month: 4 },
      { description: 'Paraná Lodge- Redes', amountArs: 60000.00, date: new Date('2024-04-15'), month: 4 },
      { description: 'iCenter- Dev', amountArs: 100000.00, date: new Date('2024-04-15'), month: 4 },

      // MAYO 2024
      { description: 'JFC Tecno', amountArs: 435000.00, date: new Date('2024-05-15'), month: 5 },
      { description: 'JFC Tecno - Mailchimp', amountArs: 28080.00, date: new Date('2024-05-15'), month: 5 },
      { description: 'Grupo GO- Dominio', amountArs: 25500.00, date: new Date('2024-05-15'), month: 5 },
      { description: 'Palermo Market', amountArs: 153125.00, date: new Date('2024-05-15'), month: 5 },
      { description: 'Grupo GO- SW', amountArs: 125400.00, date: new Date('2024-05-15'), month: 5 },
      { description: 'JFC Tecno- Dev', amountArs: 50000.00, date: new Date('2024-05-15'), month: 5 },
      { description: 'San Martín- Dev (2/2)', amountArs: 216800.00, date: new Date('2024-05-15'), month: 5 },
      { description: 'Gebo- Diseño web', amountArs: 200000.00, date: new Date('2024-05-15'), month: 5 },

      // JUNIO 2024
      { description: 'JFC Tecno', amountArs: 450000.00, date: new Date('2024-06-15'), month: 6 },
      { description: 'Palermo Market', amountArs: 156975.00, date: new Date('2024-06-15'), month: 6 },
      { description: 'iCenter- SW', amountArs: 124200.00, date: new Date('2024-06-15'), month: 6 },
      { description: 'Palermo Market- SW', amountArs: 126000.00, date: new Date('2024-06-15'), month: 6 },
      { description: 'Palermo Market- cPanel', amountArs: 201600.00, date: new Date('2024-06-15'), month: 6 },
      { description: 'Informatico- Dev (2/2)', amountArs: 177450.00, date: new Date('2024-06-15'), month: 6 },
      { description: 'Eseica NEA- Dev (2)', amountArs: 1225000.00, date: new Date('2024-06-15'), month: 6 },
      { description: 'GCSWD- Exc.', amountArs: 43666.35, date: new Date('2024-06-15'), month: 6 },
      { description: 'iCDW', amountArs: 25500.00, date: new Date('2024-06-15'), month: 6 },

      // JULIO 2024
      { description: 'JFC Tecno- Ads', amountArs: 471000.00, date: new Date('2024-07-15'), month: 7 },
      { description: 'Intercapital- Dev (2/2)', amountArs: 143500.00, date: new Date('2024-07-15'), month: 7 },
      { description: 'Palermo Market- Redes', amountArs: 173400.00, date: new Date('2024-07-15'), month: 7 },
      { description: 'Intercapital- SW', amountArs: 337200.00, date: new Date('2024-07-15'), month: 7 },
      { description: 'Intercapital- Dev (1/2)', amountArs: 570000.00, date: new Date('2024-07-15'), month: 7 },
      { description: 'Parana Lodge- Ads', amountArs: 125000.00, date: new Date('2024-07-15'), month: 7 },
      { description: 'EDUCAR- Dev', amountArs: 110000.00, date: new Date('2024-07-15'), month: 7 },

      // AGOSTO 2024
      { description: 'JFC Tecno', amountArs: 436990.00, date: new Date('2024-08-15'), month: 8 },
      { description: 'Pase saldo (Per:JUL)', amountArs: 773237.41, date: new Date('2024-08-15'), month: 8 },
      { description: 'Com. Trans. JGN', amountArs: 93450.00, date: new Date('2024-08-15'), month: 8 },
      { description: 'Pase saldo (Per:JUL)', amountArs: 534000.00, date: new Date('2024-08-15'), month: 8 },
      { description: 'Club San Martin - Dev', amountArs: 300375.00, date: new Date('2024-08-15'), month: 8 },

      // SEPTIEMBRE 2024
      { description: 'JFC Tecno', amountArs: 416000.00, date: new Date('2024-09-15'), month: 9 },
      { description: 'Sanitarios Taragui', amountArs: 40000.00, date: new Date('2024-09-15'), month: 9 },
      { description: 'Retorno- Airp', amountArs: 218000.00, date: new Date('2024-09-15'), month: 9 },
      { description: 'Palermo Market', amountArs: 154375.00, date: new Date('2024-09-15'), month: 9 },
      { description: 'Sanitarios Taragui- SW', amountArs: 304800.00, date: new Date('2024-09-15'), month: 9 },
      { description: 'Club San Martin- Dev (2/2)', amountArs: 163125.00, date: new Date('2024-09-15'), month: 9 },
      { description: 'Club San Martin- SW (36)', amountArs: 358560.00, date: new Date('2024-09-15'), month: 9 },
      { description: 'Sanitarios Taragui- Dom', amountArs: 8500.00, date: new Date('2024-09-15'), month: 9 },

      // OCTUBRE 2024
      { description: 'JFC Tecno', amountArs: 450000.00, date: new Date('2024-10-15'), month: 10 },
      { description: 'Sanitarios Taragui', amountArs: 60000.00, date: new Date('2024-10-15'), month: 10 },
      { description: 'Renov. NM', amountArs: 169700.00, date: new Date('2024-10-15'), month: 10 },
      { description: 'Palermo Market', amountArs: 148750.00, date: new Date('2024-10-15'), month: 10 },
      { description: 'JFC Tecno- Otros pagos', amountArs: 111420.00, date: new Date('2024-10-15'), month: 10 },
      { description: 'Liq. Cripto. (1/10 y 23/10)', amountArs: 375353.35, date: new Date('2024-10-15'), month: 10 },
      { description: 'Trade $ROSE', amountArs: 80077.41, date: new Date('2024-10-15'), month: 10 },
      { description: 'iCenter', amountArs: 70000.00, date: new Date('2024-10-15'), month: 10 },

      // NOVIEMBRE 2024
      { description: 'JFC Tecno- Ads', amountArs: 433000.00, date: new Date('2024-11-15'), month: 11 },
      { description: 'Sanitarios Taragui', amountArs: 40000.00, date: new Date('2024-11-15'), month: 11 },
      { description: 'JFC Tecno- Mailchimp', amountArs: 32100.00, date: new Date('2024-11-15'), month: 11 },
      { description: 'Intercapital', amountArs: 400000.00, date: new Date('2024-11-15'), month: 11 },
      { description: 'JFC Tecno- Otros pagos', amountArs: 100000.00, date: new Date('2024-11-15'), month: 11 },
      { description: 'Intercapital- Dev', amountArs: 446000.00, date: new Date('2024-11-15'), month: 11 },

      // DICIEMBRE 2024
      { description: 'JFC Tecno', amountArs: 440000.00, date: new Date('2024-12-15'), month: 12 },
      { description: 'Sanitarios Taragui', amountArs: 60000.00, date: new Date('2024-12-15'), month: 12 },
      { description: 'Palermo Market (Varios ingresos)', amountArs: 423108.77, date: new Date('2024-12-15'), month: 12 },
      { description: 'Galería Colón- Dom', amountArs: 42500.00, date: new Date('2024-12-15'), month: 12 },
      { description: 'JFC Tecno- GAds & Mailchimp', amountArs: 130240.00, date: new Date('2024-12-15'), month: 12 },
      { description: 'BCC- Dev', amountArs: 291000.00, date: new Date('2024-12-15'), month: 12 },
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
            type: 'INCOME',
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
        console.error(`[Load 2024 Income] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load 2024 Income] ========================================`)
    console.log(`[Load 2024 Income] SUMMARY`)
    console.log(`[Load 2024 Income] ========================================`)
    console.log(`[Load 2024 Income] Total transactions created: ${created}`)
    console.log(`[Load 2024 Income] Total transactions skipped: ${skipped}`)
    console.log(`[Load 2024 Income] Period: January - December 2024`)
    console.log(`\n[Load 2024 Income] BY MONTH:`)
    Object.keys(monthStats).sort((a, b) => Number(a) - Number(b)).forEach(month => {
      const monthName = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][Number(month)]
      console.log(`[Load 2024 Income]   ${monthName}: ${monthStats[Number(month)]} transactions`)
    })
    console.log(`[Load 2024 Income] ========================================`)

  } catch (error) {
    console.error('[Load 2024 Income] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

load2024Income()
  .then(() => {
    console.log('[Load 2024 Income] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load 2024 Income] Failed:', error)
    process.exit(1)
  })
