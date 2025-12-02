import { prisma } from '../src/config/database'
import { getDolarBlue, getDolarBlueForDate } from '../src/services/dolarapi.service'

async function populateExchangeRates() {
  try {
    console.log('🚀 Poblando cotizaciones históricas...\n')

    // Obtener cotización actual
    console.log('📊 Obteniendo cotización actual...')
    const currentRate = await getDolarBlue()
    console.log(`✅ Cotización actual: $${currentRate}`)

    // Guardar cotización actual
    await prisma.exchangeRate.upsert({
      where: {
        date: new Date(),
      },
      update: {
        rate: currentRate,
        source: 'dolarapi',
      },
      create: {
        date: new Date(),
        currencyFrom: 'USD',
        currencyTo: 'ARS',
        rate: currentRate,
        source: 'dolarapi',
      },
    })
    console.log('✅ Cotización actual guardada\n')

    // Poblar últimos 12 meses (último día de cada mes)
    console.log('📅 Poblando últimos 12 meses...')
    const today = new Date()
    const promises = []

    for (let i = 1; i <= 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i + 1, 0) // Último día del mes
      const dateStr = date.toISOString().split('T')[0]
      
      console.log(`  Obteniendo cotización para ${dateStr}...`)
      
      const promise = getDolarBlueForDate(dateStr)
        .then(async (rate) => {
          await prisma.exchangeRate.upsert({
            where: { date },
            update: {
              rate,
              source: 'dolarapi',
            },
            create: {
              date,
              currencyFrom: 'USD',
              currencyTo: 'ARS',
              rate,
              source: 'dolarapi',
            },
          })
          console.log(`  ✅ ${dateStr}: $${rate}`)
          return rate
        })
        .catch((error) => {
          console.log(`  ⚠️ ${dateStr}: Error, usando fallback`)
          return null
        })

      promises.push(promise)
      
      // Delay para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    await Promise.all(promises)

    console.log('\n📊 Resumen final:')
    const count = await prisma.exchangeRate.count()
    console.log(`✅ Total de cotizaciones en DB: ${count}`)

    const latest = await prisma.exchangeRate.findFirst({
      orderBy: { date: 'desc' },
    })
    console.log(`✅ Cotización más reciente: $${latest?.rate} (${latest?.date.toISOString().split('T')[0]})`)

    console.log('\n🎉 ¡Listo! Las cotizaciones han sido pobladas.')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

populateExchangeRates()
