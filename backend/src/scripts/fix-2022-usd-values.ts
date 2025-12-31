import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Fix USD values for 2022 transactions
 * Calculate amountUsd = amountArs / exchangeRate for all 2022 transactions
 */
async function fix2022UsdValues() {
  console.log('[Fix 2022 USD] Starting to fix USD values for 2022 transactions...')

  try {
    // Get all 2022 transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        year: 2022
      }
    })

    console.log(`[Fix 2022 USD] Found ${transactions.length} transactions for 2022`)

    let updated = 0
    let skipped = 0

    for (const tx of transactions) {
      try {
        // Calculate USD value: amountArs / exchangeRate
        const amountUsd = tx.exchangeRate > 0 ? tx.amountArs / tx.exchangeRate : 0

        await prisma.transaction.update({
          where: { id: tx.id },
          data: {
            amountUsd: amountUsd
          }
        })

        updated++
        
        if (updated % 20 === 0) {
          console.log(`[Fix 2022 USD] Progress: ${updated}/${transactions.length}`)
        }
      } catch (error) {
        console.error(`[Fix 2022 USD] Error updating transaction ${tx.id}:`, error)
        skipped++
      }
    }

    console.log(`\n[Fix 2022 USD] ========================================`)
    console.log(`[Fix 2022 USD] SUMMARY`)
    console.log(`[Fix 2022 USD] ========================================`)
    console.log(`[Fix 2022 USD] Total transactions updated: ${updated}`)
    console.log(`[Fix 2022 USD] Total transactions skipped: ${skipped}`)
    console.log(`[Fix 2022 USD] ========================================`)

  } catch (error) {
    console.error('[Fix 2022 USD] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fix2022UsdValues()
  .then(() => {
    console.log('[Fix 2022 USD] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Fix 2022 USD] Failed:', error)
    process.exit(1)
  })
