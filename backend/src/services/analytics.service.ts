import { prisma } from '../config/database'

// Helper function to get current exchange rate
async function getCurrentExchangeRate(): Promise<number> {
  const latestRate = await prisma.exchangeRate.findFirst({
    orderBy: { date: 'desc' },
  })
  return latestRate ? Number(latestRate.rate) : 1000 // Default to 1000 if no rate found
}

/**
 * Get exchange rate for a specific month
 * - For past months: uses the rate from the last day of that month (frozen)
 * - For current/future months: uses the most recent rate (dynamic)
 */
async function getExchangeRateForMonth(month: number, year: number): Promise<number> {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  
  // If it's a future month or current month, use the most recent rate
  if (year > currentYear || (year === currentYear && month >= currentMonth)) {
    return await getCurrentExchangeRate()
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
  return rateForMonth ? Number(rateForMonth.rate) : await getCurrentExchangeRate()
}

export async function getDashboardData(userId: string) {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  // Get exchange rates for current and previous month
  const currentMonthRate = await getExchangeRateForMonth(currentMonth, currentYear)
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear
  const prevMonthRate = await getExchangeRateForMonth(prevMonth, prevYear)
  const currentYearRate = await getCurrentExchangeRate() // For year stats, use current rate

  // Get current month stats
  const [currentMonthStats, previousMonthStats, yearStats, recentTransactions, topCategories, topClients] = await Promise.all([
    getMonthStats(userId, currentMonth, currentYear, currentMonthRate),
    getMonthStats(userId, prevMonth, prevYear, prevMonthRate),
    getYearStats(userId, currentYear, currentYearRate),
    getRecentTransactions(userId, 10),
    getTopCategories(userId, currentMonth, currentYear),
    getTopClients(userId, currentMonth, currentYear),
  ])

  // Calculate growth percentages
  const incomeGrowth = calculateGrowth(
    currentMonthStats.income.ars,
    previousMonthStats.income.ars
  )
  const expenseGrowth = calculateGrowth(
    currentMonthStats.expense.ars,
    previousMonthStats.expense.ars
  )

  return {
    currentMonth: {
      ...currentMonthStats,
      incomeGrowth,
      expenseGrowth,
    },
    previousMonth: previousMonthStats,
    year: yearStats,
    recentTransactions,
    topCategories,
    topClients,
  }
}

async function getMonthStats(userId: string, month: number, year: number, currentRate: number) {
  const [income, expense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, month, year, type: 'INCOME' },
      _sum: { amountArs: true },
      _count: true,
    }),
    prisma.transaction.aggregate({
      where: { userId, month, year, type: 'EXPENSE' },
      _sum: { amountArs: true },
      _count: true,
    }),
  ])

  const totalIncomeArs = Number(income._sum.amountArs || 0)
  const totalExpenseArs = Number(expense._sum.amountArs || 0)
  
  // Convert to USD using CURRENT exchange rate
  const totalIncomeUsd = totalIncomeArs / currentRate
  const totalExpenseUsd = totalExpenseArs / currentRate

  return {
    month,
    year,
    income: {
      ars: totalIncomeArs,
      usd: totalIncomeUsd,
      count: income._count,
    },
    expense: {
      ars: totalExpenseArs,
      usd: totalExpenseUsd,
      count: expense._count,
    },
    balance: {
      ars: totalIncomeArs - totalExpenseArs,
      usd: totalIncomeUsd - totalExpenseUsd,
    },
    profitMargin: totalIncomeArs > 0 
      ? ((totalIncomeArs - totalExpenseArs) / totalIncomeArs) * 100 
      : 0,
  }
}

async function getYearStats(userId: string, year: number, currentRate: number) {
  const [income, expense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, year, type: 'INCOME' },
      _sum: { amountArs: true },
      _count: true,
    }),
    prisma.transaction.aggregate({
      where: { userId, year, type: 'EXPENSE' },
      _sum: { amountArs: true },
      _count: true,
    }),
  ])

  const totalIncomeArs = Number(income._sum.amountArs || 0)
  const totalExpenseArs = Number(expense._sum.amountArs || 0)
  
  // Convert to USD using CURRENT exchange rate
  const totalIncomeUsd = totalIncomeArs / currentRate
  const totalExpenseUsd = totalExpenseArs / currentRate

  return {
    year,
    income: {
      ars: totalIncomeArs,
      usd: totalIncomeUsd,
      count: income._count,
    },
    expense: {
      ars: totalExpenseArs,
      usd: totalExpenseUsd,
      count: expense._count,
    },
    balance: {
      ars: totalIncomeArs - totalExpenseArs,
      usd: totalIncomeUsd - totalExpenseUsd,
    },
  }
}

async function getRecentTransactions(userId: string, limit: number) {
  return prisma.transaction.findMany({
    where: { userId },
    include: {
      category: {
        select: { name: true, color: true, icon: true },
      },
      client: {
        select: { company: true, responsible: true },
      },
    },
    orderBy: { date: 'desc' },
    take: limit,
  })
}

async function getTopCategories(userId: string, month: number, year: number) {
  const categories = await prisma.transaction.groupBy({
    by: ['categoryId', 'type'],
    where: { userId, month, year },
    _sum: { amountArs: true, amountUsd: true },
    _count: true,
    orderBy: { _sum: { amountArs: 'desc' } },
    take: 10,
  })

  // Enrich with category details
  const enriched = await Promise.all(
    categories.map(async (cat) => {
      const category = await prisma.category.findUnique({
        where: { id: cat.categoryId },
        select: { name: true, color: true, icon: true },
      })

      return {
        categoryId: cat.categoryId,
        categoryName: category?.name || 'Unknown',
        categoryColor: category?.color || '#gray',
        categoryIcon: category?.icon || '💰',
        type: cat.type,
        totalArs: cat._sum.amountArs || 0,
        totalUsd: cat._sum.amountUsd || 0,
        count: cat._count,
      }
    })
  )

  return enriched
}

async function getTopClients(userId: string, month: number, year: number) {
  const clients = await prisma.transaction.groupBy({
    by: ['clientId'],
    where: { userId, month, year, clientId: { not: null } },
    _sum: { amountArs: true, amountUsd: true },
    _count: true,
    orderBy: { _sum: { amountArs: 'desc' } },
    take: 10,
  })

  // Enrich with client details
  const enriched = await Promise.all(
    clients.map(async (cli) => {
      if (!cli.clientId) return null

      const client = await prisma.client.findUnique({
        where: { id: cli.clientId },
        select: { company: true, responsible: true },
      })

      return {
        clientId: cli.clientId,
        clientName: client?.company || 'Unknown',
        clientCompany: client?.company,
        clientResponsible: client?.responsible,
        totalArs: cli._sum.amountArs || 0,
        totalUsd: cli._sum.amountUsd || 0,
        count: cli._count,
      }
    })
  )

  return enriched.filter(Boolean)
}

function calculateGrowth(current: any, previous: any): number {
  const curr = Number(current) || 0
  const prev = Number(previous) || 0

  if (prev === 0) return curr > 0 ? 100 : 0
  return ((curr - prev) / prev) * 100
}

export async function getMonthlyTrend(userId: string, year: number, months = 12) {
  const trends = []

  for (let i = 0; i < months; i++) {
    const month = ((new Date().getMonth() + 1) - i + 12) % 12 || 12
    const yearOffset = Math.floor(((new Date().getMonth() + 1) - i) / 12)
    const trendYear = year - yearOffset

    // Get rate specific for this month
    const monthRate = await getExchangeRateForMonth(month, trendYear)
    const stats = await getMonthStats(userId, month, trendYear, monthRate)
    trends.unshift(stats)
  }

  return trends
}

export async function getCategoryBreakdown(userId: string, type: 'INCOME' | 'EXPENSE', month?: number, year?: number) {
  const where: any = { userId, type }

  if (month && year) {
    where.month = month
    where.year = year
  }

  const categories = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where,
    _sum: { amountArs: true, amountUsd: true },
    _count: true,
    orderBy: { _sum: { amountArs: 'desc' } },
  })

  // Enrich with category details
  const enriched = await Promise.all(
    categories.map(async (cat) => {
      const category = await prisma.category.findUnique({
        where: { id: cat.categoryId },
        select: { name: true, color: true, icon: true },
      })

      return {
        categoryId: cat.categoryId,
        categoryName: category?.name || 'Unknown',
        categoryColor: category?.color || '#gray',
        categoryIcon: category?.icon || '💰',
        totalArs: cat._sum.amountArs || 0,
        totalUsd: cat._sum.amountUsd || 0,
        count: cat._count,
      }
    })
  )

  // Calculate percentages
  const totalArs = enriched.reduce((sum, cat) => sum + Number(cat.totalArs), 0)

  return enriched.map(cat => ({
    ...cat,
    percentage: totalArs > 0 ? (Number(cat.totalArs) / totalArs) * 100 : 0,
  }))
}

export async function getClientAnalysis(userId: string, clientId: string) {
  // Get client stats
  const [income, expense, monthlyTrend, categoryBreakdown] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, clientId, type: 'INCOME' },
      _sum: { amountArs: true, amountUsd: true },
      _count: true,
    }),
    prisma.transaction.aggregate({
      where: { userId, clientId, type: 'EXPENSE' },
      _sum: { amountArs: true, amountUsd: true },
      _count: true,
    }),
    getClientMonthlyTrend(userId, clientId),
    getClientCategoryBreakdown(userId, clientId),
  ])

  const totalIncomeArs = income._sum.amountArs || 0
  const totalIncomeUsd = income._sum.amountUsd || 0
  const totalExpenseArs = expense._sum.amountArs || 0
  const totalExpenseUsd = expense._sum.amountUsd || 0

  return {
    income: {
      ars: totalIncomeArs,
      usd: totalIncomeUsd,
      count: income._count,
    },
    expense: {
      ars: totalExpenseArs,
      usd: totalExpenseUsd,
      count: expense._count,
    },
    balance: {
      ars: totalIncomeArs - totalExpenseArs,
      usd: totalIncomeUsd - totalExpenseUsd,
    },
    profitMargin: totalIncomeArs > 0 
      ? ((totalIncomeArs - totalExpenseArs) / totalIncomeArs) * 100 
      : 0,
    monthlyTrend,
    categoryBreakdown,
  }
}

async function getClientMonthlyTrend(userId: string, clientId: string) {
  const trends = await prisma.transaction.groupBy({
    by: ['month', 'year', 'type'],
    where: { userId, clientId },
    _sum: { amountArs: true, amountUsd: true },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    take: 12,
  })

  return trends
}

async function getClientCategoryBreakdown(userId: string, clientId: string) {
  const categories = await prisma.transaction.groupBy({
    by: ['categoryId', 'type'],
    where: { userId, clientId },
    _sum: { amountArs: true, amountUsd: true },
    _count: true,
    orderBy: { _sum: { amountArs: 'desc' } },
  })

  // Enrich with category details
  const enriched = await Promise.all(
    categories.map(async (cat) => {
      const category = await prisma.category.findUnique({
        where: { id: cat.categoryId },
        select: { name: true, color: true, icon: true },
      })

      return {
        categoryId: cat.categoryId,
        categoryName: category?.name || 'Unknown',
        categoryColor: category?.color || '#gray',
        categoryIcon: category?.icon || '💰',
        type: cat.type,
        totalArs: cat._sum.amountArs || 0,
        totalUsd: cat._sum.amountUsd || 0,
        count: cat._count,
      }
    })
  )

  return enriched
}

/**
 * Compare two periods (months or years)
 */
export async function comparePeriods(
  userId: string,
  period1: { month?: number; year: number },
  period2: { month?: number; year: number }
) {
  // Get specific rates for each period
  const rate1 = period1.month 
    ? await getExchangeRateForMonth(period1.month, period1.year)
    : await getCurrentExchangeRate()
  const rate2 = period2.month 
    ? await getExchangeRateForMonth(period2.month, period2.year)
    : await getCurrentExchangeRate()
    
  const [stats1, stats2] = await Promise.all([
    period1.month 
      ? getMonthStats(userId, period1.month, period1.year, rate1)
      : getYearStats(userId, period1.year, rate1),
    period2.month
      ? getMonthStats(userId, period2.month, period2.year, rate2)
      : getYearStats(userId, period2.year, rate2),
  ])

  const incomeGrowth = calculateGrowth(stats1.income.ars, stats2.income.ars)
  const expenseGrowth = calculateGrowth(stats1.expense.ars, stats2.expense.ars)
  const balanceGrowth = calculateGrowth(stats1.balance.ars, stats2.balance.ars)

  return {
    period1: {
      ...stats1,
      label: period1.month ? `${period1.month}/${period1.year}` : `${period1.year}`,
    },
    period2: {
      ...stats2,
      label: period2.month ? `${period2.month}/${period2.year}` : `${period2.year}`,
    },
    comparison: {
      incomeGrowth,
      expenseGrowth,
      balanceGrowth,
      incomeDiff: {
        ars: Number(stats1.income.ars) - Number(stats2.income.ars),
        usd: Number(stats1.income.usd) - Number(stats2.income.usd),
      },
      expenseDiff: {
        ars: Number(stats1.expense.ars) - Number(stats2.expense.ars),
        usd: Number(stats1.expense.usd) - Number(stats2.expense.usd),
      },
      balanceDiff: {
        ars: Number(stats1.balance.ars) - Number(stats2.balance.ars),
        usd: Number(stats1.balance.usd) - Number(stats2.balance.usd),
      },
    },
  }
}

/**
 * Generate projections based on historical data
 */
export async function generateProjections(
  userId: string,
  monthsToProject: number = 3
) {
  // Get last 6 months of data for trend analysis
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  const historicalData = []
  for (let i = 5; i >= 0; i--) {
    let month = currentMonth - i
    let year = currentYear

    if (month <= 0) {
      month += 12
      year -= 1
    }

    // Get rate specific for this historical month
    const monthRate = await getExchangeRateForMonth(month, year)
    const stats = await getMonthStats(userId, month, year, monthRate)
    historicalData.push(stats)
  }

  // Calculate average growth rates
  const incomeGrowthRates = []
  const expenseGrowthRates = []

  for (let i = 1; i < historicalData.length; i++) {
    const prevIncome = Number(historicalData[i - 1].income.ars)
    const currIncome = Number(historicalData[i].income.ars)
    const prevExpense = Number(historicalData[i - 1].expense.ars)
    const currExpense = Number(historicalData[i].expense.ars)

    if (prevIncome > 0) {
      incomeGrowthRates.push((currIncome - prevIncome) / prevIncome)
    }
    if (prevExpense > 0) {
      expenseGrowthRates.push((currExpense - prevExpense) / prevExpense)
    }
  }

  const avgIncomeGrowth = incomeGrowthRates.length > 0
    ? incomeGrowthRates.reduce((a, b) => a + b, 0) / incomeGrowthRates.length
    : 0

  const avgExpenseGrowth = expenseGrowthRates.length > 0
    ? expenseGrowthRates.reduce((a, b) => a + b, 0) / expenseGrowthRates.length
    : 0

  // Generate projections
  const projections = []
  let lastIncome = Number(historicalData[historicalData.length - 1].income.ars)
  let lastExpense = Number(historicalData[historicalData.length - 1].expense.ars)

  for (let i = 1; i <= monthsToProject; i++) {
    let month = currentMonth + i
    let year = currentYear

    if (month > 12) {
      month -= 12
      year += 1
    }

    const projectedIncome = lastIncome * (1 + avgIncomeGrowth)
    const projectedExpense = lastExpense * (1 + avgExpenseGrowth)

    projections.push({
      month,
      year,
      income: {
        ars: projectedIncome,
        usd: 0, // Could calculate based on exchange rate
      },
      expense: {
        ars: projectedExpense,
        usd: 0,
      },
      balance: {
        ars: projectedIncome - projectedExpense,
        usd: 0,
      },
      confidence: Math.max(0, 100 - (i * 10)), // Confidence decreases over time
    })

    lastIncome = projectedIncome
    lastExpense = projectedExpense
  }

  return {
    historical: historicalData,
    projections,
    trends: {
      avgIncomeGrowth: avgIncomeGrowth * 100,
      avgExpenseGrowth: avgExpenseGrowth * 100,
    },
  }
}
