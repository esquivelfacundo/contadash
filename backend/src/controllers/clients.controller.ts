import { Request, Response, NextFunction } from 'express'
import * as clientService from '../services/client.service'
import { CreateClientInput, UpdateClientInput } from '../validations/client.validation'

export async function getClients(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const activeOnly = req.query.active === 'true'

    const clients = await clientService.getClients(req.user.userId, activeOnly)

    res.json({ clients })
  } catch (error) {
    next(error)
  }
}

export async function getClientById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const client = await clientService.getClientById(req.user.userId, id)

    res.json({ client })
  } catch (error) {
    next(error)
  }
}

export async function createClient(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const data: CreateClientInput = req.body
    const client = await clientService.createClient(req.user.userId, data)

    res.status(201).json({
      message: 'Client created successfully',
      client,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateClient(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const data: UpdateClientInput = req.body

    const client = await clientService.updateClient(req.user.userId, id, data)

    res.json({
      message: 'Client updated successfully',
      client,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteClient(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const result = await clientService.deleteClient(req.user.userId, id)

    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function getClientStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const stats = await clientService.getClientStats(req.user.userId, id)

    res.json({ stats })
  } catch (error) {
    next(error)
  }
}
