import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load June 2025 income transactions for facundoesquivel01@gmail.com
 */
async function loadJune2025Income() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load Jun 2025] Loading income transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load Jun 2025] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load Jun 2025] Found user: ${user.id} - ${user.name}`)

    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'INCOME'
      } 
    })

    console.log(`[Load Jun 2025] Found ${categories.length} income categories`)

    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load Jun 2025] No income category found, creating default...`)
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

    // June 2025 income transactions
    const transactions = [
      { description: 'JFC Tecno- Ads', amountArs: 524500.00, date: new Date('2025-06-15') },
      { description: 'W- Monotributo', amountArs: 36339.83, date: new Date('2025-06-15') },
      { description: 'Guille Dusset- RBMA (4/6)', amountArs: 16666.66, date: new Date('2025-06-15') },
      { description: 'TA- Mantenimiento', amountArs: 39000.00, date: new Date('2025-06-15') },
      { description: 'iCenter- Dev', amountArs: 139800.00, date: new Date('2025-06-15') },
      { description: 'Palermo Market- SW', amountArs: 145800.00, date: new Date('2025-06-15') },
      { description: 'Palermo Market- cPanel', amountArs: 233280.00, date: new Date('2025-06-15') },
      { description: 'W- Compra de luces (3/6)', amountArs: 75000.00, date: new Date('2025-06-15') },
      { description: 'FSE- Desarrollo (2/2)', amountArs: 488430.00, date: new Date('2025-06-15') },
      { description: 'Farmacentro (2/2)', amountArs: 1200000.00, date: new Date('2025-06-15') },
      { description: 'CSM- Dev S (1/2)', amountArs: 531000.00, date: new Date('2025-06-15') },
      { description: 'JFC Tecno- G Ads', amountArs: 100000.00, date: new Date('2025-06-15') },
      { description: 'CSM- Dev WABA', amountArs: 413000.00, date: new Date('2025-06-15') },
      { description: 'MC- SW', amountArs: 143400.00, date: new Date('2025-06-15') },
      { description: 'Aporte EE', amountArs: 500000.00, date: new Date('2025-06-15') },
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
            month: 6, // June
            year: 2025,
            exchangeRate: 1400, // Approximate rate for June 2025
          },
        })

        console.log(`[Load Jun 2025] ✓ ${tx.description} - $${tx.amountArs.toLocaleString('es-AR')} ARS`)
        created++
      } catch (error) {
        console.error(`[Load Jun 2025] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load Jun 2025] ========================================`)
    console.log(`[Load Jun 2025] SUMMARY`)
    console.log(`[Load Jun 2025] ========================================`)
    console.log(`[Load Jun 2025] Transactions created: ${created}`)
    console.log(`[Load Jun 2025] Transactions skipped: ${skipped}`)
    console.log(`[Load Jun 2025] Month: June 2025`)
    console.log(`[Load Jun 2025] Total: $${transactions.reduce((sum, t) => sum + t.amountArs, 0).toLocaleString('es-AR')} ARS`)
  } catch (error) {
    console.error('[Load Jun 2025] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

loadJune2025Income()
  .then(() => {
    console.log('[Load Jun 2025] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load Jun 2025] Failed:', error)
    process.exit(1)
  })
