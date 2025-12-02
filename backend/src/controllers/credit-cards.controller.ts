import { Request, Response, NextFunction } from 'express'
import * as creditCardService from '../services/credit-card.service'

export async function getAllCreditCards(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const cards = await creditCardService.getAllCreditCards(req.user.userId)
    res.json(cards)
  } catch (error) {
    next(error)
  }
}

export async function getCreditCardById(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const card = await creditCardService.getCreditCardById(req.params.id, req.user.userId)
    res.json(card)
  } catch (error) {
    next(error)
  }
}

export async function createCreditCard(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const card = await creditCardService.createCreditCard(req.user.userId, req.body)
    res.status(201).json(card)
  } catch (error) {
    next(error)
  }
}

export async function updateCreditCard(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const card = await creditCardService.updateCreditCard(req.params.id, req.user.userId, req.body)
    res.json(card)
  } catch (error) {
    next(error)
  }
}

export async function deleteCreditCard(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await creditCardService.deleteCreditCard(req.params.id, req.user.userId)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export async function getCreditCardStats(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const month = req.query.month ? Number(req.query.month) : undefined
    const year = req.query.year ? Number(req.query.year) : undefined

    const stats = await creditCardService.getCreditCardStats(req.params.id, req.user.userId, month, year)
    res.json(stats)
  } catch (error) {
    next(error)
  }
}
