import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Delete ALL income recurring transactions for facundoesquivel01@gmail.com
 * Clean slate before creating new ones
 */
async function deleteAllIncomeRecurring() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Delete Income] Deleting all INCOME recurring transactions for: ${userEmail}`)

  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Delete Income] User not found: ${userEmail}`)
      return
    }

    console.log(`[Delete Income] Found user: ${user.id} - ${user.name}`)

    // Get all INCOME recurring transactions
    const incomeRecurring = await prisma.recurringTransaction.findMany({
      where: {
        userId: user.id,
        type: 'INCOME',
      },
    })

    console.log(`[Delete Income] Found ${incomeRecurring.length} INCOME recurring transactions to delete`)

    let totalGeneratedDeleted = 0
    let totalRecurringDeleted = 0

    for (const recurring of incomeRecurring) {
      console.log(`[Delete Income] Processing: ${recurring.description}`)

      // Delete all generated transactions first
      const deletedGenerated = await prisma.transaction.deleteMany({
        where: {
          recurringTransactionId: recurring.id,
        },
      })

      console.log(`[Delete Income]   Deleted ${deletedGenerated.count} generated transactions`)
      totalGeneratedDeleted += deletedGenerated.count

      // Delete the recurring transaction
      await prisma.recurringTransaction.delete({
        where: { id: recurring.id },
      })

      console.log(`[Delete Income]   Deleted recurring transaction`)
      totalRecurringDeleted++
    }

    console.log(`\n[Delete Income] ========================================`)
    console.log(`[Delete Income] DELETION SUMMARY`)
    console.log(`[Delete Income] ========================================`)
    console.log(`[Delete Income] INCOME recurring transactions deleted: ${totalRecurringDeleted}`)
    console.log(`[Delete Income] Generated transactions deleted: ${totalGeneratedDeleted}`)
    console.log(`[Delete Income] Deletion completed successfully!`)
  } catch (error) {
    console.error('[Delete Income] Error during deletion:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the deletion
deleteAllIncomeRecurring()
  .then(() => {
    console.log('[Delete Income] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Delete Income] Failed:', error)
    process.exit(1)
  })
