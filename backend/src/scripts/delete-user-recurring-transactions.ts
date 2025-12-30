import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Delete all recurring transactions for user facundoesquivel01@gmail.com
 * This will also delete all generated transactions from those recurring transactions
 */
async function deleteUserRecurringTransactions() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Delete] Starting deletion for user: ${userEmail}`)

  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Delete] User not found: ${userEmail}`)
      return
    }

    console.log(`[Delete] Found user: ${user.id} - ${user.name}`)

    // Get all recurring transactions for this user
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: { userId: user.id },
    })

    console.log(`[Delete] Found ${recurringTransactions.length} recurring transactions to delete`)

    let totalGeneratedDeleted = 0
    let totalRecurringDeleted = 0

    for (const recurring of recurringTransactions) {
      console.log(`[Delete] Processing recurring: ${recurring.id} - ${recurring.description}`)

      // First, delete all generated transactions from this recurring transaction
      const deletedGenerated = await prisma.transaction.deleteMany({
        where: {
          recurringTransactionId: recurring.id,
        },
      })

      console.log(`[Delete]   Deleted ${deletedGenerated.count} generated transactions`)
      totalGeneratedDeleted += deletedGenerated.count

      // Then delete the recurring transaction itself
      await prisma.recurringTransaction.delete({
        where: { id: recurring.id },
      })

      console.log(`[Delete]   Deleted recurring transaction`)
      totalRecurringDeleted++
    }

    console.log(`\n[Delete] ========================================`)
    console.log(`[Delete] DELETION SUMMARY`)
    console.log(`[Delete] ========================================`)
    console.log(`[Delete] Recurring transactions deleted: ${totalRecurringDeleted}`)
    console.log(`[Delete] Generated transactions deleted: ${totalGeneratedDeleted}`)
    console.log(`[Delete] Deletion completed successfully!`)
  } catch (error) {
    console.error('[Delete] Error during deletion:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the deletion
deleteUserRecurringTransactions()
  .then(() => {
    console.log('[Delete] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Delete] Failed:', error)
    process.exit(1)
  })
