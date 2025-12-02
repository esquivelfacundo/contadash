'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Autocomplete,
  InputAdornment,
  IconButton,
  Collapse,
  Button,
} from '@mui/material'
import {
  Search,
  FilterList,
  Clear,
} from '@mui/icons-material'

export interface TransactionFilters {
  searchText?: string
  type?: 'INCOME' | 'EXPENSE' | 'ALL'
  categoryIds?: string[]
  clientIds?: string[]
  creditCardIds?: string[]
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  isPaid?: boolean | 'ALL'
}

interface TransactionSearchFilterProps {
  onFilterChange: (filters: TransactionFilters) => void
  categories?: any[]
  clients?: any[]
  creditCards?: any[]
}

export default function TransactionSearchFilter({
  onFilterChange,
  categories = [],
  clients = [],
  creditCards = [],
}: TransactionSearchFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState<TransactionFilters>({
    searchText: '',
    type: 'ALL',
    categoryIds: [],
    clientIds: [],
    creditCardIds: [],
    dateFrom: '',
    dateTo: '',
    isPaid: 'ALL',
  })

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      onFilterChange(filters)
    }, 300)

    return () => clearTimeout(timer)
  }, [filters, onFilterChange])

  const handleChange = (field: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleClear = () => {
    setFilters({
      searchText: '',
      type: 'ALL',
      categoryIds: [],
      clientIds: [],
      creditCardIds: [],
      dateFrom: '',
      dateTo: '',
      isPaid: 'ALL',
    })
  }

  const hasActiveFilters = 
    filters.searchText ||
    filters.type !== 'ALL' ||
    (filters.categoryIds && filters.categoryIds.length > 0) ||
    (filters.clientIds && filters.clientIds.length > 0) ||
    (filters.creditCardIds && filters.creditCardIds.length > 0) ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.isPaid !== 'ALL'

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Search Bar */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Buscar por descripción, monto, categoría..."
            value={filters.searchText}
            onChange={(e) => handleChange('searchText', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: filters.searchText && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => handleChange('searchText', '')}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Type Filter */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Tipo"
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <MenuItem value="ALL">Todos</MenuItem>
            <MenuItem value="INCOME">Ingresos</MenuItem>
            <MenuItem value="EXPENSE">Egresos</MenuItem>
          </TextField>
        </Grid>

        {/* Advanced Filters Toggle */}
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant={showAdvanced ? 'contained' : 'outlined'}
            startIcon={<FilterList />}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Ocultar Filtros' : 'Más Filtros'}
          </Button>
        </Grid>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Grid item xs={12}>
            <Button
              size="small"
              startIcon={<Clear />}
              onClick={handleClear}
            >
              Limpiar Filtros
            </Button>
          </Grid>
        )}
      </Grid>

      {/* Advanced Filters */}
      <Collapse in={showAdvanced}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Categories */}
          <Grid item xs={12} md={4}>
            <Autocomplete
              multiple
              options={categories}
              getOptionLabel={(option) => option.name}
              value={categories.filter(c => filters.categoryIds?.includes(c.id))}
              onChange={(_, newValue) => {
                handleChange('categoryIds', newValue.map(v => v.id))
              }}
              renderInput={(params) => (
                <TextField {...params} label="Categorías" placeholder="Seleccionar..." />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={option.name}
                    size="small"
                    style={{ backgroundColor: option.color, color: '#fff' }}
                  />
                ))
              }
            />
          </Grid>

          {/* Clients */}
          <Grid item xs={12} md={4}>
            <Autocomplete
              multiple
              options={clients}
              getOptionLabel={(option) => option.company}
              value={clients.filter(c => filters.clientIds?.includes(c.id))}
              onChange={(_, newValue) => {
                handleChange('clientIds', newValue.map(v => v.id))
              }}
              renderInput={(params) => (
                <TextField {...params} label="Clientes" placeholder="Seleccionar..." />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={option.company}
                    size="small"
                  />
                ))
              }
            />
          </Grid>

          {/* Credit Cards */}
          <Grid item xs={12} md={4}>
            <Autocomplete
              multiple
              options={creditCards}
              getOptionLabel={(option) => option.name}
              value={creditCards.filter(c => filters.creditCardIds?.includes(c.id))}
              onChange={(_, newValue) => {
                handleChange('creditCardIds', newValue.map(v => v.id))
              }}
              renderInput={(params) => (
                <TextField {...params} label="Tarjetas de Crédito" placeholder="Seleccionar..." />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={option.name}
                    size="small"
                  />
                ))
              }
            />
          </Grid>

          {/* Date From */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Desde"
              value={filters.dateFrom}
              onChange={(e) => handleChange('dateFrom', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Date To */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Hasta"
              value={filters.dateTo}
              onChange={(e) => handleChange('dateTo', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Min Amount */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Monto Mínimo (ARS)"
              value={filters.minAmount || ''}
              onChange={(e) => handleChange('minAmount', e.target.value ? Number(e.target.value) : undefined)}
            />
          </Grid>

          {/* Max Amount */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Monto Máximo (ARS)"
              value={filters.maxAmount || ''}
              onChange={(e) => handleChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
            />
          </Grid>

          {/* Payment Status */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Estado de Pago"
              value={filters.isPaid}
              onChange={(e) => handleChange('isPaid', e.target.value)}
            >
              <MenuItem value="ALL">Todos</MenuItem>
              <MenuItem value={true as any}>Pagados</MenuItem>
              <MenuItem value={false as any}>Pendientes</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Collapse>
    </Box>
  )
}
