import React from 'react'
import { View, StyleSheet, TouchableOpacity, Text as RNText } from 'react-native'
import { Avatar, IconButton } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'
import { useAuthStore } from '../store/authStore'

export const AppHeader = () => {
  const navigation = useNavigation()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' as any }],
    })
  }

  const handleSettings = () => {
    navigation.navigate('Settings' as any)
  }

  const handleAnalytics = () => {
    navigation.navigate('Analytics' as any)
  }

  const handleProfile = () => {
    navigation.navigate('Profile' as any)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo/Nombre de la App */}
        <RNText style={styles.logo}>ContaDash</RNText>

        {/* Acciones del Usuario */}
        <View style={styles.actions}>
        {/* Botón de Analytics */}
        <IconButton
          icon="chart-bar"
          size={22}
          iconColor={colors.textSecondary}
          onPress={handleAnalytics}
          style={styles.iconButton}
        />

        {/* Botón de Configuración */}
        <IconButton
          icon="cog"
          size={22}
          iconColor={colors.textSecondary}
          onPress={handleSettings}
          style={styles.iconButton}
        />

        {/* Botón de Logout */}
        <IconButton
          icon="logout"
          size={22}
          iconColor={colors.textSecondary}
          onPress={handleLogout}
          style={styles.iconButton}
        />

        {/* Avatar - Navega al Perfil */}
        <TouchableOpacity onPress={handleProfile} style={styles.userButton}>
          <Avatar.Text
            size={32}
            label={getInitials(user?.name || 'U')}
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
  },
  logo: {
    fontSize: 28,
    fontFamily: 'Satisfy',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconButton: {
    margin: 0,
  },
  userButton: {
    marginLeft: 4,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  avatarLabel: {
    fontSize: 13,
    fontWeight: 'bold',
  },
})
