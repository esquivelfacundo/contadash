import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load April 2025 income transactions for facundoesquivel01@gmail.com
 */
async function loadApril2025Income() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load Apr 2025] Loading income transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load Apr 2025] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load Apr 2025] Found user: ${user.id} - ${user.name}`)

    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'INCOME'
      } 
    })

    console.log(`[Load Apr 2025] Found ${categories.length} income categories`)

    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load Apr 2025] No income category found, creating default...`)
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

    // April 2025 income transactions
    const transactions = [
      { description: 'JFCT- Ads', amountArs: 616285.00, date: new Date('2025-04-15') },
      { description: 'CSM- SW', amountArs: 511920.00, date: new Date('2025-04-15') },
      { description: 'VB- SW', amountArs: 142200.00, date: new Date('2025-04-15') },
      { description: 'EDUCAR S.R.L- SW', amountArs: 316800.00, date: new Date('2025-04-15') },
      { description: 'TA- Mantenimiento', amountArs: 39000.00, date: new Date('2025-04-15') },
      { description: 'FSE- Desarrollo (1/2)', amountArs: 595840.00, date: new Date('2025-04-15') },
      { description: 'FSE- SW', amountArs: 319200.00, date: new Date('2025-04-15') },
      { description: 'FSE- LW', amountArs: 148960.00, date: new Date('2025-04-15') },
      { description: 'W- Compra de luces (1/6)', amountArs: 75000.00, date: new Date('2025-04-15') },
      { description: 'Urbaterra- Dev (2/3)', amountArs: 149060.00, date: new Date('2025-04-15') },
      { description: 'Guille Dusset- RBMA (2/6)', amountArs: 16666.66, date: new Date('2025-04-15') },
      { description: 'Farmacentro (1/2)', amountArs: 1210000.00, date: new Date('2025-04-15') },
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
            month: 4, // April
            year: 2025,
            exchangeRate: 1300, // Approximate rate for April 2025
          },
        })

        console.log(`[Load Apr 2025] ✓ ${tx.description} - $${tx.amountArs.toLocaleString('es-AR')} ARS`)
        created++
      } catch (error) {
        console.error(`[Load Apr 2025] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load Apr 2025] ========================================`)
    console.log(`[Load Apr 2025] SUMMARY`)
    console.log(`[Load Apr 2025] ========================================`)
    console.log(`[Load Apr 2025] Transactions created: ${created}`)
    console.log(`[Load Apr 2025] Transactions skipped: ${skipped}`)
    console.log(`[Load Apr 2025] Month: April 2025`)
    console.log(`[Load Apr 2025] Total: $${transactions.reduce((sum, t) => sum + t.amountArs, 0).toLocaleString('es-AR')} ARS`)
  } catch (error) {
    console.error('[Load Apr 2025] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

loadApril2025Income()
  .then(() => {
    console.log('[Load Apr 2025] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load Apr 2025] Failed:', error)
    process.exit(1)
  })
