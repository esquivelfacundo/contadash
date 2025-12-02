import { Request, Response, NextFunction } from 'express'
import * as analyticsService from '../services/analytics.service'

export async function getDashboard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const data = await analyticsService.getDashboardData(req.user.userId)

    res.json(data)
  } catch (error) {
    next(error)
  }
}

export async function getMonthlyTrend(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear()
    const months = req.query.months ? parseInt(req.query.months as string) : 12

    const trend = await analyticsService.getMonthlyTrend(req.user.userId, year, months)

    res.json({ trend })
  } catch (error) {
    next(error)
  }
}

export async function getCategoryBreakdown(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const type = req.query.type as 'INCOME' | 'EXPENSE'
    const month = req.query.month ? parseInt(req.query.month as string) : undefined
    const year = req.query.year ? parseInt(req.query.year as string) : undefined

    if (!type || (type !== 'INCOME' && type !== 'EXPENSE')) {
      return res.status(400).json({ error: 'Type must be INCOME or EXPENSE' })
    }

    const breakdown = await analyticsService.getCategoryBreakdown(
      req.user.userId,
      type,
      month,
      year
    )

    res.json({ breakdown })
  } catch (error) {
    next(error)
  }
}

export async function getClientAnalysis(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { clientId } = req.params

    const analysis = await analyticsService.getClientAnalysis(req.user.userId, clientId)

    res.json({ analysis })
  } catch (error) {
    next(error)
  }
}

export async function comparePeriods(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { month1, year1, month2, year2 } = req.query

    if (!year1 || !year2) {
      return res.status(400).json({ error: 'year1 and year2 are required' })
    }

    const period1 = {
      month: month1 ? parseInt(month1 as string) : undefined,
      year: parseInt(year1 as string),
    }

    const period2 = {
      month: month2 ? parseInt(month2 as string) : undefined,
      year: parseInt(year2 as string),
    }

    const comparison = await analyticsService.comparePeriods(
      req.user.userId,
      period1,
      period2
    )

    res.json(comparison)
  } catch (error) {
    next(error)
  }
}

export async function getProjections(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const monthsToProject = req.query.months 
      ? parseInt(req.query.months as string) 
      : 3

    const projections = await analyticsService.generateProjections(
      req.user.userId,
      monthsToProject
    )

    res.json(projections)
  } catch (error) {
    next(error)
  }
}
