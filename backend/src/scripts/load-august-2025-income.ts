import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load August 2025 income transactions for facundoesquivel01@gmail.com
 */
async function loadAugust2025Income() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load Aug 2025] Loading income transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load Aug 2025] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load Aug 2025] Found user: ${user.id} - ${user.name}`)

    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'INCOME'
      } 
    })

    console.log(`[Load Aug 2025] Found ${categories.length} income categories`)

    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load Aug 2025] No income category found, creating default...`)
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

    // August 2025 income transactions
    const transactions = [
      { description: 'JFC Tecno- Ads', amountArs: 635075.00, date: new Date('2025-08-15') },
      { description: 'Somos Charly- Dev', amountArs: 133500.00, date: new Date('2025-08-15') },
      { description: 'CSM- Licencia QR', amountArs: 133500.00, date: new Date('2025-08-15') },
      { description: 'W- Compra de luces (5/6)', amountArs: 75000.00, date: new Date('2025-08-15') },
      { description: 'W- Monotributo', amountArs: 63357.80, date: new Date('2025-08-15') },
      { description: 'Optica- Dev (1/3)', amountArs: 1415100.00, date: new Date('2025-08-15') },
      { description: 'CSM- Mantenimiento', amountArs: 49724.60, date: new Date('2025-08-15') },
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
            month: 8, // August
            year: 2025,
            exchangeRate: 1500, // Approximate rate for August 2025
          },
        })

        console.log(`[Load Aug 2025] ✓ ${tx.description} - $${tx.amountArs.toLocaleString('es-AR')} ARS`)
        created++
      } catch (error) {
        console.error(`[Load Aug 2025] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load Aug 2025] ========================================`)
    console.log(`[Load Aug 2025] SUMMARY`)
    console.log(`[Load Aug 2025] ========================================`)
    console.log(`[Load Aug 2025] Transactions created: ${created}`)
    console.log(`[Load Aug 2025] Transactions skipped: ${skipped}`)
    console.log(`[Load Aug 2025] Month: August 2025`)
    console.log(`[Load Aug 2025] Total: $${transactions.reduce((sum, t) => sum + t.amountArs, 0).toLocaleString('es-AR')} ARS`)
  } catch (error) {
    console.error('[Load Aug 2025] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

loadAugust2025Income()
  .then(() => {
    console.log('[Load Aug 2025] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load Aug 2025] Failed:', error)
    process.exit(1)
  })
