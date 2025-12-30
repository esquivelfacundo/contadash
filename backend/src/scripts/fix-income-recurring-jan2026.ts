import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Fix income recurring transactions for facundoesquivel01@gmail.com
 * 1. Delete all current INCOME recurring transactions
 * 2. Create correct INCOME recurring transactions from screenshots
 */
async function fixIncomeRecurringTransactions() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Fix Income] Starting fix for user: ${userEmail}`)

  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Fix Income] User not found: ${userEmail}`)
      return
    }

    console.log(`[Fix Income] Found user: ${user.id} - ${user.name}`)

    // Step 1: Delete all INCOME recurring transactions
    console.log('\n[Fix Income] Step 1: Deleting all INCOME recurring transactions...')
    
    const incomeRecurring = await prisma.recurringTransaction.findMany({
      where: {
        userId: user.id,
        type: 'INCOME',
      },
    })

    console.log(`[Fix Income] Found ${incomeRecurring.length} INCOME recurring transactions to delete`)

    for (const recurring of incomeRecurring) {
      // Delete generated transactions first
      const deletedGenerated = await prisma.transaction.deleteMany({
        where: { recurringTransactionId: recurring.id },
      })
      console.log(`[Fix Income]   Deleted ${deletedGenerated.count} generated transactions from: ${recurring.description}`)

      // Delete recurring transaction
      await prisma.recurringTransaction.delete({
        where: { id: recurring.id },
      })
      console.log(`[Fix Income]   Deleted recurring: ${recurring.description}`)
    }

    // Step 2: Get clients and categories
    console.log('\n[Fix Income] Step 2: Getting clients and categories...')
    
    const clients = await prisma.client.findMany({
      where: { userId: user.id },
    })

    const categories = await prisma.category.findMany({
      where: { userId: user.id },
    })

    console.log(`[Fix Income] Found ${clients.length} clients and ${categories.length} categories`)

    // Helper functions
    const findClient = (name: string) => {
      const client = clients.find(c => 
        c.company.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(c.company.toLowerCase())
      )
      return client?.id
    }

    const findCategory = (name: string) => {
      const category = categories.find(c => c.name.toLowerCase().includes(name.toLowerCase()))
      return category?.id
    }

    // Start date: January 1, 2026 (explicitly set to day 1)
    const startDate = new Date('2026-01-01T00:00:00.000Z')

    // Step 3: Create correct INCOME transactions from screenshots
    console.log('\n[Fix Income] Step 3: Creating correct INCOME recurring transactions...')

    // INCOME transactions from screenshots (ANNUAL frequency)
    const incomeTransactions: Array<{
      description: string
      client: string
      amount: number
      category: string
      frequency: 'MONTHLY' | 'YEARLY'
      isARS?: boolean
    }> = [
      // YEARLY (Annual) transactions - All in USD except where noted
      { description: 'JFC Tecno (Linode 4GB)', client: 'JFC Tecno', amount: 240.00, category: 'Servidores', frequency: 'YEARLY' as const },
      { description: 'Intercapital (TradingView API)', client: 'Intercapital', amount: 1200.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'MORFI Market (cPanel)', client: 'MORFI Market', amount: 192.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'MORFI Market (Linode 4GB)', client: 'MORFI Market', amount: 240.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'DecoHouse (Linode 2GB)', client: 'DecoHouse', amount: 240.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'Noe (Linode 2GB)', client: 'María Noel PH', amount: 120.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'ST (Linode 4GB)', client: 'Sanitarios Taragüi', amount: 240.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'CSM (Licencia QR)', client: 'Club San Martín', amount: 100.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'LOS (Linode 8GB)', client: 'Laboratorio Óptico Salas', amount: 480.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'FSE – Turnos (Bookly Custom Fields + Locations)', client: 'Franco Salón Exclusivo', amount: 35.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'FSE Academia (Tutor LMS)', client: 'Franco Salón Exclusivo', amount: 200.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'Intercapital (Linode 4GB + VPS)', client: 'Intercapital', amount: 480.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'Palermo Market (cPanel)', client: 'Palermo Gourmet Market', amount: 192.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'Palermo Market (Linode 4GB)', client: 'Palermo Gourmet Market', amount: 240.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'iCenter (Linode 4GB)', client: 'iCenter', amount: 240.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'Grupo GO (Linode 2GB)', client: 'Grupo GO', amount: 120.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'FSE – Turnos', client: 'Franco Salón Exclusivo', amount: 480.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'Colegio Informático (Linode 4GB)', client: 'Colegio Informático', amount: 240.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'Vickel Blends (Linode 2GB)', client: 'Vickel Blends', amount: 120.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'Club San Martín (Linode 4GB)', client: 'Club San Martín', amount: 432.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'Urbaterra (Linode 2GB)', client: 'Urbaterra', amount: 120.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'Tienda Amor (Linode 2GB)', client: '', amount: 120.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'ESEICA NEA (cPanel)', client: 'ESEICA NEA', amount: 192.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'ESEICA NEA (Linode 4GB)', client: 'ESEICA NEA', amount: 240.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'GEBO Consultores (Linode 2GB)', client: 'GEBO Consultores', amount: 120.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'Paraná Lodge (Linode 2GB)', client: 'Paraná Lodge', amount: 120.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'Centro Ocular Irigoyen (Linode 2GB)', client: 'Centro Ocular Irigoyen', amount: 244.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'Somos Charly (Linode 2GB)', client: 'Somos Charly', amount: 240.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'Mail Upgrade (Hostinger)', client: 'Club San Martín', amount: 110.00, category: 'Servidores', frequency: 'YEARLY' },
      { description: 'FSE Academia (Linode 4GB)', client: 'Franco Salón Exclusivo', amount: 240.00, category: 'Servidores', frequency: 'YEARLY' },
      
      // MONTHLY transactions
      { description: 'Mantenimiento', client: 'iCenter', amount: 50.00, category: 'Dev', frequency: 'MONTHLY', isARS: true },
      { description: 'Mantenimiento', client: 'Club San Martín', amount: 70311.83, category: 'Dev', frequency: 'MONTHLY', isARS: true },
      { description: 'Ads', client: 'Paraná Lodge', amount: 370.00, category: 'Marketing', frequency: 'MONTHLY', isARS: true },
      { description: 'Mantenimiento', client: 'Laboratorio Óptico Salas', amount: 80.00, category: 'Dev', frequency: 'MONTHLY' },
    ]

    let createdCount = 0

    for (const transaction of incomeTransactions) {
      const clientId = findClient(transaction.client)
      const categoryId = findCategory(transaction.category)

      if (!categoryId) {
        console.warn(`[Fix Income] ❌ Category not found: ${transaction.category} - Skipping: ${transaction.description}`)
        continue
      }

      // Skip only if client is specified but not found
      if (!clientId && transaction.client && transaction.client.trim() !== '') {
        console.warn(`[Fix Income] ❌ Client not found: "${transaction.client}" - Skipping: ${transaction.description}`)
        continue
      }

      try {
        const isARS = transaction.isARS || false
        
        await prisma.recurringTransaction.create({
          data: {
            userId: user.id,
            description: transaction.description,
            amountUsd: isARS ? 0 : transaction.amount,
            amountArs: isARS ? transaction.amount : 0,
            type: 'INCOME',
            frequency: transaction.frequency,
            categoryId: categoryId,
            ...(clientId && { clientId: clientId }),
            startDate: startDate,
            isActive: true,
            exchangeRate: 1525,
          },
        })

        const currency = isARS ? 'ARS' : 'USD'
        console.log(`[Fix Income] ✓ Created: ${transaction.description} - ${transaction.amount} ${currency} (${transaction.frequency})`)
        createdCount++
      } catch (error) {
        console.error(`[Fix Income] Error creating ${transaction.description}:`, error)
      }
    }

    console.log(`\n[Fix Income] ========================================`)
    console.log(`[Fix Income] SUMMARY`)
    console.log(`[Fix Income] ========================================`)
    console.log(`[Fix Income] INCOME recurring transactions deleted: ${incomeRecurring.length}`)
    console.log(`[Fix Income] INCOME recurring transactions created: ${createdCount}`)
    console.log(`[Fix Income] Start date: January 1, 2026`)
    console.log(`[Fix Income] Fix completed successfully!`)
  } catch (error) {
    console.error('[Fix Income] Error during fix:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixIncomeRecurringTransactions()
  .then(() => {
    console.log('[Fix Income] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Fix Income] Failed:', error)
    process.exit(1)
  })
