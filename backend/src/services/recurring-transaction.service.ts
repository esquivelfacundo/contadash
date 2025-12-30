import { prisma } from '../config/database'
import { getDolarBlueForDate } from './dolarapi.service'

export async function getAllRecurringTransactions(userId: string, isActive?: boolean) {
  return await prisma.recurringTransaction.findMany({
    where: {
      userId,
      ...(isActive !== undefined && { isActive }),
    },
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
    },
    orderBy: { startDate: 'asc' },
  })
}

export async function getRecurringTransactionById(id: string, userId: string) {
  const recurring = await prisma.recurringTransaction.findFirst({
    where: { id, userId },
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
    },
  })

  if (!recurring) {
    throw new Error('Transacción recurrente no encontrada')
  }

  return recurring
}

export async function createRecurringTransaction(userId: string, data: any) {
  // Si no se especifica startDate, usar el primer día del mes actual
  const startDate = data.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  
  // Get current exchange rate for reference
  const today = new Date().toISOString().split('T')[0]
  const currentExchangeRate = await getDolarBlueForDate(today)
  
  // Store only the base currency amount
  // The other currency will be calculated dynamically for each month
  let finalAmountArs = data.amountArs
  let finalAmountUsd = data.amountUsd
  
  if (data.amountUsd > 0 && data.amountArs === 0) {
    // USD is base, keep only USD amount
    finalAmountArs = 0
    finalAmountUsd = data.amountUsd
  } else if (data.amountArs > 0 && data.amountUsd === 0) {
    // ARS is base, keep only ARS amount
    finalAmountArs = data.amountArs
    finalAmountUsd = 0
  }
  
  return await prisma.recurringTransaction.create({
    data: {
      ...data,
      amountArs: finalAmountArs,
      amountUsd: finalAmountUsd,
      exchangeRate: currentExchangeRate,
      startDate,
      userId,
    },
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
    },
  })
}

export async function updateRecurringTransaction(id: string, userId: string, data: any) {
  await getRecurringTransactionById(id, userId)

  // If updating amounts, ensure only base currency is stored
  let updateData = { ...data }
  if ((data.amountArs !== undefined || data.amountUsd !== undefined)) {
    if (data.amountUsd !== undefined && data.amountUsd > 0 && (data.amountArs === undefined || data.amountArs === 0)) {
      // USD is base, clear ARS
      updateData.amountArs = 0
      updateData.amountUsd = data.amountUsd
    } else if (data.amountArs !== undefined && data.amountArs > 0 && (data.amountUsd === undefined || data.amountUsd === 0)) {
      // ARS is base, clear USD
      updateData.amountArs = data.amountArs
      updateData.amountUsd = 0
    }
  }

  const updated = await prisma.recurringTransaction.update({
    where: { id },
    data: updateData,
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
    },
  })

  // Delete transactions that fall outside the new date range
  if (data.startDate !== undefined || data.endDate !== undefined) {
    const deleteConditions: any = {
      recurringTransactionId: id,
    }

    // Build OR conditions for transactions outside the range
    const orConditions: any[] = []

    if (data.startDate !== undefined) {
      const startYear = new Date(data.startDate).getFullYear()
      const startMonth = new Date(data.startDate).getMonth() + 1

      // Delete transactions before the new start date
      orConditions.push({
        OR: [
          { year: { lt: startYear } },
          {
            AND: [
              { year: startYear },
              { month: { lt: startMonth } },
            ],
          },
        ],
      })
    }

    if (data.endDate !== undefined) {
      const endYear = new Date(data.endDate).getFullYear()
      const endMonth = new Date(data.endDate).getMonth() + 1

      // Delete transactions after the new end date
      orConditions.push({
        OR: [
          { year: { gt: endYear } },
          {
            AND: [
              { year: endYear },
              { month: { gt: endMonth } },
            ],
          },
        ],
      })
    }

    if (orConditions.length > 0) {
      await prisma.transaction.deleteMany({
        where: {
          ...deleteConditions,
          OR: orConditions,
        },
      })
    }
  }

  // Update ALL generated transactions (not just future ones)
  // Get all generated transactions to update them properly
  const generatedTransactions = await prisma.transaction.findMany({
    where: {
      recurringTransactionId: id,
      isManuallyModified: false,
    },
  })

  // Determine base currency from updated data
  const finalAmountArs = updateData.amountArs !== undefined ? updateData.amountArs : updated.amountArs
  const finalAmountUsd = updateData.amountUsd !== undefined ? updateData.amountUsd : updated.amountUsd
  
  let baseCurrency: 'USD' | 'ARS' | 'NONE' = 'NONE'
  if (Number(finalAmountUsd) > 0 && Number(finalAmountArs) === 0) {
    baseCurrency = 'USD'
  } else if (Number(finalAmountArs) > 0 && Number(finalAmountUsd) === 0) {
    baseCurrency = 'ARS'
  }

  // Update each generated transaction
  for (const transaction of generatedTransactions) {
    const txExchangeRate = Number(transaction.exchangeRate || 1)
    let correctAmountUsd: number
    let correctAmountArs: number

    if (baseCurrency === 'USD') {
      // USD is fixed, recalculate ARS
      correctAmountUsd = Number(finalAmountUsd)
      correctAmountArs = correctAmountUsd * txExchangeRate
    } else if (baseCurrency === 'ARS') {
      // ARS is fixed, recalculate USD
      correctAmountArs = Number(finalAmountArs)
      correctAmountUsd = correctAmountArs / txExchangeRate
    } else {
      // No clear base currency, skip amount update
      correctAmountUsd = Number(transaction.amountUsd)
      correctAmountArs = Number(transaction.amountArs)
    }

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        ...(data.description !== undefined && { description: data.description }),
        ...(baseCurrency !== 'NONE' && { 
          amountArs: correctAmountArs,
          amountUsd: correctAmountUsd,
        }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.clientId !== undefined && { clientId: data.clientId }),
        ...(data.creditCardId !== undefined && { creditCardId: data.creditCardId }),
      },
    })
  }

  return updated
}

export async function deleteRecurringTransaction(id: string, userId: string) {
  await getRecurringTransactionById(id, userId)

  // First, delete all transactions generated from this recurring transaction
  await prisma.transaction.deleteMany({
    where: {
      recurringTransactionId: id,
    },
  })

  // Then delete the recurring transaction itself
  await prisma.recurringTransaction.delete({
    where: { id },
  })
}

export async function endRecurringTransaction(id: string, userId: string, endMonth: number, endYear: number) {
  await getRecurringTransactionById(id, userId)

  // Set endDate to the last day of the specified month
  const endDate = new Date(endYear, endMonth, 0) // Day 0 = last day of previous month

  return await prisma.recurringTransaction.update({
    where: { id },
    data: {
      endDate,
      isActive: false, // Deactivate when ended
    },
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
    },
  })
}

export async function generateTransactionFromRecurring(recurringId: string, userId: string, date: Date) {
  const recurring = await getRecurringTransactionById(recurringId, userId)

  if (!recurring.isActive) {
    throw new Error('La transacción recurrente está inactiva')
  }

  const month = date.getMonth() + 1
  const year = date.getFullYear()

  // Check if transaction already exists for this month
  const existing = await prisma.transaction.findFirst({
    where: {
      recurringTransactionId: recurringId,
      month,
      year,
    },
  })

  if (existing) {
    throw new Error('Ya existe una transacción generada para este mes')
  }

  // Get exchange rate for the specific date
  const dateStr = date.toISOString().split('T')[0]
  const exchangeRate = await getDolarBlueForDate(dateStr)

  // Calculate amounts based on the exchange rate for this date
  // Convert Decimal to Number for calculations
  const baseAmountArs = Number(recurring.amountArs)
  const baseAmountUsd = Number(recurring.amountUsd)
  
  let amountArs: number
  let amountUsd: number

  // Determine which currency is the base and calculate the other
  if (baseAmountUsd > 0) {
    // USD is base currency, calculate ARS with current month's exchange rate
    amountUsd = baseAmountUsd
    amountArs = baseAmountUsd * exchangeRate
  } else if (baseAmountArs > 0) {
    // ARS is base currency, calculate USD with current month's exchange rate
    amountArs = baseAmountArs
    amountUsd = baseAmountArs / exchangeRate
  } else {
    // Fallback: both are 0 (shouldn't happen)
    amountArs = 0
    amountUsd = 0
  }

  return await prisma.transaction.create({
    data: {
      userId,
      date,
      month,
      year,
      type: recurring.type,
      categoryId: recurring.categoryId,
      clientId: recurring.clientId,
      creditCardId: recurring.creditCardId,
      recurringTransactionId: recurringId,
      description: recurring.description,
      amountArs,
      amountUsd,
      exchangeRate,
      isPaid: false, // Start as unpaid for recurring
      notes: recurring.notes,
    },
    include: {
      category: true,
      client: true,
      creditCard: true,
    },
  })
}

export async function markTransactionAsPaid(transactionId: string, userId: string) {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  })

  if (!transaction) {
    throw new Error('Transacción no encontrada')
  }

  return await prisma.transaction.update({
    where: { id: transactionId },
    data: { isPaid: true },
  })
}

export async function getUpcomingRecurringTransactions(userId: string, month: number, year: number) {
  const recurring = await prisma.recurringTransaction.findMany({
    where: {
      userId,
      isActive: true,
      startDate: {
        lte: new Date(year, month - 1, 31),
      },
      OR: [
        { endDate: null },
        {
          endDate: {
            gte: new Date(year, month - 1, 1),
          },
        },
      ],
    },
    include: {
      category: true,
      client: true,
      creditCard: true,
    },
  })

  // Check which ones don't have a transaction for this month yet
  const upcoming = []
  for (const rec of recurring) {
    const existing = await prisma.transaction.findFirst({
      where: {
        recurringTransactionId: rec.id,
        month,
        year,
      },
    })

    if (!existing) {
      upcoming.push(rec)
    }
  }

  return upcoming
}
