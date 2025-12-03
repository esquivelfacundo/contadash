import puppeteer from 'puppeteer'

interface PDFGenerationOptions {
  title: string
  content: string
  footer?: string
}

export class PDFService {
  /**
   * Generar PDF desde HTML
   */
  async generatePDF(options: PDFGenerationOptions): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    })

    try {
      const page = await browser.newPage()

      const html = this.buildHTML(options)

      await page.setContent(html, {
        waitUntil: 'networkidle0',
      })

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      })

      return Buffer.from(pdf)
    } finally {
      await browser.close()
    }
  }

  /**
   * Construir HTML para el PDF
   */
  private buildHTML(options: PDFGenerationOptions): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            color: #333;
            line-height: 1.6;
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            margin-bottom: 30px;
          }
          
          .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
          }
          
          .header p {
            font-size: 14px;
            opacity: 0.9;
          }
          
          .content {
            padding: 0 20px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          th {
            background: #f5f5f5;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #ddd;
          }
          
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #eee;
          }
          
          tr:hover {
            background: #f9f9f9;
          }
          
          .summary {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
          }
          
          .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
          }
          
          .summary-item:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 18px;
            padding-top: 15px;
          }
          
          .income {
            color: #4caf50;
          }
          
          .expense {
            color: #f44336;
          }
          
          .balance {
            color: #2196f3;
          }
          
          .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          @media print {
            .page-break {
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ContaDash</h1>
          <p>${options.title}</p>
        </div>
        
        <div class="content">
          ${options.content}
        </div>
        
        ${
          options.footer
            ? `
        <div class="footer">
          ${options.footer}
        </div>
        `
            : ''
        }
      </body>
      </html>
    `
  }

  /**
   * Generar PDF de reporte mensual
   */
  async generateMonthlyReportPDF(data: any): Promise<Buffer> {
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ]

    const content = `
      <h2>Resumen del Mes</h2>
      <div class="summary">
        <div class="summary-item">
          <span>Total Ingresos:</span>
          <span class="income">$${data.summary.totalIncome.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
          })}</span>
        </div>
        <div class="summary-item">
          <span>Total Egresos:</span>
          <span class="expense">$${data.summary.totalExpense.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
          })}</span>
        </div>
        <div class="summary-item">
          <span>Balance:</span>
          <span class="balance">$${data.summary.balance.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
          })}</span>
        </div>
      </div>
      
      <h2>Transacciones (${data.transactions.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Descripción</th>
            <th>Categoría</th>
            <th>Cliente</th>
            <th class="text-right">Monto</th>
          </tr>
        </thead>
        <tbody>
          ${data.transactions
            .map(
              (t: any) => `
            <tr>
              <td>${new Date(t.date).toLocaleDateString('es-AR')}</td>
              <td>${t.description}</td>
              <td>${t.category.icon} ${t.category.name}</td>
              <td>${t.client?.company || '-'}</td>
              <td class="text-right ${t.type === 'INCOME' ? 'income' : 'expense'}">
                $${Number(t.amountArs).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      
      ${
        data.summary.byCategory.length > 0
          ? `
      <h2>Por Categoría</h2>
      <table>
        <thead>
          <tr>
            <th>Categoría</th>
            <th class="text-center">Cantidad</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.summary.byCategory
            .map(
              (c: any) => `
            <tr>
              <td>${c.categoryIcon} ${c.categoryName}</td>
              <td class="text-center">${c.count}</td>
              <td class="text-right">$${c.total.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
              })}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      `
          : ''
      }
    `

    return this.generatePDF({
      title: `Reporte Mensual - ${monthNames[data.month - 1]} ${data.year}`,
      content,
      footer: `Generado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}`,
    })
  }

  /**
   * Generar PDF de reporte anual
   */
  async generateAnnualReportPDF(data: any): Promise<Buffer> {
    const content = `
      <h2>Resumen Anual</h2>
      <div class="summary">
        <div class="summary-item">
          <span>Total Ingresos:</span>
          <span class="income">$${data.summary.totalIncome.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
          })}</span>
        </div>
        <div class="summary-item">
          <span>Total Egresos:</span>
          <span class="expense">$${data.summary.totalExpense.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
          })}</span>
        </div>
        <div class="summary-item">
          <span>Balance:</span>
          <span class="balance">$${data.summary.balance.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
          })}</span>
        </div>
      </div>
      
      <h2>Desglose Mensual</h2>
      <table>
        <thead>
          <tr>
            <th>Mes</th>
            <th class="text-right">Ingresos</th>
            <th class="text-right">Egresos</th>
            <th class="text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          ${data.months
            .map(
              (m: any) => `
            <tr>
              <td>${m.monthName}</td>
              <td class="text-right income">$${m.totalIncome.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
              })}</td>
              <td class="text-right expense">$${m.totalExpense.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
              })}</td>
              <td class="text-right balance">$${m.balance.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
              })}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `

    return this.generatePDF({
      title: `Reporte Anual - ${data.year}`,
      content,
      footer: `Generado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}`,
    })
  }

  /**
   * Generar PDF de reporte por cliente
   */
  async generateClientReportPDF(data: any): Promise<Buffer> {
    const content = `
      <h2>Cliente: ${data.client.company}</h2>
      ${data.client.responsible ? `<p>Responsable: ${data.client.responsible}</p>` : ''}
      
      <div class="summary">
        <div class="summary-item">
          <span>Total Ingresos:</span>
          <span class="income">$${data.summary.totalIncome.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
          })}</span>
        </div>
        <div class="summary-item">
          <span>Total Egresos:</span>
          <span class="expense">$${data.summary.totalExpense.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
          })}</span>
        </div>
        <div class="summary-item">
          <span>Balance:</span>
          <span class="balance">$${data.summary.balance.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
          })}</span>
        </div>
      </div>
      
      <h2>Transacciones (${data.transactions.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Descripción</th>
            <th>Categoría</th>
            <th class="text-right">Monto</th>
          </tr>
        </thead>
        <tbody>
          ${data.transactions
            .map(
              (t: any) => `
            <tr>
              <td>${new Date(t.date).toLocaleDateString('es-AR')}</td>
              <td>${t.description}</td>
              <td>${t.category.icon} ${t.category.name}</td>
              <td class="text-right ${t.type === 'INCOME' ? 'income' : 'expense'}">
                $${Number(t.amountArs).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `

    return this.generatePDF({
      title: `Reporte por Cliente - ${data.client.company}`,
      content,
      footer: `Generado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}`,
    })
  }

  /**
   * Generar PDF de reporte por categoría
   */
  async generateCategoryReportPDF(data: any): Promise<Buffer> {
    const content = `
      <h2>Categoría: ${data.category.icon} ${data.category.name}</h2>
      <p>Tipo: ${data.category.type === 'INCOME' ? 'Ingreso' : 'Egreso'}</p>
      
      <div class="summary">
        <div class="summary-item">
          <span>Total:</span>
          <span class="${data.category.type === 'INCOME' ? 'income' : 'expense'}">
            $${data.summary.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div class="summary-item">
          <span>Cantidad de Transacciones:</span>
          <span>${data.summary.count}</span>
        </div>
      </div>
      
      <h2>Transacciones (${data.transactions.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Descripción</th>
            <th>Cliente</th>
            <th class="text-right">Monto</th>
          </tr>
        </thead>
        <tbody>
          ${data.transactions
            .map(
              (t: any) => `
            <tr>
              <td>${new Date(t.date).toLocaleDateString('es-AR')}</td>
              <td>${t.description}</td>
              <td>${t.client?.company || '-'}</td>
              <td class="text-right">
                $${Number(t.amountArs).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `

    return this.generatePDF({
      title: `Reporte por Categoría - ${data.category.name}`,
      content,
      footer: `Generado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}`,
    })
  }
}

export const pdfService = new PDFService()
