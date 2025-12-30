import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script to fix existing recurring transactions that have both amountArs and amountUsd set.
 * This script will identify which is the base currency and set the other to 0.
 */
async function fixRecurringTransactions() {
  console.log('Starting migration to fix recurring transactions...')

  try {
    // Get all recurring transactions
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: {
        AND: [
          { amountArs: { gt: 0 } },
          { amountUsd: { gt: 0 } },
        ],
      },
    })

    console.log(`Found ${recurringTransactions.length} recurring transactions to fix`)

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
        console.log(`  Recurring ${recurring.id}: USD base (${amountUsd} USD)`)
      } else {
        // ARS is the base currency
        newAmountArs = amountArs
        newAmountUsd = 0
        console.log(`  Recurring ${recurring.id}: ARS base ($${amountArs} ARS)`)
      }

      // Update the recurring transaction
      await prisma.recurringTransaction.update({
        where: { id: recurring.id },
        data: {
          amountArs: newAmountArs,
          amountUsd: newAmountUsd,
        },
      })

      // Delete all generated transactions for this recurring transaction
      // They will be regenerated with correct amounts when the user navigates to those months
      const deletedCount = await prisma.transaction.deleteMany({
        where: {
          recurringTransactionId: recurring.id,
        },
      })

      console.log(`    Deleted ${deletedCount.count} generated transactions`)
    }

    console.log('Migration completed successfully!')
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
