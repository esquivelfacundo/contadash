# 🤖 Configuración de Android Studio para Build Local

## 📊 Estado Actual:
- ⏳ **Android Studio instalándose** vía snap
- ⏱️ **Tiempo estimado**: 5-10 minutos

---

## 📋 PASOS A SEGUIR (Después de que termine la instalación):

### **1️⃣ Abrir Android Studio**
```bash
android-studio
```

### **2️⃣ Configuración Inicial**
1. **Welcome Screen** → Click en "More Actions" → "SDK Manager"
2. O si ya está abierto: **Tools** → **SDK Manager**

### **3️⃣ Instalar Componentes Necesarios**

#### **En la pestaña "SDK Platforms":**
- ✅ Marcar: **Android 15.0 (API 36)**

#### **En la pestaña "SDK Tools":**
- ✅ **Android SDK Build-Tools 36.0.0**
- ✅ **Android SDK Command-line Tools (latest)**
- ✅ **Android SDK Platform-Tools**
- ✅ **NDK (Side by side)** - Versión 27.1.12297006

### **4️⃣ Aplicar Cambios**
- Click en "Apply"
- Esperar descarga e instalación (~5-10 minutos)
- Click en "OK"

---

## 🔧 CONFIGURAR VARIABLES DE ENTORNO

Después de instalar los componentes, ejecuta:

```bash
cd /home/lidius/Documents/contadash/mobile
./setup-android-sdk.sh
```

Este script:
- ✅ Detecta el Android SDK
- ✅ Configura `ANDROID_HOME` y `ANDROID_SDK_ROOT`
- ✅ Agrega paths al `~/.bashrc`
- ✅ Verifica que todo esté instalado

---

## 🚀 COMPILAR EL APK

Una vez configurado todo:

```bash
# Recargar variables de entorno
source ~/.bashrc

# Limpiar builds anteriores
rm -rf android/

# Compilar APK localmente
npx eas-cli build --platform android --profile production --local
```

---

## ⏱️ TIEMPO TOTAL ESTIMADO:

1. **Instalación Android Studio**: 5-10 min (en progreso)
2. **Configuración inicial**: 2 min
3. **Descarga de componentes**: 5-10 min
4. **Configuración de variables**: 1 min
5. **Build del APK**: 10-15 min

**TOTAL: ~25-40 minutos**

---

## 🆘 TROUBLESHOOTING

### **Si el script dice "Android SDK no encontrado":**
1. Abre Android Studio
2. Ve a Tools → SDK Manager
3. Verifica la ruta en "Android SDK Location"
4. Debería ser: `/home/lidius/Android/Sdk`

### **Si el build falla con "SDK not found":**
```bash
# Verificar que las variables estén configuradas
echo $ANDROID_HOME
echo $ANDROID_SDK_ROOT

# Si están vacías, ejecuta:
source ~/.bashrc
```

### **Si falta algún componente:**
Abre Android Studio → Tools → SDK Manager y verifica que todos los componentes listados arriba estén instalados.

---

## 📱 RESULTADO FINAL

Al terminar, tendrás:
- ✅ APK generado en: `/home/lidius/Documents/contadash/mobile/build-XXXXX.apk`
- ✅ Listo para instalar en tu celular
- ✅ Sin depender de la cola de Expo

---

**🎯 PRÓXIMO PASO: Esperar que termine la instalación de Android Studio y seguir los pasos arriba.**
