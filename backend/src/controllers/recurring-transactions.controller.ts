import { Request, Response, NextFunction } from 'express'
import * as recurringService from '../services/recurring-transaction.service'

export async function getAllRecurringTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined
    const recurring = await recurringService.getAllRecurringTransactions(req.user.userId, isActive)
    res.json(recurring)
  } catch (error) {
    next(error)
  }
}

export async function getRecurringTransactionById(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const recurring = await recurringService.getRecurringTransactionById(req.params.id, req.user.userId)
    res.json(recurring)
  } catch (error) {
    next(error)
  }
}

export async function createRecurringTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const recurring = await recurringService.createRecurringTransaction(req.user.userId, req.body)
    res.status(201).json(recurring)
  } catch (error) {
    next(error)
  }
}

export async function updateRecurringTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const recurring = await recurringService.updateRecurringTransaction(req.params.id, req.user.userId, req.body)
    res.json(recurring)
  } catch (error) {
    next(error)
  }
}

export async function deleteRecurringTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await recurringService.deleteRecurringTransaction(req.params.id, req.user.userId)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export async function generateTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const date = req.body.date ? new Date(req.body.date) : new Date()
    const transaction = await recurringService.generateTransactionFromRecurring(req.params.id, req.user.userId, date)
    res.status(201).json(transaction)
  } catch (error) {
    next(error)
  }
}

export async function markAsPaid(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const transaction = await recurringService.markTransactionAsPaid(req.params.transactionId, req.user.userId)
    res.json(transaction)
  } catch (error) {
    next(error)
  }
}

export async function getUpcoming(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const month = req.query.month ? Number(req.query.month) : new Date().getMonth() + 1
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear()

    const upcoming = await recurringService.getUpcomingRecurringTransactions(req.user.userId, month, year)
    res.json(upcoming)
  } catch (error) {
    next(error)
  }
}

export async function endRecurringTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { endMonth, endYear } = req.body
    
    if (!endMonth || !endYear) {
      return res.status(400).json({ error: 'endMonth and endYear are required' })
    }

    const recurring = await recurringService.endRecurringTransaction(
      req.params.id, 
      req.user.userId, 
      Number(endMonth), 
      Number(endYear)
    )
    res.json(recurring)
  } catch (error) {
    next(error)
  }
}
