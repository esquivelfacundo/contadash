import axios from 'axios'

const DOLAR_API_URL = 'https://dolarapi.com/v1'

interface DolarQuote {
  casa: string
  nombre: string
  compra: number
  venta: number
  fechaActualizacion: string
}

export async function getDolarBlue(): Promise<number> {
  try {
    const response = await axios.get<DolarQuote>(`${DOLAR_API_URL}/dolares/blue`)
    return response.data.venta
  } catch (error) {
    console.error('Error fetching dolar blue:', error)
    return 1000 // Fallback value
  }
}

export async function getDolarOficial(): Promise<number> {
  try {
    const response = await axios.get<DolarQuote>(`${DOLAR_API_URL}/dolares/oficial`)
    return response.data.venta
  } catch (error) {
    console.error('Error fetching dolar oficial:', error)
    return 900 // Fallback value
  }
}

export async function getAllDolarQuotes() {
  try {
    const response = await axios.get<DolarQuote[]>(`${DOLAR_API_URL}/dolares`)
    return response.data
  } catch (error) {
    console.error('Error fetching all dolar quotes:', error)
    return []
  }
}

/**
 * Get historical dolar blue rate for a specific date
 * @param date Date in YYYY-MM-DD format
 * @returns Exchange rate for that date, or current rate if date is today/future
 */
export async function getDolarBlueForDate(date: string): Promise<number> {
  try {
    const targetDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    targetDate.setHours(0, 0, 0, 0)

    // If date is today or future, return current rate
    if (targetDate >= today) {
      return await getDolarBlue()
    }

    // For past dates, try to get historical rate
    // Format: YYYY/MM/DD
    const year = targetDate.getFullYear()
    const month = String(targetDate.getMonth() + 1).padStart(2, '0')
    const day = String(targetDate.getDate()).padStart(2, '0')
    const formattedDate = `${year}/${month}/${day}`

    const response = await axios.get<DolarQuote>(
      `${DOLAR_API_URL}/dolares/blue/${formattedDate}`
    )
    return response.data.venta
  } catch (error) {
    console.error(`Error fetching dolar blue for date ${date}:`, error)
    // If historical data not available, return current rate as fallback
    return await getDolarBlue()
  }
}
