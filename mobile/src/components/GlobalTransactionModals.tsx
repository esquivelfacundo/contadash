import React from 'react'
import { IncomeTransactionModal } from './IncomeTransactionModal'
import { ExpenseTransactionModal } from './ExpenseTransactionModal'
import { useTransactionModal } from '../context/TransactionModalContext'

export const GlobalTransactionModals: React.FC = () => {
  const { 
    incomeModalOpen, 
    expenseModalOpen,
    closeIncomeModal,
    closeExpenseModal 
  } = useTransactionModal()

  const handleIncomeSuccess = () => {
    closeIncomeModal()
    // Aquí podrías agregar lógica para refrescar datos si es necesario
  }

  const handleExpenseSuccess = () => {
    closeExpenseModal()
    // Aquí podrías agregar lógica para refrescar datos si es necesario
  }

  return (
    <>
      {/* Modal de Ingreso Global */}
      <IncomeTransactionModal
        visible={incomeModalOpen}
        onDismiss={closeIncomeModal}
        onSuccess={handleIncomeSuccess}
        transaction={null}
      />

      {/* Modal de Egreso Global */}
      <ExpenseTransactionModal
        visible={expenseModalOpen}
        onDismiss={closeExpenseModal}
        onSuccess={handleExpenseSuccess}
        transaction={null}
      />
    </>
  )
}
