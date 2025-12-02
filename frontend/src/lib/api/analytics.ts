import { apiClient } from './client'

export const analyticsApi = {
  getDashboard: async () => {
    const response = await apiClient.get('/analytics/dashboard')
    return response.data
  },

  getTrend: async (year?: number, months?: number) => {
    const response = await apiClient.get('/analytics/trend', {
      params: { year, months },
    })
    return response.data.trend
  },

  getCategoryBreakdown: async (type: 'INCOME' | 'EXPENSE', month?: number, year?: number) => {
    const response = await apiClient.get('/analytics/category-breakdown', {
      params: { type, month, year },
    })
    return response.data.breakdown
  },

  getClientAnalysis: async (clientId: string) => {
    const response = await apiClient.get(`/analytics/client/${clientId}`)
    return response.data.analysis
  },

  comparePeriods: async (
    period1: { month?: number; year: number },
    period2: { month?: number; year: number }
  ) => {
    const response = await apiClient.get('/analytics/compare-periods', {
      params: {
        year1: period1.year,
        month1: period1.month,
        year2: period2.year,
        month2: period2.month,
      },
    })
    return response.data
  },

  getProjections: async (months: number = 3) => {
    const response = await apiClient.get('/analytics/projections', {
      params: { months },
    })
    return response.data
  },
}
