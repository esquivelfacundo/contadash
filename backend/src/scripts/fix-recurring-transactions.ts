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
    // Get all recurring transactions that have both amounts set (the problem)
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: {
        AND: [
          { amountArs: { gt: 0 } },
          { amountUsd: { gt: 0 } },
        ],
      },
    })

    console.log(`[Migration] Found ${recurringTransactions.length} recurring transactions with both amounts set`)

    let totalFixed = 0
    let totalTransactionsUpdated = 0

    for (const recurring of recurringTransactions) {
      const amountArs = Number(recurring.amountArs)
      const amountUsd = Number(recurring.amountUsd)
      const exchangeRate = Number(recurring.exchangeRate)

      console.log(`[Migration]   Analyzing recurring ${recurring.id}:`)
      console.log(`[Migration]     Current: ${amountUsd} USD = $${amountArs} ARS (rate: ${exchangeRate})`)

      // Determine which is the base currency by checking which one was likely entered
      // If amountUsd * exchangeRate ≈ amountArs, then USD is the base
      // If amountArs / exchangeRate ≈ amountUsd, then ARS is the base
      const calculatedArsFromUsd = amountUsd * exchangeRate
      const calculatedUsdFromArs = amountArs / exchangeRate

      const diffFromUsdBase = Math.abs(calculatedArsFromUsd - amountArs)
      const diffFromArsBase = Math.abs(calculatedUsdFromArs - amountUsd)

      console.log(`[Migration]     If USD base: ${amountUsd} * ${exchangeRate} = ${calculatedArsFromUsd} (diff: ${diffFromUsdBase})`)
      console.log(`[Migration]     If ARS base: ${amountArs} / ${exchangeRate} = ${calculatedUsdFromArs} (diff: ${diffFromArsBase})`)

      let newAmountArs: number
      let newAmountUsd: number

      // Use percentage difference for better accuracy
      const percentDiffFromUsdBase = (diffFromUsdBase / amountArs) * 100
      const percentDiffFromArsBase = (diffFromArsBase / amountUsd) * 100

      console.log(`[Migration]     Percent diff USD base: ${percentDiffFromUsdBase.toFixed(2)}%`)
      console.log(`[Migration]     Percent diff ARS base: ${percentDiffFromArsBase.toFixed(2)}%`)

      if (percentDiffFromUsdBase < percentDiffFromArsBase || percentDiffFromUsdBase < 1) {
        // USD is the base currency
        newAmountUsd = amountUsd
        newAmountArs = 0
        console.log(`[Migration]     ✓ Identified as USD base (${amountUsd} USD)`)
        
        // Fix all generated transactions from this recurring transaction
        // Update USD amount to match the recurring transaction's USD amount
        // Recalculate ARS based on each transaction's exchange rate
        const generatedTransactions = await prisma.transaction.findMany({
          where: { recurringTransactionId: recurring.id },
        })
        
        for (const transaction of generatedTransactions) {
          const txExchangeRate = Number(transaction.exchangeRate)
          const correctAmountUsd = amountUsd
          const correctAmountArs = amountUsd * txExchangeRate
          
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              amountUsd: correctAmountUsd,
              amountArs: correctAmountArs,
            },
          })
          totalTransactionsUpdated++
        }
        
        console.log(`[Migration]     Updated ${generatedTransactions.length} generated transactions`)
        
      } else {
        // ARS is the base currency
        newAmountArs = amountArs
        newAmountUsd = 0
        console.log(`[Migration]     ✓ Identified as ARS base ($${amountArs} ARS)`)
        
        // Fix all generated transactions from this recurring transaction
        // Update ARS amount to match the recurring transaction's ARS amount
        // Recalculate USD based on each transaction's exchange rate
        const generatedTransactions = await prisma.transaction.findMany({
          where: { recurringTransactionId: recurring.id },
        })
        
        for (const transaction of generatedTransactions) {
          const txExchangeRate = Number(transaction.exchangeRate)
          const correctAmountArs = amountArs
          const correctAmountUsd = amountArs / txExchangeRate
          
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              amountArs: correctAmountArs,
              amountUsd: correctAmountUsd,
            },
          })
          totalTransactionsUpdated++
        }
        
        console.log(`[Migration]     Updated ${generatedTransactions.length} generated transactions`)
      }

      // Update the recurring transaction
      await prisma.recurringTransaction.update({
        where: { id: recurring.id },
        data: {
          amountArs: newAmountArs,
          amountUsd: newAmountUsd,
        },
      })
      
      totalFixed++
    }

    console.log(`[Migration] Fixed ${totalFixed} recurring transactions`)
    console.log(`[Migration] Updated ${totalTransactionsUpdated} generated transactions`)
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
