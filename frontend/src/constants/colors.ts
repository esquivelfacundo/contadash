/**
 * Paleta de colores estándar del sistema
 * Usar estos colores en todos los gráficos y visualizaciones
 */

export const COLORS = {
  // Colores principales
  income: {
    main: '#10B981',
    light: 'rgba(16, 185, 129, 0.1)',
    medium: 'rgba(16, 185, 129, 0.5)',
    dark: '#059669',
  },
  expense: {
    main: '#8B5CF6',
    light: 'rgba(139, 92, 246, 0.1)',
    medium: 'rgba(139, 92, 246, 0.5)',
    dark: '#7C3AED',
  },
  balance: {
    main: '#F59E0B',
    light: 'rgba(245, 158, 11, 0.1)',
    medium: 'rgba(245, 158, 11, 0.5)',
    dark: '#D97706',
  },
  
  // Colores secundarios
  transactions: {
    main: '#EF4444',
    light: 'rgba(239, 68, 68, 0.1)',
    medium: 'rgba(239, 68, 68, 0.5)',
    dark: '#DC2626',
  },
  paymentMethods: {
    main: '#3B82F6',
    light: 'rgba(59, 130, 246, 0.1)',
    medium: 'rgba(59, 130, 246, 0.5)',
    dark: '#2563EB',
  },
  
  // Colores de utilidad
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  success: '#10B981',
  
  // Colores de fondo
  background: {
    primary: '#0F172A',
    secondary: '#1E293B',
    tertiary: '#334155',
  },
  
  // Colores de texto
  text: {
    primary: '#ffffff',
    secondary: '#94A3B8',
    disabled: '#64748B',
  },
  
  // Colores para gráficos (paleta adicional)
  chart: [
    '#10B981', // Verde (ingresos)
    '#8B5CF6', // Morado (egresos)
    '#F59E0B', // Amarillo (balance)
    '#3B82F6', // Azul
    '#EC4899', // Rosa
    '#14B8A6', // Teal
    '#F97316', // Naranja
    '#06B6D4', // Cyan
    '#84CC16', // Lima
    '#A855F7', // Púrpura
    '#22D3EE', // Cyan claro
    '#EF4444', // Rojo
  ],
} as const

export type ColorKey = keyof typeof COLORS
