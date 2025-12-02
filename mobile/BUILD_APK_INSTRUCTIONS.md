# 📱 Instrucciones para Generar APK de ContaDash

## ✅ Configuración Completada

Ya he configurado todo lo necesario:

1. ✅ **API configurada** para conectarse a `http://192.168.0.81:3000/api`
2. ✅ **Permisos de red** agregados en `app.json`
3. ✅ **Cleartext traffic** habilitado para HTTP local
4. ✅ **EAS Build** configurado en `eas.json`

---

## 🚀 Pasos para Generar el APK

### 1. Login en Expo (si no lo has hecho)

```bash
cd /home/lidius/Documents/contadash/mobile
npx eas-cli login
```

Si no tienes cuenta de Expo, créala en: https://expo.dev/signup

---

### 2. Configurar el Proyecto en EAS

```bash
npx eas-cli build:configure
```

Esto creará/actualizará la configuración necesaria.

---

### 3. Generar el APK

```bash
npx eas-cli build --platform android --profile preview
```

**Opciones durante el build:**
- Te preguntará si quieres crear un proyecto en Expo → **Sí**
- Te pedirá generar un keystore → **Sí** (para la primera vez)

---

### 4. Esperar el Build

El build se hace en la nube de Expo y tarda aproximadamente **5-15 minutos**.

Verás un link como:
```
Build details: https://expo.dev/accounts/[tu-usuario]/projects/contadash/builds/[build-id]
```

---

### 5. Descargar el APK

Cuando termine, verás:
```
✔ Build finished
APK: https://expo.dev/artifacts/eas/[hash].apk
```

**Descarga el APK con:**
```bash
wget [URL-del-APK] -O ContaDash.apk
```

O simplemente copia el link y ábrelo en tu navegador.

---

## 📲 Instalar en tu Celular

### Opción A: USB
1. Conecta tu celular por USB
2. Habilita "Transferencia de archivos"
3. Copia `ContaDash.apk` a tu celular
4. Abre el APK desde el explorador de archivos
5. Permite "Instalar desde fuentes desconocidas" si te lo pide

### Opción B: Compartir por Red
1. Usa cualquier app de compartir archivos (Google Drive, Telegram, WhatsApp)
2. Envíate el APK
3. Descárgalo en tu celular
4. Instálalo

---

## 🔧 Verificar Conexión

Una vez instalada la app:

1. **Asegúrate que tu celular esté en la misma red WiFi** (192.168.0.x)
2. **Verifica que el backend esté corriendo** en tu PC:
   ```bash
   cd /home/lidius/Documents/contadash/backend
   npm run dev
   ```
3. **Abre la app** y prueba hacer login

---

## 🐛 Troubleshooting

### "No se puede conectar al servidor"
- ✅ Verifica que estés en la misma red WiFi
- ✅ Verifica que el backend esté corriendo en el puerto 3000
- ✅ Prueba acceder desde el navegador del celular a: `http://192.168.0.81:3000/api`

### "Error de certificado SSL"
- ✅ Ya está configurado `usesCleartextTraffic: true`
- ✅ Estamos usando HTTP (no HTTPS) para red local

### El build falla
- ✅ Asegúrate de tener una cuenta de Expo
- ✅ Verifica que estés logueado: `npx eas-cli whoami`
- ✅ Revisa los logs del build en el link que te da

---

## 📁 Ubicación del APK

El APK se descargará en:
```
/home/lidius/Documents/contadash/mobile/ContaDash.apk
```

O en la carpeta donde ejecutes el comando `wget`.

---

## 🎯 Comando Rápido (Todo en Uno)

Si ya tienes todo configurado:

```bash
cd /home/lidius/Documents/contadash/mobile
npx eas-cli build --platform android --profile preview --non-interactive
```

---

## 📝 Notas Importantes

1. **Primera vez**: El build puede tardar más (15-20 min)
2. **Builds siguientes**: Son más rápidos (5-10 min)
3. **Límite gratuito**: Expo tiene límite de builds gratuitos por mes
4. **Tamaño del APK**: Aproximadamente 50-80 MB

---

## 🔄 Para Actualizar la App

Si haces cambios en el código:

1. Haz los cambios
2. Ejecuta nuevamente: `npx eas-cli build --platform android --profile preview`
3. Descarga el nuevo APK
4. Instálalo sobre la versión anterior (no necesitas desinstalar)

---

¡Listo! Ahora puedes generar tu APK y probarlo en tu celular. 🎉
