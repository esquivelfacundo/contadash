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
import { budgetsApi, Budget } from '@/lib/api/budgets'
import { categoriesApi } from '@/lib/api/categories'
import { exchangeApi } from '@/lib/api/exchange'

const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Categoría requerida'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  currency: z.enum(['ARS', 'USD']),
  amountArs: z.number().nonnegative(),
  amountUsd: z.number().nonnegative(),
  exchangeRate: z.number().positive(),
}).refine(
  (data) => data.amountArs > 0 || data.amountUsd > 0,
  {
    message: 'Al menos uno de los montos debe ser mayor a 0',
    path: ['amountArs'],
  }
)

type BudgetForm = z.infer<typeof budgetSchema>

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  budget?: Budget
  defaultMonth?: number
  defaultYear?: number
}

export default function BudgetFormDialog({
  open,
  onClose,
  onSuccess,
  budget,
  defaultMonth,
  defaultYear,
}: Props) {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const currentDate = new Date()
  const currentMonth = defaultMonth || currentDate.getMonth() + 1
  const currentYear = defaultYear || currentDate.getFullYear()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BudgetForm>({
    resolver: zodResolver(budgetSchema),
    defaultValues: budget
      ? {
          categoryId: budget.categoryId,
          month: budget.month,
          year: budget.year,
          currency: 'ARS',
          amountArs: Number(budget.amountArs),
          amountUsd: Number(budget.amountUsd),
          exchangeRate: 0,
        }
      : {
          categoryId: '',
          month: currentMonth,
          year: currentYear,
          currency: 'ARS',
          amountArs: 0,
          amountUsd: 0,
          exchangeRate: 0,
        },
  })

  const currency = watch('currency')
  const amountArs = watch('amountArs')
  const amountUsd = watch('amountUsd')
  const exchangeRate = watch('exchangeRate')

  useEffect(() => {
    if (open) {
      loadCategories()
      loadExchangeRate()

      if (budget) {
        reset({
          categoryId: budget.categoryId,
          month: budget.month,
          year: budget.year,
          currency: 'ARS',
          amountArs: Number(budget.amountArs),
          amountUsd: Number(budget.amountUsd),
          exchangeRate: 0,
        })
      }
    }
  }, [open, budget])

  // Auto-calculate the other currency
  useEffect(() => {
    if (currency === 'USD' && amountUsd > 0 && exchangeRate > 0) {
      setValue('amountArs', amountUsd * exchangeRate)
    } else if (currency === 'ARS' && amountArs > 0 && exchangeRate > 0) {
      setValue('amountUsd', amountArs / exchangeRate)
    }
  }, [currency, amountArs, amountUsd, exchangeRate])

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll()
      // Filter only EXPENSE categories for budgets
      setCategories(data.filter((c: any) => c.type === 'EXPENSE'))
    } catch (err) {
    }
  }

  const loadExchangeRate = async () => {
    try {
      const rate = await exchangeApi.getDolarBlue()
      setValue('exchangeRate', rate)
    } catch (err) {
    }
  }

  const onSubmit = async (data: BudgetForm) => {
    try {
      setLoading(true)

      const payload = {
        categoryId: data.categoryId,
        month: data.month,
        year: data.year,
        amountArs: data.amountArs,
        amountUsd: data.amountUsd,
      }

      if (budget) {
        await budgetsApi.update(budget.id, payload)
      } else {
        await budgetsApi.create(payload)
      }

      onSuccess()
      handleClose()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al guardar presupuesto')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ]

  // Generate year options (2 years back to 7 years forward, plus next year if December)
  const todayMonth = new Date().getMonth()
  const includeNextYear = todayMonth === 11 // December is month 11 (0-indexed)
  const yearCount = includeNextYear ? 11 : 10
  const startYear = includeNextYear ? currentYear + 8 : currentYear + 7
  const years = Array.from({ length: yearCount }, (_, i) => startYear - i)

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {budget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Category */}
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
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Month and Year */}
            <Grid item xs={6}>
              <Controller
                name="month"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Mes"
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    error={!!errors.month}
                    helperText={errors.month?.message}
                  >
                    {months.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="year"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Año"
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    error={!!errors.year}
                    helperText={errors.year?.message}
                  >
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Currency Selector */}
            <Grid item xs={12}>
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
                    <MenuItem value="ARS">💵 Pesos (ARS)</MenuItem>
                    <MenuItem value="USD">💵 Dólares (USD)</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {/* Amount Fields */}
            {currency === 'ARS' ? (
              <Grid item xs={12}>
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
            ) : (
              <Grid item xs={12}>
                <Controller
                  name="amountUsd"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Monto (USD)"
                      type="number"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      error={!!errors.amountUsd}
                      helperText={errors.amountUsd?.message}
                    />
                  )}
                />
              </Grid>
            )}

            {/* Exchange Rate */}
            <Grid item xs={12}>
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
                    helperText={`${currency === 'ARS' ? 'USD' : 'ARS'}: ${
                      currency === 'ARS'
                        ? amountUsd.toFixed(2)
                        : amountArs.toFixed(2)
                    }`}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Guardando...' : budget ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
