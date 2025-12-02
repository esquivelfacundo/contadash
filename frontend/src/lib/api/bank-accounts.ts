import { apiClient } from './client'

export interface BankAccount {
  id: string
  name: string
  bank: string
  accountType: 'SAVINGS' | 'CHECKING' | 'INVESTMENT'
  accountNumber: string
  currency: 'ARS' | 'USD'
  balance?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateBankAccountRequest {
  name: string
  bank: string
  accountType: 'SAVINGS' | 'CHECKING' | 'INVESTMENT'
  accountNumber: string
  currency: 'ARS' | 'USD'
  balance?: number
  isActive?: boolean
}

export interface UpdateBankAccountRequest extends Partial<CreateBankAccountRequest> {}

export const bankAccountsApi = {
  async getAll(): Promise<BankAccount[]> {
    const response = await apiClient.get('/bank-accounts')
    return response.data.bankAccounts || response.data || []
  },

  async getById(id: string): Promise<BankAccount> {
    const response = await apiClient.get(`/bank-accounts/${id}`)
    return response.data.bankAccount || response.data
  },

  async create(data: CreateBankAccountRequest): Promise<BankAccount> {
    const response = await apiClient.post('/bank-accounts', data)
    return response.data.bankAccount || response.data
  },

  async update(id: string, data: UpdateBankAccountRequest): Promise<BankAccount> {
    const response = await apiClient.put(`/bank-accounts/${id}`, data)
    return response.data.bankAccount || response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/bank-accounts/${id}`)
  },

  async getByCurrency(currency: 'ARS' | 'USD'): Promise<BankAccount[]> {
    const response = await apiClient.get(`/bank-accounts?currency=${currency}`)
    return response.data.bankAccounts || response.data || []
  }
}
