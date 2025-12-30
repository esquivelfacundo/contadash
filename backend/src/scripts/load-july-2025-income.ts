import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load July 2025 income transactions for facundoesquivel01@gmail.com
 */
async function loadJuly2025Income() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load Jul 2025] Loading income transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load Jul 2025] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load Jul 2025] Found user: ${user.id} - ${user.name}`)

    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'INCOME'
      } 
    })

    console.log(`[Load Jul 2025] Found ${categories.length} income categories`)

    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load Jul 2025] No income category found, creating default...`)
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

    // July 2025 income transactions
    const transactions = [
      { description: 'JFC Tecno- Ads', amountArs: 632676.00, date: new Date('2025-07-15') },
      { description: 'FSE- Licencia Tutor LMS', amountArs: 259000.00, date: new Date('2025-07-15') },
      { description: 'CSM- Dev S (2/2)', amountArs: 587250.00, date: new Date('2025-07-15') },
      { description: 'Intercapital- VPS', amountArs: 320400.00, date: new Date('2025-07-15') },
      { description: 'Intercapital- SW', amountArs: 320400.00, date: new Date('2025-07-15') },
      { description: 'W- Compra de luces (4/6)', amountArs: 75000.00, date: new Date('2025-07-15') },
      { description: 'Guille Dusset- RBMA (5/6)', amountArs: 16666.66, date: new Date('2025-07-15') },
      { description: 'W- Monotributo', amountArs: 36339.83, date: new Date('2025-07-15') },
      { description: 'FSE- Dev Mobbex (1/2)', amountArs: 123000.00, date: new Date('2025-07-15') },
      { description: 'FSE- Dev Mobbex (2/2)', amountArs: 132000.00, date: new Date('2025-07-15') },
      { description: 'W Studio- Dividendos', amountArs: 730000.00, date: new Date('2025-07-15') },
      { description: 'CSM- Mantenimiento', amountArs: 18806.45, date: new Date('2025-07-15') },
      { description: 'Pedro- Cafe', amountArs: 95000.00, date: new Date('2025-07-15') },
      { description: 'FSE- Sistema caja', amountArs: 486550.00, date: new Date('2025-07-15') },
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
            month: 7, // July
            year: 2025,
            exchangeRate: 1450, // Approximate rate for July 2025
          },
        })

        console.log(`[Load Jul 2025] ✓ ${tx.description} - $${tx.amountArs.toLocaleString('es-AR')} ARS`)
        created++
      } catch (error) {
        console.error(`[Load Jul 2025] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load Jul 2025] ========================================`)
    console.log(`[Load Jul 2025] SUMMARY`)
    console.log(`[Load Jul 2025] ========================================`)
    console.log(`[Load Jul 2025] Transactions created: ${created}`)
    console.log(`[Load Jul 2025] Transactions skipped: ${skipped}`)
    console.log(`[Load Jul 2025] Month: July 2025`)
    console.log(`[Load Jul 2025] Total: $${transactions.reduce((sum, t) => sum + t.amountArs, 0).toLocaleString('es-AR')} ARS`)
  } catch (error) {
    console.error('[Load Jul 2025] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

loadJuly2025Income()
  .then(() => {
    console.log('[Load Jul 2025] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load Jul 2025] Failed:', error)
    process.exit(1)
  })
