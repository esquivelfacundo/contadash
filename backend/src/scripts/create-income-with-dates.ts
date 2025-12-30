import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Create income recurring transactions with specific start dates
 */
async function createIncomeWithDates() {
  const userEmail = 'facundoesquivel01@gmail.com'
  
  console.log(`[Create Income] Creating INCOME recurring transactions for: ${userEmail}`)

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`[Create Income] User not found: ${userEmail}`)
      return
    }

    console.log(`[Create Income] Found user: ${user.id} - ${user.name}`)

    const clients = await prisma.client.findMany({ where: { userId: user.id } })
    const categories = await prisma.category.findMany({ where: { userId: user.id } })

    console.log(`[Create Income] Found ${clients.length} clients and ${categories.length} categories`)

    const findClient = (name: string) => {
      if (!name || name === '—') return null
      const normalized = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return clients.find(c => {
        const clientNorm = c.company.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        return clientNorm.includes(normalized) || normalized.includes(clientNorm)
      })?.id
    }

    const findCategory = (name: string) => {
      return categories.find(c => c.name.toLowerCase() === name.toLowerCase())?.id
    }

    // Helper to create date from day, month name, and year
    const createDate = (day: number, monthName: string, year: number) => {
      const months: { [key: string]: number } = {
        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
        'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
        'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
      }
      const month = months[monthName.toLowerCase()]
      return new Date(Date.UTC(year, month, day))
    }

    const transactions = [
      { name: 'Intercapital (TradingView API)', category: 'Servidores', client: 'Intercapital', usd: 1200, frequency: 'YEARLY', date: createDate(1, 'Enero', 2026) },
      { name: 'MORFI Market (cPanel)', category: 'Servidores', client: 'MORFI Market', usd: 192, frequency: 'YEARLY', date: createDate(1, 'Diciembre', 2026) },
      { name: 'MORFI Market (Linode 4GB)', category: 'Servidores', client: 'MORFI Market', usd: 240, frequency: 'YEARLY', date: createDate(1, 'Diciembre', 2026) },
      { name: 'DecoHouse (Linode 2GB)', category: 'Servidores', client: 'DecoHouse', usd: 240, frequency: 'YEARLY', date: createDate(1, 'Octubre', 2026) },
      { name: 'Noe (Linode 2GB)', category: 'Servidores', client: 'María Noel PH', usd: 120, frequency: 'YEARLY', date: createDate(1, 'Octubre', 2026) },
      { name: 'ST (Linode 4GB)', category: 'Servidores', client: 'Sanitarios Taragüi', usd: 240, frequency: 'YEARLY', date: createDate(1, 'Septiembre', 2026) },
      { name: 'CSM (Licencia QR)', category: 'Servidores', client: 'Club San Martín', usd: 100, frequency: 'YEARLY', date: createDate(1, 'Agosto', 2026) },
      { name: 'LOS (Linode 8GB)', category: 'Servidores', client: 'Laboratorio Óptico Salas', usd: 480, frequency: 'YEARLY', date: createDate(1, 'Agosto', 2026) },
      { name: 'FSE – Turnos (Bookly Custom Fields + Locations)', category: 'Servidores', client: 'Franco Salón Exclusivo', usd: 35, frequency: 'YEARLY', date: createDate(1, 'Julio', 2026) },
      { name: 'FSE Academia (Tutor LMS)', category: 'Servidores', client: 'Franco Salón Exclusivo', usd: 200, frequency: 'YEARLY', date: createDate(1, 'Julio', 2026) },
      { name: 'Intercapital (Linode 4GB + VPS)', category: 'Servidores', client: 'Intercapital', usd: 480, frequency: 'YEARLY', date: createDate(1, 'Julio', 2026) },
      { name: 'Palermo Market (cPanel)', category: 'Servidores', client: 'Palermo Gourmet Market', usd: 192, frequency: 'YEARLY', date: createDate(1, 'Junio', 2026) },
      { name: 'Palermo Market (Linode 4GB)', category: 'Servidores', client: 'Palermo Gourmet Market', usd: 240, frequency: 'YEARLY', date: createDate(1, 'Junio', 2026) },
      { name: 'iCenter (Linode 4GB)', category: 'Servidores', client: 'iCenter', usd: 240, frequency: 'YEARLY', date: createDate(1, 'Junio', 2026) },
      { name: 'Grupo GO (Linode 2GB)', category: 'Servidores', client: 'Grupo GO', usd: 120, frequency: 'YEARLY', date: createDate(1, 'Mayo', 2026) },
      { name: 'FSE – Turnos', category: 'Servidores', client: 'Franco Salón Exclusivo', usd: 480, frequency: 'YEARLY', date: createDate(1, 'Abril', 2026) },
      { name: 'Colegio Informático (Linode 4GB)', category: 'Servidores', client: 'Colegio Informático', usd: 240, frequency: 'YEARLY', date: createDate(1, 'Abril', 2026) },
      { name: 'Vickel Blends (Linode 2GB)', category: 'Servidores', client: 'Vickel Blends', usd: 120, frequency: 'YEARLY', date: createDate(1, 'Abril', 2026) },
      { name: 'Club San Martín (Linode 4GB)', category: 'Servidores', client: 'Club San Martín', usd: 432, frequency: 'YEARLY', date: createDate(1, 'Abril', 2026) },
      { name: 'Uribaterra (Linode 2GB)', category: 'Servidores', client: 'Uribaterra', usd: 120, frequency: 'YEARLY', date: createDate(1, 'Marzo', 2026) },
      { name: 'Tienda Amor (Linode 2GB)', category: 'Servidores', client: '—', usd: 120, frequency: 'YEARLY', date: createDate(1, 'Febrero', 2026) },
      { name: 'ESEICA NEA (cPanel)', category: 'Servidores', client: 'ESEICA NEA', usd: 192, frequency: 'YEARLY', date: createDate(1, 'Febrero', 2026) },
      { name: 'ESEICA NEA (Linode 4GB)', category: 'Servidores', client: 'ESEICA NEA', usd: 240, frequency: 'YEARLY', date: createDate(1, 'Febrero', 2026) },
      { name: 'GEBO Consultores (Linode 2GB)', category: 'Servidores', client: 'GEBO Consultores', usd: 120, frequency: 'YEARLY', date: createDate(1, 'Febrero', 2026) },
      { name: 'Paraná Lodge (Linode 2GB)', category: 'Servidores', client: 'Paraná Lodge', usd: 120, frequency: 'YEARLY', date: createDate(1, 'Febrero', 2026) },
      { name: 'Centro Ocular Irigoyen (Linode 2GB)', category: 'Servidores', client: 'Centro Ocular Irigoyen', usd: 244, frequency: 'YEARLY', date: createDate(1, 'Febrero', 2026) },
      { name: 'Somos Charly (Linode 2GB)', category: 'Servidores', client: 'Somos Charly', usd: 240, frequency: 'YEARLY', date: createDate(1, 'Enero', 2026) },
      { name: 'Mail Upgrade (Hostinger)', category: 'Servidores', client: 'Club San Martín', usd: 110, frequency: 'YEARLY', date: createDate(1, 'Enero', 2026) },
      { name: 'FSE Academia (Linode 4GB)', category: 'Servidores', client: 'Franco Salón Exclusivo', usd: 240, frequency: 'YEARLY', date: createDate(1, 'Enero', 2026) },
      
      // MONTHLY
      { name: 'Mantenimiento', category: 'Dev', client: 'iCenter', ars: 50.00, frequency: 'MONTHLY', date: createDate(1, 'Enero', 2026) },
      { name: 'Mantenimiento', category: 'Dev', client: 'Club San Martín', ars: 70311.83, frequency: 'MONTHLY', date: createDate(1, 'Enero', 2026) },
      { name: 'Ads', category: 'Marketing', client: 'Paraná Lodge', ars: 370.00, frequency: 'MONTHLY', date: createDate(1, 'Enero', 2026) },
      { name: 'Mantenimiento', category: 'Dev', client: 'Laboratorio Óptico Salas', usd: 80, frequency: 'MONTHLY', date: createDate(1, 'Enero', 2026) },
    ]

    let created = 0
    let skipped = 0

    for (const tx of transactions) {
      const categoryId = findCategory(tx.category)
      const clientId = findClient(tx.client)

      if (!categoryId) {
        console.warn(`[Create Income] ❌ Category not found: ${tx.category} - Skipping: ${tx.name}`)
        skipped++
        continue
      }

      if (!clientId && tx.client !== '—') {
        console.warn(`[Create Income] ❌ Client not found: ${tx.client} - Skipping: ${tx.name}`)
        skipped++
        continue
      }

      try {
        await prisma.recurringTransaction.create({
          data: {
            userId: user.id,
            description: tx.name,
            amountUsd: tx.usd || 0,
            amountArs: tx.ars || 0,
            type: 'INCOME',
            frequency: tx.frequency as 'MONTHLY' | 'YEARLY',
            categoryId,
            ...(clientId && { clientId }),
            startDate: tx.date,
            isActive: true,
            exchangeRate: 1525,
          },
        })

        const amount = tx.usd ? `$${tx.usd} USD` : `$${tx.ars} ARS`
        const dateStr = tx.date.toISOString().split('T')[0]
        console.log(`[Create Income] ✓ ${tx.name} - ${amount} (${tx.frequency}) - Start: ${dateStr}`)
        created++
      } catch (error) {
        console.error(`[Create Income] ❌ Error creating ${tx.name}:`, error)
        skipped++
      }
    }

    console.log(`\n[Create Income] ========================================`)
    console.log(`[Create Income] SUMMARY`)
    console.log(`[Create Income] ========================================`)
    console.log(`[Create Income] Transactions created: ${created}`)
    console.log(`[Create Income] Transactions skipped: ${skipped}`)
    console.log(`[Create Income] Creation completed!`)
  } catch (error) {
    console.error('[Create Income] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createIncomeWithDates()
  .then(() => {
    console.log('[Create Income] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Create Income] Failed:', error)
    process.exit(1)
  })
