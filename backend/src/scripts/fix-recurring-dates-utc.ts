import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Fix recurring transaction dates to ensure day 1 is preserved in UTC
 * This fixes timezone issues where dates appear as day 31 or 30 instead of day 1
 */
async function fixRecurringDatesUTC() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Fix Dates] Fixing recurring transaction dates for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Fix Dates] User not found: ${userEmail}`)
      return
    }

    console.log(`[Fix Dates] Found user: ${user.id} - ${user.name}`)

    // Get all recurring transactions
    const transactions = await prisma.recurringTransaction.findMany({
      where: { userId: user.id },
      orderBy: { startDate: 'asc' },
    })

    console.log(`[Fix Dates] Found ${transactions.length} recurring transactions`)

    let updated = 0

    for (const tx of transactions) {
      const currentDate = new Date(tx.startDate)
      
      // Extract the intended date components
      const year = currentDate.getUTCFullYear()
      const month = currentDate.getUTCMonth()
      const day = currentDate.getUTCDate()
      
      // Create a new date ensuring it's day 1 in UTC
      const fixedDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
      
      // Only update if the day is not 1
      if (day !== 1) {
        await prisma.recurringTransaction.update({
          where: { id: tx.id },
          data: { startDate: fixedDate },
        })
        
        console.log(`[Fix Dates] ✓ Updated: ${tx.description}`)
        console.log(`[Fix Dates]   From: ${currentDate.toISOString()} (day ${day})`)
        console.log(`[Fix Dates]   To:   ${fixedDate.toISOString()} (day 1)`)
        updated++
      } else {
        console.log(`[Fix Dates] ✓ OK: ${tx.description} - Already day 1`)
      }
    }

    console.log(`\n[Fix Dates] ========================================`)
    console.log(`[Fix Dates] SUMMARY`)
    console.log(`[Fix Dates] ========================================`)
    console.log(`[Fix Dates] Total transactions: ${transactions.length}`)
    console.log(`[Fix Dates] Dates updated: ${updated}`)
    console.log(`[Fix Dates] Already correct: ${transactions.length - updated}`)
    console.log(`[Fix Dates] Fix completed!`)
  } catch (error) {
    console.error('[Fix Dates] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixRecurringDatesUTC()
  .then(() => {
    console.log('[Fix Dates] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Fix Dates] Failed:', error)
    process.exit(1)
  })
