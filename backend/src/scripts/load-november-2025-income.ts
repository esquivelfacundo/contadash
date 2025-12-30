import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load November 2025 income transactions for facundoesquivel01@gmail.com
 */
async function loadNovember2025Income() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load Nov 2025] Loading income transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load Nov 2025] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load Nov 2025] Found user: ${user.id} - ${user.name}`)

    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'INCOME'
      } 
    })

    console.log(`[Load Nov 2025] Found ${categories.length} income categories`)

    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load Nov 2025] No income category found, creating default...`)
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

    // November 2025 income transactions
    const transactions = [
      { description: 'iCenter- Ads', amountArs: 0.00, date: new Date('2025-11-15') },
      { description: 'W- Compra de luces (6/6)', amountArs: 75000.00, date: new Date('2025-11-15') },
      { description: 'CSM- Mantenimiento', amountArs: 70311.83, date: new Date('2025-11-15') },
      { description: 'TA- Mantenimiento', amountArs: 36589.80, date: new Date('2025-11-15') },
      { description: 'Parana Lodge- Ads', amountArs: 375000.00, date: new Date('2025-11-15') },
      { description: 'iCenter- Mantenimiento', amountArs: 50000.00, date: new Date('2025-11-15') },
    ]

    let created = 0
    let skipped = 0

    for (const tx of transactions) {
      try {
        // Skip transactions with 0 amount
        if (tx.amountArs === 0) {
          console.log(`[Load Nov 2025] ⊘ Skipping ${tx.description} - $0.00 (zero amount)`)
          skipped++
          continue
        }

        await prisma.transaction.create({
          data: {
            user: { connect: { id: user.id } },
            description: tx.description,
            amountArs: tx.amountArs,
            amountUsd: 0,
            type: 'INCOME',
            category: { connect: { id: categoryId } },
            date: tx.date,
            month: 11, // November
            year: 2025,
            exchangeRate: 1650, // Approximate rate for November 2025
          },
        })

        console.log(`[Load Nov 2025] ✓ ${tx.description} - $${tx.amountArs.toLocaleString('es-AR')} ARS`)
        created++
      } catch (error) {
        console.error(`[Load Nov 2025] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load Nov 2025] ========================================`)
    console.log(`[Load Nov 2025] SUMMARY`)
    console.log(`[Load Nov 2025] ========================================`)
    console.log(`[Load Nov 2025] Transactions created: ${created}`)
    console.log(`[Load Nov 2025] Transactions skipped: ${skipped}`)
    console.log(`[Load Nov 2025] Month: November 2025`)
    console.log(`[Load Nov 2025] Total: $${transactions.filter(t => t.amountArs > 0).reduce((sum, t) => sum + t.amountArs, 0).toLocaleString('es-AR')} ARS`)
  } catch (error) {
    console.error('[Load Nov 2025] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

loadNovember2025Income()
  .then(() => {
    console.log('[Load Nov 2025] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load Nov 2025] Failed:', error)
    process.exit(1)
  })
