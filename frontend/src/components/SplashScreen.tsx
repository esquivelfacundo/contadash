'use client'

import { useEffect, useState, useRef } from 'react'
import { Box, Typography, keyframes } from '@mui/material'

const gradientAnimation = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const scaleIn = keyframes`
  from {
    transform: scale(0.8);
  }
  to {
    transform: scale(1);
  }
`

const cursorBlink = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
`

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`

interface SplashScreenProps {
  onFinish: () => void
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isFadingOut, setIsFadingOut] = useState(false)
  const onFinishRef = useRef(onFinish)
  const fullText = 'ContaDash'
  const typingSpeed = 150 // ms por letra (9 letras × 150ms = 1350ms)
  const totalDuration = 2500 // Duración total: 2.5 segundos (tiempo para escribir + pausa)
  const fadeOutDuration = 400 // Duración del fade-out

  // Actualizar ref cuando cambie onFinish
  useEffect(() => {
    onFinishRef.current = onFinish
  }, [onFinish])

  useEffect(() => {
    let currentIndex = 0

    // Animación de escritura
    const typingInterval = setInterval(() => {
      currentIndex++
      const newText = fullText.slice(0, currentIndex)
      if (currentIndex <= fullText.length) {
        setDisplayedText(newText)
      }
    }, typingSpeed)

    // Timer FIJO para iniciar fade-out
    const fadeOutTimeout = setTimeout(() => {
      clearInterval(typingInterval)
      setIsFadingOut(true)
      
      // Notificar al padre después del fade-out
      setTimeout(() => {
        onFinishRef.current()
      }, fadeOutDuration)
    }, totalDuration)

    // Cleanup
    return () => {
      clearInterval(typingInterval)
      clearTimeout(fadeOutTimeout)
    }
  }, [])

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0F172A',
        overflow: 'hidden',
        animation: isFadingOut ? `${fadeOut} ${fadeOutDuration}ms ease-out forwards` : 'none',
      }}
    >
      {/* Gradiente animado de fondo */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(139, 92, 246, 0.3) 50%, rgba(245, 158, 11, 0.3) 100%)',
          animation: `${gradientAnimation} 4s ease-in-out infinite`,
        }}
      />

      {/* Contenido */}
      <Box
        sx={{
          position: 'relative',
          textAlign: 'center',
          animation: `${fadeIn} 0.5s ease-out, ${scaleIn} 0.5s ease-out`,
        }}
      >
        <Typography
          sx={{
            fontFamily: 'var(--font-satisfy), "Satisfy", cursive',
            fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
            color: '#FFFFFF',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            letterSpacing: 2,
            mb: 2,
            minHeight: { xs: '3rem', sm: '4rem', md: '5rem' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {displayedText}
          <Box
            component="span"
            sx={{
              color: '#10B981',
              opacity: 0.8,
              animation: `${cursorBlink} 1s step-end infinite`,
            }}
          >
            |
          </Box>
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
            color: 'rgba(255, 255, 255, 0.7)',
            letterSpacing: 1,
          }}
        >
          Tu asistente financiero
        </Typography>
      </Box>
    </Box>
  )
}
