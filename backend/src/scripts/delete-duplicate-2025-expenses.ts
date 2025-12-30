import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Delete duplicate 2025 expense transactions for facundoesquivel01@gmail.com
 * Keeps only the first occurrence of each transaction based on description, amount, and date
 */
async function deleteDuplicate2025Expenses() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Delete 2025 Expense Duplicates] Removing duplicate 2025 expense transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Delete 2025 Expense Duplicates] User not found: ${userEmail}`)
      return
    }

    console.log(`[Delete 2025 Expense Duplicates] Found user: ${user.id} - ${user.name}`)

    // Get all 2025 expense transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: 'EXPENSE',
        year: 2025,
      },
      orderBy: [
        { month: 'asc' },
        { date: 'asc' },
        { createdAt: 'asc' }, // Keep the first created one
      ],
    })

    console.log(`[Delete 2025 Expense Duplicates] Found ${transactions.length} total 2025 expense transactions`)

    // Group transactions by unique key (description + amount + date)
    const uniqueMap = new Map<string, string>() // key -> first transaction ID
    const duplicateIds: string[] = []

    for (const tx of transactions) {
      const key = `${tx.description}|${tx.amountArs}|${tx.date.toISOString().split('T')[0]}`
      
      if (uniqueMap.has(key)) {
        // This is a duplicate
        duplicateIds.push(tx.id)
        console.log(`[Delete 2025 Expense Duplicates] 🔍 Duplicate found: ${tx.description} - $${tx.amountArs} (${tx.date.toISOString().split('T')[0]})`)
      } else {
        // This is the first occurrence, keep it
        uniqueMap.set(key, tx.id)
      }
    }

    console.log(`\n[Delete 2025 Expense Duplicates] ========================================`)
    console.log(`[Delete 2025 Expense Duplicates] ANALYSIS`)
    console.log(`[Delete 2025 Expense Duplicates] ========================================`)
    console.log(`[Delete 2025 Expense Duplicates] Total transactions: ${transactions.length}`)
    console.log(`[Delete 2025 Expense Duplicates] Unique transactions: ${uniqueMap.size}`)
    console.log(`[Delete 2025 Expense Duplicates] Duplicates to delete: ${duplicateIds.length}`)

    if (duplicateIds.length > 0) {
      // Delete duplicates
      const result = await prisma.transaction.deleteMany({
        where: {
          id: { in: duplicateIds },
        },
      })

      console.log(`\n[Delete 2025 Expense Duplicates] ========================================`)
      console.log(`[Delete 2025 Expense Duplicates] DELETION SUMMARY`)
      console.log(`[Delete 2025 Expense Duplicates] ========================================`)
      console.log(`[Delete 2025 Expense Duplicates] Duplicates deleted: ${result.count}`)
      console.log(`[Delete 2025 Expense Duplicates] Remaining transactions: ${uniqueMap.size}`)
      console.log(`[Delete 2025 Expense Duplicates] Cleanup completed successfully!`)
    } else {
      console.log(`\n[Delete 2025 Expense Duplicates] ✓ No duplicates found! Database is clean.`)
    }

  } catch (error) {
    console.error('[Delete 2025 Expense Duplicates] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

deleteDuplicate2025Expenses()
  .then(() => {
    console.log('[Delete 2025 Expense Duplicates] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Delete 2025 Expense Duplicates] Failed:', error)
    process.exit(1)
  })
