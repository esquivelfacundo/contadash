import { prisma } from '../config/database'

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
    orderBy: { createdAt: 'desc' },
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
  
  return await prisma.recurringTransaction.create({
    data: {
      ...data,
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

  return await prisma.recurringTransaction.update({
    where: { id },
    data,
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

export async function deleteRecurringTransaction(id: string, userId: string) {
  await getRecurringTransactionById(id, userId)

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
      amountArs: recurring.amountArs,
      amountUsd: recurring.amountUsd,
      exchangeRate: recurring.exchangeRate,
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
