import type { Metadata } from 'next'
import { Inter, Satisfy } from 'next/font/google'
import ThemeProvider from '@/components/ThemeProvider'
import './globals.css'
import '../styles/form-fixes.css'

const inter = Inter({ subsets: ['latin'] })
const satisfy = Satisfy({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-satisfy',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ContaDash - Gestión Financiera',
  description: 'Sistema de gestión financiera profesional',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Satisfy&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} ${satisfy.variable}`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
