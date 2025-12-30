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
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { recurringTransactionsApi } from '@/lib/api/recurring-transactions'
import { categoriesApi } from '@/lib/api/categories'
import { clientsApi } from '@/lib/api/clients'
import { creditCardsApi } from '@/lib/api/credit-cards'

const recurringSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().min(1, 'Categoría requerida'),
  clientId: z.string().optional(),
  creditCardId: z.string().optional(),
  description: z.string().min(1, 'Descripción requerida'),
  currency: z.enum(['ARS', 'USD']),
  amountArs: z.number().min(0),
  amountUsd: z.number().min(0),
  exchangeRate: z.number().optional().default(1),
  frequency: z.enum(['MONTHLY', 'YEARLY']),
  dayOfMonth: z.number().min(1).max(31),
  generateHistorical: z.boolean(),
  historicalStartMonth: z.number().min(1).max(12).optional(),
  historicalStartYear: z.number().min(2020).max(2100).optional(),
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

type RecurringForm = z.infer<typeof recurringSchema>

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  recurring?: any
}

export default function RecurringTransactionFormDialog({
  open,
  onClose,
  onSuccess,
  recurring,
}: Props) {
  const [categories, setCategories] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [creditCards, setCreditCards] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<RecurringForm>({
    resolver: zodResolver(recurringSchema),
    defaultValues: recurring
      ? {
          type: recurring.type,
          categoryId: recurring.categoryId,
          clientId: recurring.clientId || '',
          creditCardId: recurring.creditCardId || '',
          description: recurring.description,
          currency: 'ARS',
          amountArs: Number(recurring.amountArs),
          amountUsd: Number(recurring.amountUsd || 0),
          exchangeRate: Number(recurring.exchangeRate || 1),
          frequency: recurring.frequency === 'DAILY' || recurring.frequency === 'WEEKLY' ? 'MONTHLY' : recurring.frequency,
          dayOfMonth: recurring.dayOfMonth || new Date().getDate(),
          generateHistorical: false,
          historicalStartMonth: 1,
          historicalStartYear: new Date().getFullYear(),
        }
      : {
          type: 'EXPENSE',
          categoryId: '',
          clientId: '',
          creditCardId: '',
          description: '',
          currency: 'ARS',
          amountArs: 0,
          amountUsd: 0,
          exchangeRate: 1,
          frequency: 'MONTHLY',
          dayOfMonth: new Date().getDate(),
          generateHistorical: false,
          historicalStartMonth: 1,
          historicalStartYear: new Date().getFullYear(),
        },
  })

  const selectedType = watch('type')
  const currency = watch('currency')
  const amountArs = watch('amountArs')
  const amountUsd = watch('amountUsd')
  const exchangeRate = watch('exchangeRate')
  const generateHistorical = watch('generateHistorical')

  useEffect(() => {
    if (open) {
      loadCategories()
      loadClients()
      loadCreditCards()
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

  const loadCreditCards = async () => {
    try {
      const data = await creditCardsApi.getAll()
      setCreditCards(data.filter((c: any) => c.isActive))
    } catch (err) {
    }
  }

  const onSubmit = async (data: RecurringForm) => {
    try {
      setLoading(true)
      
      const today = new Date()
      const currentYear = today.getFullYear()
      
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
      
      // Determinar la fecha de inicio
      // Si se marcó histórico, usar el mes/año seleccionado
      // Si no, usar la fecha actual
      const startDate = data.generateHistorical && data.historicalStartMonth && data.historicalStartYear
        ? new Date(data.historicalStartYear, data.historicalStartMonth - 1, data.dayOfMonth)
        : new Date(today.getFullYear(), today.getMonth(), data.dayOfMonth)
      
      const payload = {
        type: data.type,
        categoryId: data.categoryId,
        clientId: data.clientId || undefined,
        creditCardId: data.creditCardId || undefined,
        description: data.description,
        amountArs: finalAmountArs,
        amountUsd: finalAmountUsd,
        exchangeRate: data.exchangeRate,
        frequency: data.frequency,
        startDate: startDate.toISOString(),
        endDate: undefined, // Sin fecha fin
        dayOfMonth: data.dayOfMonth,
        isActive: true,
      }

      if (recurring) {
        await recurringTransactionsApi.update(recurring.id, payload)
      } else {
        const created = await recurringTransactionsApi.create(payload)
        
        // Si se marcó "Generar histórico", generar desde el mes/año seleccionado hasta mes actual
        if (data.generateHistorical && data.historicalStartMonth && data.historicalStartYear) {
          const startDate = new Date(data.historicalStartYear, data.historicalStartMonth - 1, data.dayOfMonth)
          const endDate = new Date(today.getFullYear(), today.getMonth(), data.dayOfMonth)
          
          await generateHistoricalTransactions(
            created.id,
            startDate,
            endDate,
            data.frequency
          )
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
    fromDate: Date,
    toDate: Date,
    frequency: string
  ) => {
    const dates: Date[] = []
    let currentDate = new Date(fromDate)

    while (currentDate <= toDate) {
      dates.push(new Date(currentDate))

      // Incrementar según frecuencia
      if (frequency === 'MONTHLY') {
        currentDate.setMonth(currentDate.getMonth() + 1)
      } else if (frequency === 'YEARLY') {
        currentDate.setFullYear(currentDate.getFullYear() + 1)
      } else if (frequency === 'WEEKLY') {
        currentDate.setDate(currentDate.getDate() + 7)
      } else if (frequency === 'DAILY') {
        currentDate.setDate(currentDate.getDate() + 1)
      }
    }

    // Generar transacciones para cada fecha
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {recurring ? 'Editar Transacción Recurrente' : 'Nueva Transacción Recurrente'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
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
                    <MenuItem value="INCOME">💰 Ingreso</MenuItem>
                    <MenuItem value="EXPENSE">💸 Egreso</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="frequency"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Frecuencia"
                    error={!!errors.frequency}
                    helperText={errors.frequency?.message}
                  >
                    <MenuItem value="MONTHLY">📅 Mensual</MenuItem>
                    <MenuItem value="YEARLY">📆 Anual</MenuItem>
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
                    placeholder="Ej: Alquiler mensual, Salario, Tarjeta Visa, etc."
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
              <Grid item xs={12} sm={6}>
                <Controller
                  name="amountArs"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Monto Base (ARS)"
                      type="number"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      error={!!errors.amountArs}
                      helperText={errors.amountArs?.message}
                    />
                  )}
                />
              </Grid>
            ) : (
              <Grid item xs={12} sm={6}>
                <Controller
                  name="amountUsd"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Monto Base (USD)"
                      type="number"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      error={!!errors.amountUsd}
                      helperText={errors.amountUsd?.message}
                    />
                  )}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <Controller
                name="dayOfMonth"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Día del Mes"
                    type="number"
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    error={!!errors.dayOfMonth}
                    helperText={errors.dayOfMonth?.message}
                    inputProps={{ min: 1, max: 31 }}
                  />
                )}
              />
            </Grid>

            {!recurring && (
              <Grid item xs={12}>
                <Controller
                  name="generateHistorical"
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
                {generateHistorical && (
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
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Se generarán transacciones desde el mes seleccionado hasta el mes actual
                    </Alert>
                  </Box>
                )}
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Guardando...' : recurring ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
