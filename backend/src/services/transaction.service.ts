import { prisma } from '../config/database'
import { CreateTransactionInput, UpdateTransactionInput, TransactionFilters } from '../validations/transaction.validation'
import { NotFoundError, ForbiddenError } from '../utils/errors'
import { Prisma } from '@prisma/client'

export async function getTransactions(userId: string, filters: TransactionFilters) {
  const page = parseInt(filters.page || '1')
  const limit = Math.min(parseInt(filters.limit || '50'), 100)
  const skip = (page - 1) * limit

  // Auto-generate recurring transactions for the requested month
  if (filters.month && filters.year) {
    await autoGenerateRecurringTransactions(userId, parseInt(filters.month), parseInt(filters.year))
  }

  // Build where clause
  const where: Prisma.TransactionWhereInput = {
    userId,
  }

  if (filters.type) {
    where.type = filters.type
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId
  }

  if (filters.clientId) {
    where.clientId = filters.clientId
  }

  if (filters.startDate || filters.endDate) {
    where.date = {}
    if (filters.startDate) {
      where.date.gte = new Date(filters.startDate)
    }
    if (filters.endDate) {
      where.date.lte = new Date(filters.endDate)
    }
  }

  if (filters.month && filters.year) {
    where.month = parseInt(filters.month)
    where.year = parseInt(filters.year)
  }

  if (filters.search) {
    where.OR = [
      { description: { contains: filters.search, mode: 'insensitive' } },
      { notes: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  if (filters.tags) {
    const tagArray = filters.tags.split(',').map(t => t.trim()).filter(Boolean)
    if (tagArray.length > 0) {
      where.tags = {
        hasSome: tagArray
      }
    }
  }

  // Get transactions with relations
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
            icon: true,
          },
        },
        client: {
          select: {
            id: true,
            company: true,
            responsible: true,
          },
        },
        creditCard: {
          select: {
            id: true,
            name: true,
          },
        },
        bankAccount: {
          select: {
            id: true,
            name: true,
            bank: true,
            currency: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ])

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getTransactionById(userId: string, id: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      category: true,
      client: true,
    },
  })

  if (!transaction) {
    throw new NotFoundError('Transaction not found')
  }

  if (transaction.userId !== userId) {
    throw new ForbiddenError('Access denied')
  }

  return transaction
}

export async function createTransaction(userId: string, data: CreateTransactionInput) {
  console.log('🔵 Creating transaction:', {
    userId,
    categoryId: data.categoryId,
    creditCardId: data.creditCardId,
    paymentMethod: data.paymentMethod,
    bankAccountId: data.bankAccountId,
    amountArs: data.amountArs,
    amountUsd: data.amountUsd,
  })

  // Verify category belongs to user
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  })

  if (!category || category.userId !== userId) {
    throw new NotFoundError('Category not found')
  }

  // Verify client belongs to user (if provided)
  if (data.clientId) {
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    })

    if (!client || client.userId !== userId) {
      throw new NotFoundError('Client not found')
    }
  }

  // Verify bank account belongs to user (if provided)
  if (data.bankAccountId) {
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id: data.bankAccountId },
    })

    if (!bankAccount || bankAccount.userId !== userId) {
      throw new NotFoundError('Bank account not found')
    }
  }

  // Extract month and year from date
  const date = new Date(data.date)
  const month = date.getUTCMonth() + 1
  const year = date.getUTCFullYear()

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      date,
      month,
      year,
      type: data.type,
      categoryId: data.categoryId,
      clientId: data.clientId,
      creditCardId: data.creditCardId,
      paymentMethod: data.paymentMethod,
      bankAccountId: data.bankAccountId,
      description: data.description,
      amountArs: data.amountArs,
      amountUsd: data.amountUsd,
      exchangeRate: data.exchangeRate,
      notes: data.notes,
    },
    include: {
      category: true,
      client: true,
      creditCard: true,
      bankAccount: true,
    },
  })

  console.log('✅ Transaction created:', {
    id: transaction.id,
    creditCardId: transaction.creditCardId,
    paymentMethod: transaction.paymentMethod,
    bankAccountId: transaction.bankAccountId,
    amountArs: transaction.amountArs,
  })

  return transaction
}

export async function updateTransaction(
  userId: string,
  id: string,
  data: UpdateTransactionInput
) {
  // Verify transaction exists and belongs to user
  const existing = await getTransactionById(userId, id)

  // Verify category if provided
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    })

    if (!category || category.userId !== userId) {
      throw new NotFoundError('Category not found')
    }
  }

  // Verify client if provided
  if (data.clientId) {
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    })

    if (!client || client.userId !== userId) {
      throw new NotFoundError('Client not found')
    }
  }

  // Update month and year if date changed
  let month = existing.month
  let year = existing.year

  if (data.date) {
    const date = new Date(data.date)
    month = date.getUTCMonth() + 1
    year = date.getUTCFullYear()
  }

  // If transaction is from a recurring transaction, mark it as manually modified
  const isManuallyModified = existing.recurringTransactionId ? true : existing.isManuallyModified

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
      month,
      year,
      isManuallyModified,
    },
    include: {
      category: true,
      client: true,
      creditCard: true,
      bankAccount: true,
    },
  })

  return transaction
}

export async function deleteTransaction(userId: string, id: string) {
  // Verify transaction exists and belongs to user
  await getTransactionById(userId, id)

  await prisma.transaction.delete({
    where: { id },
  })

  return { message: 'Transaction deleted successfully' }
}

export async function getTransactionStats(userId: string, month?: number, year?: number) {
  const where: Prisma.TransactionWhereInput = { userId }

  if (month && year) {
    where.month = month
    where.year = year
  } else if (year) {
    // Filter by year only if month is not provided
    where.year = year
  }

  const [income, expense, count] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...where, type: 'INCOME' },
      _sum: { amountArs: true, amountUsd: true },
    }),
    prisma.transaction.aggregate({
      where: { ...where, type: 'EXPENSE' },
      _sum: { amountArs: true, amountUsd: true },
    }),
    prisma.transaction.count({ where }),
  ])

  const totalIncomeArs = Number(income._sum.amountArs) || 0
  const totalIncomeUsd = Number(income._sum.amountUsd) || 0
  const totalExpenseArs = Number(expense._sum.amountArs) || 0
  const totalExpenseUsd = Number(expense._sum.amountUsd) || 0

  return {
    income: {
      ars: totalIncomeArs,
      usd: totalIncomeUsd,
    },
    expense: {
      ars: totalExpenseArs,
      usd: totalExpenseUsd,
    },
    balance: {
      ars: totalIncomeArs - totalExpenseArs,
      usd: totalIncomeUsd - totalExpenseUsd,
    },
    count,
  }
}

/**
 * Get transactions for a month including credit card placeholders
 */
export async function getTransactionsWithCreditCardPlaceholders(
  userId: string,
  month: number,
  year: number
) {
  // Get regular transactions
  const result = await getTransactions(userId, {
    page: '1',
    month: month.toString(),
    year: year.toString(),
    limit: '1000',
  })

  // Get active credit cards
  const creditCards = await prisma.creditCard.findMany({
    where: {
      userId,
      isActive: true,
    },
  })

  // Find or get "Deuda" category for placeholders
  let deudaCategory = await prisma.category.findFirst({
    where: {
      userId,
      name: 'Deuda',
      type: 'EXPENSE',
    },
  })

  // If no "Deuda" category exists, use any expense category as fallback
  if (!deudaCategory) {
    deudaCategory = await prisma.category.findFirst({
      where: {
        userId,
        type: 'EXPENSE',
      },
    })
  }

  // Find credit cards that don't have a transaction this month
  const placeholders: any[] = []
  
  console.log('🔍 Checking credit cards for placeholders:', {
    totalCards: creditCards.length,
    totalTransactions: result.transactions.length,
    transactionsWithCards: result.transactions.filter((t: any) => t.creditCardId).length,
  })
  
  for (const card of creditCards) {
    const hasTransaction = result.transactions.some(
      (t: any) => t.creditCardId === card.id
    )
    
    console.log(`🔍 Card ${card.name} (${card.id}):`, {
      hasTransaction,
      matchingTransactions: result.transactions.filter((t: any) => t.creditCardId === card.id).length,
    })

    if (!hasTransaction && deudaCategory) {
      // Create placeholder
      placeholders.push({
        id: `placeholder-${card.id}-${month}-${year}`,
        type: 'EXPENSE',
        date: new Date(year, month - 1, card.closingDay || 1),
        month,
        year,
        categoryId: deudaCategory.id,
        category: {
          id: deudaCategory.id,
          name: deudaCategory.name,
          icon: deudaCategory.icon,
          color: deudaCategory.color,
          type: deudaCategory.type,
        },
        clientId: null,
        creditCardId: card.id,
        creditCard: {
          id: card.id,
          name: card.name,
        },
        description: `Resumen ${card.name}`,
        amountArs: 0,
        amountUsd: 0,
        exchangeRate: 1000,
        isPaid: false,
        isPlaceholder: true,
      })
    }
  }

  return {
    transactions: [...result.transactions, ...placeholders],
    pagination: result.pagination,
  }
}

/**
 * Auto-generate recurring transactions for a specific month/year
 * This function is called automatically when querying transactions for a month
 */
async function autoGenerateRecurringTransactions(userId: string, month: number, year: number) {
  // Get all active recurring transactions
  const recurringTransactions = await prisma.recurringTransaction.findMany({
    where: {
      userId,
      isActive: true,
    },
  })

  for (const recurring of recurringTransactions) {
    // Check if transaction already exists for this month
    const existing = await prisma.transaction.findFirst({
      where: {
        recurringTransactionId: recurring.id,
        month,
        year,
      },
    })

    if (existing) {
      continue // Skip if already exists
    }

    // Check if this month is within the recurring transaction's date range
    const targetDate = new Date(year, month - 1, recurring.dayOfMonth || 1)
    
    // Check start date
    if (recurring.startDate && targetDate < recurring.startDate) {
      continue
    }

    // Check end date
    if (recurring.endDate && targetDate > recurring.endDate) {
      continue
    }

    // Check frequency
    if (recurring.frequency === 'MONTHLY') {
      // Generate for every month
    } else if (recurring.frequency === 'YEARLY') {
      // Only generate if it's the same month as start date
      const startMonth = recurring.startDate ? recurring.startDate.getMonth() + 1 : 1
      if (month !== startMonth) {
        continue
      }
    } else {
      // Skip other frequencies for now
      continue
    }

    // Calculate amounts based on currency
    // TODO: Get historical exchange rate for targetDate
    // For now, use current exchange rate from API or recurring's rate
    const exchangeRate = Number(recurring.exchangeRate)
    
    let amountArs = Number(recurring.amountArs)
    let amountUsd = Number(recurring.amountUsd)
    
    // If recurring has a primary currency, recalculate the other amount
    // This ensures USD recurrents use the exchange rate of the payment date
    if (amountUsd > 0 && amountArs === 0) {
      // Primary currency is USD
      amountArs = amountUsd * exchangeRate
    } else if (amountArs > 0 && amountUsd === 0) {
      // Primary currency is ARS
      amountUsd = amountArs / exchangeRate
    }
    // If both are set, use them as-is (legacy data)

    // Generate the transaction
    try {
      await prisma.transaction.create({
        data: {
          userId,
          date: targetDate,
          month,
          year,
          type: recurring.type,
          categoryId: recurring.categoryId,
          clientId: recurring.clientId,
          creditCardId: recurring.creditCardId,
          recurringTransactionId: recurring.id,
          description: recurring.description,
          amountArs,
          amountUsd,
          exchangeRate,
          isPaid: false, // Start as unpaid
          notes: recurring.notes,
        },
      })
    } catch (error) {
      // Ignore errors (e.g., if transaction was created by another request)
      console.error(`Error auto-generating recurring transaction ${recurring.id}:`, error)
    }
  }
}
