import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Delete duplicate 2025 income transactions for facundoesquivel01@gmail.com
 * Keeps only the first occurrence of each transaction based on description, amount, and date
 */
async function deleteDuplicate2025Income() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Delete Duplicates] Removing duplicate 2025 income transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Delete Duplicates] User not found: ${userEmail}`)
      return
    }

    console.log(`[Delete Duplicates] Found user: ${user.id} - ${user.name}`)

    // Get all 2025 income transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: 'INCOME',
        year: 2025,
      },
      orderBy: [
        { month: 'asc' },
        { date: 'asc' },
        { createdAt: 'asc' }, // Keep the first created one
      ],
    })

    console.log(`[Delete Duplicates] Found ${transactions.length} total 2025 income transactions`)

    // Group transactions by unique key (description + amount + date)
    const uniqueMap = new Map<string, string>() // key -> first transaction ID
    const duplicateIds: string[] = []

    for (const tx of transactions) {
      const key = `${tx.description}|${tx.amountArs}|${tx.date.toISOString().split('T')[0]}`
      
      if (uniqueMap.has(key)) {
        // This is a duplicate
        duplicateIds.push(tx.id)
        console.log(`[Delete Duplicates] 🔍 Duplicate found: ${tx.description} - $${tx.amountArs} (${tx.date.toISOString().split('T')[0]})`)
      } else {
        // This is the first occurrence, keep it
        uniqueMap.set(key, tx.id)
      }
    }

    console.log(`\n[Delete Duplicates] ========================================`)
    console.log(`[Delete Duplicates] ANALYSIS`)
    console.log(`[Delete Duplicates] ========================================`)
    console.log(`[Delete Duplicates] Total transactions: ${transactions.length}`)
    console.log(`[Delete Duplicates] Unique transactions: ${uniqueMap.size}`)
    console.log(`[Delete Duplicates] Duplicates to delete: ${duplicateIds.length}`)

    if (duplicateIds.length > 0) {
      // Delete duplicates
      const result = await prisma.transaction.deleteMany({
        where: {
          id: { in: duplicateIds },
        },
      })

      console.log(`\n[Delete Duplicates] ========================================`)
      console.log(`[Delete Duplicates] DELETION SUMMARY`)
      console.log(`[Delete Duplicates] ========================================`)
      console.log(`[Delete Duplicates] Duplicates deleted: ${result.count}`)
      console.log(`[Delete Duplicates] Remaining transactions: ${uniqueMap.size}`)
      console.log(`[Delete Duplicates] Cleanup completed successfully!`)
    } else {
      console.log(`\n[Delete Duplicates] ✓ No duplicates found! Database is clean.`)
    }

  } catch (error) {
    console.error('[Delete Duplicates] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

deleteDuplicate2025Income()
  .then(() => {
    console.log('[Delete Duplicates] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Delete Duplicates] Failed:', error)
    process.exit(1)
  })
