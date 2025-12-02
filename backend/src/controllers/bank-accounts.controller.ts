import { Request, Response, NextFunction } from 'express'
import * as bankAccountService from '../services/bank-account.service'

export async function getAllBankAccounts(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const currency = req.query.currency as 'ARS' | 'USD' | undefined
    const accounts = await bankAccountService.getAllBankAccounts(req.user.userId, currency)
    
    res.json({
      success: true,
      bankAccounts: accounts,
    })
  } catch (error) {
    next(error)
  }
}

export async function getBankAccountById(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const account = await bankAccountService.getBankAccountById(req.params.id, req.user.userId)
    
    res.json({
      success: true,
      bankAccount: account,
    })
  } catch (error) {
    next(error)
  }
}

export async function createBankAccount(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const account = await bankAccountService.createBankAccount(req.user.userId, req.body)
    
    res.status(201).json({
      success: true,
      bankAccount: account,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateBankAccount(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const account = await bankAccountService.updateBankAccount(req.params.id, req.user.userId, req.body)
    
    res.json({
      success: true,
      bankAccount: account,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteBankAccount(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await bankAccountService.deleteBankAccount(req.params.id, req.user.userId)
    
    res.json({
      success: true,
      message: 'Cuenta bancaria eliminada correctamente',
    })
  } catch (error) {
    next(error)
  }
}

export async function getBankAccountStats(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const month = req.query.month ? Number(req.query.month) : undefined
    const year = req.query.year ? Number(req.query.year) : undefined

    const stats = await bankAccountService.getBankAccountStats(req.params.id, req.user.userId, month, year)
    
    res.json({
      success: true,
      ...stats,
    })
  } catch (error) {
    next(error)
  }
}
