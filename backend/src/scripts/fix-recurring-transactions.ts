import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script to fix existing recurring transactions that have both amountArs and amountUsd set.
 * This script will identify which is the base currency and set the other to 0.
 * Also deletes all generated transactions to force regeneration with correct amounts.
 * This script is idempotent and safe to run multiple times.
 */
async function fixRecurringTransactions() {
  console.log('[Migration] Checking for recurring transactions to fix...')

  try {
    // First, delete ALL generated transactions from recurring transactions
    // This ensures they regenerate with correct amounts
    console.log('[Migration] Deleting all generated transactions from recurring transactions...')
    const allDeletedCount = await prisma.transaction.deleteMany({
      where: {
        recurringTransactionId: { not: null },
      },
    })
    console.log(`[Migration] Deleted ${allDeletedCount.count} generated transactions`)

    // Get all recurring transactions that have both amounts set (the problem)
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: {
        AND: [
          { amountArs: { gt: 0 } },
          { amountUsd: { gt: 0 } },
        ],
      },
    })

    if (recurringTransactions.length === 0) {
      console.log('[Migration] No recurring transactions need fixing.')
      return
    }

    console.log(`[Migration] Found ${recurringTransactions.length} recurring transactions to fix`)

    for (const recurring of recurringTransactions) {
      const amountArs = Number(recurring.amountArs)
      const amountUsd = Number(recurring.amountUsd)
      const exchangeRate = Number(recurring.exchangeRate)

      // Determine which is the base currency by checking which one was likely entered
      // If amountArs / exchangeRate ≈ amountUsd, then USD is likely the base
      // If amountUsd * exchangeRate ≈ amountArs, then USD is likely the base
      const calculatedArsFromUsd = amountUsd * exchangeRate
      const calculatedUsdFromArs = amountArs / exchangeRate

      const diffFromUsdBase = Math.abs(calculatedArsFromUsd - amountArs)
      const diffFromArsBase = Math.abs(calculatedUsdFromArs - amountUsd)

      let newAmountArs: number
      let newAmountUsd: number

      if (diffFromUsdBase < diffFromArsBase) {
        // USD is the base currency
        newAmountUsd = amountUsd
        newAmountArs = 0
        console.log(`[Migration]   Fixed: ${recurring.id} - USD base (${amountUsd} USD)`)
      } else {
        // ARS is the base currency
        newAmountArs = amountArs
        newAmountUsd = 0
        console.log(`[Migration]   Fixed: ${recurring.id} - ARS base ($${amountArs} ARS)`)
      }

      // Update the recurring transaction
      await prisma.recurringTransaction.update({
        where: { id: recurring.id },
        data: {
          amountArs: newAmountArs,
          amountUsd: newAmountUsd,
        },
      })
    }

    console.log('[Migration] Recurring transactions migration completed successfully!')
  } catch (error) {
    console.error('Error during migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
fixRecurringTransactions()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
