import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Load January 2025 income transactions for facundoesquivel01@gmail.com
 */
async function loadJanuary2025Income() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Load Jan 2025] Loading income transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Load Jan 2025] User not found: ${userEmail}`)
      return
    }

    console.log(`[Load Jan 2025] Found user: ${user.id} - ${user.name}`)

    // Get income category (assuming "Dev" or similar exists)
    const categories = await prisma.category.findMany({ 
      where: { 
        userId: user.id,
        type: 'INCOME'
      } 
    })

    console.log(`[Load Jan 2025] Found ${categories.length} income categories`)

    // Use first income category or create a default one
    let categoryId = categories[0]?.id

    if (!categoryId) {
      console.log(`[Load Jan 2025] No income category found, creating default...`)
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

    // January 2025 income transactions
    const transactions = [
      { description: 'JFC Tecno- Ads', amountArs: 445000.00, date: new Date('2025-01-15') },
      { description: 'JFC Tecno- G Ads', amountArs: 100000.00, date: new Date('2025-01-15') },
      { description: 'JFC Tecno- Mailchimp', amountArs: 33210.00, date: new Date('2025-01-15') },
      { description: 'JFC Tecno- Renovación SW', amountArs: 295200.00, date: new Date('2025-01-15') },
      { description: 'JFC Tecno- Dominio', amountArs: 27269.00, date: new Date('2025-01-15') },
      { description: 'Somos Charly- Marketing', amountArs: 250000.00, date: new Date('2025-01-15') },
      { description: 'Sanitarios Taragui- Marketing', amountArs: 50000.00, date: new Date('2025-01-15') },
      { description: 'Palermo Market- Marketing', amountArs: 146400.00, date: new Date('2025-01-15') },
      { description: 'FSE S.R.L- Dev (1/2)', amountArs: 610000.00, date: new Date('2025-01-15') },
      { description: 'Sanitarios Taragui- Certificados', amountArs: 20000.00, date: new Date('2025-01-15') },
      { description: 'Sanitarios Taragui- Saldo pend.', amountArs: 20000.00, date: new Date('2025-01-15') },
      { description: 'CSM- Dev', amountArs: 50000.00, date: new Date('2025-01-15') },
      { description: 'Somos Charly- SW', amountArs: 146400.00, date: new Date('2025-01-15') },
      { description: 'Palermo Market- Mail', amountArs: 122000.00, date: new Date('2025-01-15') },
    ]

    let created = 0
    let skipped = 0

    for (const tx of transactions) {
      try {
        // Get exchange rate for the transaction date
        const dateStr = tx.date.toISOString().split('T')[0]
        
        await prisma.transaction.create({
          data: {
            user: { connect: { id: user.id } },
            description: tx.description,
            amountArs: tx.amountArs,
            amountUsd: 0, // Will be calculated by the system
            type: 'INCOME',
            category: { connect: { id: categoryId } },
            date: tx.date,
            month: 1, // January
            year: 2025,
            exchangeRate: 1050, // Approximate rate for January 2025
          },
        })

        console.log(`[Load Jan 2025] ✓ ${tx.description} - $${tx.amountArs.toLocaleString('es-AR')} ARS`)
        created++
      } catch (error) {
        console.error(`[Load Jan 2025] ❌ Error creating ${tx.description}:`, error)
        skipped++
      }
    }

    console.log(`\n[Load Jan 2025] ========================================`)
    console.log(`[Load Jan 2025] SUMMARY`)
    console.log(`[Load Jan 2025] ========================================`)
    console.log(`[Load Jan 2025] Transactions created: ${created}`)
    console.log(`[Load Jan 2025] Transactions skipped: ${skipped}`)
    console.log(`[Load Jan 2025] Month: January 2025`)
    console.log(`[Load Jan 2025] Total: $${transactions.reduce((sum, t) => sum + t.amountArs, 0).toLocaleString('es-AR')} ARS`)
  } catch (error) {
    console.error('[Load Jan 2025] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

loadJanuary2025Income()
  .then(() => {
    console.log('[Load Jan 2025] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Load Jan 2025] Failed:', error)
    process.exit(1)
  })
