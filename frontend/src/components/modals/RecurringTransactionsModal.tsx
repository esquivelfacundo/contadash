'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Repeat as RepeatIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { recurringTransactionsApi } from '@/lib/api/recurring-transactions'
import RecurringTransactionFormDialog from '@/components/RecurringTransactionFormDialog'

interface RecurringTransactionsModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function RecurringTransactionsModal({ open, onClose, onSuccess }: RecurringTransactionsModalProps) {
  const [recurringTransactions, setRecurringTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    if (open) {
      loadRecurringTransactions()
    }
  }, [open])

  const loadRecurringTransactions = async () => {
    try {
      setLoading(true)
      const data = await recurringTransactionsApi.getAll()
      setRecurringTransactions(data)
    } catch (err: any) {
      setError('Error al cargar transacciones recurrentes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingTransaction(null)
    setFormDialogOpen(true)
  }

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction)
    setFormDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta transacción recurrente?')) return

    try {
      await recurringTransactionsApi.delete(id)
      loadRecurringTransactions()
      onSuccess?.()
    } catch (err: any) {
      setError('Error al eliminar transacción recurrente')
    }
  }

  const handleFormClose = () => {
    setFormDialogOpen(false)
    setEditingTransaction(null)
    loadRecurringTransactions()
    onSuccess?.()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatCurrencyUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getBaseCurrency = (transaction: any) => {
    const amountArs = Number(transaction.amountArs || 0)
    const amountUsd = Number(transaction.amountUsd || 0)
    
    if (amountUsd > 0 && amountArs === 0) {
      return 'USD'
    } else if (amountArs > 0 && amountUsd === 0) {
      return 'ARS'
    } else if (amountUsd > 0 && amountArs > 0) {
      // Both set - determine by checking which calculation matches
      const exchangeRate = Number(transaction.exchangeRate || 1)
      const calculatedArsFromUsd = amountUsd * exchangeRate
      const diffFromUsdBase = Math.abs(calculatedArsFromUsd - amountArs)
      const percentDiff = (diffFromUsdBase / amountArs) * 100
      return percentDiff < 1 ? 'USD' : 'ARS'
    }
    return 'ARS'
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'MONTHLY': return 'Mensual'
      case 'YEARLY': return 'Anual'
      default: return frequency
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'INCOME' ? 'success' : 'error'
  }

  const getTypeLabel = (type: string) => {
    return type === 'INCOME' ? 'Ingreso' : 'Egreso'
  }

  const incomeTransactions = recurringTransactions.filter(t => t.type === 'INCOME')
  const expenseTransactions = recurringTransactions.filter(t => t.type === 'EXPENSE')
  const currentTransactions = tabValue === 0 ? incomeTransactions : expenseTransactions

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1E293B',
            color: 'white',
          },
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <RepeatIcon sx={{ color: '#10B981' }} />
            <Typography variant="h6" color="white">Transacciones Recurrentes</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
            >
              Nueva Transacción Recurrente
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Tabs */}
          <Card sx={{ mb: 3, bgcolor: '#0F172A', border: '1px solid #334155' }}>
            <Tabs 
              value={tabValue} 
              onChange={(_, value) => setTabValue(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  color: '#94A3B8',
                  '&.Mui-selected': {
                    color: '#10B981',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#10B981',
                },
              }}
            >
              <Tab label={`Ingresos (${incomeTransactions.length})`} />
              <Tab label={`Egresos (${expenseTransactions.length})`} />
            </Tabs>
          </Card>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress sx={{ color: '#CD9FCC' }} />
            </Box>
          ) : currentTransactions.length === 0 ? (
            <Box textAlign="center" py={4}>
              <RepeatIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay {tabValue === 0 ? 'ingresos' : 'egresos'} recurrentes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Crea transacciones que se repitan automáticamente cada mes o año
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Cliente/Empresa</TableCell>
                    <TableCell align="right">Monto ARS</TableCell>
                    <TableCell align="right">Monto USD</TableCell>
                    <TableCell align="center">Moneda Base</TableCell>
                    <TableCell>Frecuencia</TableCell>
                    <TableCell>Fecha Inicio</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentTransactions.map((transaction) => {
                    const baseCurrency = getBaseCurrency(transaction)
                    const amountArs = Number(transaction.amountArs || 0)
                    const amountUsd = Number(transaction.amountUsd || 0)
                    const exchangeRate = Number(transaction.exchangeRate || 1)
                    
                    // Calculate display amounts
                    let displayArs = amountArs
                    let displayUsd = amountUsd
                    
                    if (baseCurrency === 'USD' && amountUsd > 0) {
                      displayUsd = amountUsd
                      displayArs = amountUsd * exchangeRate
                    } else if (baseCurrency === 'ARS' && amountArs > 0) {
                      displayArs = amountArs
                      displayUsd = amountArs / exchangeRate
                    }
                    
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold" color="white">
                            {transaction.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {transaction.category && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <span>{transaction.category.icon}</span>
                              <Typography variant="body2" color="white">
                                {transaction.category.name}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          {transaction.client ? (
                            <Typography variant="body2" color="white">
                              {transaction.client.company}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="subtitle2" 
                            fontWeight={baseCurrency === 'ARS' ? 'bold' : 'normal'}
                            color={transaction.type === 'INCOME' ? '#10B981' : '#EF4444'}
                          >
                            {formatCurrency(displayArs)}
                          </Typography>
                          {baseCurrency === 'ARS' && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Fijo
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="subtitle2" 
                            fontWeight={baseCurrency === 'USD' ? 'bold' : 'normal'}
                            color={transaction.type === 'INCOME' ? '#10B981' : '#EF4444'}
                          >
                            {formatCurrencyUSD(displayUsd)}
                          </Typography>
                          {baseCurrency === 'USD' && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Fijo
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={baseCurrency}
                            size="small"
                            sx={{
                              bgcolor: baseCurrency === 'USD' ? '#3B82F6' : '#10B981',
                              color: 'white',
                              fontWeight: 'bold',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getFrequencyLabel(transaction.frequency)}
                            variant="outlined"
                            size="small"
                            sx={{ 
                              borderColor: '#334155',
                              color: '#94A3B8',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="white">
                            {new Date(transaction.startDate).toLocaleDateString('es-AR', { 
                              day: '2-digit',
                              month: '2-digit', 
                              year: 'numeric' 
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={transaction.isActive ? 'Activa' : 'Inactiva'}
                            size="small"
                            sx={{
                              bgcolor: transaction.isActive ? '#10B981' : '#6B7280',
                              color: 'white',
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(transaction)}
                            sx={{ color: '#94A3B8', '&:hover': { color: '#10B981' } }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(transaction.id)}
                            sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <RecurringTransactionFormDialog
        open={formDialogOpen}
        onClose={handleFormClose}
        onSuccess={handleFormClose}
        recurring={editingTransaction}
      />
    </>
  )
}
