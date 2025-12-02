'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Box,
  Typography,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { transactionsApi } from '@/lib/api/transactions'
import { categoriesApi } from '@/lib/api/categories'
import { bankAccountsApi } from '@/lib/api/bank-accounts'
import { exchangeApi } from '@/lib/api/exchange'
import AttachmentUploader from './AttachmentUploader'

const expenseTransactionSchema = z.object({
  date: z.string().min(1, 'Fecha requerida'),
  categoryId: z.string().min(1, 'Categoría requerida'),
  description: z.string().min(1, 'Descripción requerida'),
  amountArs: z.number().positive('Monto debe ser positivo'),
  exchangeRate: z.number().positive('Cotización debe ser positiva'),
  paymentMethod: z.enum(['CASH', 'MERCADOPAGO', 'BANK_ACCOUNT', 'CRYPTO']),
  bankAccountId: z.string().optional(),
  attachmentUrl: z.string().nullable().optional(),
}).refine(
  (data) => {
    // Si el método de pago es cuenta bancaria, bankAccountId es requerido
    if (data.paymentMethod === 'BANK_ACCOUNT') {
      return data.bankAccountId && data.bankAccountId.length > 0
    }
    return true
  },
  {
    message: 'Debe seleccionar una cuenta bancaria',
    path: ['bankAccountId'],
  }
)

type ExpenseTransactionForm = z.infer<typeof expenseTransactionSchema>

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  transaction?: any
  defaultDate?: Date
}

export default function ExpenseTransactionDialog({
  open,
  onClose,
  onSuccess,
  transaction,
  defaultDate,
}: Props) {
  const [categories, setCategories] = useState<any[]>([])
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ExpenseTransactionForm>({
    resolver: zodResolver(expenseTransactionSchema),
    defaultValues: transaction
      ? {
          date: new Date(transaction.date).toISOString().split('T')[0],
          categoryId: transaction.categoryId,
          description: transaction.description,
          amountArs: Number(transaction.amountArs),
          exchangeRate: Number(transaction.exchangeRate),
          paymentMethod: transaction.paymentMethod || 'CASH',
          bankAccountId: transaction.bankAccountId || '',
          attachmentUrl: transaction.attachmentUrl || null,
        }
      : {
          date: defaultDate
            ? defaultDate.toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          categoryId: '',
          description: '',
          amountArs: 0,
          exchangeRate: 1000,
          paymentMethod: 'CASH',
          bankAccountId: '',
          attachmentUrl: null,
        },
  })

  const paymentMethod = watch('paymentMethod')
  const amountArs = watch('amountArs')
  const exchangeRate = watch('exchangeRate')
  const transactionDate = watch('date')
  const currency = exchangeRate === 1 ? 'USD' : 'ARS'

  useEffect(() => {
    if (open) {
      loadExpenseCategories()
      loadBankAccounts()
      
      // Cargar cotización para transacciones nuevas
      if (!transaction) {
        loadExchangeRate()
      }
    }
  }, [open])

  // Cargar cotización cuando cambie la fecha (tanto para creación como edición)
  useEffect(() => {
    if (open && transactionDate) {
      // Siempre cargar cotización cuando cambie la fecha, incluso en edición
      loadExchangeRate(transactionDate)
    }
  }, [transactionDate, open])

  const loadExpenseCategories = async () => {
    try {
      const data = await categoriesApi.getAll()
      // Filtrar solo categorías de egresos
      setCategories(data.filter((c: any) => c.type === 'EXPENSE'))
    } catch (err) {
      console.error('Error loading expense categories:', err)
    }
  }

  const loadBankAccounts = async () => {
    try {
      const data = await bankAccountsApi.getAll()
      setBankAccounts(data)
    } catch (err) {
      console.error('Error loading bank accounts:', err)
    }
  }

  const loadExchangeRate = async (date?: string) => {
    try {
      const selectedDate = date || new Date().toISOString().split('T')[0]
      const today = new Date()
      
      // Crear fecha local para evitar problemas de timezone
      const [year, month, day] = selectedDate.split('-').map(Number)
      const transactionDateObj = new Date(year, month - 1, day) // month - 1 porque Date usa 0-indexado
      
      console.log('🔍 Loading exchange rate for date:', selectedDate)
      console.log('📅 Today:', today.toISOString().split('T')[0])
      console.log('📅 Transaction date:', transactionDateObj.toISOString().split('T')[0])
      console.log('📅 Today month/year:', today.getMonth(), today.getFullYear())
      console.log('📅 Transaction month/year:', transactionDateObj.getMonth(), transactionDateObj.getFullYear())
      
      // Determinar si es mes actual o futuro
      const isCurrentOrFutureMonth = 
        transactionDateObj.getFullYear() > today.getFullYear() || 
        (transactionDateObj.getFullYear() === today.getFullYear() && 
         transactionDateObj.getMonth() >= today.getMonth())
      
      console.log('🔄 Is current or future month:', isCurrentOrFutureMonth)
      
      let rate: number
      
      if (isCurrentOrFutureMonth) {
        // Usar cotización actual para mes actual o futuro
        console.log('💹 Using current rate')
        rate = await exchangeApi.getDolarBlue()
      } else {
        // Usar cotización histórica para meses pasados
        // Obtener último día del mes de la transacción
        const lastDayOfMonth = new Date(
          transactionDateObj.getFullYear(), 
          transactionDateObj.getMonth() + 1, 
          0
        )
        const dateStr = lastDayOfMonth.toISOString().split('T')[0]
        
        console.log('📊 Using historical rate for:', dateStr)
        
        try {
          rate = await exchangeApi.getDolarBlueForDate(dateStr)
          console.log('✅ Historical rate found:', rate)
        } catch (err) {
          // Fallback a cotización actual si no hay histórico
          console.warn('⚠️ No historical rate found, using current rate:', err)
          rate = await exchangeApi.getDolarBlue()
        }
      }
      
      console.log('💰 Final rate:', rate)
      
      // Actualizar el campo de cotización
      setValue('exchangeRate', rate)
      
    } catch (err) {
      console.error('❌ Error loading exchange rate:', err)
      // Fallback a cotización por defecto
      setValue('exchangeRate', 1000)
    }
  }

  // Cargar cuentas bancarias cuando cambie la moneda
  useEffect(() => {
    if (open && paymentMethod === 'BANK_ACCOUNT') {
      loadBankAccounts()
    }
  }, [open, paymentMethod, currency])

  const onSubmit = async (data: ExpenseTransactionForm) => {
    try {
      setLoading(true)
      const payload = {
        ...data,
        type: 'EXPENSE' as const,
        amountUsd: data.amountArs / data.exchangeRate,
        bankAccountId: data.paymentMethod === 'BANK_ACCOUNT' ? data.bankAccountId : undefined,
        attachmentUrl: data.attachmentUrl || undefined,
      }

      if (transaction) {
        await transactionsApi.update(transaction.id, payload)
      } else {
        await transactionsApi.create(payload)
      }

      onSuccess()
      handleClose()
    } catch (err) {
      console.error('Error saving expense transaction:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const filteredBankAccounts = bankAccounts.filter((account) => account.currency === currency && account.isActive)
  const amountUsd = amountArs / exchangeRate

  const paymentMethodOptions = [
    { value: 'CASH', label: '💵 Efectivo' },
    { value: 'MERCADOPAGO', label: '💳 MercadoPago' },
    { value: 'BANK_ACCOUNT', label: '🏦 Cuenta Bancaria' },
    { value: 'CRYPTO', label: '₿ Criptomoneda' },
  ]

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1E293B', color: 'white' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <span style={{ fontSize: '1.5em' }}>💸</span>
          {transaction ? 'Editar Egreso' : 'Nuevo Egreso'}
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="form-input-fix" sx={{ bgcolor: '#1E293B' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Fecha"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.date}
                    helperText={errors.date?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Categoría de Egreso"
                    error={!!errors.categoryId}
                    helperText={errors.categoryId?.message}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Descripción"
                    multiline
                    rows={2}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="amountArs"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Monto (ARS)"
                    type="number"
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    error={!!errors.amountArs}
                    helperText={errors.amountArs?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="exchangeRate"
                control={control}
                render={({ field }) => {
                  const getExchangeRateHelperText = () => {
                    if (errors.exchangeRate?.message) return errors.exchangeRate.message
                    
                    if (transactionDate) {
                      const today = new Date()
                      const transactionDateObj = new Date(transactionDate)
                      const isCurrentOrFutureMonth = 
                        transactionDateObj.getFullYear() > today.getFullYear() || 
                        (transactionDateObj.getFullYear() === today.getFullYear() && 
                         transactionDateObj.getMonth() >= today.getMonth())
                      
                      return isCurrentOrFutureMonth 
                        ? '💹 Cotización actual del dólar blue'
                        : '📊 Cotización histórica del mes seleccionado'
                    }
                    
                    return 'Cotización del dólar blue'
                  }

                  return (
                    <TextField
                      {...field}
                      fullWidth
                      label="Cotización"
                      type="number"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      error={!!errors.exchangeRate}
                      helperText={getExchangeRateHelperText()}
                    />
                  )
                }}
              />
            </Grid>

            {/* Método de Pago */}
            <Grid item xs={12}>
              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Método de Pago"
                    error={!!errors.paymentMethod}
                    helperText={errors.paymentMethod?.message}
                  >
                    {paymentMethodOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Cuenta Bancaria (solo si método es BANK_ACCOUNT) */}
            {paymentMethod === 'BANK_ACCOUNT' && (
              <Grid item xs={12}>
                <Controller
                  name="bankAccountId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label={`Cuenta Bancaria (${currency})`}
                      error={!!errors.bankAccountId}
                      helperText={errors.bankAccountId?.message || `Mostrando cuentas en ${currency}`}
                    >
                      <MenuItem value="">Seleccionar cuenta</MenuItem>
                      {filteredBankAccounts.map((account) => (
                        <MenuItem key={account.id} value={account.id}>
                          {account.name} - {account.bank} (*{account.accountNumber.slice(-4)})
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Monto (USD)"
                value={amountUsd.toFixed(2)}
                disabled
                helperText="Calculado automáticamente"
              />
            </Grid>

            {/* Sistema de carga de archivos */}
            <Grid item xs={12}>
              <Controller
                name="attachmentUrl"
                control={control}
                render={({ field }) => (
                  <AttachmentUploader
                    value={field.value || null}
                    onChange={field.onChange}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1E293B' }}>
          <Button onClick={handleClose} sx={{ color: 'white' }}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{
              bgcolor: '#EF4444',
              '&:hover': {
                bgcolor: '#DC2626',
              },
            }}
          >
            {loading ? 'Guardando...' : transaction ? 'Actualizar' : 'Crear Egreso'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
