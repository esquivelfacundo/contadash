import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load May 2025 income transactions for facundoesquivel01@gmail.com
 */
async function loadMay2025Income() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load May 2025] Loading income transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load May 2025] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load May 2025] Found user: ${user.id} - ${user.name}`)

    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'INCOME'
      } 
    })

    console.log(`[Load May 2025] Found ${categories.length} income categories`)

    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load May 2025] No income category found, creating default...`)
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

    // May 2025 income transactions
    const transactions = [
      { description: 'JFC Tecno- Ads', amountArs: 616215.00, date: new Date('2025-05-15') },
      { description: 'Grupo GO- Renovaciones', amountArs: 169500.00, date: new Date('2025-05-15') },
      { description: 'TA- Mantenimiento', amountArs: 39000.00, date: new Date('2025-05-15') },
      { description: 'W- Compra de luces (2/6)', amountArs: 75000.00, date: new Date('2025-05-15') },
      { description: 'Urbaterra (3/3)', amountArs: 141750.00, date: new Date('2025-05-15') },
      { description: 'Guille Dusset- RBMA (3/6)', amountArs: 16666.66, date: new Date('2025-05-15') },
      { description: 'CSM- Dev', amountArs: 98000.00, date: new Date('2025-05-15') },
      { description: 'WS- Mono', amountArs: 72679.66, date: new Date('2025-05-15') },
      { description: 'FSE- Desarrollo S+F (1/2)', amountArs: 1771750.00, date: new Date('2025-05-15') },
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
            month: 5, // May
            year: 2025,
            exchangeRate: 1350, // Approximate rate for May 2025
          },
        })

        console.log(`[Load May 2025] ✓ ${tx.description} - $${tx.amountArs.toLocaleString('es-AR')} ARS`)
        created++
      } catch (error) {
        console.error(`[Load May 2025] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load May 2025] ========================================`)
    console.log(`[Load May 2025] SUMMARY`)
    console.log(`[Load May 2025] ========================================`)
    console.log(`[Load May 2025] Transactions created: ${created}`)
    console.log(`[Load May 2025] Transactions skipped: ${skipped}`)
    console.log(`[Load May 2025] Month: May 2025`)
    console.log(`[Load May 2025] Total: $${transactions.reduce((sum, t) => sum + t.amountArs, 0).toLocaleString('es-AR')} ARS`)
  } catch (error) {
    console.error('[Load May 2025] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

loadMay2025Income()
  .then(() => {
    console.log('[Load May 2025] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load May 2025] Failed:', error)
    process.exit(1)
  })
