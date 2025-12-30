import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load September 2025 income transactions for facundoesquivel01@gmail.com
 */
async function loadSeptember2025Income() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load Sep 2025] Loading income transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load Sep 2025] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load Sep 2025] Found user: ${user.id} - ${user.name}`)

    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'INCOME'
      } 
    })

    console.log(`[Load Sep 2025] Found ${categories.length} income categories`)

    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load Sep 2025] No income category found, creating default...`)
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

    // September 2025 income transactions
    const transactions = [
      { description: 'LOS- Comisión', amountArs: 30000.00, date: new Date('2025-09-15') },
      { description: 'W- Compra de luces (6/6)', amountArs: 75000.00, date: new Date('2025-09-15') },
      { description: 'CSM- Mantenimiento', amountArs: 49724.60, date: new Date('2025-09-15') },
      { description: 'SW- Sanitarios Taragui', amountArs: 354000.00, date: new Date('2025-09-15') },
      { description: 'Optica- Dev (2/3)', amountArs: 1510500.00, date: new Date('2025-09-15') },
      { description: 'DV- Mantenimiento', amountArs: 49724.60, date: new Date('2025-09-15') },
      { description: 'CSM- Dev Abonos', amountArs: 737500.00, date: new Date('2025-09-15') },
      { description: 'EE- Clock Transfer', amountArs: 305000.00, date: new Date('2025-09-15') },
      { description: 'JGN- SW', amountArs: 170400.00, date: new Date('2025-09-15') },
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
            month: 9, // September
            year: 2025,
            exchangeRate: 1550, // Approximate rate for September 2025
          },
        })

        console.log(`[Load Sep 2025] ✓ ${tx.description} - $${tx.amountArs.toLocaleString('es-AR')} ARS`)
        created++
      } catch (error) {
        console.error(`[Load Sep 2025] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load Sep 2025] ========================================`)
    console.log(`[Load Sep 2025] SUMMARY`)
    console.log(`[Load Sep 2025] ========================================`)
    console.log(`[Load Sep 2025] Transactions created: ${created}`)
    console.log(`[Load Sep 2025] Transactions skipped: ${skipped}`)
    console.log(`[Load Sep 2025] Month: September 2025`)
    console.log(`[Load Sep 2025] Total: $${transactions.reduce((sum, t) => sum + t.amountArs, 0).toLocaleString('es-AR')} ARS`)
  } catch (error) {
    console.error('[Load Sep 2025] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

loadSeptember2025Income()
  .then(() => {
    console.log('[Load Sep 2025] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load Sep 2025] Failed:', error)
    process.exit(1)
  })
