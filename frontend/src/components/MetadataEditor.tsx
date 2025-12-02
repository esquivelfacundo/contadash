'use client'

import React, { useState } from 'react'
import {
  Box,
  TextField,
  IconButton,
  Button,
  Paper,
  Typography,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'

interface MetadataEditorProps {
  value: Record<string, any>
  onChange: (metadata: Record<string, any>) => void
  label?: string
  commonFields?: Array<{ key: string; label: string; type?: string }>
}

const DEFAULT_COMMON_FIELDS = [
  { key: 'invoiceNumber', label: 'Nº de Factura', type: 'text' },
  { key: 'supplier', label: 'Proveedor', type: 'text' },
  { key: 'warranty', label: 'Garantía', type: 'text' },
  { key: 'purchaseOrder', label: 'Orden de Compra', type: 'text' },
  { key: 'reference', label: 'Referencia', type: 'text' },
]

export default function MetadataEditor({
  value = {},
  onChange,
  label = 'Datos Adicionales',
  commonFields = DEFAULT_COMMON_FIELDS,
}: MetadataEditorProps) {
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [selectedCommonField, setSelectedCommonField] = useState('')

  const entries = Object.entries(value)

  const handleAdd = () => {
    if (newKey.trim() && !value[newKey]) {
      onChange({
        ...value,
        [newKey.trim()]: newValue.trim() || '',
      })
      setNewKey('')
      setNewValue('')
    }
  }

  const handleAddCommonField = () => {
    if (selectedCommonField && !value[selectedCommonField]) {
      onChange({
        ...value,
        [selectedCommonField]: '',
      })
      setSelectedCommonField('')
    }
  }

  const handleUpdate = (key: string, newVal: string) => {
    onChange({
      ...value,
      [key]: newVal,
    })
  }

  const handleDelete = (key: string) => {
    const newMetadata = { ...value }
    delete newMetadata[key]
    onChange(newMetadata)
  }

  const getFieldLabel = (key: string) => {
    const field = commonFields.find((f) => f.key === key)
    return field ? field.label : key
  }

  const availableCommonFields = commonFields.filter((field) => !value[field.key])

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>

      {/* Existing fields */}
      {entries.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            {entries.map(([key, val]) => (
              <Grid item xs={12} key={key}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    label={getFieldLabel(key)}
                    value={val || ''}
                    onChange={(e) => handleUpdate(key, e.target.value)}
                    size="small"
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(key)}
                    sx={{ mt: 0.5 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Add common field */}
      {availableCommonFields.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Agregar campo común</InputLabel>
            <Select
              value={selectedCommonField}
              onChange={(e) => setSelectedCommonField(e.target.value)}
              label="Agregar campo común"
            >
              {availableCommonFields.map((field) => (
                <MenuItem key={field.key} value={field.key}>
                  {field.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={handleAddCommonField}
            disabled={!selectedCommonField}
            startIcon={<AddIcon />}
          >
            Agregar
          </Button>
        </Box>
      )}

      {/* Add custom field */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Agregar campo personalizado
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <TextField
            size="small"
            label="Nombre del campo"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            label="Valor"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={!newKey.trim()}
            startIcon={<AddIcon />}
          >
            Agregar
          </Button>
        </Box>
      </Paper>

      {entries.length === 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          No hay datos adicionales. Agrega campos comunes o personalizados.
        </Typography>
      )}
    </Box>
  )
}
