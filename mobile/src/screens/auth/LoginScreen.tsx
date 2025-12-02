import React, { useState, useEffect, useRef } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform, Animated, Dimensions } from 'react-native'
import { TextInput, Button, Text, HelperText } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../../theme/colors'
import { useAuthStore } from '../../store/authStore'

const { width, height } = Dimensions.get('window')

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const login = useAuthStore((state) => state.login)
  const isLoading = useAuthStore((state) => state.isLoading)
  const authError = useAuthStore((state) => state.error)
  
  const [localError, setLocalError] = useState('')
  const gradientAnimation = useRef(new Animated.Value(0)).current
  const fadeAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Animación del gradiente
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(gradientAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start()

    // Fade in del contenido
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()
  }, [])

  const handleLogin = async () => {
    // Validaciones básicas
    if (!email || !password) {
      setLocalError('Por favor completa todos los campos')
      return
    }

    if (!email.includes('@')) {
      setLocalError('Por favor ingresa un email válido')
      return
    }

    try {
      setLocalError('')
      await login(email, password)
      // La navegación se maneja automáticamente por el AppNavigator
    } catch (err: any) {
      // El error ya está en el store
      setLocalError(err.message || 'Error al iniciar sesión')
    }
  }
  
  const error = localError || authError

  const gradientOpacity = gradientAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.7, 1],
  })

  return (
    <View style={styles.container}>
      {/* Gradiente animado de fondo */}
      <Animated.View
        style={[
          styles.gradientContainer,
          {
            opacity: gradientOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(16, 185, 129, 0.2)',
            'rgba(139, 92, 246, 0.2)',
            'rgba(245, 158, 11, 0.2)',
            'rgba(16, 185, 129, 0.2)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnimation }]}>
          <Text style={styles.title}>
            ContaDash
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Gestiona tus finanzas de forma inteligente
          </Text>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            mode="outlined"
            style={styles.input}
            theme={{ colors: { primary: colors.primary } }}
          />

          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            theme={{ colors: { primary: colors.primary } }}
          />

          {error ? (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          ) : null}

          <Button 
            mode="contained" 
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            buttonColor={colors.primary}
          >
            Iniciar Sesión
          </Button>

          <Button 
            mode="text" 
            onPress={() => alert('Próximamente: Registro')}
            style={styles.linkButton}
            textColor={colors.textSecondary}
          >
            ¿No tienes cuenta? Regístrate
          </Button>

          <Button 
            mode="text" 
            onPress={() => alert('Próximamente: Recuperar contraseña')}
            style={styles.linkButton}
            textColor={colors.textSecondary}
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradientContainer: {
    position: 'absolute',
    width: width,
    height: height,
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontFamily: 'Satisfy',
    fontSize: 48,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 48,
    fontSize: 16,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  linkButton: {
    marginTop: 8,
  },
})
