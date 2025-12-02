# 🚀 Instrucciones para Iniciar ContaDash Mobile

## ✅ Setup Completado

Las dependencias se instalaron correctamente. Ahora puedes iniciar la app.

---

## 📱 Opción 1: Ver en tu iPhone con Expo Go (RECOMENDADO)

### Paso 1: Iniciar el servidor

Abre una terminal en la carpeta `mobile` y ejecuta:

```bash
cd /home/lidius/Documents/contadash/mobile
npx expo start
```

### Paso 2: Escanear QR Code

1. Aparecerá un **código QR** en la terminal
2. Abre la app **Expo Go** en tu iPhone
3. Toca "Scan QR Code" 
4. Escanea el código QR
5. ¡La app se cargará en tu iPhone!

**Nota**: Tu iPhone y tu computadora deben estar en la misma red WiFi.

---

## 💻 Opción 2: Ver en el Navegador (Ubuntu)

### Ejecutar en modo web:

```bash
cd /home/lidius/Documents/contadash/mobile
npx expo start --web
```

Se abrirá automáticamente en tu navegador en: http://localhost:19006

---

## 🔧 Si el QR Code no aparece

### Opción A: Usar túnel

```bash
npx expo start --tunnel
```

Esto creará una URL pública que funciona incluso si no estás en la misma red.

### Opción B: Especificar tu IP

```bash
npx expo start --host 192.168.0.81
```

(Reemplaza con tu IP local si es diferente)

---

## 📱 Descargar Expo Go

### iOS (iPhone):
- **App Store**: https://apps.apple.com/app/expo-go/id982107779
- Busca "Expo Go" en el App Store

### Android (si necesitas):
- **Google Play**: https://play.google.com/store/apps/details?id=host.exp.exponent

---

## 🎯 Comandos Útiles

```bash
# Iniciar normalmente
npx expo start

# Iniciar en modo web
npx expo start --web

# Iniciar con túnel (para diferentes redes)
npx expo start --tunnel

# Limpiar cache y reiniciar
npx expo start -c

# Ver en Android emulator (si tienes instalado)
npx expo start --android
```

---

## 🔍 Troubleshooting

### Error: "Cannot connect to Metro"

```bash
# Limpiar cache
npx expo start -c
```

### Error: "Network error"

1. Verifica que iPhone y computadora estén en la misma WiFi
2. Desactiva VPN si tienes
3. Usa `--tunnel` si sigues con problemas

### Error: "Port already in use"

```bash
# Matar proceso en puerto 19000
lsof -ti:19000 | xargs kill -9
# Reintentar
npx expo start
```

---

## 📊 Lo que verás

Cuando la app cargue, verás:

- 🎉 Título "ContaDash Mobile"
- ✅ Mensaje de confirmación
- 📋 Lista de features configuradas
- 🎨 Tema oscuro aplicado

---

## 🎨 Características Actuales

- ✅ React Native + Expo configurado
- ✅ TypeScript funcionando
- ✅ React Native Paper (UI library)
- ✅ Tema oscuro (colores de ContaDash)
- ✅ Estructura base lista

---

## 🚀 Próximos Pasos

Una vez que veas la app funcionando:

1. ✅ Verificar que carga correctamente
2. ⏳ Implementar sistema de navegación
3. ⏳ Crear pantalla de login
4. ⏳ Conectar con el backend
5. ⏳ Implementar pantallas principales

---

## 💡 Tips

- **Hot Reload**: Los cambios se reflejan automáticamente
- **Shake**: Agita tu iPhone para abrir el menú de desarrollo
- **Logs**: Los console.log aparecen en la terminal
- **Errores**: Los errores aparecen en pantalla y en terminal

---

**¿Listo para comenzar?** 🚀

Ejecuta: `npx expo start` y escanea el QR con Expo Go!
