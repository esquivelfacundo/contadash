import { apiClient } from './client'

export interface ScheduledReportInput {
  name: string
  type: 'MONTHLY' | 'ANNUAL' | 'CLIENT' | 'CATEGORY' | 'CUSTOM'
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  format: 'PDF' | 'EXCEL' | 'BOTH'
  recipients: string[]
  filters?: any
}

export const reportsApi = {
  // Generar reportes
  generateMonthlyReport: async (month: number, year: number, format?: 'pdf' | 'excel') => {
    const params = new URLSearchParams({ month: month.toString(), year: year.toString() })
    if (format) params.append('format', format)
    
    if (format) {
      const response = await apiClient.get(`/reports/monthly?${params.toString()}`, {
        responseType: 'blob',
      })
      return response.data
    }
    
    const response = await apiClient.get(`/reports/monthly?${params.toString()}`)
    return response.data
  },

  generateAnnualReport: async (year: number, format?: 'pdf' | 'excel') => {
    const params = new URLSearchParams({ year: year.toString() })
    if (format) params.append('format', format)
    
    if (format) {
      const response = await apiClient.get(`/reports/annual?${params.toString()}`, {
        responseType: 'blob',
      })
      return response.data
    }
    
    const response = await apiClient.get(`/reports/annual?${params.toString()}`)
    return response.data
  },

  generateClientReport: async (
    clientId: string,
    startDate?: string,
    endDate?: string,
    format?: 'pdf' | 'excel'
  ) => {
    const params = new URLSearchParams({ clientId })
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (format) params.append('format', format)
    
    if (format) {
      const response = await apiClient.get(`/reports/client?${params.toString()}`, {
        responseType: 'blob',
      })
      return response.data
    }
    
    const response = await apiClient.get(`/reports/client?${params.toString()}`)
    return response.data
  },

  generateCategoryReport: async (
    categoryId: string,
    startDate?: string,
    endDate?: string,
    format?: 'pdf' | 'excel'
  ) => {
    const params = new URLSearchParams({ categoryId })
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (format) params.append('format', format)
    
    if (format) {
      const response = await apiClient.get(`/reports/category?${params.toString()}`, {
        responseType: 'blob',
      })
      return response.data
    }
    
    const response = await apiClient.get(`/reports/category?${params.toString()}`)
    return response.data
  },

  generateCustomReport: async (filters: any, format?: 'pdf' | 'excel') => {
    const params = new URLSearchParams(filters)
    if (format) params.append('format', format)
    
    if (format) {
      const response = await apiClient.get(`/reports/custom?${params.toString()}`, {
        responseType: 'blob',
      })
      return response.data
    }
    
    const response = await apiClient.get(`/reports/custom?${params.toString()}`)
    return response.data
  },

  // Enviar reporte por email
  sendReportByEmail: async (data: any) => {
    const response = await apiClient.post('/reports/send-email', data)
    return response.data
  },

  // Reportes programados
  getScheduledReports: async () => {
    const response = await apiClient.get('/reports/scheduled')
    return response.data
  },

  createScheduledReport: async (data: ScheduledReportInput) => {
    const response = await apiClient.post('/reports/scheduled', data)
    return response.data
  },

  getScheduledReportById: async (id: string) => {
    const response = await apiClient.get(`/reports/scheduled/${id}`)
    return response.data
  },

  updateScheduledReport: async (id: string, data: Partial<ScheduledReportInput>) => {
    const response = await apiClient.put(`/reports/scheduled/${id}`, data)
    return response.data
  },

  deleteScheduledReport: async (id: string) => {
    const response = await apiClient.delete(`/reports/scheduled/${id}`)
    return response.data
  },

  toggleScheduledReport: async (id: string, isActive: boolean) => {
    const response = await apiClient.patch(`/reports/scheduled/${id}/toggle`, { isActive })
    return response.data
  },

  executeScheduledReport: async (id: string) => {
    const response = await apiClient.post(`/reports/scheduled/${id}/execute`)
    return response.data
  },
}
