import { Request, Response, NextFunction } from 'express'
import * as budgetService from '../services/budget.service'
import {
  createBudgetSchema,
  updateBudgetSchema,
  budgetFiltersSchema,
} from '../validations/budget.validation'

/**
 * Get all budgets for the authenticated user
 */
export async function getBudgets(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const filters = budgetFiltersSchema.parse(req.query)
    const budgets = await budgetService.getBudgets(req.user.userId, filters)

    res.json({ budgets })
  } catch (error) {
    next(error)
  }
}

/**
 * Get a single budget by ID
 */
export async function getBudgetById(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const budget = await budgetService.getBudgetById(req.user.userId, id)

    if (!budget) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' })
    }

    res.json({ budget })
  } catch (error) {
    next(error)
  }
}

/**
 * Get budgets with spending comparison for a specific period
 */
export async function getBudgetsWithSpending(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { month, year } = req.query

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' })
    }

    const budgets = await budgetService.getBudgetsWithSpending(
      req.user.userId,
      parseInt(month as string),
      parseInt(year as string)
    )

    res.json({ budgets })
  } catch (error) {
    next(error)
  }
}

/**
 * Get budget summary for a period
 */
export async function getBudgetSummary(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { month, year } = req.query

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' })
    }

    const result = await budgetService.getBudgetSummary(
      req.user.userId,
      parseInt(month as string),
      parseInt(year as string)
    )

    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * Create a new budget
 */
export async function createBudget(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const data = createBudgetSchema.parse(req.body)
    const budget = await budgetService.createBudget(req.user.userId, data)

    res.status(201).json({ budget })
  } catch (error) {
    next(error)
  }
}

/**
 * Update a budget
 */
export async function updateBudget(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const data = updateBudgetSchema.parse(req.body)
    const budget = await budgetService.updateBudget(req.user.userId, id, data)

    res.json({ budget })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a budget
 */
export async function deleteBudget(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    await budgetService.deleteBudget(req.user.userId, id)

    res.json({ message: 'Presupuesto eliminado exitosamente' })
  } catch (error) {
    next(error)
  }
}

/**
 * Copy budgets from one period to another
 */
export async function copyBudgets(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { fromMonth, fromYear, toMonth, toYear } = req.body

    if (!fromMonth || !fromYear || !toMonth || !toYear) {
      return res.status(400).json({
        error: 'fromMonth, fromYear, toMonth, and toYear are required',
      })
    }

    const budgets = await budgetService.copyBudgets(
      req.user.userId,
      parseInt(fromMonth),
      parseInt(fromYear),
      parseInt(toMonth),
      parseInt(toYear)
    )

    res.json({ budgets, message: 'Presupuestos copiados exitosamente' })
  } catch (error) {
    next(error)
  }
}
