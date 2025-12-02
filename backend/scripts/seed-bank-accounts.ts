import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedBankAccounts() {
  try {
    // Get the first user (assuming there's at least one user)
    const user = await prisma.user.findFirst()
    
    if (!user) {
      console.log('No users found. Please create a user first.')
      return
    }

    console.log(`Creating bank accounts for user: ${user.email}`)

    // Create sample bank accounts
    const bankAccounts = [
      {
        userId: user.id,
        name: 'Cuenta Principal ARS',
        bank: 'banco-nacion',
        accountType: 'SAVINGS' as const,
        accountNumber: '1234567890123456',
        currency: 'ARS' as const,
        balance: 150000,
        isActive: true,
      },
      {
        userId: user.id,
        name: 'Cuenta USD',
        bank: 'bbva',
        accountType: 'SAVINGS' as const,
        accountNumber: '9876543210987654',
        currency: 'USD' as const,
        balance: 500,
        isActive: true,
      },
      {
        userId: user.id,
        name: 'Cuenta Corriente Galicia',
        bank: 'galicia',
        accountType: 'CHECKING' as const,
        accountNumber: '5555666677778888',
        currency: 'ARS' as const,
        balance: 75000,
        isActive: true,
      },
    ]

    for (const accountData of bankAccounts) {
      // Check if account already exists
      const existing = await prisma.bankAccount.findFirst({
        where: {
          userId: accountData.userId,
          accountNumber: accountData.accountNumber,
          bank: accountData.bank,
        },
      })

      if (!existing) {
        const account = await prisma.bankAccount.create({
          data: accountData,
        })
        console.log(`✅ Created bank account: ${account.name}`)
      } else {
        console.log(`⚠️  Bank account already exists: ${accountData.name}`)
      }
    }

    console.log('✅ Bank accounts seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding bank accounts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedBankAccounts()
