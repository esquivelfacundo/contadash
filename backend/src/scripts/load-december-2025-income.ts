import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load December 2025 income transactions for facundoesquivel01@gmail.com
 */
async function loadDecember2025Income() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load Dec 2025] Loading income transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load Dec 2025] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load Dec 2025] Found user: ${user.id} - ${user.name}`)

    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'INCOME'
      } 
    })

    console.log(`[Load Dec 2025] Found ${categories.length} income categories`)

    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load Dec 2025] No income category found, creating default...`)
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

    // December 2025 income transactions
    const transactions = [
      { description: 'DH- Dev', amountArs: 500000.00, date: new Date('2025-12-15') },
      { description: 'Palermo Market', amountArs: 502250.00, date: new Date('2025-12-15') },
      { description: 'FSE- Desarrollo S+F (2/2)', amountArs: 1769000.00, date: new Date('2025-12-15') },
      { description: 'CSM- Mantenimiento', amountArs: 70311.83, date: new Date('2025-12-15') },
      { description: 'iCenter- Dev Caja', amountArs: 450000.00, date: new Date('2025-12-15') },
      { description: 'iCenter- Mantenimiento', amountArs: 53000.00, date: new Date('2025-12-15') },
      { description: 'LOS- Mantenimiento', amountArs: 114800.00, date: new Date('2025-12-15') },
      { description: 'Parana Lodge- Ads', amountArs: 375000.00, date: new Date('2025-12-15') },
      { description: 'BORI OIL- Ads', amountArs: 150000.00, date: new Date('2025-12-15') },
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
            month: 12, // December
            year: 2025,
            exchangeRate: 1700, // Approximate rate for December 2025
          },
        })

        console.log(`[Load Dec 2025] ✓ ${tx.description} - $${tx.amountArs.toLocaleString('es-AR')} ARS`)
        created++
      } catch (error) {
        console.error(`[Load Dec 2025] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load Dec 2025] ========================================`)
    console.log(`[Load Dec 2025] SUMMARY`)
    console.log(`[Load Dec 2025] ========================================`)
    console.log(`[Load Dec 2025] Transactions created: ${created}`)
    console.log(`[Load Dec 2025] Transactions skipped: ${skipped}`)
    console.log(`[Load Dec 2025] Month: December 2025`)
    console.log(`[Load Dec 2025] Total: $${transactions.reduce((sum, t) => sum + t.amountArs, 0).toLocaleString('es-AR')} ARS`)
    console.log(`[Load Dec 2025] ========================================`)
    console.log(`[Load Dec 2025] 🎉 COMPLETED FULL YEAR 2025! 🎉`)
    console.log(`[Load Dec 2025] ========================================`)
  } catch (error) {
    console.error('[Load Dec 2025] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

loadDecember2025Income()
  .then(() => {
    console.log('[Load Dec 2025] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load Dec 2025] Failed:', error)
    process.exit(1)
  })
