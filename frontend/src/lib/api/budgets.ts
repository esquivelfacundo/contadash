import { apiClient } from './client'

export interface Budget {
  id: string
  userId: string
  categoryId: string
  month: number
  year: number
  amountArs: number
  amountUsd: number
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
    icon: string
    color: string
    type: 'INCOME' | 'EXPENSE'
  }
  spending?: {
    ars: number
    usd: number
  }
  remaining?: {
    ars: number
    usd: number
  }
  percentage?: {
    ars: number
    usd: number
  }
  status?: 'ok' | 'warning' | 'exceeded'
}

export interface CreateBudgetInput {
  categoryId: string
  month: number
  year: number
  amountArs: number
  amountUsd: number
}

export interface UpdateBudgetInput {
  categoryId?: string
  month?: number
  year?: number
  amountArs?: number
  amountUsd?: number
}

export interface BudgetFilters {
  categoryId?: string
  month?: number
  year?: number
}

export interface BudgetSummary {
  summary: {
    totalBudgets: number
    totalBudgetedArs: number
    totalBudgetedUsd: number
    totalSpentArs: number
    totalSpentUsd: number
    totalRemainingArs: number
    totalRemainingUsd: number
    exceeded: number
    warning: number
    ok: number
  }
  budgets: Budget[]
}

export const budgetsApi = {
  /**
   * Get all budgets with optional filters
   */
  getAll: async (filters?: BudgetFilters): Promise<Budget[]> => {
    const response = await apiClient.get('/budgets', { params: filters })
    return response.data.budgets
  },

  /**
   * Get a single budget by ID
   */
  getById: async (id: string): Promise<Budget> => {
    const response = await apiClient.get(`/budgets/${id}`)
    return response.data.budget
  },

  /**
   * Get budgets with spending comparison for a specific period
   */
  getWithSpending: async (month: number, year: number): Promise<Budget[]> => {
    const response = await apiClient.get('/budgets/with-spending', {
      params: { month, year },
    })
    return response.data.budgets
  },

  /**
   * Get budget summary for a period
   */
  getSummary: async (month: number, year: number): Promise<BudgetSummary> => {
    const response = await apiClient.get('/budgets/summary', {
      params: { month, year },
    })
    return response.data
  },

  /**
   * Create a new budget
   */
  create: async (data: CreateBudgetInput): Promise<Budget> => {
    const response = await apiClient.post('/budgets', data)
    return response.data.budget
  },

  /**
   * Update a budget
   */
  update: async (id: string, data: UpdateBudgetInput): Promise<Budget> => {
    const response = await apiClient.put(`/budgets/${id}`, data)
    return response.data.budget
  },

  /**
   * Delete a budget
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/budgets/${id}`)
  },

  /**
   * Copy budgets from one period to another
   */
  copy: async (
    fromMonth: number,
    fromYear: number,
    toMonth: number,
    toYear: number
  ): Promise<Budget[]> => {
    const response = await apiClient.post('/budgets/copy', {
      fromMonth,
      fromYear,
      toMonth,
      toYear,
    })
    return response.data.budgets
  },
}
