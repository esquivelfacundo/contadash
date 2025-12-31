import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Fix USD values for all transactions with amountUsd = 0
 * Calculate amountUsd = amountArs / exchangeRate
 */
async function fixAllUsdValues() {
  console.log('[Fix USD] Starting to fix USD values for all transactions with amountUsd = 0...')

  try {
    // Get all transactions with amountUsd = 0
    const transactions = await prisma.transaction.findMany({
      where: {
        amountUsd: 0
      }
    })

    console.log(`[Fix USD] Found ${transactions.length} transactions with amountUsd = 0`)

    let updated = 0
    let skipped = 0
    const yearStats: Record<number, number> = {}

    for (const tx of transactions) {
      try {
        // Calculate USD value: amountArs / exchangeRate
        const amountUsd = tx.exchangeRate > 0 ? Number(tx.amountArs) / Number(tx.exchangeRate) : 0

        await prisma.transaction.update({
          where: { id: tx.id },
          data: {
            amountUsd: amountUsd
          }
        })

        yearStats[tx.year] = (yearStats[tx.year] || 0) + 1
        updated++
        
        if (updated % 50 === 0) {
          console.log(`[Fix USD] Progress: ${updated}/${transactions.length}`)
        }
      } catch (error) {
        console.error(`[Fix USD] Error updating transaction ${tx.id}:`, error)
        skipped++
      }
    }

    console.log(`\n[Fix USD] ========================================`)
    console.log(`[Fix USD] SUMMARY`)
    console.log(`[Fix USD] ========================================`)
    console.log(`[Fix USD] Total transactions updated: ${updated}`)
    console.log(`[Fix USD] Total transactions skipped: ${skipped}`)
    console.log(`\n[Fix USD] BY YEAR:`)
    Object.keys(yearStats).sort().forEach(year => {
      console.log(`[Fix USD]   ${year}: ${yearStats[Number(year)]} transactions`)
    })
    console.log(`[Fix USD] ========================================`)

  } catch (error) {
    console.error('[Fix USD] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixAllUsdValues()
  .then(() => {
    console.log('[Fix USD] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Fix USD] Failed:', error)
    process.exit(1)
  })
