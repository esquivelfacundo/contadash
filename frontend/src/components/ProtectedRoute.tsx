'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth.store'
import { CircularProgress, Box } from '@mui/material'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, token } = useAuthStore()

  useEffect(() => {
    // Verificar si hay token en localStorage
    const storedToken = localStorage.getItem('token')
    
    if (!isAuthenticated && !storedToken) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Mostrar loading mientras verifica
  if (!isAuthenticated && !token) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return <>{children}</>
}
