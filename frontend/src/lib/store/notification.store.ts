import { create } from 'zustand'

interface Notification {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

interface NotificationState {
  notification: Notification | null
  showNotification: (message: string, type: Notification['type']) => void
  hideNotification: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notification: null,
  showNotification: (message, type) => set({ notification: { message, type } }),
  hideNotification: () => set({ notification: null }),
}))
