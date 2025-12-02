'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, CircularProgress, Typography } from '@mui/material'

export default function CreditCardsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/settings')
  }, [router])

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        gap: 2 
      }}
    >
      <CircularProgress sx={{ color: '#CD9FCC' }} />
      <Typography variant="body2" color="text.secondary">
        Redirigiendo a Configuración...
      </Typography>
    </Box>
  )
}
