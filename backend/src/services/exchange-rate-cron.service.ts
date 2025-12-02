import cron from 'node-cron'
import { prisma } from '../config/database'
import { getDolarBlue } from './dolarapi.service'

/**
 * Cron job to capture exchange rate daily
 * Runs every day at 20:00 (8 PM)
 */
export function startExchangeRateCron() {
  // Run every day at 20:00
  cron.schedule('0 20 * * *', async () => {
    try {
      console.log('🔄 Capturando cotización del dólar...')
      
      const rate = await getDolarBlue()
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Set to start of day
      
      // Check if we already have a rate for today
      const existing = await prisma.exchangeRate.findUnique({
        where: { date: today },
      })
      
      if (existing) {
        // Update existing rate
        await prisma.exchangeRate.update({
          where: { date: today },
          data: { rate, source: 'dolarapi' },
        })
        console.log(`✅ Cotización actualizada: $${rate} (${today.toISOString().split('T')[0]})`)
      } else {
        // Create new rate
        await prisma.exchangeRate.create({
          data: {
            date: today,
            currencyFrom: 'USD',
            currencyTo: 'ARS',
            rate,
            source: 'dolarapi',
          },
        })
        console.log(`✅ Cotización guardada: $${rate} (${today.toISOString().split('T')[0]})`)
      }
    } catch (error) {
      console.error('❌ Error capturando cotización:', error)
    }
  })
  
  console.log('✅ Cron de cotización iniciado (se ejecuta diariamente a las 20:00)')
}

/**
 * Manually capture today's exchange rate
 */
export async function captureExchangeRateNow() {
  try {
    console.log('🔄 Capturando cotización actual...')
    
    const rate = await getDolarBlue()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const existing = await prisma.exchangeRate.findUnique({
      where: { date: today },
    })
    
    if (existing) {
      await prisma.exchangeRate.update({
        where: { date: today },
        data: { rate, source: 'dolarapi' },
      })
      console.log(`✅ Cotización actualizada: $${rate}`)
    } else {
      await prisma.exchangeRate.create({
        data: {
          date: today,
          currencyFrom: 'USD',
          currencyTo: 'ARS',
          rate,
          source: 'dolarapi',
        },
      })
      console.log(`✅ Cotización guardada: $${rate}`)
    }
    
    return rate
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}
