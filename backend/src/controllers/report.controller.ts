import { Request, Response, NextFunction } from 'express'
import * as reportService from '../services/report.service'
import * as scheduledReportService from '../services/scheduled-report.service'
import { pdfService } from '../services/pdf.service'
import { excelService } from '../services/excel.service'
import { emailService } from '../services/email.service'

/**
 * Generar reporte mensual
 */
export async function generateMonthlyReport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { month, year, format } = req.query

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' })
    }

    const data = await reportService.generateMonthlyReport(
      req.user.userId,
      parseInt(month as string),
      parseInt(year as string)
    )

    if (format === 'pdf') {
      const pdfBuffer = await pdfService.generateMonthlyReportPDF(data)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="reporte_mensual_${month}_${year}.pdf"`)
      return res.send(pdfBuffer)
    }

    if (format === 'excel') {
      const excelBuffer = await excelService.generateMonthlyReportExcel(data)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="reporte_mensual_${month}_${year}.xlsx"`)
      return res.send(excelBuffer)
    }

    res.json(data)
  } catch (error) {
    next(error)
  }
}

/**
 * Generar reporte anual
 */
export async function generateAnnualReport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { year, format } = req.query

    if (!year) {
      return res.status(400).json({ error: 'Year is required' })
    }

    const data = await reportService.generateAnnualReport(req.user.userId, parseInt(year as string))

    if (format === 'pdf') {
      const pdfBuffer = await pdfService.generateAnnualReportPDF(data)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="reporte_anual_${year}.pdf"`)
      return res.send(pdfBuffer)
    }

    if (format === 'excel') {
      const excelBuffer = await excelService.generateAnnualReportExcel(data)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="reporte_anual_${year}.xlsx"`)
      return res.send(excelBuffer)
    }

    res.json(data)
  } catch (error) {
    next(error)
  }
}

/**
 * Generar reporte por cliente
 */
export async function generateClientReport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { clientId, startDate, endDate, format } = req.query

    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' })
    }

    const data = await reportService.generateClientReport(
      req.user.userId,
      clientId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    )

    if (format === 'pdf') {
      const pdfBuffer = await pdfService.generateClientReportPDF(data)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="reporte_cliente_${data.client.company}.pdf"`)
      return res.send(pdfBuffer)
    }

    if (format === 'excel') {
      const excelBuffer = await excelService.generateClientReportExcel(data)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="reporte_cliente_${data.client.company}.xlsx"`)
      return res.send(excelBuffer)
    }

    res.json(data)
  } catch (error) {
    next(error)
  }
}

/**
 * Generar reporte por categoría
 */
export async function generateCategoryReport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { categoryId, startDate, endDate, format } = req.query

    if (!categoryId) {
      return res.status(400).json({ error: 'Category ID is required' })
    }

    const data = await reportService.generateCategoryReport(
      req.user.userId,
      categoryId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    )

    if (format === 'pdf') {
      const pdfBuffer = await pdfService.generateCategoryReportPDF(data)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="reporte_categoria_${data.category.name}.pdf"`)
      return res.send(pdfBuffer)
    }

    if (format === 'excel') {
      const excelBuffer = await excelService.generateCategoryReportExcel(data)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="reporte_categoria_${data.category.name}.xlsx"`)
      return res.send(excelBuffer)
    }

    res.json(data)
  } catch (error) {
    next(error)
  }
}

/**
 * Generar reporte personalizado
 */
export async function generateCustomReport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { startDate, endDate, type, categoryId, clientId, format } = req.query

    const filters: any = {}
    if (startDate) filters.startDate = new Date(startDate as string)
    if (endDate) filters.endDate = new Date(endDate as string)
    if (type) filters.type = type
    if (categoryId) filters.categoryId = categoryId
    if (clientId) filters.clientId = clientId

    const data = await reportService.generateCustomReport(req.user.userId, filters)

    if (format === 'pdf') {
      const pdfBuffer = await pdfService.generateMonthlyReportPDF(data)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_personalizado.pdf"')
      return res.send(pdfBuffer)
    }

    if (format === 'excel') {
      const excelBuffer = await excelService.generateMonthlyReportExcel(data)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_personalizado.xlsx"')
      return res.send(excelBuffer)
    }

    res.json(data)
  } catch (error) {
    next(error)
  }
}

/**
 * Enviar reporte por email
 */
export async function sendReportByEmail(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { reportType, recipients, ...params } = req.body

    if (!reportType || !recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'Report type and recipients are required' })
    }

    // Generar reporte según tipo
    let data: any
    let pdfBuffer: Buffer
    let excelBuffer: Buffer

    switch (reportType) {
      case 'monthly':
        data = await reportService.generateMonthlyReport(req.user.userId, params.month, params.year)
        pdfBuffer = await pdfService.generateMonthlyReportPDF(data)
        excelBuffer = await excelService.generateMonthlyReportExcel(data)
        break

      case 'annual':
        data = await reportService.generateAnnualReport(req.user.userId, params.year)
        pdfBuffer = await pdfService.generateAnnualReportPDF(data)
        excelBuffer = await excelService.generateAnnualReportExcel(data)
        break

      case 'client':
        data = await reportService.generateClientReport(
          req.user.userId,
          params.clientId,
          params.startDate ? new Date(params.startDate) : undefined,
          params.endDate ? new Date(params.endDate) : undefined
        )
        pdfBuffer = await pdfService.generateClientReportPDF(data)
        excelBuffer = await excelService.generateClientReportExcel(data)
        break

      case 'category':
        data = await reportService.generateCategoryReport(
          req.user.userId,
          params.categoryId,
          params.startDate ? new Date(params.startDate) : undefined,
          params.endDate ? new Date(params.endDate) : undefined
        )
        pdfBuffer = await pdfService.generateCategoryReportPDF(data)
        excelBuffer = await excelService.generateCategoryReportExcel(data)
        break

      default:
        return res.status(400).json({ error: 'Invalid report type' })
    }

    // Preparar attachments
    const attachments = [
      {
        filename: `reporte_${reportType}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
      {
        filename: `reporte_${reportType}.xlsx`,
        content: excelBuffer,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    ]

    // Enviar a cada destinatario
    for (const recipient of recipients) {
      await emailService.sendReportEmail(recipient, `Reporte ${reportType}`, attachments)
    }

    res.json({ message: 'Report sent successfully' })
  } catch (error) {
    next(error)
  }
}

// Scheduled Reports Controllers

export async function createScheduledReport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const report = await scheduledReportService.createScheduledReport(req.user.userId, req.body)
    res.status(201).json(report)
  } catch (error) {
    next(error)
  }
}

export async function getScheduledReports(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const reports = await scheduledReportService.getScheduledReports(req.user.userId)
    res.json(reports)
  } catch (error) {
    next(error)
  }
}

export async function getScheduledReportById(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const report = await scheduledReportService.getScheduledReportById(req.user.userId, req.params.id)
    res.json(report)
  } catch (error) {
    next(error)
  }
}

export async function updateScheduledReport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const report = await scheduledReportService.updateScheduledReport(
      req.user.userId,
      req.params.id,
      req.body
    )
    res.json(report)
  } catch (error) {
    next(error)
  }
}

export async function deleteScheduledReport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const result = await scheduledReportService.deleteScheduledReport(req.user.userId, req.params.id)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function toggleScheduledReport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { isActive } = req.body
    const report = await scheduledReportService.toggleScheduledReport(
      req.user.userId,
      req.params.id,
      isActive
    )
    res.json(report)
  } catch (error) {
    next(error)
  }
}

export async function executeScheduledReport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const result = await scheduledReportService.executeScheduledReport(req.user.userId, req.params.id)
    res.json(result)
  } catch (error) {
    next(error)
  }
}
