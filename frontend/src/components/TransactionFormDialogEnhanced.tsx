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
  Checkbox,
  FormControlLabel,
  IconButton,
  Box,
  Typography,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { transactionsApi } from '@/lib/api/transactions'
import { categoriesApi } from '@/lib/api/categories'
import { clientsApi } from '@/lib/api/clients'
import { creditCardsApi } from '@/lib/api/credit-cards'
import { recurringTransactionsApi } from '@/lib/api/recurring-transactions'
import { exchangeApi } from '@/lib/api/exchange'
import AttachmentUploader from './AttachmentUploader'

const transactionSchema = z.object({
  date: z.string().min(1, 'Fecha requerida'),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().min(1, 'Categoría requerida'),
  clientId: z.string().optional(),
  creditCardId: z.string().optional(),
  description: z.string().min(1, 'Descripción requerida'),
  currency: z.enum(['ARS', 'USD']),
  amountArs: z.number().min(0),
  amountUsd: z.number().min(0),
  exchangeRate: z.number().positive('Cotización debe ser positiva'),
  isPaid: z.boolean(),
  isRecurring: z.boolean(),
  recurringFrequency: z.enum(['MONTHLY', 'YEARLY']).optional(),
  recurringDayOfMonth: z.number().min(1).max(31).optional(),
  applyHistorical: z.boolean(),
  historicalStartMonth: z.number().min(1).max(12).optional(),
  historicalStartYear: z.number().min(2020).max(2100).optional(),
  attachmentUrl: z.string().nullable().optional(),
}).refine(
  (data) => {
    // Validar que el monto de la moneda seleccionada sea positivo
    if (data.currency === 'ARS') {
      return data.amountArs > 0
    } else {
      return data.amountUsd > 0
    }
  },
  {
    message: 'El monto debe ser mayor a 0',
    path: ['amountArs'], // Mostrar error en el campo visible
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

export default function TransactionFormDialogEnhanced({
  open,
  onClose,
  onSuccess,
  transaction,
  defaultType,
  defaultDate,
}: Props) {
  const [categories, setCategories] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [creditCards, setCreditCards] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [quickCategoryOpen, setQuickCategoryOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('💰')

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          date: new Date(transaction.date).toISOString().split('T')[0],
          type: transaction.type,
          categoryId: transaction.categoryId,
          clientId: transaction.client?.id || transaction.clientId || '',
          creditCardId: transaction.creditCard?.id || transaction.creditCardId || '',
          description: transaction.description,
          currency: 'ARS',
          amountArs: Number(transaction.amountArs),
          amountUsd: Number(transaction.amountUsd),
          exchangeRate: Number(transaction.exchangeRate),
          isPaid: transaction.isPaid ?? true,
          isRecurring: false,
          recurringFrequency: 'MONTHLY',
          recurringDayOfMonth: new Date(transaction.date).getDate(),
          applyHistorical: false,
          historicalStartMonth: 1,
          historicalStartYear: new Date().getFullYear(),
          attachmentUrl: transaction.attachmentUrl || null,
        }
      : {
          date: defaultDate
            ? defaultDate.toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          type: defaultType || 'INCOME',
          categoryId: '',
          clientId: '',
          creditCardId: '',
          description: '',
          currency: 'ARS',
          amountArs: 0,
          amountUsd: 0,
          exchangeRate: 0,
          isPaid: true,
          isRecurring: false,
          recurringFrequency: 'MONTHLY',
          recurringDayOfMonth: new Date().getDate(),
          applyHistorical: false,
          historicalStartMonth: 1,
          historicalStartYear: new Date().getFullYear(),
          attachmentUrl: null,
        },
  })

  const selectedType = watch('type')
  const currency = watch('currency')
  const amountArs = watch('amountArs')
  const amountUsd = watch('amountUsd')
  const exchangeRate = watch('exchangeRate')
  const creditCardId = watch('creditCardId')
  const isRecurring = watch('isRecurring')
  const applyHistorical = watch('applyHistorical')
  const transactionDate = watch('date')

  const loadExchangeRate = async (date?: string) => {
    try {
      let rate: number
      
      if (date) {
        // Load rate for specific date (historical or current)
        rate = await exchangeApi.getDolarBlueForDate(date)
      } else {
        // Load current rate
        rate = await exchangeApi.getDolarBlue()
      }
      
      setValue('exchangeRate', rate)
    } catch (err) {
      // Mantener valor por defecto si falla
    }
  }

  useEffect(() => {
    if (open) {
      loadCategories()
      loadClients()
      loadCreditCards()
      
      // Load exchange rate for new transactions
      if (!transaction) {
        loadExchangeRate()
      }
      
      // Reset form with transaction data when editing
      if (transaction) {
        reset({
          date: new Date(transaction.date).toISOString().split('T')[0],
          type: transaction.type,
          categoryId: transaction.category?.id || transaction.categoryId || '',
          clientId: transaction.client?.id || transaction.clientId || '',
          creditCardId: transaction.creditCard?.id || transaction.creditCardId || '',
          description: transaction.description,
          currency: 'ARS',
          amountArs: Number(transaction.amountArs) || 0,
          amountUsd: Number(transaction.amountUsd) || 0,
          exchangeRate: Number(transaction.exchangeRate) || 0,
          isPaid: transaction.isPaid ?? true,
          isRecurring: false,
          recurringFrequency: 'MONTHLY',
          recurringDayOfMonth: new Date(transaction.date).getDate(),
          applyHistorical: false,
          historicalStartMonth: 1,
          historicalStartYear: new Date().getFullYear(),
          attachmentUrl: transaction.attachmentUrl || null,
        })
      } else {
        // Reset to default values when creating new
        reset({
          date: defaultDate
            ? defaultDate.toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          type: defaultType || 'INCOME',
          categoryId: '',
          clientId: '',
          creditCardId: '',
          description: '',
          currency: 'ARS',
          amountArs: 0,
          amountUsd: 0,
          exchangeRate: 0,
          isPaid: true,
          isRecurring: false,
          recurringFrequency: 'MONTHLY',
          recurringDayOfMonth: new Date().getDate(),
          applyHistorical: false,
          historicalStartMonth: 1,
          historicalStartYear: new Date().getFullYear(),
          attachmentUrl: null,
        })
      }
    }
  }, [open, transaction, defaultDate, defaultType, reset])

  // Reload exchange rate when date changes
  useEffect(() => {
    if (open && transactionDate) {
      loadExchangeRate(transactionDate)
    }
  }, [transactionDate, open])

  // Auto-calculate amounts based on currency
  useEffect(() => {
    if (currency === 'USD' && amountUsd > 0) {
      // Si ingresa en USD, calcular ARS
      setValue('amountArs', amountUsd * exchangeRate)
    } else if (currency === 'ARS' && amountArs > 0) {
      // Si ingresa en ARS, calcular USD
      setValue('amountUsd', amountArs / exchangeRate)
    }
  }, [currency, amountUsd, amountArs, exchangeRate, setValue])

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

  const loadCreditCards = async () => {
    try {
      const data = await creditCardsApi.getAll()
      setCreditCards(data.filter((c: any) => c.isActive))
    } catch (err) {
    }
  }

  const handleQuickCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      const newCategory = await categoriesApi.create({
        name: newCategoryName,
        type: selectedType,
        icon: newCategoryIcon,
        color: selectedType === 'INCOME' ? '#10b981' : '#ef4444',
      })
      
      setCategories([...categories, newCategory])
      setValue('categoryId', newCategory.id)
      setQuickCategoryOpen(false)
      setNewCategoryName('')
      setNewCategoryIcon('💰')
    } catch (err) {
    }
  }

  const onSubmit = async (data: TransactionForm) => {
    // Calculate amounts based on currency
    let finalAmountArs = data.amountArs
    let finalAmountUsd = data.amountUsd
    
    if (data.currency === 'USD') {
      // Si ingresó en USD, calcular ARS
      finalAmountArs = data.amountUsd * data.exchangeRate
      finalAmountUsd = data.amountUsd
    } else {
      // Si ingresó en ARS, calcular USD
      finalAmountArs = data.amountArs
      finalAmountUsd = data.amountArs / data.exchangeRate
    }

    // Clean payload - only include fields accepted by backend
    const basePayload = {
      date: new Date(data.date).toISOString(),
      type: data.type,
      categoryId: data.categoryId,
      clientId: data.clientId || undefined,
      creditCardId: data.creditCardId || undefined,
      description: data.description,
      amountArs: finalAmountArs,
      amountUsd: finalAmountUsd,
      exchangeRate: data.exchangeRate,
      isPaid: data.isPaid,
      attachmentUrl: data.attachmentUrl || undefined,
    }

    try {
      setLoading(true)

      // Check if it's an update or create
      // Placeholders have id: null, so they should be created
      const isUpdate = transaction && transaction.id && !transaction.isPlaceholder
      
      if (isUpdate) {
        // Update existing transaction
        await transactionsApi.update(transaction.id, basePayload)
      } else {
        // Create new transaction (including placeholders)
        const created = await transactionsApi.create(basePayload)
        
        // Si se marcó como recurrente, crear la transacción recurrente
        if (data.isRecurring && data.recurringFrequency && data.recurringDayOfMonth) {
          const today = new Date()
          const currentYear = today.getFullYear()
          const transactionDate = new Date(data.date)
          
          // Si se marcó aplicar histórico, empezar desde enero
          // Si no, empezar desde la fecha de la transacción
          const startDate = data.applyHistorical 
            ? new Date(currentYear, 0, 1)
            : new Date(transactionDate.getFullYear(), transactionDate.getMonth(), data.recurringDayOfMonth)
          
          const recurringPayload = {
            type: data.type,
            categoryId: data.categoryId,
            clientId: data.clientId || undefined,
            creditCardId: data.creditCardId || undefined,
            description: data.description,
            amountArs: data.amountArs,
            amountUsd: 0,
            exchangeRate: 1000,
            frequency: data.recurringFrequency,
            startDate: startDate.toISOString(),
            dayOfMonth: data.recurringDayOfMonth,
            isActive: true,
          }
          
          const created = await recurringTransactionsApi.create(recurringPayload)
          
          // Si se marcó aplicar histórico, generar desde el mes/año seleccionado hasta hoy
          if (data.applyHistorical && data.historicalStartMonth && data.historicalStartYear) {
            const historicalStartDate = new Date(
              data.historicalStartYear, 
              data.historicalStartMonth - 1, 
              data.recurringDayOfMonth
            )
            const endDate = new Date(today.getFullYear(), today.getMonth(), data.recurringDayOfMonth)
            
            await generateHistoricalTransactions(
              created.id,
              historicalStartDate,
              endDate,
              data.recurringFrequency
            )
          }
        }
      }

      onSuccess()
      handleClose()
    } catch (err: any) {
    } finally {
      setLoading(false)
    }
  }

  const generateHistoricalTransactions = async (
    recurringId: string,
    startDate: Date,
    endDate: Date,
    frequency: string
  ) => {
    const dates: Date[] = []
    const current = new Date(startDate)

    while (current <= endDate) {
      dates.push(new Date(current))
      if (frequency === 'MONTHLY') {
        current.setMonth(current.getMonth() + 1)
      } else if (frequency === 'YEARLY') {
        current.setFullYear(current.getFullYear() + 1)
      }
    }

    for (const date of dates) {
      try {
        await recurringTransactionsApi.generateTransaction(recurringId, date)
      } catch (err) {
      }
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const filteredCategories = categories.filter((c) => c.type === selectedType)

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1E293B',
            color: 'white',
          },
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
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
                <Box display="flex" gap={1}>
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
                  <IconButton
                    color="primary"
                    onClick={() => setQuickCategoryOpen(true)}
                    sx={{ flexShrink: 0 }}
                  >
                    <Add />
                  </IconButton>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
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
                      {clients.map((client: any) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.company}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="creditCardId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Tarjeta de Crédito (opcional)"
                      disabled={selectedType === 'INCOME'}
                    >
                      <MenuItem value="">Ninguna</MenuItem>
                      {creditCards.map((card: any) => (
                        <MenuItem key={card.id} value={card.id}>
                          {card.name} ****{card.lastFourDigits}
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

              <Grid item xs={12} sm={4}>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Moneda"
                    >
                      <MenuItem value="ARS">🇦🇷 Pesos (ARS)</MenuItem>
                      <MenuItem value="USD">🇺🇸 Dólares (USD)</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              {currency === 'ARS' ? (
                <>
                  <Grid item xs={12} sm={4}>
                    <Controller
                      name="amountArs"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Monto (ARS)"
                          type="number"
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
                            field.onChange(isNaN(value) ? 0 : value)
                          }}
                          error={!!errors.amountArs}
                          helperText={errors.amountArs?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Equivalente (USD)"
                      value={((exchangeRate && exchangeRate > 0) ? (amountArs / exchangeRate) : 0).toFixed(2)}
                      disabled
                      helperText={`Cotización: $${(exchangeRate || 0).toFixed(2)}`}
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} sm={4}>
                    <Controller
                      name="amountUsd"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Monto (USD)"
                          type="number"
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
                            field.onChange(isNaN(value) ? 0 : value)
                          }}
                          error={!!errors.amountUsd}
                          helperText={errors.amountUsd?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Equivalente (ARS)"
                      value={((amountUsd || 0) * (exchangeRate || 0)).toFixed(2)}
                      disabled
                      helperText={`Cotización: $${(exchangeRate || 0).toFixed(2)}`}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Controller
                  name="isPaid"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="Pagado"
                    />
                  )}
                />
              </Grid>

              {!transaction && (
                <>
                  <Grid item xs={12}>
                    <Controller
                      name="isRecurring"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="🔄 Es una transacción recurrente"
                        />
                      )}
                    />
                  </Grid>

                  {isRecurring && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="recurringFrequency"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              select
                              fullWidth
                              label="Frecuencia"
                            >
                              <MenuItem value="MONTHLY">📅 Mensual</MenuItem>
                              <MenuItem value="YEARLY">📆 Anual</MenuItem>
                            </TextField>
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="recurringDayOfMonth"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Día del Mes"
                              type="number"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              inputProps={{ min: 1, max: 31 }}
                              helperText="Día en que se repite"
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Controller
                          name="applyHistorical"
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={field.value}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                />
                              }
                              label="Generar transacciones antiguas"
                            />
                          )}
                        />
                        {applyHistorical && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Desde qué mes generar:
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Controller
                                  name="historicalStartMonth"
                                  control={control}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      select
                                      fullWidth
                                      label="Mes"
                                      size="small"
                                    >
                                      <MenuItem value={1}>Enero</MenuItem>
                                      <MenuItem value={2}>Febrero</MenuItem>
                                      <MenuItem value={3}>Marzo</MenuItem>
                                      <MenuItem value={4}>Abril</MenuItem>
                                      <MenuItem value={5}>Mayo</MenuItem>
                                      <MenuItem value={6}>Junio</MenuItem>
                                      <MenuItem value={7}>Julio</MenuItem>
                                      <MenuItem value={8}>Agosto</MenuItem>
                                      <MenuItem value={9}>Septiembre</MenuItem>
                                      <MenuItem value={10}>Octubre</MenuItem>
                                      <MenuItem value={11}>Noviembre</MenuItem>
                                      <MenuItem value={12}>Diciembre</MenuItem>
                                    </TextField>
                                  )}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <Controller
                                  name="historicalStartYear"
                                  control={control}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      select
                                      fullWidth
                                      label="Año"
                                      size="small"
                                    >
                                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                        <MenuItem key={year} value={year}>
                                          {year}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  )}
                                />
                              </Grid>
                            </Grid>
                            <Box sx={{ mt: 1, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                              <Typography variant="caption">
                                Se generarán transacciones desde el mes seleccionado hasta el mes actual
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Grid>
                    </>
                  )}
                </>
              )}

              {/* New Fields: Tags, Attachment, Metadata */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Información Adicional
                </Typography>
              </Grid>

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
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Guardando...' : transaction ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Quick Category Dialog */}
      <Dialog open={quickCategoryOpen} onClose={() => setQuickCategoryOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nueva Categoría</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Icono (emoji)"
                value={newCategoryIcon}
                onChange={(e) => setNewCategoryIcon(e.target.value)}
                placeholder="💰"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Tipo: {selectedType === 'INCOME' ? 'Ingreso' : 'Egreso'}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickCategoryOpen(false)}>Cancelar</Button>
          <Button onClick={handleQuickCategory} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
