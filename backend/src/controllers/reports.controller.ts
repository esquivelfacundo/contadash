import { Request, Response, NextFunction } from 'express'
import * as reportService from '../services/report.service'

export async function getTransactionsReport(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { startDate, endDate, type } = req.query

    const report = await reportService.generateTransactionsReport(
      req.user.userId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      type as 'INCOME' | 'EXPENSE' | undefined
    )

    res.json(report)
  } catch (error) {
    next(error)
  }
}
