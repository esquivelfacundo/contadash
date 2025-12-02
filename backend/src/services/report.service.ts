import { prisma } from '../config/database'
import { Decimal } from '@prisma/client/runtime/library'

interface ReportFilters {
  startDate?: Date
  endDate?: Date
  type?: 'INCOME' | 'EXPENSE'
  categoryId?: string
  clientId?: string
}

interface MonthlyReportData {
  month: number
  year: number
  transactions: any[]
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
    count: number
    byCategory: Array<{
      categoryName: string
      categoryIcon: string
      total: number
      count: number
    }>
  }
}

interface AnnualReportData {
  year: number
  months: Array<{
    month: number
    monthName: string
    totalIncome: number
    totalExpense: number
    balance: number
  }>
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
    count: number
  }
}

interface ClientReportData {
  client: {
    id: string
    company: string
    responsible: string | null
  }
  transactions: any[]
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
    count: number
    byMonth: Array<{
      month: number
      year: number
      total: number
    }>
  }
}

interface CategoryReportData {
  category: {
    id: string
    name: string
    icon: string
    type: string
  }
  transactions: any[]
  summary: {
    total: number
    count: number
    byMonth: Array<{
      month: number
      year: number
      total: number
    }>
  }
}

/**
 * Generar reporte mensual
 */
export async function generateMonthlyReport(
  userId: string,
  month: number,
  year: number
): Promise<MonthlyReportData> {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: {
        select: {
          name: true,
          icon: true,
          type: true,
        },
      },
      client: {
        select: {
          company: true,
          responsible: true,
        },
      },
      creditCard: {
        select: {
          name: true,
          lastFourDigits: true,
        },
      },
    },
    orderBy: { date: 'desc' },
  })

  // Calcular totales
  const totals = transactions.reduce(
    (acc, t) => {
      const amount = Number(t.amountArs)
      if (t.type === 'INCOME') {
        acc.totalIncome += amount
      } else {
        acc.totalExpense += amount
      }
      return acc
    },
    { totalIncome: 0, totalExpense: 0 }
  )

  // Agrupar por categoría
  const byCategory = transactions.reduce((acc: any[], t) => {
    const existing = acc.find((item) => item.categoryName === t.category.name)
    const amount = Number(t.amountArs)

    if (existing) {
      existing.total += amount
      existing.count += 1
    } else {
      acc.push({
        categoryName: t.category.name,
        categoryIcon: t.category.icon,
        total: amount,
        count: 1,
      })
    }
    return acc
  }, [])

  return {
    month,
    year,
    transactions,
    summary: {
      ...totals,
      balance: totals.totalIncome - totals.totalExpense,
      count: transactions.length,
      byCategory: byCategory.sort((a, b) => b.total - a.total),
    },
  }
}

/**
 * Generar reporte anual
 */
export async function generateAnnualReport(
  userId: string,
  year: number
): Promise<AnnualReportData> {
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31, 23, 59, 59)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      month: true,
      type: true,
      amountArs: true,
    },
  })

  // Agrupar por mes
  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ]

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const monthTransactions = transactions.filter((t) => t.month === month)

    const totals = monthTransactions.reduce(
      (acc, t) => {
        const amount = Number(t.amountArs)
        if (t.type === 'INCOME') {
          acc.totalIncome += amount
        } else {
          acc.totalExpense += amount
        }
        return acc
      },
      { totalIncome: 0, totalExpense: 0 }
    )

    return {
      month,
      monthName: monthNames[i],
      totalIncome: totals.totalIncome,
      totalExpense: totals.totalExpense,
      balance: totals.totalIncome - totals.totalExpense,
    }
  })

  // Totales anuales
  const summary = months.reduce(
    (acc, m) => {
      acc.totalIncome += m.totalIncome
      acc.totalExpense += m.totalExpense
      return acc
    },
    { totalIncome: 0, totalExpense: 0, balance: 0, count: transactions.length }
  )
  summary.balance = summary.totalIncome - summary.totalExpense

  return {
    year,
    months,
    summary,
  }
}

/**
 * Generar reporte por cliente
 */
export async function generateClientReport(
  userId: string,
  clientId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ClientReportData> {
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      userId,
    },
  })

  if (!client) {
    throw new Error('Client not found')
  }

  const where: any = {
    userId,
    clientId,
  }

  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = startDate
    if (endDate) where.date.lte = endDate
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      category: {
        select: {
          name: true,
          icon: true,
        },
      },
    },
    orderBy: { date: 'desc' },
  })

  // Calcular totales
  const totals = transactions.reduce(
    (acc, t) => {
      const amount = Number(t.amountArs)
      if (t.type === 'INCOME') {
        acc.totalIncome += amount
      } else {
        acc.totalExpense += amount
      }
      return acc
    },
    { totalIncome: 0, totalExpense: 0 }
  )

  // Agrupar por mes
  const byMonth = transactions.reduce((acc: any[], t) => {
    const key = `${t.year}-${t.month}`
    const existing = acc.find((item) => `${item.year}-${item.month}` === key)
    const amount = Number(t.amountArs)

    if (existing) {
      existing.total += amount
    } else {
      acc.push({
        month: t.month,
        year: t.year,
        total: amount,
      })
    }
    return acc
  }, [])

  return {
    client: {
      id: client.id,
      company: client.company,
      responsible: client.responsible,
    },
    transactions,
    summary: {
      ...totals,
      balance: totals.totalIncome - totals.totalExpense,
      count: transactions.length,
      byMonth: byMonth.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      }),
    },
  }
}

/**
 * Generar reporte por categoría
 */
export async function generateCategoryReport(
  userId: string,
  categoryId: string,
  startDate?: Date,
  endDate?: Date
): Promise<CategoryReportData> {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  })

  if (!category) {
    throw new Error('Category not found')
  }

  const where: any = {
    userId,
    categoryId,
  }

  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = startDate
    if (endDate) where.date.lte = endDate
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      client: {
        select: {
          company: true,
          responsible: true,
        },
      },
    },
    orderBy: { date: 'desc' },
  })

  // Calcular total
  const total = transactions.reduce((acc, t) => acc + Number(t.amountArs), 0)

  // Agrupar por mes
  const byMonth = transactions.reduce((acc: any[], t) => {
    const key = `${t.year}-${t.month}`
    const existing = acc.find((item) => `${item.year}-${item.month}` === key)
    const amount = Number(t.amountArs)

    if (existing) {
      existing.total += amount
    } else {
      acc.push({
        month: t.month,
        year: t.year,
        total: amount,
      })
    }
    return acc
  }, [])

  return {
    category: {
      id: category.id,
      name: category.name,
      icon: category.icon,
      type: category.type,
    },
    transactions,
    summary: {
      total,
      count: transactions.length,
      byMonth: byMonth.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      }),
    },
  }
}

/**
 * Generar reporte personalizado
 */
export async function generateCustomReport(userId: string, filters: ReportFilters) {
  const where: any = { userId }

  if (filters.startDate || filters.endDate) {
    where.date = {}
    if (filters.startDate) where.date.gte = filters.startDate
    if (filters.endDate) where.date.lte = filters.endDate
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

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      category: {
        select: {
          name: true,
          icon: true,
        },
      },
      client: {
        select: {
          company: true,
          responsible: true,
        },
      },
    },
    orderBy: { date: 'desc' },
  })

  const totals = transactions.reduce(
    (acc, t) => {
      const amount = Number(t.amountArs)
      if (t.type === 'INCOME') {
        acc.totalIncome += amount
      } else {
        acc.totalExpense += amount
      }
      return acc
    },
    { totalIncome: 0, totalExpense: 0 }
  )

  return {
    transactions,
    filters,
    summary: {
      ...totals,
      balance: totals.totalIncome - totals.totalExpense,
      count: transactions.length,
    },
  }
}
