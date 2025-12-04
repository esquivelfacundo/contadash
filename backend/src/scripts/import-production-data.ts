import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function importData() {
  try {
    console.log('🔄 Importando datos a producción...')
    
    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, '../../data_backup.sql')
    const sql = fs.readFileSync(sqlFile, 'utf-8')
    
    // Ejecutar el SQL
    await prisma.$executeRawUnsafe(sql)
    
    console.log('✅ Datos importados exitosamente')
  } catch (error) {
    console.error('❌ Error importando datos:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

importData()
