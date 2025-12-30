import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script to fix ALL generated transactions from recurring transactions.
 * For USD base: Keep USD fixed, recalculate ARS with each month's exchange rate
 * For ARS base: Keep ARS fixed, recalculate USD with each month's exchange rate
 */
async function fixGeneratedTransactions() {
  console.log('[Fix] Starting to fix generated transactions...')

  try {
    // Get all recurring transactions
    const recurringTransactions = await prisma.recurringTransaction.findMany()
    
    console.log(`[Fix] Found ${recurringTransactions.length} recurring transactions`)
    
    let totalUpdated = 0

    for (const recurring of recurringTransactions) {
      const amountArs = Number(recurring.amountArs || 0)
      const amountUsd = Number(recurring.amountUsd || 0)
      
      // Determine base currency
      let baseCurrency: 'USD' | 'ARS' | 'NONE' = 'NONE'
      
      if (amountUsd > 0 && amountArs === 0) {
        baseCurrency = 'USD'
      } else if (amountArs > 0 && amountUsd === 0) {
        baseCurrency = 'ARS'
      }
      
      if (baseCurrency === 'NONE') {
        console.log(`[Fix] Skipping recurring ${recurring.id} - no clear base currency`)
        continue
      }
      
      console.log(`[Fix] Processing recurring ${recurring.id} - Base: ${baseCurrency}`)
      
      // Get all generated transactions
      const generatedTransactions = await prisma.transaction.findMany({
        where: { recurringTransactionId: recurring.id },
      })
      
      console.log(`[Fix]   Found ${generatedTransactions.length} generated transactions`)
      
      for (const transaction of generatedTransactions) {
        const txExchangeRate = Number(transaction.exchangeRate || 1)
        
        if (baseCurrency === 'USD') {
          // USD is fixed, recalculate ARS
          const correctAmountUsd = amountUsd
          const correctAmountArs = amountUsd * txExchangeRate
          
          // Only update if values are different
          if (Number(transaction.amountUsd) !== correctAmountUsd || 
              Number(transaction.amountArs) !== correctAmountArs) {
            await prisma.transaction.update({
              where: { id: transaction.id },
              data: {
                amountUsd: correctAmountUsd,
                amountArs: correctAmountArs,
              },
            })
            totalUpdated++
          }
        } else if (baseCurrency === 'ARS') {
          // ARS is fixed, recalculate USD
          const correctAmountArs = amountArs
          const correctAmountUsd = amountArs / txExchangeRate
          
          // Only update if values are different
          if (Number(transaction.amountArs) !== correctAmountArs || 
              Number(transaction.amountUsd) !== correctAmountUsd) {
            await prisma.transaction.update({
              where: { id: transaction.id },
              data: {
                amountArs: correctAmountArs,
                amountUsd: correctAmountUsd,
              },
            })
            totalUpdated++
          }
        }
      }
    }

    console.log(`[Fix] Updated ${totalUpdated} generated transactions`)
    console.log('[Fix] Fix completed successfully!')
  } catch (error) {
    console.error('[Fix] Error during fix:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixGeneratedTransactions()
  .then(() => {
    console.log('[Fix] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Fix] Failed:', error)
    process.exit(1)
  })
