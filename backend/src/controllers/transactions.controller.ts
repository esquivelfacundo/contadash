import { Request, Response, NextFunction } from 'express'
import * as transactionService from '../services/transaction.service'
import { CreateTransactionInput, UpdateTransactionInput, TransactionFilters } from '../validations/transaction.validation'

export async function getTransactions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const filters: TransactionFilters = req.query as any

    const result = await transactionService.getTransactions(req.user.userId, filters)

    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function getTransactionsWithCreditCards(
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

    const result = await transactionService.getTransactionsWithCreditCardPlaceholders(
      req.user.userId,
      parseInt(month as string),
      parseInt(year as string)
    )

    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function getTransactionById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const transaction = await transactionService.getTransactionById(req.user.userId, id)

    res.json({ transaction })
  } catch (error) {
    next(error)
  }
}

export async function createTransaction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const data: CreateTransactionInput = req.body
    const transaction = await transactionService.createTransaction(req.user.userId, data)

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateTransaction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const data: UpdateTransactionInput = req.body

    const transaction = await transactionService.updateTransaction(
      req.user.userId,
      id,
      data
    )

    res.json({
      message: 'Transaction updated successfully',
      transaction,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteTransaction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const result = await transactionService.deleteTransaction(req.user.userId, id)

    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function getTransactionStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const month = req.query.month ? parseInt(req.query.month as string) : undefined
    const year = req.query.year ? parseInt(req.query.year as string) : undefined

    const stats = await transactionService.getTransactionStats(req.user.userId, month, year)

    res.json({ stats })
  } catch (error) {
    next(error)
  }
}
