# 📲 Integraciones Móviles - ContaDash

## 🎯 Objetivo

Implementación de features específicas de dispositivos móviles.

---

## 📷 Cámara y Galería

### **Hook useCamera**

```typescript
// src/hooks/useCamera.ts
import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import * as Camera from 'expo-camera'

export const useCamera = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync()
    setHasPermission(status === 'granted')
    return status === 'granted'
  }

  const takePicture = async () => {
    const hasPermission = await requestPermission()
    if (!hasPermission) return null

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8
    })

    if (!result.canceled) {
      return result.assets[0].uri
    }
    return null
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8
    })

    if (!result.canceled) {
      return result.assets[0].uri
    }
    return null
  }

  return {
    hasPermission,
    requestPermission,
    takePicture,
    pickImage
  }
}
```

---

## 🔐 Biometría

### **Hook useBiometric**

```typescript
// src/hooks/useBiometric.ts
import * as LocalAuthentication from 'expo-local-authentication'

export const useBiometric = () => {
  const checkSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync()
    const enrolled = await LocalAuthentication.isEnrolledAsync()
    return compatible && enrolled
  }

  const authenticate = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticarse con biometría',
        fallbackLabel: 'Usar contraseña'
      })
      return result.success
    } catch (error) {
      console.error('Biometric auth error:', error)
      return false
    }
  }

  return {
    checkSupport,
    authenticate
  }
}
```

---

## 🔔 Notificaciones Push

### **Setup de Notificaciones**

```typescript
// src/services/notifications.ts
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
})

export const notificationService = {
  async requestPermission() {
    const { status } = await Notifications.requestPermissionsAsync()
    return status === 'granted'
  },

  async getToken() {
    const token = await Notifications.getExpoPushTokenAsync()
    return token.data
  },

  async scheduleNotification(title: string, body: string, trigger: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true
      },
      trigger
    })
  },

  async scheduleBudgetAlert(categoryName: string, percentage: number) {
    await this.scheduleNotification(
      'Alerta de Presupuesto',
      `Has gastado ${percentage}% del presupuesto de ${categoryName}`,
      { seconds: 1 }
    )
  }
}
```

---

## 💾 Almacenamiento Offline

### **Offline Sync**

```typescript
// src/services/offline.ts
import NetInfo from '@react-native-community/netinfo'
import { storage } from '@utils/storage'

export const offlineService = {
  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch()
    return state.isConnected ?? false
  },

  async queueTransaction(transaction: any) {
    const queue = await storage.getItem('offline-queue') || []
    queue.push(transaction)
    await storage.setItem('offline-queue', queue)
  },

  async syncQueue() {
    const isOnline = await this.isOnline()
    if (!isOnline) return

    const queue = await storage.getItem('offline-queue') || []
    
    for (const transaction of queue) {
      try {
        await transactionsApi.create(transaction)
      } catch (error) {
        console.error('Sync error:', error)
      }
    }

    await storage.setItem('offline-queue', [])
  }
}
```

---

**Última actualización**: 1 de Diciembre, 2025  
**Versión**: 1.0.0
