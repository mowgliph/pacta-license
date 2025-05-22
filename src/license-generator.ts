import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { format, addYears, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { LicenseData } from './types';

export class LicenseGenerator {
  constructor(private outputDir: string) {
    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
  }

  private generateLicenseNumber(): string {
    return `PACTA-${Date.now().toString().slice(-6)}`;
  }

  private generateSignature(data: string): string {
    return Buffer.from(`${data}:${Date.now()}`).toString('base64').slice(0, 32);
  }

  async generate(company: string, contactName: string, email: string, type: 'trial' | 'full' = 'full') {
    const licenseNumber = this.generateLicenseNumber();
    const issueDate = new Date();
    const expiryDate = type === 'trial' 
      ? addDays(issueDate, 30) 
      : addYears(issueDate, 1);

    const licenseData: LicenseData = {
      id: uuidv4(),
      company,
      contactName,
      email,
      issueDate: issueDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      licenseType: type,
      licenseNumber,
      signature: this.generateSignature(`${company}:${licenseNumber}`)
    };

    const filename = `LICENCIA_${company.replace(/\s+/g, '_')}`;
    const licPath = join(this.outputDir, `${filename}.lic`);
    const pdfPath = join(this.outputDir, `${filename}.pdf`);

    // Guardar archivo .lic
    writeFileSync(licPath, JSON.stringify(licenseData, null, 2), 'utf-8');
    
    // Generar PDF
    await this.generatePdf(licenseData, pdfPath);
    
    // Generar archivo de texto
    await this.generateTextFile(licenseData, join(this.outputDir, `${filename}.txt`));

    return { licPath, pdfPath, licenseData };
  }

  private async generatePdf(license: LicenseData, outputPath: string) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Título
    page.drawText('LICENCIA DE USO DE SOFTWARE', {
      x: 50,
      y: height - 80,
      size: 18,
      font: boldFont,
      color: rgb(0, 0.2, 0.4),
    });
    
    page.drawText('PACTA – Plataforma de Administración de Contratos y Trazabilidad Automatizada', {
      x: 50,
      y: height - 110,
      size: 12,
      font: boldFont,
    });

    // Cuerpo del texto
    const text = `
Esta licencia autoriza el uso del software PACTA, una aplicación de escritorio diseñada para 
la gestión de contratos y suplementos, de acuerdo con los términos y condiciones establecidos 
a continuación. La presente licencia garantiza acceso a todas las funcionalidades descritas 
en el Documento de Requerimientos del Producto (PRD) de la versión 1.0 y permite el uso local 
del sistema con soporte para actualizaciones futuras según los acuerdos de mantenimiento establecidos.

---

Datos de la Licencia:
• Número de Licencia: ${license.licenseNumber}
• Tipo de Licencia: ${license.licenseType === 'full' ? 'Completa' : 'Prueba'}
• Empresa: ${license.company}
• Contacto: ${license.contactName}
• Email: ${license.email}
• Fecha de Emisión: ${format(new Date(license.issueDate), 'PPP', { locale: es })}
• Fecha de Vencimiento: ${format(new Date(license.expiryDate), 'PPP', { locale: es })}

Términos y Condiciones:
1. Esta licencia es intransferible y exclusiva para el titular registrado.
2. La versión de prueba tiene una validez de 30 días.
3. La versión completa tiene validez de un año a partir de la fecha de emisión.
4. Cualquier uso no autorizado puede resultar en la terminación de la licencia.

Firma Digital: ${license.signature}
    `;

    // Dibujar texto con formato
    const lines = text.split('\n');
    let y = height - 180;
    
    for (const line of lines) {
      if (line.startsWith('•')) {
        page.drawText('•', { x: 50, y, size: 10, font });
        page.drawText(line.substring(1).trim(), { x: 60, y, size: 10, font });
      } else if (line.includes(':')) {
        const [label, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        page.drawText(`${label}:`, { x: 50, y, size: 10, font: boldFont });
        const labelWidth = boldFont.widthOfTextAtSize(`${label}:`, 10);
        page.drawText(value, { x: 50 + labelWidth + 5, y, size: 10, font });
      } else if (line.trim() === '---') {
        page.drawLine({
          start: { x: 50, y: y - 5 },
          end: { x: width - 50, y: y - 5 },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        });
        y -= 15;
        continue;
      } else if (line.trim()) {
        page.drawText(line.trim(), { x: 50, y, size: 10, font });
      }
      y -= 15;
    }

    // Guardar PDF
    const pdfBytes = await pdfDoc.save();
    writeFileSync(outputPath, pdfBytes);
  }

  private async generateTextFile(license: LicenseData, outputPath: string) {
    const text = `
LICENCIA DE USO DE SOFTWARE
===========================

PACTA – Plataforma de Administración de Contratos y Trazabilidad Automatizada

Esta licencia autoriza el uso del software PACTA, una aplicación de escritorio diseñada para 
la gestión de contratos y suplementos.

Datos de la Licencia:
----------------------
• Número de Licencia: ${license.licenseNumber}
• Tipo de Licencia: ${license.licenseType === 'full' ? 'Completa' : 'Prueba (30 días)'}
• Empresa: ${license.company}
• Contacto: ${license.contactName}
• Email: ${license.email}
• Fecha de Emisión: ${format(new Date(license.issueDate), 'PPP', { locale: es })}
• Fecha de Vencimiento: ${format(new Date(license.expiryDate), 'PPP', { locale: es })}

Términos y Condiciones:
-----------------------
1. Esta licencia es intransferible y exclusiva para el titular registrado.
2. La versión de prueba tiene una validez de 30 días.
3. La versión completa tiene validez de un año.
4. Cualquier uso no autorizado puede resultar en la terminación de la licencia.

Firma Digital: ${license.signature}
    `;

    writeFileSync(outputPath, text.trim(), 'utf-8');
  }
}