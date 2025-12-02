import ExcelJS from 'exceljs'

export class ExcelService {
  /**
   * Generar Excel de reporte mensual
   */
  async generateMonthlyReportExcel(data: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Reporte Mensual')

    // Configurar columnas
    worksheet.columns = [
      { header: 'Fecha', key: 'date', width: 12 },
      { header: 'Descripción', key: 'description', width: 30 },
      { header: 'Categoría', key: 'category', width: 20 },
      { header: 'Cliente', key: 'client', width: 25 },
      { header: 'Tipo', key: 'type', width: 10 },
      { header: 'Monto ARS', key: 'amountArs', width: 15 },
      { header: 'Monto USD', key: 'amountUsd', width: 15 },
    ]

    // Estilo del header
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' },
    }
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

    // Agregar datos
    data.transactions.forEach((t: any) => {
      worksheet.addRow({
        date: new Date(t.date).toLocaleDateString('es-AR'),
        description: t.description,
        category: `${t.category.icon} ${t.category.name}`,
        client: t.client?.company || '-',
        type: t.type === 'INCOME' ? 'Ingreso' : 'Egreso',
        amountArs: Number(t.amountArs),
        amountUsd: Number(t.amountUsd),
      })
    })

    // Agregar resumen al final
    worksheet.addRow({})
    worksheet.addRow({})
    
    const summaryRow = worksheet.addRow({
      date: 'RESUMEN',
      description: '',
      category: '',
      client: '',
      type: '',
      amountArs: '',
      amountUsd: '',
    })
    summaryRow.font = { bold: true, size: 14 }

    worksheet.addRow({
      date: 'Total Ingresos:',
      description: '',
      category: '',
      client: '',
      type: '',
      amountArs: data.summary.totalIncome,
      amountUsd: '',
    })

    worksheet.addRow({
      date: 'Total Egresos:',
      description: '',
      category: '',
      client: '',
      type: '',
      amountArs: data.summary.totalExpense,
      amountUsd: '',
    })

    const balanceRow = worksheet.addRow({
      date: 'Balance:',
      description: '',
      category: '',
      client: '',
      type: '',
      amountArs: data.summary.balance,
      amountUsd: '',
    })
    balanceRow.font = { bold: true }

    // Formato de números
    worksheet.getColumn('amountArs').numFmt = '$#,##0.00'
    worksheet.getColumn('amountUsd').numFmt = '$#,##0.00'

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }

  /**
   * Generar Excel de reporte anual
   */
  async generateAnnualReportExcel(data: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Reporte Anual')

    // Configurar columnas
    worksheet.columns = [
      { header: 'Mes', key: 'month', width: 15 },
      { header: 'Ingresos', key: 'income', width: 15 },
      { header: 'Egresos', key: 'expense', width: 15 },
      { header: 'Balance', key: 'balance', width: 15 },
    ]

    // Estilo del header
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' },
    }
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

    // Agregar datos
    data.months.forEach((m: any) => {
      worksheet.addRow({
        month: m.monthName,
        income: m.totalIncome,
        expense: m.totalExpense,
        balance: m.balance,
      })
    })

    // Agregar totales
    worksheet.addRow({})
    const totalRow = worksheet.addRow({
      month: 'TOTAL',
      income: data.summary.totalIncome,
      expense: data.summary.totalExpense,
      balance: data.summary.balance,
    })
    totalRow.font = { bold: true, size: 14 }

    // Formato de números
    worksheet.getColumn('income').numFmt = '$#,##0.00'
    worksheet.getColumn('expense').numFmt = '$#,##0.00'
    worksheet.getColumn('balance').numFmt = '$#,##0.00'

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }

  /**
   * Generar Excel de reporte por cliente
   */
  async generateClientReportExcel(data: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(`Cliente - ${data.client.company}`)

    // Configurar columnas
    worksheet.columns = [
      { header: 'Fecha', key: 'date', width: 12 },
      { header: 'Descripción', key: 'description', width: 30 },
      { header: 'Categoría', key: 'category', width: 20 },
      { header: 'Tipo', key: 'type', width: 10 },
      { header: 'Monto ARS', key: 'amountArs', width: 15 },
    ]

    // Estilo del header
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' },
    }
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

    // Agregar datos
    data.transactions.forEach((t: any) => {
      worksheet.addRow({
        date: new Date(t.date).toLocaleDateString('es-AR'),
        description: t.description,
        category: `${t.category.icon} ${t.category.name}`,
        type: t.type === 'INCOME' ? 'Ingreso' : 'Egreso',
        amountArs: Number(t.amountArs),
      })
    })

    // Agregar resumen
    worksheet.addRow({})
    worksheet.addRow({})
    
    const summaryRow = worksheet.addRow({
      date: 'RESUMEN',
      description: '',
      category: '',
      type: '',
      amountArs: '',
    })
    summaryRow.font = { bold: true, size: 14 }

    worksheet.addRow({
      date: 'Total Ingresos:',
      description: '',
      category: '',
      type: '',
      amountArs: data.summary.totalIncome,
    })

    worksheet.addRow({
      date: 'Total Egresos:',
      description: '',
      category: '',
      type: '',
      amountArs: data.summary.totalExpense,
    })

    const balanceRow = worksheet.addRow({
      date: 'Balance:',
      description: '',
      category: '',
      type: '',
      amountArs: data.summary.balance,
    })
    balanceRow.font = { bold: true }

    // Formato de números
    worksheet.getColumn('amountArs').numFmt = '$#,##0.00'

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }

  /**
   * Generar Excel de reporte por categoría
   */
  async generateCategoryReportExcel(data: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(`Categoría - ${data.category.name}`)

    // Configurar columnas
    worksheet.columns = [
      { header: 'Fecha', key: 'date', width: 12 },
      { header: 'Descripción', key: 'description', width: 30 },
      { header: 'Cliente', key: 'client', width: 25 },
      { header: 'Monto ARS', key: 'amountArs', width: 15 },
    ]

    // Estilo del header
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' },
    }
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

    // Agregar datos
    data.transactions.forEach((t: any) => {
      worksheet.addRow({
        date: new Date(t.date).toLocaleDateString('es-AR'),
        description: t.description,
        client: t.client?.company || '-',
        amountArs: Number(t.amountArs),
      })
    })

    // Agregar resumen
    worksheet.addRow({})
    worksheet.addRow({})
    
    const summaryRow = worksheet.addRow({
      date: 'RESUMEN',
      description: '',
      client: '',
      amountArs: '',
    })
    summaryRow.font = { bold: true, size: 14 }

    const totalRow = worksheet.addRow({
      date: 'Total:',
      description: '',
      client: '',
      amountArs: data.summary.total,
    })
    totalRow.font = { bold: true }

    // Formato de números
    worksheet.getColumn('amountArs').numFmt = '$#,##0.00'

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }
}

export const excelService = new ExcelService()
