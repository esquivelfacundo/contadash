import { prisma } from '../config/database'
import { CreateClientInput, UpdateClientInput } from '../validations/client.validation'
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors'

export async function getClients(userId: string, activeOnly = false) {
  const where: any = { userId }
  
  if (activeOnly) {
    where.active = true
  }

  const clients = await prisma.client.findMany({
    where,
    orderBy: { company: 'asc' },
  })

  return clients
}

export async function getClientById(userId: string, id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      _count: {
        select: { transactions: true },
      },
    },
  })

  if (!client) {
    throw new NotFoundError('Client not found')
  }

  if (client.userId !== userId) {
    throw new ForbiddenError('Access denied')
  }

  return client
}

export async function createClient(userId: string, data: CreateClientInput) {
  // Check if company with same name already exists
  const existing = await prisma.client.findUnique({
    where: {
      userId_company: {
        userId,
        company: data.company,
      },
    },
  })

  if (existing) {
    throw new ConflictError('Company with this name already exists')
  }

  const client = await prisma.client.create({
    data: {
      userId,
      company: data.company,
      responsible: data.responsible,
      email: data.email,
      phone: data.phone,
      active: true,
    },
  })

  return client
}

export async function updateClient(
  userId: string,
  id: string,
  data: UpdateClientInput
) {
  // Verify client exists and belongs to user
  await getClientById(userId, id)

  // Check company name conflict if company is being updated
  if (data.company) {
    const conflict = await prisma.client.findFirst({
      where: {
        userId,
        company: data.company,
        id: { not: id },
      },
    })

    if (conflict) {
      throw new ConflictError('Company with this name already exists')
    }
  }

  const client = await prisma.client.update({
    where: { id },
    data,
  })

  return client
}

export async function deleteClient(userId: string, id: string) {
  // Verify client exists and belongs to user
  await getClientById(userId, id)

  // Check if client has transactions
  const transactionCount = await prisma.transaction.count({
    where: { clientId: id },
  })

  if (transactionCount > 0) {
    throw new ConflictError(
      `Cannot delete client with ${transactionCount} transactions. Please reassign or delete them first.`
    )
  }

  await prisma.client.delete({
    where: { id },
  })

  return { message: 'Client deleted successfully' }
}

export async function getClientStats(userId: string, id: string) {
  // Verify client exists and belongs to user
  await getClientById(userId, id)

  const [income, expense, transactionCount] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, clientId: id, type: 'INCOME' },
      _sum: { amountArs: true, amountUsd: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, clientId: id, type: 'EXPENSE' },
      _sum: { amountArs: true, amountUsd: true },
    }),
    prisma.transaction.count({
      where: { userId, clientId: id },
    }),
  ])

  const totalIncomeArs = income._sum.amountArs || 0
  const totalIncomeUsd = income._sum.amountUsd || 0
  const totalExpenseArs = expense._sum.amountArs || 0
  const totalExpenseUsd = expense._sum.amountUsd || 0

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
    transactionCount,
  }
}
