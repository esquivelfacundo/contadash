import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Create all recurring transactions for facundoesquivel01@gmail.com
 * Starting from January 2026
 */
async function createRecurringTransactions() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Create] Creating recurring transactions for: ${userEmail}`)

  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Create] User not found: ${userEmail}`)
      return
    }

    console.log(`[Create] Found user: ${user.id} - ${user.name}`)

    // Get all clients
    const clients = await prisma.client.findMany({
      where: { userId: user.id },
    })

    console.log(`[Create] Found ${clients.length} clients`)

    // Get all categories
    const categories = await prisma.category.findMany({
      where: { userId: user.id },
    })

    console.log(`[Create] Found ${categories.length} categories`)

    // Helper function to find client by name
    const findClient = (name: string) => {
      const client = clients.find(c => c.company.toLowerCase().includes(name.toLowerCase()))
      return client?.id
    }

    // Helper function to find category by name
    const findCategory = (name: string) => {
      const category = categories.find(c => c.name.toLowerCase().includes(name.toLowerCase()))
      return category?.id
    }

    // Start date: January 1, 2026
    const startDate = new Date(2026, 0, 1)

    // INGRESOS (INCOME)
    const incomeTransactions = [
      { description: 'JFC Tomas (Justo 4GB)', client: 'JFC Tomas', amount: 193.00, category: 'Servicios' },
      { description: 'Inmobiliaria (TotalPlayter API)', client: 'Inmobiliaria', amount: 1125.00, category: 'Servicios' },
      { description: 'MOSER Market (iPhone)', client: 'MOSER Market', amount: 737.00, category: 'Servicios' },
      { description: 'MOSER Market (Jurado 4GB)', client: 'MOSER Market', amount: 545.00, category: 'Servicios' },
      { description: 'Doxihouse (Jurado 2GB)', client: 'Doxihouse', amount: 483.00, category: 'Servicios' },
      { description: 'Rua 4 (Justo 2GB)', client: 'Rua 4', amount: 193.00, category: 'Servicios' },
      { description: 'ST (Jurado 4GB)', client: 'ST', amount: 483.00, category: 'Servicios' },
      { description: 'CSM (4 Jurado VPS)', client: 'CSM', amount: 193.00, category: 'Servicios' },
      { description: 'LGS (Jurado 4GB)', client: 'LGS', amount: 483.00, category: 'Servicios' },
      { description: 'ESE- Tomas (Roadly Custom EMEA + Luccianna)', client: 'ESE- Tomas', amount: 93.00, category: 'Servicios' },
      { description: 'PSE Academia (Titan 1.8G)', client: 'PSE Academia', amount: 193.00, category: 'Servicios' },
      { description: 'Inmobiliaria (4 Jurado VPS)', client: 'Inmobiliaria', amount: 483.00, category: 'Servicios' },
      { description: 'Palermo Market (3 Jurado 4GB)', client: 'Palermo Market', amount: 367.00, category: 'Servicios' },
      { description: 'iCamper (Jurado 4GB)', client: 'iCamper', amount: 367.00, category: 'Servicios' },
      { description: 'Nueva Guarnici Jurado', client: 'Nueva Guarnici Jurado', amount: 116.00, category: 'Servicios' },
      { description: 'Grupo GO (Jurado 2GB)', client: 'Grupo GO', amount: 193.00, category: 'Servicios' },
      { description: 'PGE Tomas', client: 'PGE Tomas', amount: 483.00, category: 'Servicios' },
      { description: 'Colegio Informático (Jurado 4GB)', client: 'Colegio Informático', amount: 367.00, category: 'Servicios' },
      { description: 'Vidal Benda (Jurado 2GB)', client: 'Vidal Benda', amount: 193.00, category: 'Servicios' },
      { description: 'Club San Martin (Jurado 4GB)', client: 'Club San Martin', amount: 367.00, category: 'Servicios' },
      { description: 'Utalema (Jurado 2GB)', client: 'Utalema', amount: 193.00, category: 'Servicios' },
      { description: 'Tennis Amer (Jurado 2GB)', client: 'Tennis Amer', amount: 193.00, category: 'Servicios' },
      { description: 'ESECA NEA (iPhone)', client: 'ESECA NEA', amount: 192.00, category: 'Servicios' },
      { description: 'ESECA NEA (Jurado 4GB)', client: 'ESECA NEA', amount: 483.00, category: 'Servicios' },
      { description: 'GESDI Consultores (Jurado 2GB)', client: 'GESDI Consultores', amount: 193.00, category: 'Servicios' },
      { description: 'Parana Lodge (Jurado 2GB)', client: 'Parana Lodge', amount: 193.00, category: 'Servicios' },
      { description: 'Centro Ocular (Esperon Jurado 2GB)', client: 'Centro Ocular Esperon', amount: 193.00, category: 'Servicios' },
      { description: 'Somos Charity (Jurado 2GB)', client: 'Somos Charity', amount: 483.00, category: 'Servicios' },
      { description: 'Mart (Upgrade Hostinger)', client: 'Mart', amount: 193.00, category: 'Servicios' },
      { description: 'PSE Academia (3 Jurado 4GB)', client: 'PSE Academia', amount: 367.00, category: 'Servicios' },
    ]

    // EGRESOS (EXPENSES)
    const expenseTransactions = [
      { description: 'Expensas', amount: 75.00, category: 'Alquiler' },
      { description: 'Cuota', amount: 33.00, category: 'Otro' },
      { description: 'Agustin P Justo 1991', amount: 103.00, category: 'Alquiler' },
    ]

    let createdCount = 0

    // Create INCOME transactions
    console.log('\n[Create] Creating INCOME transactions...')
    for (const transaction of incomeTransactions) {
      const clientId = findClient(transaction.client)
      const categoryId = findCategory(transaction.category)

      if (!clientId) {
        console.warn(`[Create] Client not found: ${transaction.client} - Skipping`)
        continue
      }

      if (!categoryId) {
        console.warn(`[Create] Category not found: ${transaction.category} - Skipping`)
        continue
      }

      try {
        await prisma.recurringTransaction.create({
          data: {
            userId: user.id,
            description: transaction.description,
            amountUsd: transaction.amount,
            amountArs: 0,
            type: 'INCOME',
            frequency: 'MONTHLY',
            categoryId: categoryId,
            clientId: clientId,
            startDate: startDate,
            isActive: true,
            exchangeRate: 1525, // Current rate for reference
          },
        })

        console.log(`[Create] ✓ Created: ${transaction.description} - $${transaction.amount} USD`)
        createdCount++
      } catch (error) {
        console.error(`[Create] Error creating ${transaction.description}:`, error)
      }
    }

    // Create EXPENSE transactions
    console.log('\n[Create] Creating EXPENSE transactions...')
    for (const transaction of expenseTransactions) {
      const categoryId = findCategory(transaction.category)

      if (!categoryId) {
        console.warn(`[Create] Category not found: ${transaction.category} - Skipping`)
        continue
      }

      try {
        await prisma.recurringTransaction.create({
          data: {
            userId: user.id,
            description: transaction.description,
            amountArs: transaction.amount,
            amountUsd: 0,
            type: 'EXPENSE',
            frequency: 'MONTHLY',
            categoryId: categoryId,
            startDate: startDate,
            isActive: true,
            exchangeRate: 1525,
          },
        })

        console.log(`[Create] ✓ Created: ${transaction.description} - $${transaction.amount} ARS`)
        createdCount++
      } catch (error) {
        console.error(`[Create] Error creating ${transaction.description}:`, error)
      }
    }

    console.log(`\n[Create] ========================================`)
    console.log(`[Create] SUMMARY`)
    console.log(`[Create] ========================================`)
    console.log(`[Create] Total recurring transactions created: ${createdCount}`)
    console.log(`[Create] Start date: January 1, 2026`)
    console.log(`[Create] Creation completed successfully!`)
  } catch (error) {
    console.error('[Create] Error during creation:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the creation
createRecurringTransactions()
  .then(() => {
    console.log('[Create] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Create] Failed:', error)
    process.exit(1)
  })
