import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Ads', icon: '📢', color: '#10b981' },
  { name: 'Desarrollo', icon: '💻', color: '#3b82f6' },
  { name: 'Mantenimiento', icon: '🔧', color: '#8b5cf6' },
  { name: 'Consultoría', icon: '💡', color: '#f59e0b' },
  { name: 'Proyectos', icon: '📁', color: '#ec4899' },
  { name: 'Otros', icon: '💰', color: '#6b7280' },
]

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Administración', icon: '📋', color: '#ef4444' },
  { name: 'Publicidad', icon: '📣', color: '#f97316' },
  { name: 'Impuestos', icon: '🏛️', color: '#dc2626' },
  { name: 'Servicios', icon: '⚙️', color: '#7c3aed' },
  { name: 'Freelancers', icon: '👥', color: '#2563eb' },
  { name: 'Software', icon: '💿', color: '#0891b2' },
  { name: 'Equipamiento', icon: '🖥️', color: '#059669' },
  { name: 'Caja chica', icon: '💵', color: '#65a30d' },
  { name: 'Otros', icon: '📦', color: '#6b7280' },
]

async function seedDefaultCategories(userId: string) {
  console.log('  📁 Seeding default categories...')
  
  // Income categories
  for (const cat of DEFAULT_INCOME_CATEGORIES) {
    await prisma.category.create({
      data: {
        userId,
        name: cat.name,
        type: 'INCOME',
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      },
    })
  }
  
  // Expense categories
  for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
    await prisma.category.create({
      data: {
        userId,
        name: cat.name,
        type: 'EXPENSE',
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      },
    })
  }
  
  console.log(`  ✅ Created ${DEFAULT_INCOME_CATEGORIES.length + DEFAULT_EXPENSE_CATEGORIES.length} default categories`)
}

async function main() {
  console.log('🌱 Starting database seed...\n')
  
  // Create demo user
  console.log('👤 Creating demo user...')
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@contadash.com' },
    update: {},
    create: {
      email: 'demo@contadash.com',
      passwordHash: await bcrypt.hash('demo123456', 12),
      name: 'Demo User',
      company: 'Demo Company',
      plan: 'PRO',
      emailVerified: new Date(),
    },
  })
  console.log(`  ✅ Demo user created: ${demoUser.email}`)
  console.log(`  🔑 Password: demo123456\n`)
  
  // Seed default categories
  await seedDefaultCategories(demoUser.id)
  
  // Seed some exchange rates (last 30 days)
  console.log('\n💱 Seeding exchange rates...')
  const today = new Date()
  let ratesCreated = 0
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const baseRate = 1000
    const variation = Math.random() * 100 - 50 // ±50
    const rate = baseRate + variation
    
    await prisma.exchangeRate.upsert({
      where: { date },
      update: {},
      create: {
        date,
        currencyFrom: 'USD',
        currencyTo: 'ARS',
        rate: rate,
        source: 'seed',
      },
    })
    ratesCreated++
  }
  console.log(`  ✅ Created ${ratesCreated} exchange rates\n`)
  
  console.log('🎉 Seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`  - Users: 1`)
  console.log(`  - Categories: ${DEFAULT_INCOME_CATEGORIES.length + DEFAULT_EXPENSE_CATEGORIES.length}`)
  console.log(`  - Exchange rates: ${ratesCreated}`)
  console.log('\n🚀 You can now start the server with: npm run dev')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
