import { Request, Response, NextFunction } from 'express'
import * as yearlySummaryService from '../services/yearly-summary.service'

export async function getYearlySummary(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear()

    const summary = await yearlySummaryService.getYearlySummary(req.user.userId, year)

    res.json(summary)
  } catch (error) {
    next(error)
  }
}
