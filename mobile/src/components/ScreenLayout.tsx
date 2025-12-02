import React from 'react'
import { View, StyleSheet } from 'react-native'
import { FloatingNavBar } from './FloatingNavBar'
import { colors } from '../theme/colors'

interface ScreenLayoutProps {
  children: React.ReactNode
  showNavBar?: boolean
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({ 
  children, 
  showNavBar = true 
}) => {
  return (
    <View style={styles.container}>
      {/* Contenido de la pantalla - ocupa todo el espacio */}
      {children}

      {/* Navegación flotante - posición absoluta, siempre visible */}
      {showNavBar && (
        <View style={styles.navBarContainer}>
          <FloatingNavBar />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
})
