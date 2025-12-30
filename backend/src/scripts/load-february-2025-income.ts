import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load February 2025 income transactions for facundoesquivel01@gmail.com
 */
async function loadFebruary2025Income() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load Feb 2025] Loading income transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load Feb 2025] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load Feb 2025] Found user: ${user.id} - ${user.name}`)

    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'INCOME'
      } 
    })

    console.log(`[Load Feb 2025] Found ${categories.length} income categories`)

    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load Feb 2025] No income category found, creating default...`)
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

    // February 2025 income transactions
    const transactions = [
      { description: 'JFC Tecno- Ads', amountArs: 597385.00, date: new Date('2025-02-15') },
      { description: 'Palermo Market- Marketing', amountArs: 49000.00, date: new Date('2025-02-15') },
      { description: 'Centro Ocular Irigoyen- SW', amountArs: 209439.00, date: new Date('2025-02-15') },
      { description: 'Parana Lodge- SW', amountArs: 147000.00, date: new Date('2025-02-15') },
      { description: 'Gebo Consultores- SW', amountArs: 180200.00, date: new Date('2025-02-15') },
      { description: 'Eseica NEA- Renovación SW', amountArs: 292800.00, date: new Date('2025-02-15') },
      { description: 'Eseica NEA- Renovación cPanel', amountArs: 234240.00, date: new Date('2025-02-15') },
    ]

    let created = 0
    let skipped = 0

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
            month: 2, // February
            year: 2025,
            exchangeRate: 1200, // Approximate rate for February 2025
          },
        })

        console.log(`[Load Feb 2025] ✓ ${tx.description} - $${tx.amountArs.toLocaleString('es-AR')} ARS`)
        created++
      } catch (error) {
        console.error(`[Load Feb 2025] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load Feb 2025] ========================================`)
    console.log(`[Load Feb 2025] SUMMARY`)
    console.log(`[Load Feb 2025] ========================================`)
    console.log(`[Load Feb 2025] Transactions created: ${created}`)
    console.log(`[Load Feb 2025] Transactions skipped: ${skipped}`)
    console.log(`[Load Feb 2025] Month: February 2025`)
    console.log(`[Load Feb 2025] Total: $${transactions.reduce((sum, t) => sum + t.amountArs, 0).toLocaleString('es-AR')} ARS`)
  } catch (error) {
    console.error('[Load Feb 2025] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

loadFebruary2025Income()
  .then(() => {
    console.log('[Load Feb 2025] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load Feb 2025] Failed:', error)
    process.exit(1)
  })
