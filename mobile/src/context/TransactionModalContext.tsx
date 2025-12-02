import React, { createContext, useContext, useState, ReactNode } from 'react'

interface TransactionModalContextType {
  incomeModalOpen: boolean
  expenseModalOpen: boolean
  openIncomeModal: () => void
  openExpenseModal: () => void
  closeIncomeModal: () => void
  closeExpenseModal: () => void
}

const TransactionModalContext = createContext<TransactionModalContextType | undefined>(undefined)

export const useTransactionModal = () => {
  const context = useContext(TransactionModalContext)
  if (!context) {
    throw new Error('useTransactionModal must be used within TransactionModalProvider')
  }
  return context
}

interface TransactionModalProviderProps {
  children: ReactNode
}

export const TransactionModalProvider: React.FC<TransactionModalProviderProps> = ({ children }) => {
  const [incomeModalOpen, setIncomeModalOpen] = useState(false)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)

  const openIncomeModal = () => setIncomeModalOpen(true)
  const openExpenseModal = () => setExpenseModalOpen(true)
  const closeIncomeModal = () => setIncomeModalOpen(false)
  const closeExpenseModal = () => setExpenseModalOpen(false)

  return (
    <TransactionModalContext.Provider
      value={{
        incomeModalOpen,
        expenseModalOpen,
        openIncomeModal,
        openExpenseModal,
        closeIncomeModal,
        closeExpenseModal,
      }}
    >
      {children}
    </TransactionModalContext.Provider>
  )
}
