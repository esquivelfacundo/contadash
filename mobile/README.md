# 📱 ContaDash Mobile

Aplicación móvil de ContaDash desarrollada con React Native y Expo.

## 🚀 Quick Start

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Ejecutar la App

#### En tu iPhone con Expo Go:

```bash
npm start
```

1. Abre la app **Expo Go** en tu iPhone
2. Escanea el código QR que aparece en la terminal
3. ¡Listo! La app se cargará en tu teléfono

#### En el Navegador Web (Ubuntu):

```bash
npm run web
```

Se abrirá automáticamente en tu navegador.

#### En Android Emulator (si tienes instalado):

```bash
npm run android
```

## 📱 Expo Go en iOS

### Descargar:
- App Store: https://apps.apple.com/app/expo-go/id982107779

### Cómo usar:
1. Asegúrate de que tu iPhone y tu computadora estén en la misma red WiFi
2. Ejecuta `npm start` en la terminal
3. Aparecerá un código QR
4. Abre Expo Go en tu iPhone
5. Toca "Scan QR Code"
6. Escanea el código QR
7. ¡La app se cargará!

## 💻 Visualización en Ubuntu

### Opción 1: Navegador Web (Más Fácil)

```bash
npm run web
```

La app se abrirá en tu navegador. Perfecto para desarrollo rápido.

### Opción 2: Android Emulator (Más Realista)

1. Instalar Android Studio:
   ```bash
   # Descargar de: https://developer.android.com/studio
   ```

2. Configurar AVD (Android Virtual Device):
   - Abrir Android Studio
   - Tools > AVD Manager
   - Create Virtual Device
   - Seleccionar Pixel 5
   - Descargar system image (API 33)
   - Finish

3. Ejecutar:
   ```bash
   npm run android
   ```

## 🔧 Troubleshooting

### Error: "Cannot connect to Metro"

```bash
# Limpiar cache y reiniciar
npx expo start -c
```

### Error: "Network error"

- Verifica que tu iPhone y computadora estén en la misma red WiFi
- Desactiva VPN si tienes una activa
- Verifica el firewall de Ubuntu

### Error: "Module not found"

```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

## 📚 Documentación

- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Guía Completa](../guia-mobile/README.md)

## 🎯 Próximos Pasos

1. ✅ Setup completado
2. ⏳ Implementar autenticación
3. ⏳ Crear navegación
4. ⏳ Implementar pantallas principales

---

**Versión**: 1.0.0  
**Última actualización**: 1 de Diciembre, 2025
