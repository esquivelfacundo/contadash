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

      let newAmountArs: number
      let newAmountUsd: number

      // Check if USD is a round number (likely manually entered)
      // Round numbers: 10, 20, 50, 100, 120, 150, etc.
      const isUsdRound = (amountUsd % 1 === 0) && (
        amountUsd % 10 === 0 || 
        amountUsd % 5 === 0 || 
        amountUsd < 1000
      )
      
      // Check if ARS is a round number (likely manually entered)
      // Round numbers in ARS: 1000, 5000, 10000, 50000, etc.
      const isArsRound = (amountArs % 1 === 0) && (
        amountArs % 1000 === 0 || 
        amountArs % 5000 === 0 || 
        amountArs % 10000 === 0
      )

      console.log(`[Migration]     USD ${amountUsd} is round: ${isUsdRound}`)
      console.log(`[Migration]     ARS ${amountArs} is round: ${isArsRound}`)

      // Determine which is the base currency
      // Priority 1: Check for round numbers (indicates manual entry)
      // Priority 2: Check calculation accuracy
      if (isUsdRound && !isArsRound) {
        // USD is clearly the base (round USD, calculated ARS)
        newAmountUsd = amountUsd
        newAmountArs = 0
        console.log(`[Migration]     ✓ Identified as USD base (round number: ${amountUsd} USD)`)
        
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
        
      } else if (isArsRound && !isUsdRound) {
        // ARS is clearly the base (round ARS, calculated USD)
        newAmountArs = amountArs
        newAmountUsd = 0
        console.log(`[Migration]     ✓ Identified as ARS base (round number: $${amountArs} ARS)`)
        
        // Fix all generated transactions from this recurring transaction
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
        
      } else {
        // Both are round or both are calculated - use percentage difference
        const calculatedArsFromUsd = amountUsd * exchangeRate
        const calculatedUsdFromArs = amountArs / exchangeRate
        const diffFromUsdBase = Math.abs(calculatedArsFromUsd - amountArs)
        const diffFromArsBase = Math.abs(calculatedUsdFromArs - amountUsd)
        const percentDiffFromUsdBase = (diffFromUsdBase / amountArs) * 100
        const percentDiffFromArsBase = (diffFromArsBase / amountUsd) * 100
        
        console.log(`[Migration]     Percent diff USD base: ${percentDiffFromUsdBase.toFixed(2)}%`)
        console.log(`[Migration]     Percent diff ARS base: ${percentDiffFromArsBase.toFixed(2)}%`)
        
        if (percentDiffFromUsdBase < percentDiffFromArsBase || percentDiffFromUsdBase < 1) {
          // USD is the base currency
          newAmountUsd = amountUsd
          newAmountArs = 0
          console.log(`[Migration]     ✓ Identified as USD base (by calculation: ${amountUsd} USD)`)
          
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
          console.log(`[Migration]     ✓ Identified as ARS base (by calculation: $${amountArs} ARS)`)
        
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
