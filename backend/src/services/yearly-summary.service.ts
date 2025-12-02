import { prisma } from '../config/database'

// Helper function to get exchange rate for a specific month
async function getExchangeRateForMonth(month: number, year: number): Promise<number> {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  
  // If it's a future month or current month, use the most recent rate
  if (year > currentYear || (year === currentYear && month >= currentMonth)) {
    const latestRate = await prisma.exchangeRate.findFirst({
      orderBy: { date: 'desc' },
    })
    return latestRate ? Number(latestRate.rate) : 1000
  }
  
  // For past months, get the rate from the last day of that month
  const lastDayOfMonth = new Date(year, month, 0) // Last day of the month
  lastDayOfMonth.setHours(23, 59, 59, 999)
  
  const rateForMonth = await prisma.exchangeRate.findFirst({
    where: {
      date: {
        lte: lastDayOfMonth,
      },
    },
    orderBy: { date: 'desc' },
  })
  
  // If no rate found for that month, use current rate as fallback
  if (!rateForMonth) {
    const latestRate = await prisma.exchangeRate.findFirst({
      orderBy: { date: 'desc' },
    })
    return latestRate ? Number(latestRate.rate) : 1000
  }
  
  return Number(rateForMonth.rate)
}

export async function getYearlySummary(userId: string, year: number) {
  const months = []

  for (let month = 1; month <= 12; month++) {
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
    })

    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amountArs), 0)

    const expense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amountArs), 0)

    // Get exchange rate specific for this month
    const monthRate = await getExchangeRateForMonth(month, year)
    
    // Convert to USD using the month's specific rate
    const incomeUsd = income / monthRate
    const expenseUsd = expense / monthRate

    months.push({
      month,
      monthName: new Date(year, month - 1).toLocaleString('es', { month: 'long' }),
      exchangeRate: monthRate, // Add exchange rate to response
      income: {
        ars: income,
        usd: incomeUsd,
      },
      expense: {
        ars: expense,
        usd: expenseUsd,
      },
      balance: {
        ars: income - expense,
        usd: incomeUsd - expenseUsd,
      },
    })
  }

  // Calculate totals
  const totals = months.reduce(
    (acc, m) => ({
      income: {
        ars: acc.income.ars + m.income.ars,
        usd: acc.income.usd + m.income.usd,
      },
      expense: {
        ars: acc.expense.ars + m.expense.ars,
        usd: acc.expense.usd + m.expense.usd,
      },
      balance: {
        ars: acc.balance.ars + m.balance.ars,
        usd: acc.balance.usd + m.balance.usd,
      },
    }),
    {
      income: { ars: 0, usd: 0 },
      expense: { ars: 0, usd: 0 },
      balance: { ars: 0, usd: 0 },
    }
  )

  return {
    year,
    months,
    totals,
  }
}
