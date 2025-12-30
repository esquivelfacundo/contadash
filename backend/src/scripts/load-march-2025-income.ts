import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load March 2025 income transactions for facundoesquivel01@gmail.com
 */
async function loadMarch2025Income() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load Mar 2025] Loading income transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load Mar 2025] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load Mar 2025] Found user: ${user.id} - ${user.name}`)

    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'INCOME'
      } 
    })

    console.log(`[Load Mar 2025] Found ${categories.length} income categories`)

    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load Mar 2025] No income category found, creating default...`)
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

    // March 2025 income transactions
    const transactions = [
      { description: 'JFC Tecno- Ads', amountArs: 602385.00, date: new Date('2025-03-15') },
      { description: 'CSM- Plugin de QR', amountArs: 140000.00, date: new Date('2025-03-15') },
      { description: 'CSM- Plugin de Cupones Masivos', amountArs: 60000.00, date: new Date('2025-03-15') },
      { description: 'Bolsanor- DOM', amountArs: 28500.00, date: new Date('2025-03-15') },
      { description: 'FSE S.R.L- Dev (2/2)', amountArs: 221400.00, date: new Date('2025-03-15') },
      { description: 'Urbaterra (1/3)', amountArs: 141750.00, date: new Date('2025-03-15') },
      { description: 'Urbaterra- SW', amountArs: 145800.00, date: new Date('2025-03-15') },
      { description: 'ConnectIQ', amountArs: 78000.00, date: new Date('2025-03-15') },
      { description: 'FSE S.R.L- Modulos autogestion', amountArs: 214000.00, date: new Date('2025-03-15') },
      { description: 'TA- Mantenimiento', amountArs: 39000.00, date: new Date('2025-03-15') },
      { description: 'Guille Dusset- RBMA (1/6)', amountArs: 63333.32, date: new Date('2025-03-15') },
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
            month: 3, // March
            year: 2025,
            exchangeRate: 1250, // Approximate rate for March 2025
          },
        })

        console.log(`[Load Mar 2025] ✓ ${tx.description} - $${tx.amountArs.toLocaleString('es-AR')} ARS`)
        created++
      } catch (error) {
        console.error(`[Load Mar 2025] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load Mar 2025] ========================================`)
    console.log(`[Load Mar 2025] SUMMARY`)
    console.log(`[Load Mar 2025] ========================================`)
    console.log(`[Load Mar 2025] Transactions created: ${created}`)
    console.log(`[Load Mar 2025] Transactions skipped: ${skipped}`)
    console.log(`[Load Mar 2025] Month: March 2025`)
    console.log(`[Load Mar 2025] Total: $${transactions.reduce((sum, t) => sum + t.amountArs, 0).toLocaleString('es-AR')} ARS`)
  } catch (error) {
    console.error('[Load Mar 2025] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

loadMarch2025Income()
  .then(() => {
    console.log('[Load Mar 2025] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load Mar 2025] Failed:', error)
    process.exit(1)
  })
