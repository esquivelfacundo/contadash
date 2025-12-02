import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#10B981', // Verde moderno
      light: '#34D399',
      dark: '#059669',
    },
    secondary: {
      main: '#8B5CF6', // Púrpura moderno
      light: '#A78BFA',
      dark: '#7C3AED',
    },
    success: {
      main: '#10B981', // Verde vibrante
      light: '#34D399',
      dark: '#059669',
    },
    error: {
      main: '#EF4444', // Rojo moderno
      light: '#F87171',
      dark: '#DC2626',
    },
    warning: {
      main: '#F59E0B', // Naranja/amarillo
      light: '#FBBF24',
      dark: '#D97706',
    },
    info: {
      main: '#3B82F6', // Azul moderno
      light: '#60A5FA',
      dark: '#2563EB',
    },
    background: {
      default: '#0F172A', // Fondo oscuro principal
      paper: '#1E293B', // Cards oscuras
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 13, // Reducir tamaño base
    h1: {
      fontSize: '2rem', // Reducido de 2.5rem
      fontWeight: 600, // Reducido de 700
    },
    h2: {
      fontSize: '1.6rem', // Reducido de 2rem
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.4rem', // Reducido de 1.75rem
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.2rem', // Reducido de 1.5rem
      fontWeight: 600,
    },
    h5: {
      fontSize: '1rem', // Reducido de 1.25rem
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.9rem', // Reducido de 1rem
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.85rem', // Reducido
    },
    body2: {
      fontSize: '0.8rem', // Reducido
    },
    caption: {
      fontSize: '0.7rem', // Reducido
    },
  },
  shape: {
    borderRadius: 8, // Reducido de 12
  },
  spacing: 6, // Reducido de 8 (default)
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 6,
          fontSize: '0.8rem',
          padding: '6px 12px',
        },
        sizeSmall: {
          fontSize: '0.75rem',
          padding: '4px 8px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E293B',
          borderRadius: 8,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          border: '1px solid #334155',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px',
          '&:last-child': {
            paddingBottom: '16px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E293B',
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#0F172A',
            borderRadius: 6,
            fontSize: '0.85rem',
            '& fieldset': {
              borderColor: '#334155',
            },
            '&:hover fieldset': {
              borderColor: '#475569',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#10B981',
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.85rem',
            color: '#94A3B8',
          },
          '& .MuiOutlinedInput-input': {
            color: '#F8FAFC',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '0.7rem',
          height: '24px',
          backgroundColor: '#334155',
          color: '#F8FAFC',
        },
        sizeSmall: {
          fontSize: '0.65rem',
          height: '20px',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E293B',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '0.8rem',
          padding: '12px 16px',
          borderBottom: '1px solid #334155',
          color: '#F8FAFC',
        },
        head: {
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '12px 16px',
          backgroundColor: '#0F172A',
          color: '#94A3B8',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRadius: 8,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingTop: '8px',
          paddingBottom: '8px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          minHeight: '40px',
          padding: '6px 12px',
          textTransform: 'none',
          fontWeight: 500,
          color: '#94A3B8',
          '&.Mui-selected': {
            color: '#F8FAFC',
          },
          '& .MuiSvgIcon-root': {
            fontSize: '1rem',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: '#0F172A',
          borderRadius: '8px 8px 0 0',
          '& .MuiTabs-indicator': {
            backgroundColor: '#10B981',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: '6px',
          color: '#94A3B8',
          '&:hover': {
            backgroundColor: 'rgba(148, 163, 184, 0.1)',
          },
        },
        sizeSmall: {
          padding: '4px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          color: '#F8FAFC',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1E293B',
          color: '#F8FAFC',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#F8FAFC',
          '&:hover': {
            backgroundColor: '#334155',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#334155',
        },
      },
    },
  },
})
