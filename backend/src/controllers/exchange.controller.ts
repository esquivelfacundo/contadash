import { Request, Response, NextFunction } from 'express'
import * as dolarApiService from '../services/dolarapi.service'
import { prisma } from '../config/database'

export async function getDolarBlue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const rate = await dolarApiService.getDolarBlue()
    res.json({ rate, type: 'blue' })
  } catch (error) {
    next(error)
  }
}

export async function getDolarOficial(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const rate = await dolarApiService.getDolarOficial()
    res.json({ rate, type: 'oficial' })
  } catch (error) {
    next(error)
  }
}

export async function getAllQuotes(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const quotes = await dolarApiService.getAllDolarQuotes()
    res.json({ quotes })
  } catch (error) {
    next(error)
  }
}

export async function getDolarBlueForDate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { date } = req.query
    
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'Date parameter is required (YYYY-MM-DD)' })
    }

    // Parse the date (YYYY-MM-DD format)
    const [yearStr, monthStr, dayStr] = date.split('-')
    const targetDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr))
    targetDate.setHours(0, 0, 0, 0)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    console.log(`[Exchange] Requested date: ${date}, Parsed: ${targetDate.toISOString()}`)

    // If the date is today or in the future, get current rate from API
    if (targetDate >= today) {
      const rate = await dolarApiService.getDolarBlue()
      console.log(`[Exchange] Future/current date, using API: ${rate}`)
      return res.json({ rate, date, type: 'blue', source: 'api' })
    }

    // For past dates, try to get from our database
    // First try exact date
    let exchangeRate = await prisma.exchangeRate.findUnique({
      where: { date: targetDate },
    })
    
    console.log(`[Exchange] Exact match for ${targetDate.toISOString()}: ${exchangeRate ? exchangeRate.rate : 'not found'}`)

    // If not found, get the closest rate before this date
    if (!exchangeRate) {
      exchangeRate = await prisma.exchangeRate.findFirst({
        where: {
          date: {
            lte: targetDate,
          },
        },
        orderBy: { date: 'desc' },
      })
      console.log(`[Exchange] Closest match before ${targetDate.toISOString()}: ${exchangeRate ? `${exchangeRate.rate} (${exchangeRate.date.toISOString()})` : 'not found'}`)
    }

    // If still not found in database, try API as fallback
    if (!exchangeRate) {
      console.log(`[Exchange] No rate found in DB, using API fallback`)
      try {
        const rate = await dolarApiService.getDolarBlue()
        return res.json({ rate, date, type: 'blue', source: 'api-fallback' })
      } catch {
        // Last resort: return default
        console.log(`[Exchange] API failed, using default 1000`)
        return res.json({ rate: 1000, date, type: 'blue', source: 'default' })
      }
    }

    const rate = Number(exchangeRate.rate)
    console.log(`[Exchange] Returning rate: ${rate} from ${exchangeRate.date.toISOString()}`)
    res.json({ rate, date, type: 'blue', source: 'database' })
  } catch (error) {
    next(error)
  }
}
