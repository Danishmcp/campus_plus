import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export interface CertificateData {
  certificateCode: string;
  studentName: string;
  studentRollNumber?: string | null;
  department?: string | null;
  eventTitle: string;
  clubName: string;
  eventDate: Date;
  issueDate: Date;
  issuerName: string;
  verifyUrl: string;
}

export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  // Generate verification QR code image buffer
  const qrBuffer = await QRCode.toBuffer(data.verifyUrl, {
    width: 120,
    margin: 1,
    color: {
      dark: '#1e1b4b',
      light: '#ffffff',
    },
  });

  return new Promise((resolve, reject) => {
    // Landscape A4 certificate (841.89 x 595.28)
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 40,
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const width = 841.89;
    const height = 595.28;

    // Outer decorative border
    doc.lineWidth(4).strokeColor('#4338ca').rect(25, 25, width - 50, height - 50).stroke();
    doc.lineWidth(1).strokeColor('#a5b4fc').rect(32, 32, width - 64, height - 64).stroke();

    // Corner accents
    doc.lineWidth(2).strokeColor('#4f46e5');
    // Top-left
    doc.moveTo(25, 55).lineTo(55, 25).stroke();
    // Top-right
    doc.moveTo(width - 55, 25).lineTo(width - 25, 55).stroke();
    // Bottom-left
    doc.moveTo(25, height - 55).lineTo(55, height - 25).stroke();
    // Bottom-right
    doc.moveTo(width - 55, height - 25).lineTo(width - 25, height - 55).stroke();

    // Header
    doc
      .fontSize(14)
      .fillColor('#6366f1')
      .font('Helvetica-Bold')
      .text('CAMPUSPULSE INSTITUTION OF TECHNOLOGY', 0, 65, { align: 'center', characterSpacing: 2 });

    doc
      .fontSize(10)
      .fillColor('#64748b')
      .font('Helvetica')
      .text('OFFICE OF STUDENT AFFAIRS & CAMPUS LIFE', 0, 85, { align: 'center', characterSpacing: 1 });

    // Main Certificate Title
    doc
      .fontSize(32)
      .fillColor('#1e1b4b')
      .font('Helvetica-Bold')
      .text('CERTIFICATE OF PARTICIPATION', 0, 120, { align: 'center', characterSpacing: 1.5 });

    doc
      .fontSize(12)
      .fillColor('#64748b')
      .font('Helvetica')
      .text('This is proudly presented to', 0, 170, { align: 'center' });

    // Student Name
    doc
      .fontSize(26)
      .fillColor('#4338ca')
      .font('Helvetica-Bold')
      .text(data.studentName.toUpperCase(), 0, 195, { align: 'center' });

    // Roll number & Dept
    const subText = [
      data.studentRollNumber ? `Roll No: ${data.studentRollNumber}` : null,
      data.department ? `Department of ${data.department}` : null,
    ]
      .filter(Boolean)
      .join('  •  ');

    if (subText) {
      doc
        .fontSize(11)
        .fillColor('#475569')
        .font('Helvetica')
        .text(subText, 0, 230, { align: 'center' });
    }

    // Body paragraph
    doc
      .fontSize(12)
      .fillColor('#334155')
      .font('Helvetica')
      .text(
        `for actively participating in and successfully completing the event`,
        0,
        260,
        { align: 'center' }
      );

    // Event Title
    doc
      .fontSize(18)
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .text(`"${data.eventTitle}"`, 0, 285, { align: 'center' });

    // Club & Date
    doc
      .fontSize(11)
      .fillColor('#475569')
      .font('Helvetica')
      .text(
        `organized by ${data.clubName} on ${data.eventDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}.`,
        0,
        315,
        { align: 'center' }
      );

    // Footer section (Signatures + Verification QR)
    const footerY = 380;

    // Issuer signature line
    doc.lineWidth(1).strokeColor('#94a3b8').moveTo(120, footerY + 80).lineTo(300, footerY + 80).stroke();
    doc
      .fontSize(11)
      .fillColor('#1e293b')
      .font('Helvetica-Bold')
      .text(data.issuerName, 120, footerY + 88, { width: 180, align: 'center' });
    doc
      .fontSize(9)
      .fillColor('#64748b')
      .font('Helvetica')
      .text('Club Lead / Event Coordinator', 120, footerY + 102, { width: 180, align: 'center' });

    // Dean / Admin signature line
    doc.lineWidth(1).strokeColor('#94a3b8').moveTo(350, footerY + 80).lineTo(530, footerY + 80).stroke();
    doc
      .fontSize(11)
      .fillColor('#1e293b')
      .font('Helvetica-Bold')
      .text('Dr. Sarah Connor', 350, footerY + 88, { width: 180, align: 'center' });
    doc
      .fontSize(9)
      .fillColor('#64748b')
      .font('Helvetica')
      .text('Dean of Student Affairs', 350, footerY + 102, { width: 180, align: 'center' });

    // Verification QR code on the right
    doc.image(qrBuffer, width - 220, footerY + 10, { width: 95 });
    doc
      .fontSize(8)
      .fillColor('#475569')
      .font('Helvetica-Bold')
      .text(`CERT ID: ${data.certificateCode}`, width - 250, footerY + 112, { width: 155, align: 'center' });
    doc
      .fontSize(7)
      .fillColor('#94a3b8')
      .font('Helvetica')
      .text('Scan QR to verify authenticity', width - 250, footerY + 124, { width: 155, align: 'center' });

    doc.end();
  });
}
