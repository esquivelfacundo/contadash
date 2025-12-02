'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, CircularProgress, Typography } from '@mui/material'

export default function RecurringRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/monthly')
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
        Redirigiendo a Vista Mensual...
      </Typography>
    </Box>
  )
}
