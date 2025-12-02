import axios from 'axios'
import { prisma } from '../config/database'

const ARGENTINA_DATOS_API = 'https://api.argentinadatos.com/v1'

interface DolarQuote {
  casa: string
  nombre: string
  compra: number
  venta: number
  fechaActualizacion: string
}

/**
 * Get current dolar blue rate from ArgentinaDatos API
 */
export async function getDolarBlueFromArgentinaDatos(): Promise<number> {
  try {
    const response = await axios.get<DolarQuote[]>(
      `${ARGENTINA_DATOS_API}/cotizaciones/dolares`
    )
    
    const blue = response.data.find(d => d.casa === 'blue')
    if (!blue) {
      throw new Error('Dólar blue no encontrado en la respuesta')
    }
    
    return blue.venta
  } catch (error) {
    console.error('Error fetching from ArgentinaDatos:', error)
    throw error
  }
}

/**
 * Get historical dolar blue rate for a specific date
 */
export async function getDolarBlueHistorical(date: string): Promise<number> {
  try {
    const response = await axios.get<DolarQuote>(
      `${ARGENTINA_DATOS_API}/cotizaciones/dolares/blue/${date}`
    )
    
    return response.data.venta
  } catch (error) {
    console.error(`Error fetching historical rate for ${date}:`, error)
    throw error
  }
}

/**
 * Populate historical rates from ArgentinaDatos
 */
export async function populateHistoricalRates(
  startDate: Date,
  endDate: Date
): Promise<void> {
  const dates = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  console.log(`📊 Poblando ${dates.length} cotizaciones históricas desde ArgentinaDatos...`)
  console.log(`📅 Rango: ${startDate.toISOString().split('T')[0]} → ${endDate.toISOString().split('T')[0]}\n`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const date of dates) {
    try {
      const dateStr = date.toISOString().split('T')[0]
      const rate = await getDolarBlueHistorical(dateStr)
      
      await prisma.exchangeRate.upsert({
        where: { date },
        update: { rate, source: 'argentinadatos' },
        create: {
          date,
          currencyFrom: 'USD',
          currencyTo: 'ARS',
          rate,
          source: 'argentinadatos',
        },
      })
      
      console.log(`  ✅ ${dateStr}: $${rate}`)
      successCount++
      
      // Delay to avoid rate limiting (100ms between requests)
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error: any) {
      console.error(`  ❌ Error en ${date.toISOString().split('T')[0]}: ${error.message}`)
      errorCount++
    }
  }
  
  console.log('\n📊 Resumen:')
  console.log(`  ✅ Exitosas: ${successCount}`)
  console.log(`  ❌ Errores: ${errorCount}`)
  console.log(`  📈 Total: ${dates.length}`)
  console.log('\n✅ Población completada')
}

/**
 * Populate only the last day of each month (for efficiency)
 */
export async function populateMonthlyClosingRates(year: number): Promise<void> {
  console.log(`📊 Poblando cotizaciones de cierre mensual para ${year}...\n`)
  
  const months = []
  for (let month = 1; month <= 12; month++) {
    // Get last day of each month
    const lastDay = new Date(year, month, 0)
    
    // Only process if the date is in the past
    if (lastDay <= new Date()) {
      months.push(lastDay)
    }
  }
  
  let successCount = 0
  let errorCount = 0
  
  for (const date of months) {
    try {
      const dateStr = date.toISOString().split('T')[0]
      const rate = await getDolarBlueHistorical(dateStr)
      
      await prisma.exchangeRate.upsert({
        where: { date },
        update: { rate, source: 'argentinadatos' },
        create: {
          date,
          currencyFrom: 'USD',
          currencyTo: 'ARS',
          rate,
          source: 'argentinadatos',
        },
      })
      
      console.log(`  ✅ ${dateStr}: $${rate}`)
      successCount++
      
      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error: any) {
      console.error(`  ❌ Error en ${date.toISOString().split('T')[0]}: ${error.message}`)
      errorCount++
    }
  }
  
  console.log('\n📊 Resumen:')
  console.log(`  ✅ Exitosas: ${successCount}`)
  console.log(`  ❌ Errores: ${errorCount}`)
  console.log(`  📈 Total: ${months.length}`)
  console.log('\n✅ Población completada')
}
