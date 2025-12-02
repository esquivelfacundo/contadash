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
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { creditCardsApi } from '@/lib/api/credit-cards'
import { useNotificationStore } from '@/lib/store/notification.store'

// Función para obtener estilos específicos de cada banco
const getBankCardStyle = (bank: string) => {
  const styles: Record<string, any> = {
    'banco-nacion': {
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
      logo: 'BNA',
      pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
    },
    'banco-provincia': {
      background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
      logo: 'BPBA',
      pattern: 'repeating-linear-gradient(-45deg, transparent, transparent 15px, rgba(255,255,255,0.1) 15px, rgba(255,255,255,0.1) 30px)',
    },
    'banco-ciudad': {
      background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
      logo: 'CIUDAD',
      pattern: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
    },
    'santander': {
      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
      logo: 'SANTANDER',
      pattern: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%)',
    },
    'bbva': {
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
      logo: 'BBVA',
      pattern: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 16px)',
    },
    'galicia': {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
      logo: 'GALICIA',
      pattern: 'radial-gradient(ellipse at top, rgba(255,255,255,0.1), transparent)',
    },
    'macro': {
      background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
      logo: 'MACRO',
      pattern: 'repeating-linear-gradient(135deg, transparent, transparent 12px, rgba(255,255,255,0.1) 12px, rgba(255,255,255,0.1) 24px)',
    },
    'supervielle': {
      background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)',
      logo: 'SUPERVIELLE',
      pattern: 'linear-gradient(90deg, rgba(255,255,255,0.1) 50%, transparent 50%)',
    },
    'icbc': {
      background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #ef4444 100%)',
      logo: 'ICBC',
      pattern: 'repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)',
    },
    'hsbc': {
      background: 'linear-gradient(135deg, #dc2626 0%, #ffffff 50%, #dc2626 100%)',
      logo: 'HSBC',
      pattern: 'linear-gradient(45deg, rgba(220,38,38,0.1) 25%, transparent 25%, transparent 75%, rgba(220,38,38,0.1) 75%)',
      textColor: '#dc2626',
    },
    'credicoop': {
      background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)',
      logo: 'CREDICOOP',
      pattern: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
    },
    'patagonia': {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      logo: 'PATAGONIA',
      pattern: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)',
    },
    'frances': {
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #dbeafe 100%)',
      logo: 'FRANCÉS',
      pattern: 'linear-gradient(135deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%)',
    },
    'itau': {
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
      logo: 'ITAÚ',
      pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
    },
    'american-express': {
      background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #FFA500 100%)',
      logo: 'AMERICAN EXPRESS',
      pattern: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.2) 8px, rgba(255,255,255,0.2) 16px)',
      textColor: '#8B4513',
    },
    'otro': {
      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #374151 100%)',
      logo: 'BANCO',
      pattern: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%)',
    },
  }

  return styles[bank] || styles['otro']
}


const cardSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  lastFourDigits: z.string().length(4, 'Debe ser 4 dígitos'),
  bank: z.string().optional(),
  creditLimit: z.number().positive().optional(),
  closingDay: z.number().min(1).max(31),
  dueDay: z.number().min(1).max(31),
  isActive: z.boolean(),
})

type CardForm = z.infer<typeof cardSchema>

export default function CreditCardsTab() {
  const { showNotification } = useNotificationStore()
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingCard, setEditingCard] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<any>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CardForm>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      name: '',
      lastFourDigits: '',
      bank: '',
      creditLimit: undefined,
      closingDay: 15,
      dueDay: 25,
      isActive: true,
    },
  })

  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    try {
      setLoading(true)
      const data = await creditCardsApi.getAll()
      setCards(data)
    } catch (err) {
      showNotification('Error al cargar tarjetas', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCard(null)
    reset({
      name: '',
      lastFourDigits: '',
      bank: '',
      creditLimit: undefined,
      closingDay: 15,
      dueDay: 25,
      isActive: true,
    })
    setOpenDialog(true)
  }

  const handleEdit = (card: any) => {
    setEditingCard(card)
    reset({
      name: card.name,
      lastFourDigits: card.lastFourDigits,
      bank: card.bank || '',
      creditLimit: card.creditLimit ? Number(card.creditLimit) : undefined,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      isActive: card.isActive,
    })
    setOpenDialog(true)
  }

  const onSubmit = async (data: CardForm) => {
    try {
      if (editingCard) {
        await creditCardsApi.update(editingCard.id, data)
        showNotification('Tarjeta actualizada', 'success')
      } else {
        await creditCardsApi.create(data)
        showNotification('Tarjeta creada', 'success')
      }
      loadCards()
      setOpenDialog(false)
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Error al guardar tarjeta', 'error')
    }
  }

  const handleDeleteClick = (card: any) => {
    setCardToDelete(card)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!cardToDelete) return

    try {
      await creditCardsApi.delete(cardToDelete.id)
      showNotification('Tarjeta eliminada', 'success')
      loadCards()
      setDeleteDialogOpen(false)
      setCardToDelete(null)
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Error al eliminar tarjeta', 'error')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="white" mb={1}>
            Gestión de Tarjetas de Crédito
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona tus tarjetas y controla tus consumos • {cards.length} tarjetas registradas
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreate}
          sx={{ 
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
            }
          }}
        >
          Nueva Tarjeta
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress sx={{ color: '#F59E0B' }} />
        </Box>
      ) : cards.length === 0 ? (
        <Card elevation={0} sx={{ bgcolor: '#1E293B', border: '1px solid #334155' }}>
          <CardContent>
            <Box textAlign="center" py={4}>
              <CreditCardIcon sx={{ fontSize: 64, color: '#94A3B8', mb: 2 }} />
              <Typography variant="h6" color="white" gutterBottom>
                No tienes tarjetas registradas
              </Typography>
              <Typography variant="body2" color="#94A3B8" mb={3}>
                Agrega tus tarjetas de crédito para llevar un control de tus consumos
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />} 
                onClick={handleCreate}
                sx={{ 
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                  }
                }}
              >
                Agregar Primera Tarjeta
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {cards.map((card) => {
            const bankStyle = getBankCardStyle(card.bank || 'otro')
            return (
              <Grid item xs={12} sm={6} md={4} key={card.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: 200,
                    opacity: card.isActive ? 1 : 0.6,
                    background: card.isActive ? bankStyle.background : 'linear-gradient(135deg, #6B7280 0%, #374151 100%)',
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
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: bankStyle.pattern,
                      opacity: 0.3,
                      zIndex: 1,
                    }
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
                      <Box>
                        <IconButton
                          size="small"
                          sx={{ color: bankStyle.textColor || 'white', opacity: 0.8 }}
                          onClick={() => handleEdit(card)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: bankStyle.textColor || 'white', opacity: 0.8 }}
                          onClick={() => handleDeleteClick(card)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {card.name}
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ letterSpacing: 2, my: 2 }}
                  >
                    •••• •••• •••• {card.lastFourDigits}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="end" mt="auto">
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                        Cierre: {card.closingDay} | Venc: {card.dueDay}
                      </Typography>
                      {card.creditLimit && (
                        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                          Límite: {formatCurrency(card.creditLimit)}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {!card.isActive && (
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
          {editingCard ? 'Editar Tarjeta' : 'Nueva Tarjeta'}
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
                      label="Nombre de la Tarjeta"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      placeholder="Ej: Visa Gold, Mastercard Black"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="lastFourDigits"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Últimos 4 Dígitos"
                      error={!!errors.lastFourDigits}
                      helperText={errors.lastFourDigits?.message}
                      inputProps={{ maxLength: 4 }}
                      placeholder="1234"
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
                      placeholder="Seleccionar banco"
                    >
                      <MenuItem value="banco-nacion">Banco de la Nación Argentina</MenuItem>
                      <MenuItem value="banco-provincia">Banco Provincia</MenuItem>
                      <MenuItem value="banco-ciudad">Banco Ciudad</MenuItem>
                      <MenuItem value="santander">Banco Santander</MenuItem>
                      <MenuItem value="bbva">BBVA Argentina</MenuItem>
                      <MenuItem value="galicia">Banco Galicia</MenuItem>
                      <MenuItem value="macro">Banco Macro</MenuItem>
                      <MenuItem value="supervielle">Banco Supervielle</MenuItem>
                      <MenuItem value="icbc">ICBC Argentina</MenuItem>
                      <MenuItem value="hsbc">HSBC Argentina</MenuItem>
                      <MenuItem value="credicoop">Banco Credicoop</MenuItem>
                      <MenuItem value="patagonia">Banco Patagonia</MenuItem>
                      <MenuItem value="frances">Banco Francés</MenuItem>
                      <MenuItem value="itau">Banco Itaú</MenuItem>
                      <MenuItem value="american-express">American Express</MenuItem>
                      <MenuItem value="otro">Otro</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="creditLimit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Límite de Crédito (opcional)"
                      type="number"
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="500000"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="closingDay"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Día de Cierre"
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      error={!!errors.closingDay}
                      helperText={errors.closingDay?.message}
                      inputProps={{ min: 1, max: 31 }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="dueDay"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Día de Vencimiento"
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      error={!!errors.dueDay}
                      helperText={errors.dueDay?.message}
                      inputProps={{ min: 1, max: 31 }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
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
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{ bgcolor: '#CD9FCC', '&:hover': { bgcolor: '#B87DB8' } }}
            >
              {editingCard ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar esta tarjeta?
          </Typography>
          {cardToDelete && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                <strong>Tarjeta:</strong> {cardToDelete.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Últimos 4:</strong> {cardToDelete.lastFourDigits}
              </Typography>
            </Box>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            No se puede eliminar una tarjeta con transacciones asociadas
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
