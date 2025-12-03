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
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { transactionsApi } from '@/lib/api/transactions'
import { categoriesApi } from '@/lib/api/categories'
import { clientsApi } from '@/lib/api/clients'
import { bankAccountsApi } from '@/lib/api/bank-accounts'

const transactionSchema = z.object({
  date: z.string().min(1, 'Fecha requerida'),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().min(1, 'Categoría requerida'),
  clientId: z.string().optional(),
  description: z.string().min(1, 'Descripción requerida'),
  amountArs: z.number().positive('Monto debe ser positivo'),
  exchangeRate: z.number().positive('Cotización debe ser positiva'),
  paymentMethod: z.enum(['CASH', 'MERCADOPAGO', 'BANK_ACCOUNT', 'CRYPTO']),
  bankAccountId: z.string().optional(),
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

type TransactionForm = z.infer<typeof transactionSchema>

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  transaction?: any
  defaultType?: 'INCOME' | 'EXPENSE'
  defaultDate?: Date
}

export default function TransactionFormDialog({
  open,
  onClose,
  onSuccess,
  transaction,
  defaultType,
  defaultDate,
}: Props) {
  const [categories, setCategories] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          date: new Date(transaction.date).toISOString().split('T')[0],
          type: transaction.type,
          categoryId: transaction.categoryId,
          clientId: transaction.client?.id || transaction.clientId || '',
          description: transaction.description,
          amountArs: Number(transaction.amountArs),
          exchangeRate: Number(transaction.exchangeRate),
          paymentMethod: transaction.paymentMethod || 'CASH',
          bankAccountId: transaction.bankAccountId || '',
        }
      : {
          date: defaultDate
            ? defaultDate.toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          type: defaultType || 'INCOME',
          categoryId: '',
          clientId: '',
          description: '',
          amountArs: 0,
          exchangeRate: 0,
          paymentMethod: 'CASH',
          bankAccountId: '',
        },
  })

  const selectedType = watch('type')
  const amountArs = watch('amountArs')
  const exchangeRate = watch('exchangeRate')
  const paymentMethod = watch('paymentMethod')
  const currency = exchangeRate === 1 ? 'USD' : 'ARS'

  useEffect(() => {
    if (open) {
      loadCategories()
      loadClients()
      loadBankAccounts()
    }
  }, [open])

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll()
      setCategories(data)
    } catch (err) {
    }
  }

  const loadClients = async () => {
    try {
      const data = await clientsApi.getAll()
      setClients(data)
    } catch (err) {
    }
  }

  const loadBankAccounts = async () => {
    try {
      const data = await bankAccountsApi.getAll()
      setBankAccounts(data)
    } catch (err) {
    }
  }

  // Cargar cuentas bancarias cuando cambie la moneda
  useEffect(() => {
    if (open && paymentMethod === 'BANK_ACCOUNT') {
      loadBankAccounts()
    }
  }, [open, paymentMethod, currency])

  const onSubmit = async (data: TransactionForm) => {
    try {
      setLoading(true)
      const payload = {
        ...data,
        amountUsd: data.amountArs / data.exchangeRate,
        clientId: data.clientId || undefined,
        bankAccountId: data.paymentMethod === 'BANK_ACCOUNT' ? data.bankAccountId : undefined,
      }

      if (transaction) {
        await transactionsApi.update(transaction.id, payload)
      } else {
        await transactionsApi.create(payload)
      }

      onSuccess()
      handleClose()
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const filteredCategories = categories.filter((c) => c.type === selectedType)
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
      <DialogTitle>
        {transaction ? 'Editar Transacción' : 'Nueva Transacción'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="form-input-fix">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Tipo"
                    error={!!errors.type}
                    helperText={errors.type?.message}
                  >
                    <MenuItem value="INCOME">Ingreso</MenuItem>
                    <MenuItem value="EXPENSE">Egreso</MenuItem>
                  </TextField>
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
                    label="Categoría"
                    error={!!errors.categoryId}
                    helperText={errors.categoryId?.message}
                  >
                    {filteredCategories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            {/* Cliente (solo para ingresos) */}
            {selectedType === 'INCOME' && (
              <Grid item xs={12}>
                <Controller
                  name="clientId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Cliente (opcional)"
                    >
                      <MenuItem value="">Ninguno</MenuItem>
                      {clients.map((client) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.company}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            )}
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
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Cotización"
                    type="number"
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    error={!!errors.exchangeRate}
                    helperText={errors.exchangeRate?.message}
                  />
                )}
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Guardando...' : transaction ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
