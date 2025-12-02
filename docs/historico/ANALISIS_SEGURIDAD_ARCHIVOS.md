# 🔒 ANÁLISIS DE SEGURIDAD - SISTEMA DE ARCHIVOS

**Fecha:** 30 de Noviembre, 2025, 06:33 PM  
**Estado:** 🔍 EN REVISIÓN  
**Prioridad:** 🔴 CRÍTICA

---

## 🎯 AMENAZAS IDENTIFICADAS

### 1. ⚠️ Acceso No Autorizado a Archivos
**Riesgo:** Un usuario podría acceder a archivos de otro usuario adivinando la URL

**Estado Actual:**
- ❌ Los archivos se sirven desde `/uploads` sin verificación de usuario
- ❌ Cualquiera con la URL puede acceder al archivo

**Impacto:** ALTO - Violación de privacidad

### 2. ⚠️ Malware / Archivos Maliciosos
**Riesgo:** Usuario sube archivo con código malicioso (virus, ransomware, etc.)

**Estado Actual:**
- ✅ Validación de extensión (solo PDF, JPG, PNG, GIF, WEBP)
- ❌ No hay escaneo de contenido del archivo
- ❌ No hay validación de que el contenido coincida con la extensión

**Impacto:** MEDIO - Podría infectar servidor o usuarios

### 3. ⚠️ SQL Injection
**Riesgo:** Inyección de código SQL a través de nombres de archivo o metadata

**Estado Actual:**
- ✅ Prisma ORM previene SQL injection automáticamente
- ✅ No se usa SQL crudo
- ✅ Nombres de archivo sanitizados (timestamp + random)

**Impacto:** BAJO - Bien protegido

### 4. ⚠️ Path Traversal
**Riesgo:** Usuario intenta acceder a archivos fuera de `/uploads` con `../../../etc/passwd`

**Estado Actual:**
- ✅ Multer maneja el almacenamiento de forma segura
- ⚠️ Necesita verificación adicional en endpoint de descarga

**Impacto:** MEDIO - Podría exponer archivos del sistema

### 5. ⚠️ XSS (Cross-Site Scripting)
**Riesgo:** Archivo SVG o HTML con JavaScript malicioso

**Estado Actual:**
- ✅ No se permiten archivos HTML o SVG
- ✅ Content-Type headers correctos
- ⚠️ PDFs podrían contener JavaScript

**Impacto:** MEDIO - Podría ejecutar código en navegador

### 6. ⚠️ DoS (Denial of Service)
**Riesgo:** Usuario sube muchos archivos grandes para llenar el disco

**Estado Actual:**
- ✅ Límite de 10MB por archivo
- ⚠️ No hay límite de archivos por usuario
- ⚠️ No hay límite de almacenamiento total

**Impacto:** MEDIO - Podría llenar el disco

---

## ✅ MEDIDAS DE SEGURIDAD ACTUALES

### Backend

1. **Validación de Extensión**
   ```typescript
   const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']
   ```

2. **Límite de Tamaño**
   ```typescript
   fileSize: 10 * 1024 * 1024 // 10MB
   ```

3. **Nombres de Archivo Únicos**
   ```typescript
   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
   ```

4. **Autenticación Requerida**
   ```typescript
   router.use(authMiddleware)
   ```

5. **Prisma ORM**
   - Previene SQL injection automáticamente

6. **Helmet Security Headers**
   - CSP, XSS Protection, etc.

### Frontend

1. **Validación de Extensión**
   ```typescript
   const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']
   ```

2. **Validación de Tamaño**
   ```typescript
   maxSize: 10 * 1024 * 1024
   ```

---

## 🔴 VULNERABILIDADES CRÍTICAS

### 1. ACCESO NO AUTORIZADO A ARCHIVOS

**Problema:**
```typescript
// En app.ts - CUALQUIERA puede acceder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
```

**Solución Requerida:**
- Crear endpoint protegido para servir archivos
- Verificar que el usuario sea dueño de la transacción
- No servir archivos directamente

### 2. NO HAY VALIDACIÓN DE CONTENIDO

**Problema:**
- Un archivo `.jpg` podría ser realmente un `.exe` renombrado
- Un PDF podría contener JavaScript malicioso

**Solución Requerida:**
- Validar magic numbers (primeros bytes del archivo)
- Escanear archivos con antivirus (ClamAV)
- Sanitizar PDFs

### 3. NO HAY LÍMITE DE ALMACENAMIENTO

**Problema:**
- Usuario podría subir miles de archivos de 10MB

**Solución Requerida:**
- Límite de almacenamiento por usuario
- Límite de archivos por usuario
- Monitoreo de espacio en disco

---

## 🛡️ PLAN DE SEGURIDAD

### Prioridad 1: CRÍTICA (Implementar YA)

1. **Endpoint Protegido para Archivos**
   - Crear `/api/files/:filename`
   - Verificar autenticación
   - Verificar propiedad del archivo
   - Servir archivo solo si es autorizado

2. **Validación de Magic Numbers**
   - Verificar que el contenido coincida con la extensión
   - Rechazar archivos con contenido sospechoso

3. **Path Traversal Protection**
   - Sanitizar nombres de archivo
   - Validar que el path esté dentro de `/uploads`

### Prioridad 2: ALTA (Implementar Pronto)

4. **Límites de Almacenamiento**
   - Máximo 100MB por usuario
   - Máximo 20 archivos por usuario
   - Limpiar archivos huérfanos

5. **Content-Type Validation**
   - Forzar Content-Type correcto al servir
   - Prevenir ejecución de scripts

### Prioridad 3: MEDIA (Implementar Después)

6. **Escaneo de Virus**
   - Integrar ClamAV
   - Escanear archivos al subir
   - Rechazar archivos infectados

7. **Sanitización de PDFs**
   - Remover JavaScript de PDFs
   - Usar librería como pdf-lib

---

## 📊 MATRIZ DE RIESGO

| Amenaza | Probabilidad | Impacto | Riesgo | Estado |
|---------|--------------|---------|--------|--------|
| Acceso no autorizado | ALTA | ALTO | 🔴 CRÍTICO | ❌ Vulnerable |
| Malware | MEDIA | ALTO | 🟠 ALTO | ⚠️ Parcial |
| SQL Injection | BAJA | ALTO | 🟡 MEDIO | ✅ Protegido |
| Path Traversal | MEDIA | ALTO | 🟠 ALTO | ⚠️ Parcial |
| XSS | BAJA | MEDIO | 🟡 MEDIO | ⚠️ Parcial |
| DoS | MEDIA | MEDIO | 🟡 MEDIO | ⚠️ Parcial |

---

## 🚀 IMPLEMENTACIÓN INMEDIATA

### 1. Endpoint Protegido (CRÍTICO)

```typescript
// routes/files.routes.ts
router.get('/:filename', authMiddleware, async (req, res) => {
  const { filename } = req.params
  const userId = req.user.id
  
  // Verificar que el archivo pertenece a una transacción del usuario
  const transaction = await prisma.transaction.findFirst({
    where: {
      userId,
      attachmentUrl: { contains: filename }
    }
  })
  
  if (!transaction) {
    return res.status(403).json({ error: 'No autorizado' })
  }
  
  // Servir archivo
  const filePath = path.join(__dirname, '../../uploads', filename)
  res.sendFile(filePath)
})
```

### 2. Magic Number Validation

```typescript
const fileType = await import('file-type')

const validateFileContent = async (file: Express.Multer.File) => {
  const type = await fileType.fromFile(file.path)
  
  const allowedMimes = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf']
  }
  
  if (!type || !allowedMimes[type.mime]) {
    throw new Error('Tipo de archivo no válido')
  }
}
```

### 3. Path Traversal Protection

```typescript
const sanitizeFilename = (filename: string) => {
  // Remover caracteres peligrosos
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_')
}

const validatePath = (filePath: string) => {
  const resolvedPath = path.resolve(filePath)
  const uploadsDir = path.resolve(__dirname, '../../uploads')
  
  if (!resolvedPath.startsWith(uploadsDir)) {
    throw new Error('Path inválido')
  }
}
```

---

## ✅ CHECKLIST DE SEGURIDAD

### Autenticación y Autorización
- [x] Autenticación requerida para upload
- [ ] Verificar propiedad al descargar
- [ ] Verificar propiedad al eliminar
- [x] JWT tokens seguros

### Validación de Archivos
- [x] Validación de extensión
- [ ] Validación de magic numbers
- [x] Validación de tamaño
- [ ] Escaneo de virus
- [ ] Sanitización de PDFs

### Protección de Datos
- [ ] Archivos servidos solo a dueños
- [x] Nombres de archivo únicos
- [ ] Encriptación de archivos sensibles
- [x] HTTPS en producción

### Límites y Cuotas
- [x] Límite de tamaño por archivo (10MB)
- [ ] Límite de archivos por usuario
- [ ] Límite de almacenamiento total
- [ ] Rate limiting en uploads

### Monitoreo y Auditoría
- [ ] Logs de acceso a archivos
- [ ] Alertas de actividad sospechosa
- [ ] Limpieza de archivos huérfanos
- [ ] Backup de archivos

---

## 🎯 PRÓXIMOS PASOS

1. **AHORA:** Implementar endpoint protegido
2. **AHORA:** Implementar validación de magic numbers
3. **AHORA:** Implementar path traversal protection
4. **HOY:** Implementar límites de almacenamiento
5. **ESTA SEMANA:** Integrar escaneo de virus
6. **ESTE MES:** Implementar encriptación de archivos

---

**Analizado por:** Sistema de IA  
**Fecha:** 30 de Noviembre, 2025, 06:33 PM  
**Estado:** 🔴 REQUIERE ACCIÓN INMEDIATA
