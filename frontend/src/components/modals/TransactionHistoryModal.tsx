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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Pagination,
  Paper,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Visibility,
  Search,
} from '@mui/icons-material'
import { transactionsApi } from '@/lib/api/transactions'
import { categoriesApi } from '@/lib/api/categories'
import { clientsApi } from '@/lib/api/clients'
import TransactionFormDialogEnhanced from '@/components/TransactionFormDialogEnhanced'
import DocumentViewer from '@/components/DocumentViewer'

interface TransactionHistoryModalProps {
  open: boolean
  onClose: () => void
}

export default function TransactionHistoryModal({ open, onClose }: TransactionHistoryModalProps) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    type: '',
    categoryId: '',
    clientId: '',
    search: '',
  })
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false)
  const [documentToView, setDocumentToView] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      loadTransactions()
      loadCategories()
      loadClients()
    }
  }, [open, page, filters])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 10,
        ...filters,
      }
      const data = await transactionsApi.getAll(params)
      setTransactions(data.transactions)
      setTotalPages(data.totalPages)
    } catch (err: any) {
      setError('Error al cargar transacciones')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll()
      setCategories(data)
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const loadClients = async () => {
    try {
      const data = await clientsApi.getAll()
      setClients(data)
    } catch (err) {
      console.error('Error loading clients:', err)
    }
  }

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction)
    setEditDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta transacción?')) return

    try {
      await transactionsApi.delete(id)
      loadTransactions()
    } catch (err: any) {
      setError('Error al eliminar transacción')
    }
  }

  const handleViewDocument = (url: string) => {
    setDocumentToView(url)
    setDocumentViewerOpen(true)
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPage(1)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR')
  }

  const getTypeColor = (type: string) => {
    return type === 'INCOME' ? 'success' : 'error'
  }

  const getTypeLabel = (type: string) => {
    return type === 'INCOME' ? 'Ingreso' : 'Egreso'
  }

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="xl" 
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
            <HistoryIcon sx={{ color: '#3B82F6' }} />
            <Typography variant="h6" color="white">Historial de Transacciones</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Filters */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Buscar"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              select
              size="small"
              label="Tipo"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="INCOME">Ingresos</MenuItem>
              <MenuItem value="EXPENSE">Egresos</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Categoría"
              value={filters.categoryId}
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Cliente"
              value={filters.clientId}
              onChange={(e) => handleFilterChange('clientId', e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.company}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress sx={{ color: '#0A014F' }} />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Categoría</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell align="right">Monto ARS</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {transaction.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getTypeLabel(transaction.type)}
                            color={getTypeColor(transaction.type)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {transaction.category && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <span>{transaction.category.icon}</span>
                              <Typography variant="body2">
                                {transaction.category.name}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          {transaction.client && (
                            <Typography variant="body2">
                              {transaction.client.company}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={getTypeColor(transaction.type)}
                          >
                            {formatCurrency(transaction.amountArs)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {transaction.attachmentUrl && (
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleViewDocument(transaction.attachmentUrl)}
                              title="Ver documento"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(transaction)}
                            title="Editar"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(transaction.id)}
                            title="Eliminar"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <TransactionFormDialogEnhanced
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setEditingTransaction(null)
        }}
        onSuccess={() => {
          setEditDialogOpen(false)
          setEditingTransaction(null)
          loadTransactions()
        }}
        transaction={editingTransaction}
      />

      <DocumentViewer
        open={documentViewerOpen}
        onClose={() => setDocumentViewerOpen(false)}
        url={documentToView}
      />
    </>
  )
}
