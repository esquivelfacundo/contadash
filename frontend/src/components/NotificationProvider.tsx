'use client'

import { Snackbar, Alert } from '@mui/material'
import { useNotificationStore } from '@/lib/store/notification.store'

export default function NotificationProvider() {
  const { notification, hideNotification } = useNotificationStore()

  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={4000}
      onClose={hideNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={hideNotification}
        severity={notification?.type || 'info'}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {notification?.message}
      </Alert>
    </Snackbar>
  )
}
