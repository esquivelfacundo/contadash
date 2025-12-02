# 🧩 Componentes Reutilizables - ContaDash Mobile

## 🎯 Objetivo

Biblioteca completa de componentes reutilizables para la app móvil.

---

## 📝 Formularios

### **AmountInput**

```typescript
import React from 'react'
import { TextInput } from 'react-native-paper'
import { Controller } from 'react-hook-form'

export const AmountInput = ({ control, name, label, currency = 'ARS', error }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <TextInput
          label={label}
          value={value?.toString()}
          onChangeText={(text) => {
            const num = parseFloat(text.replace(/[^0-9.]/g, ''))
            onChange(isNaN(num) ? 0 : num)
          }}
          keyboardType="numeric"
          left={<TextInput.Affix text={currency === 'ARS' ? '$' : 'US$'} />}
          error={!!error}
        />
      )}
    />
  )
}
```

### **DatePicker**

```typescript
import React, { useState } from 'react'
import { Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { TextInput } from 'react-native-paper'

export const DatePicker = ({ value, onChange, label }) => {
  const [show, setShow] = useState(false)

  return (
    <>
      <TextInput
        label={label}
        value={value ? formatDate(value) : ''}
        onFocus={() => setShow(true)}
        right={<TextInput.Icon icon="calendar" onPress={() => setShow(true)} />}
        editable={false}
      />
      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShow(Platform.OS === 'ios')
            if (selectedDate) onChange(selectedDate)
          }}
        />
      )}
    </>
  )
}
```

### **CategoryPicker**

```typescript
import React from 'react'
import { View, FlatList } from 'react-native'
import { List, RadioButton } from 'react-native-paper'

export const CategoryPicker = ({ categories, value, onChange, type }) => {
  const filtered = categories.filter(c => c.type === type)

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <List.Item
          title={item.name}
          left={() => <Text style={{ fontSize: 24 }}>{item.icon}</Text>}
          right={() => (
            <RadioButton
              value={item.id}
              status={value === item.id ? 'checked' : 'unchecked'}
              onPress={() => onChange(item.id)}
            />
          )}
          onPress={() => onChange(item.id)}
        />
      )}
    />
  )
}
```

---

## 📊 Gráficos

### **LineChart**

```typescript
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native'

export const LineChart = ({ data, labels, color = '#10B981' }) => {
  return (
    <VictoryChart theme={VictoryTheme.material}>
      <VictoryAxis
        tickValues={labels}
        style={{
          axis: { stroke: '#334155' },
          tickLabels: { fill: '#94A3B8', fontSize: 10 }
        }}
      />
      <VictoryAxis
        dependentAxis
        style={{
          axis: { stroke: '#334155' },
          tickLabels: { fill: '#94A3B8', fontSize: 10 }
        }}
      />
      <VictoryLine
        data={data}
        style={{
          data: { stroke: color, strokeWidth: 2 }
        }}
      />
    </VictoryChart>
  )
}
```

---

## 🎴 Cards

### **ExchangeRateCard**

```typescript
export const ExchangeRateCard = ({ rate, isHistorical, date }) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="labelMedium">Cotización Dólar Blue</Text>
        <Text variant="headlineMedium" style={styles.rate}>
          ${rate.toFixed(2)}
        </Text>
        <Text variant="bodySmall">
          {isHistorical 
            ? `Cotización de cierre: ${formatDate(date)}`
            : `Última actualización: ${formatDate(new Date())}`
          }
        </Text>
      </Card.Content>
    </Card>
  )
}
```

---

**Última actualización**: 1 de Diciembre, 2025  
**Versión**: 1.0.0
