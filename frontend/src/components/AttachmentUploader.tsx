'use client'

import React, { useState, useRef } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Link,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material'
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material'
import { apiClient } from '@/lib/api/client'
import axios from 'axios'
import DocumentViewer from './DocumentViewer'

interface AttachmentUploaderProps {
  value: string | null
  onChange: (url: string | null) => void
  label?: string
}

export default function AttachmentUploader({
  value,
  onChange,
  label = 'Comprobante / Archivo Adjunto',
}: AttachmentUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (url: string) => {
    if (!url) return <FileIcon />
    
    const ext = url.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return <PdfIcon color="error" />
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return <ImageIcon color="primary" />
    return <FileIcon />
  }

  const getFileName = (url: string) => {
    if (!url) return 'Archivo'
    const parts = url.split('/')
    return parts[parts.length - 1]
  }

  const validateFile = (file: File): string | null => {
    // Validar extensión del archivo (más confiable que MIME type)
    const fileName = file.name.toLowerCase()
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
    
    if (!hasValidExtension) {
      return 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF, WEBP, PDF'
    }

    // Validar tamaño (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return 'El archivo es demasiado grande. Tamaño máximo: 10MB'
    }

    return null
  }

  const handleFileUpload = async (file: File) => {
    // Validar archivo
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Obtener token para autenticación
      const token = localStorage.getItem('token')
      
      // Usar axios directamente sin el apiClient para evitar transformaciones
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          // NO especificar Content-Type - axios lo detecta automáticamente para FormData
        },
      })

      // El backend devuelve { url: '/uploads/filename.ext' }
      // Cambiar a usar el endpoint protegido /api/files/:filename
      const filename = response.data.url.split('/').pop()
      const fileUrl = `${API_URL}/files/${filename}`
      onChange(fileUrl)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al subir el archivo')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleClear = () => {
    onChange(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleViewFile = () => {
    if (!value) return
    setViewerOpen(true)
  }

  const handleCloseViewer = () => {
    setViewerOpen(false)
  }

  // Tratar cadena vacía como null
  const hasValue = value && value.trim() !== ''

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>

      {hasValue ? (
        // Mostrar archivo subido
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getFileIcon(value)}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {getFileName(value)}
              </Typography>
              <Button
                onClick={handleViewFile}
                variant="text"
                size="small"
                sx={{ mt: 0.5, p: 0, minWidth: 'auto', textTransform: 'none' }}
              >
                Ver archivo
              </Button>
            </Box>
            <IconButton size="small" color="error" onClick={handleClear} disabled={uploading}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      ) : (
        // Zona de upload
        <Box>
          <Paper
            variant="outlined"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{
              p: 3,
              textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              bgcolor: dragActive ? 'action.hover' : 'background.paper',
              border: dragActive ? '2px dashed' : '1px solid',
              borderColor: dragActive ? 'primary.main' : 'divider',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: uploading ? 'background.paper' : 'action.hover',
              },
            }}
            onClick={uploading ? undefined : handleButtonClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              disabled={uploading}
            />

            {uploading ? (
              <Box>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Subiendo archivo...
                </Typography>
                <LinearProgress sx={{ mt: 2 }} />
              </Box>
            ) : (
              <Box>
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="body1" gutterBottom>
                  Arrastra un archivo aquí o haz click para seleccionar
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Formatos: JPG, PNG, GIF, WEBP, PDF
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Tamaño máximo: 10MB
                </Typography>
              </Box>
            )}
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
        </Box>
      )}

      {/* Document Viewer Modal */}
      {value && (
        <DocumentViewer
          open={viewerOpen}
          onClose={handleCloseViewer}
          url={value}
        />
      )}
    </Box>
  )
}
