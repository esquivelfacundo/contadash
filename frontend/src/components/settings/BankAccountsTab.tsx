'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  AccountBalance,
  Savings,
  TrendingUp,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { bankAccountsApi, BankAccount } from '@/lib/api/bank-accounts'
import { useNotificationStore } from '@/lib/store/notification.store'

// Función para obtener estilos específicos de cada banco
const getBankAccountStyle = (bank: string, currency: 'ARS' | 'USD') => {
  const baseStyles: Record<string, any> = {
    'banco-nacion': {
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
      logo: 'BNA',
    },
    'banco-provincia': {
      background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
      logo: 'BPBA',
    },
    'banco-ciudad': {
      background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
      logo: 'CIUDAD',
    },
    'santander': {
      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
      logo: 'SANTANDER',
    },
    'bbva': {
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
      logo: 'BBVA',
    },
    'galicia': {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
      logo: 'GALICIA',
    },
    'macro': {
      background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
      logo: 'MACRO',
    },
    'hsbc': {
      background: 'linear-gradient(135deg, #dc2626 0%, #ffffff 50%, #dc2626 100%)',
      logo: 'HSBC',
      textColor: '#dc2626',
    },
    'icbc': {
      background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #ef4444 100%)',
      logo: 'ICBC',
    },
    'frances': {
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #dbeafe 100%)',
      logo: 'FRANCÉS',
    },
    'itau': {
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
      logo: 'ITAÚ',
    },
  }

  const style = baseStyles[bank] || {
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #374151 100%)',
    logo: 'BANCO',
  }

  // Agregar indicador de moneda
  if (currency === 'USD') {
    style.currencyColor = '#10B981'
    style.currencySymbol = '$'
  } else {
    style.currencyColor = '#3B82F6'
    style.currencySymbol = '$'
  }

  return style
}

const accountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  bank: z.string().min(1, 'El banco es requerido'),
  accountType: z.enum(['SAVINGS', 'CHECKING', 'INVESTMENT'], {
    required_error: 'El tipo de cuenta es requerido'
  }),
  accountNumber: z.string().min(1, 'El número de cuenta es requerido'),
  currency: z.enum(['ARS', 'USD'], {
    required_error: 'La moneda es requerida'
  }),
  balance: z.number().optional(),
  isActive: z.boolean().optional(),
})

type AccountForm = z.infer<typeof accountSchema>

const BANKS = [
  'banco-nacion',
  'banco-provincia', 
  'banco-ciudad',
  'santander',
  'bbva',
  'galicia',
  'macro',
  'hsbc',
  'icbc',
  'frances',
  'itau',
]

const ACCOUNT_TYPES = [
  { value: 'SAVINGS', label: 'Caja de Ahorro' },
  { value: 'CHECKING', label: 'Cuenta Corriente' },
  { value: 'INVESTMENT', label: 'Cuenta Inversión' },
]

export default function BankAccountsTab() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null)
  
  const { showNotification } = useNotificationStore()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      isActive: true,
    },
  })

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      const data = await bankAccountsApi.getAll()
      setAccounts(data)
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Error al cargar cuentas bancarias', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingAccount(null)
    reset({
      name: '',
      bank: '',
      accountType: 'SAVINGS',
      accountNumber: '',
      currency: 'ARS',
      balance: 0,
      isActive: true,
    })
    setOpenDialog(true)
  }

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account)
    reset({
      name: account.name,
      bank: account.bank,
      accountType: account.accountType,
      accountNumber: account.accountNumber,
      currency: account.currency,
      balance: account.balance || 0,
      isActive: account.isActive,
    })
    setOpenDialog(true)
  }

  const onSubmit = async (data: AccountForm) => {
    try {
      if (editingAccount) {
        await bankAccountsApi.update(editingAccount.id, data)
        showNotification('Cuenta bancaria actualizada', 'success')
      } else {
        await bankAccountsApi.create(data)
        showNotification('Cuenta bancaria creada', 'success')
      }
      loadAccounts()
      setOpenDialog(false)
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Error al guardar cuenta bancaria', 'error')
    }
  }

  const handleDeleteClick = (account: BankAccount) => {
    setAccountToDelete(account)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return

    try {
      await bankAccountsApi.delete(accountToDelete.id)
      showNotification('Cuenta bancaria eliminada', 'success')
      loadAccounts()
      setDeleteDialogOpen(false)
      setAccountToDelete(null)
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Error al eliminar cuenta bancaria', 'error')
    }
  }

  const formatCurrency = (amount: number, currency: 'ARS' | 'USD') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'ARS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatAccountNumber = (accountNumber: string) => {
    return accountNumber.replace(/(.{4})/g, '$1 ').trim()
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="white" mb={1}>
            Gestión de Cuentas Bancarias
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra tus cuentas en pesos y dólares • {accounts.length} cuentas registradas
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreate}
          sx={{ 
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            }
          }}
        >
          Nueva Cuenta
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress sx={{ color: '#10B981' }} />
        </Box>
      ) : accounts.length === 0 ? (
        <Card elevation={0} sx={{ bgcolor: '#1E293B', border: '1px solid #334155' }}>
          <CardContent>
            <Box textAlign="center" py={4}>
              <AccountBalance sx={{ fontSize: 64, color: '#94A3B8', mb: 2 }} />
              <Typography variant="h6" color="white" gutterBottom>
                No tienes cuentas bancarias registradas
              </Typography>
              <Typography variant="body2" color="#94A3B8" mb={3}>
                Agrega tus cuentas bancarias para gestionar mejor tus transacciones
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />} 
                onClick={handleCreate}
                sx={{ 
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  }
                }}
              >
                Agregar Primera Cuenta
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {accounts.map((account) => {
            const bankStyle = getBankAccountStyle(account.bank, account.currency)
            return (
              <Grid item xs={12} sm={6} md={4} key={account.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: 200,
                    opacity: account.isActive ? 1 : 0.6,
                    background: account.isActive ? bankStyle.background : 'linear-gradient(135deg, #6B7280 0%, #374151 100%)',
                    color: bankStyle.textColor || 'white',
                    border: 'none',
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s ease-in-out',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.15)',
                          px: 1.5,
                          py: 0.8,
                          borderRadius: 1,
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          fontWeight="bold" 
                          sx={{ 
                            fontSize: '0.7rem',
                            letterSpacing: 0.5,
                            color: bankStyle.textColor || 'white'
                          }}
                        >
                          {bankStyle.logo}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={account.currency}
                          size="small"
                          sx={{
                            bgcolor: bankStyle.currencyColor,
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 20
                          }}
                        />
                        <Box>
                          <IconButton
                            size="small"
                            sx={{ color: bankStyle.textColor || 'white', opacity: 0.8 }}
                            onClick={() => handleEdit(account)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{ color: bankStyle.textColor || 'white', opacity: 0.8 }}
                            onClick={() => handleDeleteClick(account)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>

                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {account.name}
                    </Typography>

                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      sx={{ letterSpacing: 1, my: 1 }}
                    >
                      {formatAccountNumber(account.accountNumber)}
                    </Typography>

                    <Box display="flex" justifyContent="space-between" alignItems="end" mt="auto">
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                          {ACCOUNT_TYPES.find(t => t.value === account.accountType)?.label}
                        </Typography>
                        {account.balance !== undefined && (
                          <Typography variant="body1" fontWeight="bold">
                            {formatCurrency(account.balance, account.currency)}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {!account.isActive && (
                      <Chip
                        label="Inactiva"
                        size="small"
                        sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)' }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Form Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAccount ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent className="form-input-fix">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nombre de la Cuenta"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      placeholder="Ej: Cuenta Principal, Ahorros USD"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="bank"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Banco"
                      error={!!errors.bank}
                      helperText={errors.bank?.message}
                    >
                      {BANKS.map((bank) => (
                        <MenuItem key={bank} value={bank}>
                          {getBankAccountStyle(bank, 'ARS').logo}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Moneda"
                      error={!!errors.currency}
                      helperText={errors.currency?.message}
                    >
                      <MenuItem value="ARS">Pesos Argentinos (ARS)</MenuItem>
                      <MenuItem value="USD">Dólares Estadounidenses (USD)</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="accountType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Tipo de Cuenta"
                      error={!!errors.accountType}
                      helperText={errors.accountType?.message}
                    >
                      {ACCOUNT_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="accountNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Número de Cuenta"
                      error={!!errors.accountNumber}
                      helperText={errors.accountNumber?.message}
                      placeholder="Ej: 1234567890123456"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="balance"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      fullWidth
                      label="Saldo Inicial (Opcional)"
                      error={!!errors.balance}
                      helperText={errors.balance?.message}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Estado"
                      value={field.value ? 'true' : 'false'}
                      onChange={(e) => field.onChange(e.target.value === 'true')}
                    >
                      <MenuItem value="true">Activa</MenuItem>
                      <MenuItem value="false">Inactiva</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              {editingAccount ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar la cuenta bancaria "{accountToDelete?.name}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
