'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
} from '@mui/material'

interface EndRecurringDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (endMonth: number, endYear: number) => void
  recurringName: string
}

const MONTHS = [
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

export default function EndRecurringDialog({
  open,
  onClose,
  onConfirm,
  recurringName,
}: EndRecurringDialogProps) {
  const currentDate = new Date()
  const [endMonth, setEndMonth] = useState(currentDate.getMonth() + 1)
  const [endYear, setEndYear] = useState(currentDate.getFullYear())

  const handleConfirm = () => {
    onConfirm(endMonth, endYear)
    onClose()
  }

  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() + i)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Finalizar Transacción Recurrente</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Transacción"
              value={recurringName}
              disabled
              variant="filled"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Mes de Finalización"
              value={endMonth}
              onChange={(e) => setEndMonth(Number(e.target.value))}
            >
              {MONTHS.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Año de Finalización"
              value={endYear}
              onChange={(e) => setEndYear(Number(e.target.value))}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Vista Previa"
              value={`Finalizará el último día de ${MONTHS[endMonth - 1].label} ${endYear}`}
              disabled
              variant="filled"
              helperText="La transacción recurrente se desactivará y no generará más transacciones después de esta fecha"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained" color="error">
          Finalizar Recurrente
        </Button>
      </DialogActions>
    </Dialog>
  )
}
