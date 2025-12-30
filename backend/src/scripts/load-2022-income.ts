import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load 2022 income transactions (April - December) for facundoesquivel01@gmail.com
 * This script runs once to populate all income data for the year
 */
async function load2022Income() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load 2022 Income] Loading income transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load 2022 Income] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load 2022 Income] Found user: ${user.id} - ${user.name}`)

    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'INCOME'
      } 
    })

    console.log(`[Load 2022 Income] Found ${categories.length} income categories`)

    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load 2022 Income] No income category found, creating default...`)
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

    // All 2022 income transactions (April - December)
    const transactions = [
      // ABRIL 2022
      { description: 'JFC Tecno', amountArs: 26000.00, date: new Date('2022-04-15'), month: 4 },
      { description: 'Serolav SRL', amountArs: 14249.00, date: new Date('2022-04-15'), month: 4 },
      { description: 'Centenario Shopping', amountArs: 15000.00, date: new Date('2022-04-15'), month: 4 },
      { description: 'FIVE', amountArs: 20000.00, date: new Date('2022-04-15'), month: 4 },
      { description: 'Aguape Web', amountArs: 43678.00, date: new Date('2022-04-15'), month: 4 },
      { description: 'JFC Tecno - Rediseño web', amountArs: 30000.00, date: new Date('2022-04-15'), month: 4 },
      { description: 'Comisión Logo Yacacrypto', amountArs: 5000.00, date: new Date('2022-04-15'), month: 4 },
      { description: 'PROFIT - $ROSE x5', amountArs: 126000.00, date: new Date('2022-04-15'), month: 4 },
      { description: 'Comisión Logo Bolsa de Comercio', amountArs: 5000.00, date: new Date('2022-04-15'), month: 4 },
      { description: 'PROFIT - $BTC x5', amountArs: 7500.00, date: new Date('2022-04-15'), month: 4 },

      // MAYO 2022
      { description: 'JFC Tecno', amountArs: 26000.00, date: new Date('2022-05-15'), month: 5 },
      { description: 'Serolav SRL', amountArs: 14249.00, date: new Date('2022-05-15'), month: 5 },
      { description: 'Centenario Shopping', amountArs: 15000.00, date: new Date('2022-05-15'), month: 5 },
      { description: 'FIVE', amountArs: 15200.00, date: new Date('2022-05-15'), month: 5 },
      { description: 'Lark', amountArs: 14250.00, date: new Date('2022-05-15'), month: 5 },
      { description: 'Rediseño logo Yaca', amountArs: 5000.00, date: new Date('2022-05-15'), month: 5 },
      { description: 'Rediseño Web JFC', amountArs: 55000.00, date: new Date('2022-05-15'), month: 5 },
      { description: 'Yacacrypto redes', amountArs: 17500.00, date: new Date('2022-05-15'), month: 5 },
      { description: 'Yacacrypto comision videos', amountArs: 5000.00, date: new Date('2022-05-15'), month: 5 },
      { description: 'Rediseño logo Bolsa de Comercio', amountArs: 5000.00, date: new Date('2022-05-15'), month: 5 },

      // JUNIO 2022
      { description: 'JFC Tecno', amountArs: 26000.00, date: new Date('2022-06-15'), month: 6 },
      { description: 'Serolav SRL', amountArs: 14249.00, date: new Date('2022-06-15'), month: 6 },
      { description: 'Centenario Shopping', amountArs: 30000.00, date: new Date('2022-06-15'), month: 6 },
      { description: 'Sanitarios Taraguí', amountArs: 15000.00, date: new Date('2022-06-15'), month: 6 },
      { description: 'Lark Indumentaria', amountArs: 14250.00, date: new Date('2022-06-15'), month: 6 },
      { description: 'GOGO Burgers', amountArs: 15000.00, date: new Date('2022-06-15'), month: 6 },
      { description: 'Yacacrypto', amountArs: 15000.00, date: new Date('2022-06-15'), month: 6 },

      // JULIO 2022
      { description: 'JFC Tecno', amountArs: 26000.00, date: new Date('2022-07-15'), month: 7 },
      { description: 'Serolav SRL', amountArs: 14249.00, date: new Date('2022-07-15'), month: 7 },
      { description: 'Centenario Shopping', amountArs: 15000.00, date: new Date('2022-07-15'), month: 7 },
      { description: 'GOGO Burgers', amountArs: 15000.00, date: new Date('2022-07-15'), month: 7 },
      { description: 'Lark Indumentaria', amountArs: 14250.00, date: new Date('2022-07-15'), month: 7 },
      { description: 'Sanitarios Taraguí', amountArs: 17500.00, date: new Date('2022-07-15'), month: 7 },
      { description: 'Yacacrypto', amountArs: 17250.00, date: new Date('2022-07-15'), month: 7 },
      { description: 'Shop Mes anterior', amountArs: 15000.00, date: new Date('2022-07-15'), month: 7 },

      // AGOSTO 2022
      { description: 'JFC Tecno', amountArs: 32500.00, date: new Date('2022-08-15'), month: 8 },
      { description: 'Serolav SRL', amountArs: 20000.00, date: new Date('2022-08-15'), month: 8 },
      { description: 'Centenario Shopping', amountArs: 25000.00, date: new Date('2022-08-15'), month: 8 },
      { description: 'GOGO Burgers', amountArs: 15000.00, date: new Date('2022-08-15'), month: 8 },
      { description: 'Lark Indumentaria', amountArs: 20000.00, date: new Date('2022-08-15'), month: 8 },
      { description: 'Sanitarios Taraguí', amountArs: 17500.00, date: new Date('2022-08-15'), month: 8 },
      { description: 'Yacacrypto', amountArs: 17250.00, date: new Date('2022-08-15'), month: 8 },
      { description: 'Importe L.T', amountArs: 11700.00, date: new Date('2022-08-15'), month: 8 },
      { description: 'Importe C.Y', amountArs: 20000.00, date: new Date('2022-08-15'), month: 8 },
      { description: 'Shop mes pasado', amountArs: 15000.00, date: new Date('2022-08-15'), month: 8 },
      { description: 'Corrección', amountArs: 30000.00, date: new Date('2022-08-15'), month: 8 },

      // SEPTIEMBRE 2022
      { description: 'JFC Tecno', amountArs: 32500.00, date: new Date('2022-09-15'), month: 9 },
      { description: 'Centenario Shopping', amountArs: 25000.00, date: new Date('2022-09-15'), month: 9 },
      { description: 'GOGO Burgers', amountArs: 15000.00, date: new Date('2022-09-15'), month: 9 },
      { description: 'Lark Indumentaria', amountArs: 20000.00, date: new Date('2022-09-15'), month: 9 },
      { description: 'Sanitarios Taraguí', amountArs: 68700.00, date: new Date('2022-09-15'), month: 9 },
      { description: 'Yacacrypto', amountArs: 15000.00, date: new Date('2022-09-15'), month: 9 },
      { description: 'DecoHouse', amountArs: 120000.00, date: new Date('2022-09-15'), month: 9 },
      { description: 'JFC Tecno - Web Update', amountArs: 10800.00, date: new Date('2022-09-15'), month: 9 },
      { description: 'BC Salud', amountArs: 56200.00, date: new Date('2022-09-15'), month: 9 },

      // OCTUBRE 2022
      { description: 'JFC Tecno - Meta Ads', amountArs: 32500.00, date: new Date('2022-10-15'), month: 10 },
      { description: 'JFC Tecno - Google Ads', amountArs: 25000.00, date: new Date('2022-10-15'), month: 10 },
      { description: 'JFC Tecno - Web Payment Method', amountArs: 22800.00, date: new Date('2022-10-15'), month: 10 },
      { description: 'Sanitarios Taraguí - Social Media', amountArs: 12500.00, date: new Date('2022-10-15'), month: 10 },
      { description: 'Centenario Shopping - Meta Ads', amountArs: 25000.00, date: new Date('2022-10-15'), month: 10 },
      { description: 'GOGO Burgers - Meta Ads', amountArs: 15000.00, date: new Date('2022-10-15'), month: 10 },
      { description: 'GOGO Burgers - Ads C', amountArs: 9000.00, date: new Date('2022-10-15'), month: 10 },
      { description: 'Yacacrypto - Meta Ads', amountArs: 30000.00, date: new Date('2022-10-15'), month: 10 },

      // NOVIEMBRE 2022
      { description: 'JFC Tecno (Meta/Google/Ads C/MailChimp)', amountArs: 110690.00, date: new Date('2022-11-15'), month: 11 },
      { description: 'Lark Indumentaria', amountArs: 20000.00, date: new Date('2022-11-15'), month: 11 },
      { description: 'Centenario Shopping (Meta/Google)', amountArs: 55000.00, date: new Date('2022-11-15'), month: 11 },
      { description: 'GOGO Burgers', amountArs: 15000.00, date: new Date('2022-11-15'), month: 11 },
      { description: 'DecoHouse (Meta/Ads C/SW/Web)', amountArs: 140000.00, date: new Date('2022-11-15'), month: 11 },
      { description: 'Serolav SRL', amountArs: 25000.00, date: new Date('2022-11-15'), month: 11 },
      { description: 'Emigrar a Europa', amountArs: 15000.00, date: new Date('2022-11-15'), month: 11 },

      // DICIEMBRE 2022
      { description: 'JFC Tecno - Meta Ads', amountArs: 32500.00, date: new Date('2022-12-15'), month: 12 },
      { description: 'JFC Tecno - Google Ads', amountArs: 25000.00, date: new Date('2022-12-15'), month: 12 },
      { description: 'JFC Tecno - MailChimp', amountArs: 3190.00, date: new Date('2022-12-15'), month: 12 },
      { description: 'Sanitarios Taraguí - Social Media', amountArs: 15000.00, date: new Date('2022-12-15'), month: 12 },
      { description: 'CSTA', amountArs: 25000.00, date: new Date('2022-12-15'), month: 12 },
      { description: 'Centenario - Meta Ads', amountArs: 25000.00, date: new Date('2022-12-15'), month: 12 },
      { description: 'Centenario - Google Ads', amountArs: 30000.00, date: new Date('2022-12-15'), month: 12 },
      { description: 'GOGO Burgers - Meta Ads', amountArs: 15000.00, date: new Date('2022-12-15'), month: 12 },
      { description: 'DecoHouse - Meta Ads', amountArs: 25000.00, date: new Date('2022-12-15'), month: 12 },
      { description: 'CDHA', amountArs: 30000.00, date: new Date('2022-12-15'), month: 12 },
      { description: 'Serolav SRL', amountArs: 25000.00, date: new Date('2022-12-15'), month: 12 },
      { description: 'DecoHouse - Devolución', amountArs: 50000.00, date: new Date('2022-12-15'), month: 12 },
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
            year: 2022,
            exchangeRate: 120 + (tx.month * 5), // Approximate progressive rate for 2022
          },
        })

        monthStats[tx.month] = (monthStats[tx.month] || 0) + 1
        created++
      } catch (error) {
        console.error(`[Load 2022 Income] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load 2022 Income] ========================================`)
    console.log(`[Load 2022 Income] SUMMARY`)
    console.log(`[Load 2022 Income] ========================================`)
    console.log(`[Load 2022 Income] Total transactions created: ${created}`)
    console.log(`[Load 2022 Income] Total transactions skipped: ${skipped}`)
    console.log(`[Load 2022 Income] Period: April - December 2022`)
    console.log(`\n[Load 2022 Income] BY MONTH:`)
    Object.keys(monthStats).sort((a, b) => Number(a) - Number(b)).forEach(month => {
      const monthName = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][Number(month)]
      console.log(`[Load 2022 Income]   ${monthName}: ${monthStats[Number(month)]} transactions`)
    })
    console.log(`[Load 2022 Income] ========================================`)

  } catch (error) {
    console.error('[Load 2022 Income] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

load2022Income()
  .then(() => {
    console.log('[Load 2022 Income] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load 2022 Income] Failed:', error)
    process.exit(1)
  })
