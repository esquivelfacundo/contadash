import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load October 2025 income transactions for facundoesquivel01@gmail.com
 */
async function loadOctober2025Income() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load Oct 2025] Loading income transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load Oct 2025] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load Oct 2025] Found user: ${user.id} - ${user.name}`)

    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'INCOME'
      } 
    })

    console.log(`[Load Oct 2025] Found ${categories.length} income categories`)

    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load Oct 2025] No income category found, creating default...`)
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

    // October 2025 income transactions
    const transactions = [
      { description: 'W- Compra de luces (6/6)', amountArs: 75000.00, date: new Date('2025-10-15') },
      { description: 'CSM- Mantenimiento', amountArs: 70311.83, date: new Date('2025-10-15') },
      { description: 'DH- Noe PH', amountArs: 183000.00, date: new Date('2025-10-15') },
      { description: 'DH- SW', amountArs: 186000.00, date: new Date('2025-10-15') },
      { description: 'Optica- Dev (3/3)', amountArs: 854000.00, date: new Date('2025-10-15') },
      { description: 'Profit TRADE (BTC/USDT)', amountArs: 384846.00, date: new Date('2025-10-15') },
      { description: 'Profit TRADE (ETH/USDT)', amountArs: 279178.83, date: new Date('2025-10-15') },
      { description: 'Grupo Fabrizzi', amountArs: 186000.00, date: new Date('2025-10-15') },
      { description: 'Parana Lodge- Ads', amountArs: 375000.00, date: new Date('2025-10-15') },
      { description: 'iCenter- Dev Stock', amountArs: 600000.00, date: new Date('2025-10-15') },
      { description: 'iCenter- Mantenimiento', amountArs: 53000.00, date: new Date('2025-10-15') },
      { description: 'iCenter- Ads', amountArs: 400000.00, date: new Date('2025-10-15') },
      { description: 'iCenter- SW Upgrade', amountArs: 116000.00, date: new Date('2025-10-15') },
      { description: 'LOS- Comisión', amountArs: 30000.00, date: new Date('2025-10-15') },
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
            month: 10, // October
            year: 2025,
            exchangeRate: 1600, // Approximate rate for October 2025
          },
        })

        console.log(`[Load Oct 2025] ✓ ${tx.description} - $${tx.amountArs.toLocaleString('es-AR')} ARS`)
        created++
      } catch (error) {
        console.error(`[Load Oct 2025] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load Oct 2025] ========================================`)
    console.log(`[Load Oct 2025] SUMMARY`)
    console.log(`[Load Oct 2025] ========================================`)
    console.log(`[Load Oct 2025] Transactions created: ${created}`)
    console.log(`[Load Oct 2025] Transactions skipped: ${skipped}`)
    console.log(`[Load Oct 2025] Month: October 2025`)
    console.log(`[Load Oct 2025] Total: $${transactions.reduce((sum, t) => sum + t.amountArs, 0).toLocaleString('es-AR')} ARS`)
  } catch (error) {
    console.error('[Load Oct 2025] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

loadOctober2025Income()
  .then(() => {
    console.log('[Load Oct 2025] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load Oct 2025] Failed:', error)
    process.exit(1)
  })
