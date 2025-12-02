import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createUser() {
  try {
    const email = 'facundoesquivel01@gmail.com'
    const password = 'Lidius@2001'
    const name = 'Facundo Esquivel'

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log('❌ El usuario ya existe')
      return
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        plan: 'FREE',
        emailVerified: new Date(),
      },
    })

    console.log('✅ Usuario creado exitosamente!')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('👤 ID:', user.id)
    console.log('📅 Creado:', user.createdAt)
    console.log('')
    console.log('🚀 Ahora puedes hacer login en: http://localhost:3001/login')
  } catch (error) {
    console.error('❌ Error creando usuario:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUser()
