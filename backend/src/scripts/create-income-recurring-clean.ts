import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Create income recurring transactions for facundoesquivel01@gmail.com
 * Clean implementation with exact data from specification
 */
async function createIncomeRecurring() {
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

    // Get all clients and categories
    const clients = await prisma.client.findMany({ where: { userId: user.id } })
    const categories = await prisma.category.findMany({ where: { userId: user.id } })

    console.log(`[Create Income] Found ${clients.length} clients and ${categories.length} categories`)

    // Helper to find client (case insensitive, handles special chars)
    const findClient = (name: string) => {
      if (!name || name === '—') return null
      const normalized = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return clients.find(c => {
        const clientNorm = c.company.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        return clientNorm.includes(normalized) || normalized.includes(clientNorm)
      })?.id
    }

    // Helper to find category
    const findCategory = (name: string) => {
      return categories.find(c => c.name.toLowerCase() === name.toLowerCase())?.id
    }

    // Start date: January 1, 2026
    const startDate = new Date('2026-01-01T00:00:00.000Z')

    // All income transactions with exact data
    const transactions = [
      // YEARLY (30 transactions)
      { name: 'JFC Tecno (Linode 4GB)', category: 'Servidores', client: 'JFC Tecno', usd: 240, frequency: 'YEARLY' },
      { name: 'Intercapital (TradingView API)', category: 'Servidores', client: 'Intercapital', usd: 1200, frequency: 'YEARLY' },
      { name: 'MORFI Market (cPanel)', category: 'Servidores', client: 'MORFI Market', usd: 192, frequency: 'YEARLY' },
      { name: 'MORFI Market (Linode 4GB)', category: 'Servidores', client: 'MORFI Market', usd: 240, frequency: 'YEARLY' },
      { name: 'DecoHouse (Linode 2GB)', category: 'Servidores', client: 'DecoHouse', usd: 240, frequency: 'YEARLY' },
      { name: 'Noe (Linode 2GB)', category: 'Servidores', client: 'María Noel PH', usd: 120, frequency: 'YEARLY' },
      { name: 'ST (Linode 4GB)', category: 'Servidores', client: 'Sanitarios Taragüi', usd: 240, frequency: 'YEARLY' },
      { name: 'CSM (Licencia QR)', category: 'Servidores', client: 'Club San Martín', usd: 100, frequency: 'YEARLY' },
      { name: 'LOS (Linode 8GB)', category: 'Servidores', client: 'Laboratorio Óptico Salas', usd: 480, frequency: 'YEARLY' },
      { name: 'FSE – Turnos (Bookly Custom Fields + Locations)', category: 'Servidores', client: 'Franco Salón Exclusivo', usd: 35, frequency: 'YEARLY' },
      { name: 'FSE Academia (Tutor LMS)', category: 'Servidores', client: 'Franco Salón Exclusivo', usd: 200, frequency: 'YEARLY' },
      { name: 'Intercapital (Linode 4GB + VPS)', category: 'Servidores', client: 'Intercapital', usd: 480, frequency: 'YEARLY' },
      { name: 'Palermo Market (cPanel)', category: 'Servidores', client: 'Palermo Gourmet Market', usd: 192, frequency: 'YEARLY' },
      { name: 'Palermo Market (Linode 4GB)', category: 'Servidores', client: 'Palermo Gourmet Market', usd: 240, frequency: 'YEARLY' },
      { name: 'iCenter (Linode 4GB)', category: 'Servidores', client: 'iCenter', usd: 240, frequency: 'YEARLY' },
      { name: 'Grupo GO (Linode 2GB)', category: 'Servidores', client: 'Grupo GO', usd: 120, frequency: 'YEARLY' },
      { name: 'FSE – Turnos', category: 'Servidores', client: 'Franco Salón Exclusivo', usd: 480, frequency: 'YEARLY' },
      { name: 'Colegio Informático (Linode 4GB)', category: 'Servidores', client: 'Colegio Informático', usd: 240, frequency: 'YEARLY' },
      { name: 'Vickel Blends (Linode 2GB)', category: 'Servidores', client: 'Vickel Blends', usd: 120, frequency: 'YEARLY' },
      { name: 'Club San Martín (Linode 4GB)', category: 'Servidores', client: 'Club San Martín', usd: 432, frequency: 'YEARLY' },
      { name: 'Urbaterra (Linode 2GB)', category: 'Servidores', client: 'Urbaterra', usd: 120, frequency: 'YEARLY' },
      { name: 'Tienda Amor (Linode 2GB)', category: 'Servidores', client: '—', usd: 120, frequency: 'YEARLY' },
      { name: 'ESEICA NEA (cPanel)', category: 'Servidores', client: 'ESEICA NEA', usd: 192, frequency: 'YEARLY' },
      { name: 'ESEICA NEA (Linode 4GB)', category: 'Servidores', client: 'ESEICA NEA', usd: 240, frequency: 'YEARLY' },
      { name: 'GEBO Consultores (Linode 2GB)', category: 'Servidores', client: 'GEBO Consultores', usd: 120, frequency: 'YEARLY' },
      { name: 'Paraná Lodge (Linode 2GB)', category: 'Servidores', client: 'Paraná Lodge', usd: 120, frequency: 'YEARLY' },
      { name: 'Centro Ocular Irigoyen (Linode 2GB)', category: 'Servidores', client: 'Centro Ocular Irigoyen', usd: 244, frequency: 'YEARLY' },
      { name: 'Somos Charly (Linode 2GB)', category: 'Servidores', client: 'Somos Charly', usd: 240, frequency: 'YEARLY' },
      { name: 'Mail Upgrade (Hostinger)', category: 'Servidores', client: 'Club San Martín', usd: 110, frequency: 'YEARLY' },
      { name: 'FSE Academia (Linode 4GB)', category: 'Servidores', client: 'Franco Salón Exclusivo', usd: 240, frequency: 'YEARLY' },
      
      // MONTHLY (4 transactions)
      { name: 'Mantenimiento', category: 'Dev', client: 'iCenter', ars: 50.00, frequency: 'MONTHLY' },
      { name: 'Mantenimiento', category: 'Dev', client: 'Club San Martín', ars: 70311.83, frequency: 'MONTHLY' },
      { name: 'Ads', category: 'Marketing', client: 'Paraná Lodge', ars: 370.00, frequency: 'MONTHLY' },
      { name: 'Mantenimiento', category: 'Dev', client: 'Laboratorio Óptico Salas', usd: 80, frequency: 'MONTHLY' },
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
            startDate,
            isActive: true,
            exchangeRate: 1525,
          },
        })

        const amount = tx.usd ? `$${tx.usd} USD` : `$${tx.ars} ARS`
        console.log(`[Create Income] ✓ ${tx.name} - ${amount} (${tx.frequency})`)
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
    console.log(`[Create Income] Start date: January 1, 2026`)
    console.log(`[Create Income] Creation completed!`)
  } catch (error) {
    console.error('[Create Income] Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createIncomeRecurring()
  .then(() => {
    console.log('[Create Income] Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Create Income] Failed:', error)
    process.exit(1)
  })
