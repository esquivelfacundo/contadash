import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Manual fix for user facundoesquivel01@gmail.com
 * Fix all recurring transactions and their generated transactions
 */
async function manualFixUserTransactions() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Manual Fix] Starting manual fix for user: ${userEmail}`)

  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Manual Fix] User not found: ${userEmail}`)
      return
    }

    console.log(`[Manual Fix] Found user: ${user.id} - ${user.name}`)

    // Get all recurring transactions for this user
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: { userId: user.id },
    })

    console.log(`[Manual Fix] Found ${recurringTransactions.length} recurring transactions`)

    let totalRecurringFixed = 0
    let totalTransactionsFixed = 0

    for (const recurring of recurringTransactions) {
      const amountArs = Number(recurring.amountArs || 0)
      const amountUsd = Number(recurring.amountUsd || 0)
      const exchangeRate = Number(recurring.exchangeRate || 1)

      console.log(`\n[Manual Fix] ========================================`)
      console.log(`[Manual Fix] Recurring Transaction: ${recurring.id}`)
      console.log(`[Manual Fix] Description: ${recurring.description}`)
      console.log(`[Manual Fix] Current amounts: ${amountUsd} USD = $${amountArs} ARS`)
      console.log(`[Manual Fix] Exchange rate: ${exchangeRate}`)

      // Determine base currency
      let baseCurrency: 'USD' | 'ARS' | 'BOTH' = 'BOTH'
      let fixedAmountUsd = amountUsd
      let fixedAmountArs = amountArs

      if (amountUsd > 0 && amountArs === 0) {
        baseCurrency = 'USD'
        console.log(`[Manual Fix] ✓ Already correct - USD base`)
      } else if (amountArs > 0 && amountUsd === 0) {
        baseCurrency = 'ARS'
        console.log(`[Manual Fix] ✓ Already correct - ARS base`)
      } else if (amountUsd > 0 && amountArs > 0) {
        // Both are set - need to determine which is base
        // Check if USD is a round number
        const isUsdRound = (amountUsd % 1 === 0) && (
          amountUsd % 10 === 0 || 
          amountUsd % 5 === 0 || 
          amountUsd < 1000
        )
        
        const isArsRound = (amountArs % 1 === 0) && (
          amountArs % 1000 === 0 || 
          amountArs % 5000 === 0 || 
          amountArs % 10000 === 0
        )

        console.log(`[Manual Fix] USD ${amountUsd} is round: ${isUsdRound}`)
        console.log(`[Manual Fix] ARS ${amountArs} is round: ${isArsRound}`)

        if (isUsdRound && !isArsRound) {
          baseCurrency = 'USD'
          fixedAmountUsd = amountUsd
          fixedAmountArs = 0
          console.log(`[Manual Fix] → Will fix to USD base (${amountUsd} USD)`)
          
          // Update recurring transaction
          await prisma.recurringTransaction.update({
            where: { id: recurring.id },
            data: {
              amountUsd: fixedAmountUsd,
              amountArs: fixedAmountArs,
            },
          })
          totalRecurringFixed++
        } else if (isArsRound && !isUsdRound) {
          baseCurrency = 'ARS'
          fixedAmountArs = amountArs
          fixedAmountUsd = 0
          console.log(`[Manual Fix] → Will fix to ARS base ($${amountArs} ARS)`)
          
          // Update recurring transaction
          await prisma.recurringTransaction.update({
            where: { id: recurring.id },
            data: {
              amountArs: fixedAmountArs,
              amountUsd: fixedAmountUsd,
            },
          })
          totalRecurringFixed++
        } else {
          // Use calculation to determine
          const calculatedArsFromUsd = amountUsd * exchangeRate
          const diffFromUsdBase = Math.abs(calculatedArsFromUsd - amountArs)
          const percentDiff = (diffFromUsdBase / amountArs) * 100

          if (percentDiff < 1) {
            baseCurrency = 'USD'
            fixedAmountUsd = amountUsd
            fixedAmountArs = 0
            console.log(`[Manual Fix] → Will fix to USD base (by calculation: ${amountUsd} USD)`)
            
            await prisma.recurringTransaction.update({
              where: { id: recurring.id },
              data: {
                amountUsd: fixedAmountUsd,
                amountArs: fixedAmountArs,
              },
            })
            totalRecurringFixed++
          } else {
            baseCurrency = 'ARS'
            fixedAmountArs = amountArs
            fixedAmountUsd = 0
            console.log(`[Manual Fix] → Will fix to ARS base (by calculation: $${amountArs} ARS)`)
            
            await prisma.recurringTransaction.update({
              where: { id: recurring.id },
              data: {
                amountArs: fixedAmountArs,
                amountUsd: fixedAmountUsd,
              },
            })
            totalRecurringFixed++
          }
        }
      }

      // Now fix all generated transactions
      const generatedTransactions = await prisma.transaction.findMany({
        where: { recurringTransactionId: recurring.id },
        orderBy: [{ year: 'asc' }, { month: 'asc' }],
      })

      console.log(`[Manual Fix] Found ${generatedTransactions.length} generated transactions`)

      if (generatedTransactions.length > 0) {
        for (const transaction of generatedTransactions) {
          const txExchangeRate = Number(transaction.exchangeRate || 1)
          let correctAmountUsd: number
          let correctAmountArs: number

          if (baseCurrency === 'USD') {
            // USD is fixed
            correctAmountUsd = fixedAmountUsd
            correctAmountArs = fixedAmountUsd * txExchangeRate
          } else if (baseCurrency === 'ARS') {
            // ARS is fixed
            correctAmountArs = fixedAmountArs
            correctAmountUsd = fixedAmountArs / txExchangeRate
          } else {
            // BOTH - shouldn't happen but keep as is
            continue
          }

          const currentUsd = Number(transaction.amountUsd)
          const currentArs = Number(transaction.amountArs)

          // Check if needs update
          if (Math.abs(currentUsd - correctAmountUsd) > 0.01 || 
              Math.abs(currentArs - correctAmountArs) > 0.01) {
            
            await prisma.transaction.update({
              where: { id: transaction.id },
              data: {
                amountUsd: correctAmountUsd,
                amountArs: correctAmountArs,
              },
            })

            console.log(`[Manual Fix]   Fixed transaction ${transaction.year}-${String(transaction.month).padStart(2, '0')}: ${currentUsd} USD → ${correctAmountUsd} USD`)
            totalTransactionsFixed++
          }
        }
      }
    }

    console.log(`\n[Manual Fix] ========================================`)
    console.log(`[Manual Fix] SUMMARY`)
    console.log(`[Manual Fix] ========================================`)
    console.log(`[Manual Fix] Recurring transactions fixed: ${totalRecurringFixed}`)
    console.log(`[Manual Fix] Generated transactions fixed: ${totalTransactionsFixed}`)
    console.log(`[Manual Fix] Manual fix completed successfully!`)
  } catch (error) {
    console.error('[Manual Fix] Error during manual fix:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the manual fix
manualFixUserTransactions()
  .then(() => {
    console.log('[Manual Fix] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Manual Fix] Failed:', error)
    process.exit(1)
  })
