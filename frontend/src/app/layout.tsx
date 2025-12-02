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
      <body className={`${inter.className} ${satisfy.variable}`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
