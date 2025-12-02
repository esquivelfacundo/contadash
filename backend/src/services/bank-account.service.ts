import { prisma } from '../config/database'
import { BankAccountType, Currency } from '@prisma/client'

export interface CreateBankAccountData {
  name: string
  bank: string
  accountType: BankAccountType
  accountNumber: string
  currency: Currency
  balance?: number
  isActive?: boolean
}

export interface UpdateBankAccountData {
  name?: string
  bank?: string
  accountType?: BankAccountType
  accountNumber?: string
  currency?: Currency
  balance?: number
  isActive?: boolean
}

export async function getAllBankAccounts(userId: string, currency?: Currency) {
  const where: any = { userId, isActive: true }
  
  if (currency) {
    where.currency = currency
  }

  return await prisma.bankAccount.findMany({
    where,
    orderBy: { name: 'asc' },
  })
}

export async function getBankAccountById(id: string, userId: string) {
  const account = await prisma.bankAccount.findFirst({
    where: { id, userId },
  })

  if (!account) {
    throw new Error('Cuenta bancaria no encontrada')
  }

  return account
}

export async function createBankAccount(userId: string, data: CreateBankAccountData) {
  // Check if account with same number and bank exists
  const existing = await prisma.bankAccount.findFirst({
    where: {
      userId,
      accountNumber: data.accountNumber,
      bank: data.bank,
    },
  })

  if (existing) {
    throw new Error('Ya existe una cuenta con este número en el mismo banco')
  }

  return await prisma.bankAccount.create({
    data: {
      ...data,
      userId,
      balance: data.balance || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  })
}

export async function updateBankAccount(id: string, userId: string, data: UpdateBankAccountData) {
  const account = await getBankAccountById(id, userId)

  // Check if updating to existing account number and bank combination
  if (data.accountNumber || data.bank) {
    const accountNumber = data.accountNumber || account.accountNumber
    const bank = data.bank || account.bank

    if (accountNumber !== account.accountNumber || bank !== account.bank) {
      const existing = await prisma.bankAccount.findFirst({
        where: {
          userId,
          accountNumber,
          bank,
          id: { not: id },
        },
      })

      if (existing) {
        throw new Error('Ya existe una cuenta con este número en el mismo banco')
      }
    }
  }

  return await prisma.bankAccount.update({
    where: { id },
    data,
  })
}

export async function deleteBankAccount(id: string, userId: string) {
  await getBankAccountById(id, userId)

  // Check if account has transactions (when we implement payment methods in transactions)
  // For now, we'll allow deletion
  
  await prisma.bankAccount.delete({
    where: { id },
  })
}

export async function getBankAccountStats(id: string, userId: string, month?: number, year?: number) {
  await getBankAccountById(id, userId)

  // For now, return basic stats
  // Later we can add transaction stats when payment methods are implemented
  const account = await prisma.bankAccount.findUnique({
    where: { id },
  })

  return {
    account,
    // Future: transaction stats
  }
}
