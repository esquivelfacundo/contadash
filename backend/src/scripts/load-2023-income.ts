import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load 2023 income transactions (January - December) for facundoesquivel01@gmail.com
 * This script runs once to populate all income data for the year
 */
async function load2023Income() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load 2023 Income] Loading income transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load 2023 Income] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load 2023 Income] Found user: ${user.id} - ${user.name}`)

    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'INCOME'
      } 
    })

    console.log(`[Load 2023 Income] Found ${categories.length} income categories`)

    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load 2023 Income] No income category found, creating default...`)
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

    // All 2023 income transactions (January - December)
    const transactions = [
      // ENERO 2023
      { description: 'JFC Tecno - Meta Ads', amountArs: 40000.00, date: new Date('2023-01-15'), month: 1 },
      { description: 'JFC Tecno - Google Ads', amountArs: 30000.00, date: new Date('2023-01-15'), month: 1 },
      { description: 'JFC Tecno - MailChimp', amountArs: 6519.88, date: new Date('2023-01-15'), month: 1 },
      { description: 'Lark Indumentaria - Meta Ads', amountArs: 30000.00, date: new Date('2023-01-15'), month: 1 },
      { description: 'Sanitarios Taragüí - Social Media', amountArs: 15000.00, date: new Date('2023-01-15'), month: 1 },
      { description: 'CSTA', amountArs: 25000.00, date: new Date('2023-01-15'), month: 1 },
      { description: 'Centenario Shopping - Meta Ads', amountArs: 40000.00, date: new Date('2023-01-15'), month: 1 },
      { description: 'Centenario Shopping - Google Ads', amountArs: 50000.00, date: new Date('2023-01-15'), month: 1 },
      { description: 'GOGO Burgers - Meta Ads', amountArs: 25000.00, date: new Date('2023-01-15'), month: 1 },
      { description: 'CGBA', amountArs: 1000.00, date: new Date('2023-01-15'), month: 1 },
      { description: 'DecoHouse - Meta Ads', amountArs: 25000.00, date: new Date('2023-01-15'), month: 1 },
      { description: 'Serolav SRL', amountArs: 30000.00, date: new Date('2023-01-15'), month: 1 },
      { description: 'Servidor - JFC Tecno', amountArs: 84690.00, date: new Date('2023-01-15'), month: 1 },
      { description: 'Servidor - Centro Ocular Irigoyen', amountArs: 75345.00, date: new Date('2023-01-15'), month: 1 },

      // FEBRERO 2023
      { description: 'JFC Tecno', amountArs: 76903.00, date: new Date('2023-02-15'), month: 2 },
      { description: 'Lark Indumentaria', amountArs: 30000.00, date: new Date('2023-02-15'), month: 2 },
      { description: 'Sanitarios Taragüí', amountArs: 40000.00, date: new Date('2023-02-15'), month: 2 },
      { description: 'Centenario Shopping', amountArs: 55000.00, date: new Date('2023-02-15'), month: 2 },
      { description: 'GOGO Burgers', amountArs: 34000.00, date: new Date('2023-02-15'), month: 2 },
      { description: 'DecoHouse', amountArs: 50000.00, date: new Date('2023-02-15'), month: 2 },
      { description: 'Serolav SRL', amountArs: 25000.00, date: new Date('2023-02-15'), month: 2 },
      { description: 'Galeria Colón', amountArs: 295000.00, date: new Date('2023-02-15'), month: 2 },

      // MARZO 2023
      { description: 'JFC Tecno', amountArs: 77000.00, date: new Date('2023-03-15'), month: 3 },
      { description: 'Sanitarios Taragüí', amountArs: 50000.00, date: new Date('2023-03-15'), month: 3 },
      { description: 'Centenario Shopping', amountArs: 76189.00, date: new Date('2023-03-15'), month: 3 },
      { description: 'DecoHouse', amountArs: 25000.00, date: new Date('2023-03-15'), month: 3 },
      { description: 'Serolav SRL', amountArs: 30000.00, date: new Date('2023-03-15'), month: 3 },

      // ABRIL 2023
      { description: 'JFC Tecno', amountArs: 96100.00, date: new Date('2023-04-15'), month: 4 },
      { description: 'Lark Indumentaria', amountArs: 39500.00, date: new Date('2023-04-15'), month: 4 },
      { description: 'Sanitarios Taragüí', amountArs: 40000.00, date: new Date('2023-04-15'), month: 4 },
      { description: 'Centenario Shopping', amountArs: 58190.50, date: new Date('2023-04-15'), month: 4 },
      { description: 'DecoHouse', amountArs: 25000.00, date: new Date('2023-04-15'), month: 4 },
      { description: 'Franco - OpenEnglish License', amountArs: 16700.00, date: new Date('2023-04-15'), month: 4 },
      { description: 'Aguape Lodge', amountArs: 39500.00, date: new Date('2023-04-15'), month: 4 },

      // MAYO 2023
      { description: 'JFC Tecno', amountArs: 77351.50, date: new Date('2023-05-15'), month: 5 },
      { description: 'Lark Indumentaria', amountArs: 30000.00, date: new Date('2023-05-15'), month: 5 },
      { description: 'Sanitarios Taragüí', amountArs: 40000.00, date: new Date('2023-05-15'), month: 5 },
      { description: 'Centenario Shopping', amountArs: 76189.00, date: new Date('2023-05-15'), month: 5 },
      { description: 'GOGO Burgers', amountArs: 34000.00, date: new Date('2023-05-15'), month: 5 },
      { description: 'DecoHouse', amountArs: 50000.00, date: new Date('2023-05-15'), month: 5 },
      { description: 'Serolav SRL', amountArs: 30000.00, date: new Date('2023-05-15'), month: 5 },
      { description: 'Galeria Colón', amountArs: 295000.00, date: new Date('2023-05-15'), month: 5 },

      // JUNIO 2023
      { description: 'Joaquín Chiesa (JFC - FERKLEY)', amountArs: 296000.00, date: new Date('2023-06-15'), month: 6 },
      { description: 'Alfredo Grosso (ST)', amountArs: 50000.00, date: new Date('2023-06-15'), month: 6 },
      { description: 'Nicolas Goitia (CS)', amountArs: 119396.00, date: new Date('2023-06-15'), month: 6 },
      { description: 'Federico Oviedo (GGB)', amountArs: 15000.00, date: new Date('2023-06-15'), month: 6 },
      { description: 'Pedro Intra (GC)', amountArs: 120000.00, date: new Date('2023-06-15'), month: 6 },
      { description: 'Facundo Franco (GGO)', amountArs: 97200.00, date: new Date('2023-06-15'), month: 6 },

      // JULIO 2023
      { description: 'Sanitarios Taragüí', amountArs: 45000.00, date: new Date('2023-07-15'), month: 7 },
      { description: 'Centenario Shopping', amountArs: 119369.00, date: new Date('2023-07-15'), month: 7 },
      { description: 'GOGO Burgers', amountArs: 29000.00, date: new Date('2023-07-15'), month: 7 },
      { description: 'Havanna', amountArs: 74500.00, date: new Date('2023-07-15'), month: 7 },
      { description: 'iCenter', amountArs: 36500.00, date: new Date('2023-07-15'), month: 7 },

      // AGOSTO 2023
      { description: 'JFCTECNO- Meta Ads', amountArs: 70000.00, date: new Date('2023-08-15'), month: 8 },
      { description: 'ST- Social Media', amountArs: 15000.00, date: new Date('2023-08-15'), month: 8 },
      { description: 'CSTA', amountArs: 30000.00, date: new Date('2023-08-15'), month: 8 },
      { description: 'CESHMA- Meta Ads', amountArs: 49000.00, date: new Date('2023-08-15'), month: 8 },
      { description: 'CESHMA- Google Ads', amountArs: 80289.50, date: new Date('2023-08-15'), month: 8 },
      { description: 'PALERMOMIA- Meta Ads', amountArs: 70000.00, date: new Date('2023-08-15'), month: 8 },
      { description: 'iCenter- Servidor web', amountArs: 66000.00, date: new Date('2023-08-15'), month: 8 },

      // SEPTIEMBRE 2023
      { description: 'JFC Tecno - Meta Ads/GAds/Mailchimp', amountArs: 76903.00, date: new Date('2023-09-15'), month: 9 },
      { description: 'Lark Indumentaria', amountArs: 30000.00, date: new Date('2023-09-15'), month: 9 },
      { description: 'Sanitarios Taragüí', amountArs: 15000.00, date: new Date('2023-09-15'), month: 9 },
      { description: 'CSTA', amountArs: 25000.00, date: new Date('2023-09-15'), month: 9 },
      { description: 'Centenario Shopping', amountArs: 55000.00, date: new Date('2023-09-15'), month: 9 },
      { description: 'GOGO Burgers', amountArs: 25000.00, date: new Date('2023-09-15'), month: 9 },
      { description: 'CGBA', amountArs: 9000.00, date: new Date('2023-09-15'), month: 9 },
      { description: 'DecoHouse / CDHA', amountArs: 50000.00, date: new Date('2023-09-15'), month: 9 },
      { description: 'Serolav SRL', amountArs: 25000.00, date: new Date('2023-09-15'), month: 9 },

      // OCTUBRE 2023
      { description: 'JFC Tecno', amountArs: 76903.00, date: new Date('2023-10-15'), month: 10 },
      { description: 'Lark Indumentaria', amountArs: 30000.00, date: new Date('2023-10-15'), month: 10 },
      { description: 'Sanitarios Taragüí', amountArs: 40000.00, date: new Date('2023-10-15'), month: 10 },
      { description: 'Centenario Shopping', amountArs: 55000.00, date: new Date('2023-10-15'), month: 10 },
      { description: 'GOGO Burgers', amountArs: 34000.00, date: new Date('2023-10-15'), month: 10 },
      { description: 'DecoHouse', amountArs: 50000.00, date: new Date('2023-10-15'), month: 10 },
      { description: 'Serolav SRL', amountArs: 25000.00, date: new Date('2023-10-15'), month: 10 },

      // NOVIEMBRE 2023
      { description: 'JFC Tecno', amountArs: 76903.00, date: new Date('2023-11-15'), month: 11 },
      { description: 'Lark Indumentaria', amountArs: 30000.00, date: new Date('2023-11-15'), month: 11 },
      { description: 'Sanitarios Taragüí', amountArs: 40000.00, date: new Date('2023-11-15'), month: 11 },
      { description: 'Centenario Shopping', amountArs: 55000.00, date: new Date('2023-11-15'), month: 11 },
      { description: 'GOGO Burgers', amountArs: 34000.00, date: new Date('2023-11-15'), month: 11 },
      { description: 'DecoHouse', amountArs: 50000.00, date: new Date('2023-11-15'), month: 11 },
      { description: 'Serolav SRL', amountArs: 25000.00, date: new Date('2023-11-15'), month: 11 },

      // DICIEMBRE 2023
      { description: 'JFC Tecno', amountArs: 76903.00, date: new Date('2023-12-15'), month: 12 },
      { description: 'Lark Indumentaria', amountArs: 30000.00, date: new Date('2023-12-15'), month: 12 },
      { description: 'Sanitarios Taragüí', amountArs: 40000.00, date: new Date('2023-12-15'), month: 12 },
      { description: 'Centenario Shopping', amountArs: 55000.00, date: new Date('2023-12-15'), month: 12 },
      { description: 'GOGO Burgers', amountArs: 34000.00, date: new Date('2023-12-15'), month: 12 },
      { description: 'DecoHouse', amountArs: 50000.00, date: new Date('2023-12-15'), month: 12 },
      { description: 'Serolav SRL', amountArs: 25000.00, date: new Date('2023-12-15'), month: 12 },
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
            year: 2023,
            exchangeRate: 200 + (tx.month * 10), // Approximate progressive rate for 2023
          },
        })

        monthStats[tx.month] = (monthStats[tx.month] || 0) + 1
        created++
      } catch (error) {
        console.error(`[Load 2023 Income] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load 2023 Income] ========================================`)
    console.log(`[Load 2023 Income] SUMMARY`)
    console.log(`[Load 2023 Income] ========================================`)
    console.log(`[Load 2023 Income] Total transactions created: ${created}`)
    console.log(`[Load 2023 Income] Total transactions skipped: ${skipped}`)
    console.log(`[Load 2023 Income] Period: January - December 2023`)
    console.log(`\n[Load 2023 Income] BY MONTH:`)
    Object.keys(monthStats).sort((a, b) => Number(a) - Number(b)).forEach(month => {
      const monthName = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][Number(month)]
      console.log(`[Load 2023 Income]   ${monthName}: ${monthStats[Number(month)]} transactions`)
    })
    console.log(`[Load 2023 Income] ========================================`)

  } catch (error) {
    console.error('[Load 2023 Income] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

load2023Income()
  .then(() => {
    console.log('[Load 2023 Income] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load 2023 Income] Failed:', error)
    process.exit(1)
  })
