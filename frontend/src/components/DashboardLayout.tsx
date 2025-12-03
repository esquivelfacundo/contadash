'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  CalendarMonth as MonthlyIcon,
  Analytics as AnalyticsIcon,
  AccountBalance as BudgetIcon,
  AccountBalanceWallet as BalanceIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material'
import { useAuthStore } from '@/lib/store/auth.store'

const drawerWidth = 240
const collapsedWidth = 70

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, clearAuth } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    try {
      await useAuthStore.getState().logout()
      router.push('/login')
    } catch (error) {
      // Even if logout fails, redirect to login
      clearAuth()
      router.push('/login')
    }
  }

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Movimientos', icon: <MonthlyIcon />, path: '/monthly' },
    { text: 'Balance', icon: <BalanceIcon />, path: '/balance' },
    { text: 'Presupuestos', icon: <BudgetIcon />, path: '/budgets' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'Configuración', icon: <SettingsIcon />, path: '/settings' },
  ]

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0F172A',
        color: 'white',
        width: sidebarCollapsed ? collapsedWidth : drawerWidth,
        transition: 'width 0.3s ease',
        position: 'relative',
        borderRight: '1px solid #1E293B',
      }}
    >
      {/* Logo y botón de colapsar */}
      <Box sx={{ p: 2, textAlign: 'center', position: 'relative' }}>
        {!sidebarCollapsed ? (
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: 'var(--font-satisfy)',
              fontSize: '1.5rem',
              fontWeight: 400,
              color: 'white',
            }}
          >
            ContaDash
          </Typography>
        ) : (
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: 'var(--font-satisfy)',
              fontSize: '1.2rem',
              fontWeight: 400,
              color: 'white',
            }}
          >
            CD
          </Typography>
        )}
        
        {/* Botón de colapsar */}
        <IconButton
          onClick={toggleSidebar}
          sx={{
            position: 'fixed',
            left: sidebarCollapsed ? collapsedWidth - 12 : drawerWidth - 12,
            top: '50px',
            width: 24,
            height: 24,
            bgcolor: '#334155',
            color: 'white',
            zIndex: 1300,
            transition: 'left 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              bgcolor: '#475569',
            },
            border: '2px solid #0F172A',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            '& .MuiSvgIcon-root': {
              fontSize: '14px',
            },
          }}
        >
          {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>
      
      {/* Menu Items */}
      <List sx={{ 
        flexGrow: 1, 
        px: 1.5, 
        py: 1, 
        bgcolor: 'transparent !important',
        '&.MuiList-root': {
          backgroundColor: 'transparent !important'
        }
      }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.25, bgcolor: 'transparent' }}>
              <ListItemButton 
                onClick={() => router.push(item.path)}
                sx={{
                  borderRadius: 1.5,
                  color: isActive ? '#10B981' : '#94A3B8',
                  py: sidebarCollapsed ? 0.5 : 0.75,
                  px: sidebarCollapsed ? 0.5 : 1.5,
                  minHeight: sidebarCollapsed ? '48px' : '36px',
                  flexDirection: sidebarCollapsed ? 'column' : 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  position: 'relative',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#10B981' : '#F8FAFC',
                  },
                  '&::before': isActive ? {
                    content: '""',
                    position: 'absolute',
                    left: -12,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    bgcolor: '#10B981',
                    borderRadius: '0 2px 2px 0',
                  } : {},
                }}
              >
              {sidebarCollapsed ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ '& svg': { fontSize: '1.1rem' } }}>
                    {item.icon}
                  </Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.6rem', 
                      textAlign: 'center',
                      lineHeight: 1,
                      color: 'inherit'
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              ) : (
                <>
                  <ListItemIcon sx={{ 
                    color: 'inherit', 
                    minWidth: 32, 
                    '& svg': { fontSize: '1.1rem' } 
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.8rem',
                      fontWeight: 500,
                    }}
                  />
                </>
              )}
            </ListItemButton>
          </ListItem>
          )
        })}
      </List>

      {/* User Section */}
      <Box sx={{ p: 1.5, bgcolor: 'transparent' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: sidebarCollapsed ? 0 : 1.5,
            p: 1,
            borderRadius: 1.5,
            cursor: 'pointer',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            bgcolor: 'transparent',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
          onClick={handleMenu}
        >
          <Avatar sx={{ width: 28, height: 28, bgcolor: '#10B981', fontSize: '0.8rem' }}>
            {mounted && user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          {!sidebarCollapsed && (
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#F8FAFC', fontSize: '0.75rem' }}>
                {mounted ? user?.name : 'Usuario'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.65rem' }}>
                {mounted ? user?.email : ''}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#0F172A' }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: sidebarCollapsed ? collapsedWidth : drawerWidth }, flexShrink: { sm: 0 }, transition: 'width 0.3s ease' }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: '#0F172A',
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: sidebarCollapsed ? collapsedWidth : drawerWidth,
              border: 'none',
              bgcolor: '#0F172A',
              transition: 'width 0.3s ease',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Mobile Menu Button */}
        <Box
          sx={{
            display: { xs: 'flex', sm: 'none' },
            p: 1,
            bgcolor: '#0F172A',
          }}
        >
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ color: 'white' }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Área principal de contenido */}
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            bgcolor: '#0F172A', // Fondo oscuro
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => { handleClose(); router.push('/profile') }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Perfil</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Cerrar Sesión</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}
