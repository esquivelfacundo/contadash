'use client'

import { useState } from 'react'
import {
  Box,
  Card,
  Tabs,
  Tab,
  Typography,
} from '@mui/material'
import {
  Category as CategoryIcon,
  People as PeopleIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material'
import DashboardLayout from '@/components/DashboardLayout'
import CategoriesTab from '@/components/settings/CategoriesTab'
import ClientsTab from '@/components/settings/ClientsTab'
import CreditCardsTab from '@/components/settings/CreditCardsTab'
import BankAccountsTab from '@/components/settings/BankAccountsTab'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  }
}

export default function SettingsPage() {
  const [value, setValue] = useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <DashboardLayout>
      <Box sx={{ minHeight: '100vh' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
          Configuración
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Gestiona las configuraciones de tu cuenta y datos maestros
        </Typography>

        {/* Navigation Tabs */}
        <Card sx={{ mb: 3, bgcolor: '#1E293B', border: 'none' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: '#94A3B8',
                '&.Mui-selected': {
                  color: '#10B981',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#10B981',
              },
            }}
          >
            <Tab 
              icon={<CategoryIcon />} 
              label="Categorías" 
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab 
              icon={<PeopleIcon />} 
              label="Clientes" 
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab 
              icon={<CreditCardIcon />} 
              label="Tarjetas de Crédito" 
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab 
              icon={<BankIcon />} 
              label="Cuentas Bancarias" 
              iconPosition="start"
              sx={{ gap: 1 }}
            />
          </Tabs>
        </Card>

        {/* Tab Content */}
        <Box 
          sx={{ 
            bgcolor: '#1E293B',
            borderRadius: 2,
            border: '1px solid #334155',
            p: 3,
            minHeight: '600px',
          }}
        >
          <TabPanel value={value} index={0}>
            <CategoriesTab />
          </TabPanel>

          <TabPanel value={value} index={1}>
            <ClientsTab />
          </TabPanel>

          <TabPanel value={value} index={2}>
            <CreditCardsTab />
          </TabPanel>

          <TabPanel value={value} index={3}>
            <BankAccountsTab />
          </TabPanel>
        </Box>
      </Box>
    </DashboardLayout>
  )
}
