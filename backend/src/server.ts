import app from './app'
import { config } from './config/app'
import { prisma } from './config/database'
import { startScheduledReportsCron } from './services/scheduled-report.service'
import { startExchangeRateCron } from './services/exchange-rate-cron.service'

const PORT = config.port

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Start scheduled reports cron
    startScheduledReportsCron()
    
    // Start exchange rate cron (captures daily at 20:00)
    startExchangeRateCron()
    
    // Start server
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`)
      console.log(`📊 Environment: ${config.nodeEnv}`)
      console.log(`🔗 API: http://0.0.0.0:${PORT}/api`)
      console.log(`🌐 Network access: http://192.168.0.81:${PORT}/api`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Handle shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

startServer()
