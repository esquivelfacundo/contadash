import { apiClient } from './client'

export const exchangeApi = {
  getDolarBlue: async () => {
    const response = await apiClient.get('/exchange/blue')
    return response.data.rate
  },

  getDolarBlueForDate: async (date: string) => {
    const response = await apiClient.get('/exchange/blue/date', {
      params: { date }
    })
    return response.data.rate
  },

  getDolarOficial: async () => {
    const response = await apiClient.get('/exchange/oficial')
    return response.data.rate
  },

  getAllQuotes: async () => {
    const response = await apiClient.get('/exchange/all')
    return response.data.quotes
  },
}
