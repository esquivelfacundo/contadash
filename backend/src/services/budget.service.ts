import { prisma } from '../config/database'
import type { CreateBudgetInput, UpdateBudgetInput, BudgetFilters } from '../validations/budget.validation'

/**
 * Get all budgets for a user with optional filters
 */
export async function getBudgets(userId: string, filters: BudgetFilters = {}) {
  const where: any = { userId }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId
  }

  if (filters.month) {
    where.month = parseInt(filters.month)
  }

  if (filters.year) {
    where.year = parseInt(filters.year)
  }

  const budgets = await prisma.budget.findMany({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
          type: true,
        },
      },
    },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { category: { name: 'asc' } },
    ],
  })

  return budgets
}

/**
 * Get a single budget by ID
 */
export async function getBudgetById(userId: string, budgetId: string) {
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
          type: true,
        },
      },
    },
  })

  return budget
}

/**
 * Get budgets for a specific month/year with spending comparison
 */
export async function getBudgetsWithSpending(userId: string, month: number, year: number) {
  // Get budgets for the period
  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      month,
      year,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
          type: true,
        },
      },
    },
    orderBy: {
      category: { name: 'asc' },
    },
  })

  // Calculate start and end dates for the month
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  // Get actual spending for each category
  const budgetsWithSpending = await Promise.all(
    budgets.map(async (budget) => {
      const spending = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          date: {
            gte: startDate,
            lte: endDate,
          },
          // NO filtrar por tipo - contar todas las transacciones de la categoría
        },
        _sum: {
          amountArs: true,
          amountUsd: true,
        },
      })

      const spentArs = Number(spending._sum.amountArs || 0)
      const spentUsd = Number(spending._sum.amountUsd || 0)
      const budgetArs = Number(budget.amountArs)
      const budgetUsd = Number(budget.amountUsd)

      const percentageArs = budgetArs > 0 ? (spentArs / budgetArs) * 100 : 0
      const percentageUsd = budgetUsd > 0 ? (spentUsd / budgetUsd) * 100 : 0

      return {
        ...budget,
        spending: {
          ars: spentArs,
          usd: spentUsd,
        },
        remaining: {
          ars: budgetArs - spentArs,
          usd: budgetUsd - spentUsd,
        },
        percentage: {
          ars: percentageArs,
          usd: percentageUsd,
        },
        status: percentageArs > 100 ? 'exceeded' : percentageArs > 80 ? 'warning' : 'ok',
      }
    })
  )

  return budgetsWithSpending
}

/**
 * Create a new budget
 */
export async function createBudget(userId: string, data: CreateBudgetInput) {
  // Check if budget already exists for this category/month/year
  const existing = await prisma.budget.findFirst({
    where: {
      userId,
      categoryId: data.categoryId,
      month: data.month,
      year: data.year,
    },
  })

  if (existing) {
    throw new Error('Ya existe un presupuesto para esta categoría en este período')
  }

  // Verify category belongs to user
  const category = await prisma.category.findFirst({
    where: {
      id: data.categoryId,
      userId,
    },
  })

  if (!category) {
    throw new Error('Categoría no encontrada')
  }

  const budget = await prisma.budget.create({
    data: {
      userId,
      categoryId: data.categoryId,
      month: data.month,
      year: data.year,
      amountArs: data.amountArs,
      amountUsd: data.amountUsd,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
          type: true,
        },
      },
    },
  })

  return budget
}

/**
 * Update a budget
 */
export async function updateBudget(
  userId: string,
  budgetId: string,
  data: UpdateBudgetInput
) {
  // Verify budget belongs to user
  const existing = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
  })

  if (!existing) {
    throw new Error('Presupuesto no encontrado')
  }

  // If updating category, month, or year, check for duplicates
  if (data.categoryId || data.month || data.year) {
    const duplicate = await prisma.budget.findFirst({
      where: {
        userId,
        categoryId: data.categoryId || existing.categoryId,
        month: data.month || existing.month,
        year: data.year || existing.year,
        id: { not: budgetId },
      },
    })

    if (duplicate) {
      throw new Error('Ya existe un presupuesto para esta categoría en este período')
    }
  }

  const budget = await prisma.budget.update({
    where: { id: budgetId },
    data: {
      categoryId: data.categoryId,
      month: data.month,
      year: data.year,
      amountArs: data.amountArs,
      amountUsd: data.amountUsd,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
          type: true,
        },
      },
    },
  })

  return budget
}

/**
 * Delete a budget
 */
export async function deleteBudget(userId: string, budgetId: string) {
  // Verify budget belongs to user
  const existing = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
  })

  if (!existing) {
    throw new Error('Presupuesto no encontrado')
  }

  await prisma.budget.delete({
    where: { id: budgetId },
  })

  return { success: true }
}

/**
 * Get budget summary for a period
 */
export async function getBudgetSummary(userId: string, month: number, year: number) {
  const budgetsWithSpending = await getBudgetsWithSpending(userId, month, year)

  const summary = {
    totalBudgets: budgetsWithSpending.length,
    totalBudgetedArs: budgetsWithSpending.reduce((sum, b) => sum + Number(b.amountArs), 0),
    totalBudgetedUsd: budgetsWithSpending.reduce((sum, b) => sum + Number(b.amountUsd), 0),
    totalSpentArs: budgetsWithSpending.reduce((sum, b) => sum + b.spending.ars, 0),
    totalSpentUsd: budgetsWithSpending.reduce((sum, b) => sum + b.spending.usd, 0),
    totalRemainingArs: budgetsWithSpending.reduce((sum, b) => sum + b.remaining.ars, 0),
    totalRemainingUsd: budgetsWithSpending.reduce((sum, b) => sum + b.remaining.usd, 0),
    exceeded: budgetsWithSpending.filter((b) => b.status === 'exceeded').length,
    warning: budgetsWithSpending.filter((b) => b.status === 'warning').length,
    ok: budgetsWithSpending.filter((b) => b.status === 'ok').length,
  }

  return {
    summary,
    budgets: budgetsWithSpending,
  }
}

/**
 * Copy budgets from one month to another
 */
export async function copyBudgets(
  userId: string,
  fromMonth: number,
  fromYear: number,
  toMonth: number,
  toYear: number
) {
  // Get source budgets
  const sourceBudgets = await prisma.budget.findMany({
    where: {
      userId,
      month: fromMonth,
      year: fromYear,
    },
  })

  if (sourceBudgets.length === 0) {
    throw new Error('No hay presupuestos en el período origen')
  }

  // Check if target period already has budgets
  const existingTarget = await prisma.budget.findMany({
    where: {
      userId,
      month: toMonth,
      year: toYear,
    },
  })

  if (existingTarget.length > 0) {
    throw new Error('El período destino ya tiene presupuestos. Elimínalos primero.')
  }

  // Create new budgets
  const newBudgets = await Promise.all(
    sourceBudgets.map((budget) =>
      prisma.budget.create({
        data: {
          userId,
          categoryId: budget.categoryId,
          month: toMonth,
          year: toYear,
          amountArs: budget.amountArs,
          amountUsd: budget.amountUsd,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
              type: true,
            },
          },
        },
      })
    )
  )

  return newBudgets
}
