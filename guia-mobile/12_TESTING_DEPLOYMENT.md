# 🚀 Testing y Deployment - ContaDash Mobile

## 🎯 Objetivo

Guía completa para testing, builds y publicación en stores.

---

## 🧪 Testing

### **Unit Tests con Jest**

```bash
# Instalar dependencias
npm install --save-dev jest @testing-library/react-native

# Ejecutar tests
npm test
```

```typescript
// __tests__/utils/formatters.test.ts
import { formatCurrency } from '@utils/formatters'

describe('formatCurrency', () => {
  it('formats ARS correctly', () => {
    expect(formatCurrency(1000, 'ARS')).toBe('$1.000')
  })

  it('formats USD correctly', () => {
    expect(formatCurrency(1000, 'USD')).toBe('US$1,000.00')
  })
})
```

---

## 📦 Builds con EAS

### **Development Build**

```bash
# Build para desarrollo
eas build --profile development --platform all
```

### **Preview Build**

```bash
# Build para testing interno
eas build --profile preview --platform all
```

### **Production Build**

```bash
# Build para producción
eas build --profile production --platform all
```

---

## 🍎 iOS Deployment

### **TestFlight**

```bash
# Submit a TestFlight
eas submit --platform ios --latest
```

### **App Store**

1. Crear app en App Store Connect
2. Configurar metadata
3. Subir screenshots
4. Submit for review

---

## 🤖 Android Deployment

### **Internal Testing**

```bash
# Submit a Google Play (internal)
eas submit --platform android --latest
```

### **Production**

1. Crear app en Google Play Console
2. Configurar store listing
3. Subir screenshots
4. Submit for review

---

## 🔄 CI/CD

### **GitHub Actions**

```yaml
# .github/workflows/build.yml
name: Build
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: eas build --platform all --non-interactive
```

---

## ✅ Checklist Pre-Launch

- [ ] Tests pasando
- [ ] No console.logs en producción
- [ ] API URLs correctas
- [ ] Iconos y splash screen
- [ ] Screenshots para stores
- [ ] Privacy policy
- [ ] Terms of service
- [ ] App description
- [ ] Keywords optimizados
- [ ] Versión incrementada
- [ ] Changelog actualizado

---

**Última actualización**: 1 de Diciembre, 2025  
**Versión**: 1.0.0
