import { prisma } from '../config/database'
import cron from 'node-cron'
import * as reportService from './report.service'
import { pdfService } from './pdf.service'
import { excelService } from './excel.service'
import { emailService } from './email.service'
import { NotFoundError } from '../utils/errors'

interface ScheduledReportInput {
  name: string
  type: 'MONTHLY' | 'ANNUAL' | 'CLIENT' | 'CATEGORY' | 'CUSTOM'
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  format: 'PDF' | 'EXCEL' | 'BOTH'
  recipients: string[]
  filters?: any
}

/**
 * Crear reporte programado
 */
export async function createScheduledReport(userId: string, data: ScheduledReportInput) {
  const nextRun = calculateNextRun(data.frequency)

  const scheduledReport = await prisma.scheduledReport.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      frequency: data.frequency,
      format: data.format,
      recipients: data.recipients,
      filters: data.filters || {},
      nextRun,
      isActive: true,
    },
  })

  return scheduledReport
}

/**
 * Obtener reportes programados del usuario
 */
export async function getScheduledReports(userId: string) {
  return prisma.scheduledReport.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Obtener reporte programado por ID
 */
export async function getScheduledReportById(userId: string, id: string) {
  const report = await prisma.scheduledReport.findFirst({
    where: { id, userId },
  })

  if (!report) {
    throw new NotFoundError('Scheduled report not found')
  }

  return report
}

/**
 * Actualizar reporte programado
 */
export async function updateScheduledReport(
  userId: string,
  id: string,
  data: Partial<ScheduledReportInput>
) {
  const report = await getScheduledReportById(userId, id)

  const updateData: any = {}

  if (data.name) updateData.name = data.name
  if (data.type) updateData.type = data.type
  if (data.format) updateData.format = data.format
  if (data.recipients) updateData.recipients = data.recipients
  if (data.filters) updateData.filters = data.filters

  if (data.frequency) {
    updateData.frequency = data.frequency
    updateData.nextRun = calculateNextRun(data.frequency)
  }

  return prisma.scheduledReport.update({
    where: { id: report.id },
    data: updateData,
  })
}

/**
 * Eliminar reporte programado
 */
export async function deleteScheduledReport(userId: string, id: string) {
  const report = await getScheduledReportById(userId, id)

  await prisma.scheduledReport.delete({
    where: { id: report.id },
  })

  return { message: 'Scheduled report deleted successfully' }
}

/**
 * Activar/desactivar reporte programado
 */
export async function toggleScheduledReport(userId: string, id: string, isActive: boolean) {
  const report = await getScheduledReportById(userId, id)

  return prisma.scheduledReport.update({
    where: { id: report.id },
    data: { isActive },
  })
}

/**
 * Ejecutar reporte programado manualmente
 */
export async function executeScheduledReport(userId: string, id: string) {
  const report = await getScheduledReportById(userId, id)

  await processScheduledReport(report)

  return { message: 'Report executed successfully' }
}

/**
 * Calcular próxima ejecución según frecuencia
 */
function calculateNextRun(frequency: string): Date {
  const now = new Date()

  switch (frequency) {
    case 'DAILY':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case 'WEEKLY':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    case 'MONTHLY':
      const nextMonth = new Date(now)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      return nextMonth
    case 'QUARTERLY':
      const nextQuarter = new Date(now)
      nextQuarter.setMonth(nextQuarter.getMonth() + 3)
      return nextQuarter
    case 'YEARLY':
      const nextYear = new Date(now)
      nextYear.setFullYear(nextYear.getFullYear() + 1)
      return nextYear
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
  }
}

/**
 * Procesar reporte programado
 */
async function processScheduledReport(report: any) {
  try {
    // Generar datos del reporte según el tipo
    let reportData: any

    switch (report.type) {
      case 'MONTHLY':
        const now = new Date()
        reportData = await reportService.generateMonthlyReport(
          report.userId,
          now.getMonth() + 1,
          now.getFullYear()
        )
        break

      case 'ANNUAL':
        reportData = await reportService.generateAnnualReport(
          report.userId,
          new Date().getFullYear()
        )
        break

      case 'CLIENT':
        if (!report.filters?.clientId) {
          throw new Error('Client ID required for client report')
        }
        reportData = await reportService.generateClientReport(
          report.userId,
          report.filters.clientId,
          report.filters.startDate,
          report.filters.endDate
        )
        break

      case 'CATEGORY':
        if (!report.filters?.categoryId) {
          throw new Error('Category ID required for category report')
        }
        reportData = await reportService.generateCategoryReport(
          report.userId,
          report.filters.categoryId,
          report.filters.startDate,
          report.filters.endDate
        )
        break

      case 'CUSTOM':
        reportData = await reportService.generateCustomReport(report.userId, report.filters || {})
        break

      default:
        throw new Error('Invalid report type')
    }

    // Generar archivos según formato
    const attachments: Array<{ filename: string; content: Buffer; contentType: string }> = []

    if (report.format === 'PDF' || report.format === 'BOTH') {
      let pdfBuffer: Buffer

      switch (report.type) {
        case 'MONTHLY':
          pdfBuffer = await pdfService.generateMonthlyReportPDF(reportData)
          break
        case 'ANNUAL':
          pdfBuffer = await pdfService.generateAnnualReportPDF(reportData)
          break
        case 'CLIENT':
          pdfBuffer = await pdfService.generateClientReportPDF(reportData)
          break
        case 'CATEGORY':
          pdfBuffer = await pdfService.generateCategoryReportPDF(reportData)
          break
        default:
          pdfBuffer = await pdfService.generateMonthlyReportPDF(reportData)
      }

      attachments.push({
        filename: `${report.name.replace(/\s+/g, '_')}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      })
    }

    if (report.format === 'EXCEL' || report.format === 'BOTH') {
      let excelBuffer: Buffer

      switch (report.type) {
        case 'MONTHLY':
          excelBuffer = await excelService.generateMonthlyReportExcel(reportData)
          break
        case 'ANNUAL':
          excelBuffer = await excelService.generateAnnualReportExcel(reportData)
          break
        case 'CLIENT':
          excelBuffer = await excelService.generateClientReportExcel(reportData)
          break
        case 'CATEGORY':
          excelBuffer = await excelService.generateCategoryReportExcel(reportData)
          break
        default:
          excelBuffer = await excelService.generateMonthlyReportExcel(reportData)
      }

      attachments.push({
        filename: `${report.name.replace(/\s+/g, '_')}.xlsx`,
        content: excelBuffer,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
    }

    // Enviar email a cada destinatario
    for (const recipient of report.recipients) {
      await emailService.sendReportEmail(recipient, report.name, attachments)
    }

    // Actualizar última ejecución y próxima ejecución
    await prisma.scheduledReport.update({
      where: { id: report.id },
      data: {
        lastRun: new Date(),
        nextRun: calculateNextRun(report.frequency),
      },
    })

    console.log(`✅ Scheduled report executed: ${report.name}`)
  } catch (error) {
    console.error(`❌ Error executing scheduled report ${report.name}:`, error)
    throw error
  }
}

/**
 * Iniciar cron job para reportes programados
 */
export function startScheduledReportsCron() {
  // Ejecutar cada hora
  cron.schedule('0 * * * *', async () => {
    console.log('🔄 Checking scheduled reports...')

    try {
      const now = new Date()

      // Buscar reportes que deben ejecutarse
      const reportsToExecute = await prisma.scheduledReport.findMany({
        where: {
          isActive: true,
          nextRun: {
            lte: now,
          },
        },
      })

      console.log(`📊 Found ${reportsToExecute.length} reports to execute`)

      // Ejecutar cada reporte
      for (const report of reportsToExecute) {
        await processScheduledReport(report)
      }
    } catch (error) {
      console.error('❌ Error in scheduled reports cron:', error)
    }
  })

  console.log('✅ Scheduled reports cron started')
}
