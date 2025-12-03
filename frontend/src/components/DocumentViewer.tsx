'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material'
import {
  Close as CloseIcon,
  Download as DownloadIcon,
} from '@mui/icons-material'
import axios from 'axios'

interface DocumentViewerProps {
  open: boolean
  onClose: () => void
  url: string | null
  title?: string
}

export default function DocumentViewer({
  open,
  onClose,
  url,
  title = 'Documento',
}: DocumentViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && url) {
      loadFile()
    }
    
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [open, url])

  const loadFile = async () => {
    if (!url) return
    
    setLoading(true)
    setError('')
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        responseType: 'blob',
      })
      
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      })
      const objectUrl = URL.createObjectURL(blob)
      setBlobUrl(objectUrl)
    } catch (err: any) {
      setError('Error al cargar el archivo')
    } finally {
      setLoading(false)
    }
  }

  if (!url) return null

  const getFileType = (fileUrl: string) => {
    const ext = fileUrl.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return 'pdf'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image'
    return 'unknown'
  }

  const fileType = getFileType(url)

  const handleDownload = async () => {
    if (!blobUrl) return
    
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = url.split('/').pop() || 'documento'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{title}</Typography>
          <Box>
            <IconButton onClick={handleDownload} color="primary">
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {loading ? (
          <Box textAlign="center" p={4}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" mt={2}>
              Cargando documento...
            </Typography>
          </Box>
        ) : error ? (
          <Box textAlign="center" p={4}>
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          </Box>
        ) : blobUrl ? (
          fileType === 'pdf' ? (
            <iframe
              src={blobUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title="PDF Viewer"
            />
          ) : fileType === 'image' ? (
            <Box
              component="img"
              src={blobUrl}
              alt="Documento"
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <Box textAlign="center" p={4}>
              <Typography variant="body1" color="text.secondary">
                No se puede previsualizar este tipo de archivo
              </Typography>
              <IconButton onClick={handleDownload} color="primary" sx={{ mt: 2 }}>
                <DownloadIcon />
                <Typography variant="body2" ml={1}>
                  Descargar archivo
                </Typography>
              </IconButton>
            </Box>
          )
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
