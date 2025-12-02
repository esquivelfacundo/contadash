import { prisma } from '../config/database'

export async function getAllCreditCards(userId: string) {
  return await prisma.creditCard.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  })
}

export async function getCreditCardById(id: string, userId: string) {
  const card = await prisma.creditCard.findFirst({
    where: { id, userId },
  })

  if (!card) {
    throw new Error('Tarjeta no encontrada')
  }

  return card
}

export async function createCreditCard(userId: string, data: any) {
  // Check if card with same last 4 digits exists
  const existing = await prisma.creditCard.findFirst({
    where: {
      userId,
      lastFourDigits: data.lastFourDigits,
    },
  })

  if (existing) {
    throw new Error('Ya existe una tarjeta con estos últimos 4 dígitos')
  }

  return await prisma.creditCard.create({
    data: {
      ...data,
      userId,
    },
  })
}

export async function updateCreditCard(id: string, userId: string, data: any) {
  const card = await getCreditCardById(id, userId)

  // Check if updating to existing last 4 digits
  if (data.lastFourDigits && data.lastFourDigits !== card.lastFourDigits) {
    const existing = await prisma.creditCard.findFirst({
      where: {
        userId,
        lastFourDigits: data.lastFourDigits,
        id: { not: id },
      },
    })

    if (existing) {
      throw new Error('Ya existe una tarjeta con estos últimos 4 dígitos')
    }
  }

  return await prisma.creditCard.update({
    where: { id },
    data,
  })
}

export async function deleteCreditCard(id: string, userId: string) {
  await getCreditCardById(id, userId)

  // Check if card has transactions
  const transactionCount = await prisma.transaction.count({
    where: { creditCardId: id },
  })

  if (transactionCount > 0) {
    throw new Error('No se puede eliminar una tarjeta con transacciones asociadas')
  }

  await prisma.creditCard.delete({
    where: { id },
  })
}

export async function getCreditCardStats(id: string, userId: string, month?: number, year?: number) {
  await getCreditCardById(id, userId)

  const currentDate = new Date()
  const targetMonth = month || currentDate.getMonth() + 1
  const targetYear = year || currentDate.getFullYear()

  const transactions = await prisma.transaction.findMany({
    where: {
      creditCardId: id,
      month: targetMonth,
      year: targetYear,
    },
  })

  const totalSpent = transactions.reduce((sum, t) => sum + Number(t.amountArs), 0)
  const totalSpentUsd = transactions.reduce((sum, t) => sum + Number(t.amountUsd), 0)

  return {
    month: targetMonth,
    year: targetYear,
    totalSpent,
    totalSpentUsd,
    transactionCount: transactions.length,
    transactions,
  }
}
