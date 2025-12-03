# 🔌 TEST DE CONEXIÓN - ContaDash Mobile

## ✅ BACKEND CORRIENDO

El backend está activo en:
```
http://192.168.0.81:3000/api
```

---

## 📱 PRUEBAS DESDE EL CELULAR

### **1. Verificar conectividad básica**

Abre el navegador en tu celular Android y visita:
```
http://192.168.0.81:3000/api
```

**Deberías ver**: Un mensaje JSON o página de la API.

---

### **2. Probar endpoint de login**

Desde el navegador del celular, prueba:
```
http://192.168.0.81:3000/api/auth/login
```

**Deberías ver**: Error 400 o 405 (es normal, solo estamos verificando que responda)

---

### **3. Verificar que estás en la misma red**

En tu celular:
1. Ve a **Configuración** → **Wi-Fi**
2. Toca la red conectada
3. Verifica que la IP del celular sea `192.168.0.XXX`

**Ejemplo**: Si tu celular tiene IP `192.168.0.105`, están en la misma red ✅

---

## 🔍 DIAGNÓSTICO DE ERRORES

### **Error: "Network request failed"**
- ✅ Backend corriendo: SÍ
- ✅ Firewall abierto: SÍ
- ❓ Misma red Wi-Fi: Verificar

**Solución**: Asegúrate que el celular y la PC estén en la misma red Wi-Fi.

---

### **Error: "Timeout"**
Puede ser que tu router bloquee la comunicación entre dispositivos.

**Solución**: Habilitar "AP Isolation" o "Client Isolation" en OFF en el router.

---

### **Error: "Unable to resolve host"**
La IP cambió o el DNS no resuelve.

**Solución**: Verificar IP actual de la PC:
```bash
hostname -I
```

Si cambió, actualizar en `/home/lidius/Documents/contadash/mobile/src/constants/api.ts`

---

## 🧪 TEST MANUAL DE LOGIN

Desde el celular, abre la app y prueba login con:
- **Email**: El usuario que creaste en el backend
- **Password**: La contraseña correspondiente

---

## 📊 LOGS DEL BACKEND

Para ver qué está recibiendo el backend, monitorea los logs:
```bash
# Los logs ya están visibles en la terminal donde corriste npm run dev
```

Deberías ver requests como:
```
POST /api/auth/login
```

---

## ✅ CHECKLIST

- [x] Backend corriendo en `0.0.0.0:3000`
- [x] Firewall permite puerto 3000
- [x] IP configurada en mobile: `192.168.0.81`
- [ ] Celular en misma red Wi-Fi
- [ ] Test de navegador exitoso
- [ ] Login desde app funciona

---

## 🚀 SIGUIENTE PASO

**Prueba el login desde la app ahora.** Si sigue fallando, verifica:
1. Que el celular esté en la misma red Wi-Fi
2. Los logs del backend para ver si llegan las peticiones
3. Que no haya "AP Isolation" activado en el router
