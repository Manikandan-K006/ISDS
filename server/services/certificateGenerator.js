const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, ImageRun, Table, TableRow, TableCell, WidthType, Header, Footer } = require('docx');
const path = require('path');
const fs = require('fs');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://isds-kappa.vercel.app';

const generateCertificateId = (domain = 'GEN') => {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900000) + 100000;
  const domainShort = domain.slice(0, 4).toUpperCase();
  return `ISDS-${year}-${domainShort}-${rand}`;
};

const generateVerificationHash = () => {
  const { randomBytes } = require('crypto');
  return randomBytes(16).toString('hex');
};

const getGradeFromPercentage = (pct) => {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  return 'D';
};

const generatePDF = async (certData) => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  const gold = [212, 175, 55];
  const navy = [20, 30, 76];
  const dark = [30, 41, 59];
  const muted = [100, 116, 139];

  // Background
  doc.setFillColor(250, 250, 252);
  doc.rect(0, 0, pw, ph, 'F');

  // Outer border with gold accent
  doc.setDrawColor(gold[0], gold[1], gold[2]);
  doc.setLineWidth(1.5);
  doc.rect(6, 6, pw - 12, ph - 12);
  doc.setDrawColor(navy[0], navy[1], navy[2]);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, pw - 20, ph - 20);

  // Top gold bar
  doc.setFillColor(gold[0], gold[1], gold[2]);
  doc.rect(10, 10, pw - 20, 3, 'F');

  // Bottom gold bar
  doc.rect(10, ph - 13, pw - 20, 3, 'F');

  // Seal - left side
  doc.setDrawColor(navy[0], navy[1], navy[2]);
  doc.setLineWidth(0.8);
  const sealX = 38, sealY = 32;
  doc.circle(sealX, sealY, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('ISDS', sealX, sealY - 3, { align: 'center' });
  doc.setFontSize(6);
  doc.text('INTELLIGENT', sealX, sealY + 3, { align: 'center' });
  doc.text('SYSTEM', sealX, sealY + 7, { align: 'center' });

  // Header line with ORG name
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(muted[0], muted[1], muted[2]);
  doc.text('ISDS — Intelligent Student Development System', pw / 2, 30, { align: 'center' });

  // CERTIFICATE OF COMPLETION title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('CERTIFICATE OF COMPLETION', pw / 2, 52, { align: 'center' });

  // Gold divider
  doc.setDrawColor(gold[0], gold[1], gold[2]);
  doc.setLineWidth(0.5);
  doc.line(pw / 2 - 40, 57, pw / 2 + 40, 57);

  // "This is to certify that"
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(muted[0], muted[1], muted[2]);
  doc.text('This is to certify that', pw / 2, 72, { align: 'center' });

  // Student Name
  doc.setFont('times', 'italic');
  doc.setFontSize(32);
  doc.setTextColor(dark[0], dark[1], dark[2]);
  doc.text(cert.studentName || 'Student Name', pw / 2, 92, { align: 'center' });

  // Gold underline under name
  doc.setDrawColor(gold[0], gold[1], gold[2]);
  doc.setLineWidth(0.3);
  doc.line(pw / 2 - 55, 97, pw / 2 + 55, 97);

  // "has successfully completed"
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(muted[0], muted[1], muted[2]);
  doc.text('has successfully completed the course', pw / 2, 112, { align: 'center' });

  // Course Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text(cert.courseName || 'Course Name', pw / 2, 130, { align: 'center' });

  // Course duration line
  if (cert.duration) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(muted[0], muted[1], muted[2]);
    doc.text(`Duration: ${cert.duration}`, pw / 2, 142, { align: 'center' });
  }

  // Details row
  const detailsY = 160;
  const leftX = pw / 2 - 110;
  const rightX = pw / 2 + 30;
  const fontSize = 9;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(leftX, detailsY - 5, leftX + 220, detailsY - 5);

  const leftCols = [
    { label: 'GRADE', value: cert.grade || cert.percentage ? getGradeFromPercentage(cert.percentage) : 'A' },
    { label: 'COMPLETION DATE', value: cert.completionDate ? new Date(cert.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' },
    { label: 'CERTIFICATE ID', value: cert.certificateId || 'N/A' },
    { label: 'ISSUE DATE', value: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
  ];

  leftCols.forEach((item, i) => {
    const y = detailsY + i * 9;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text(item.label, leftX, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text(String(item.value), leftX, y + 4);
  });

  // Right side - scores
  const rightLabel = 'SCORE';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.text(rightLabel, rightX, detailsY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(dark[0], dark[1], dark[2]);
  const score = cert.percentage != null ? `${cert.percentage}%` : (cert.score || 'N/A');
  doc.text(String(score), rightX, detailsY + 4);

  // Signatures
  const sigY = ph - 32;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);

  // Instructor signature
  doc.line(leftX, sigY, leftX + 60, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('Manikandan', leftX, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(muted[0], muted[1], muted[2]);
  doc.text('Instructor', leftX, sigY + 9);

  // Director signature
  doc.line(pw / 2 - 30, sigY, pw / 2 + 30, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('Mani K', pw / 2, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(muted[0], muted[1], muted[2]);
  doc.text('Director', pw / 2, sigY + 9, { align: 'center' });

  // QR Code - right corner
  const qrSize = 22;
  const qrX = pw - 48;
  const qrY = ph - 52;
  try {
    const QRCode = require('qrcode');
    const qrDataUrl = await QRCode.toDataURL(`${FRONTEND_URL}/verify/${cert.certificateId}`, {
      width: 200, margin: 1, color: { dark: '#141e30', light: '#ffffff' }
    });
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    doc.setFontSize(5);
    doc.setTextColor(muted[0], muted[1], muted[2]);
    doc.text('Scan to Verify', qrX + qrSize / 2, qrY + qrSize + 4, { align: 'center' });
  } catch (e) {
    // QR generation failed, skip
  }

  // Verification URL text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(muted[0], muted[1], muted[2]);
  doc.text(`${FRONTEND_URL}/verify/${cert.certificateId}`, pw - 48, qrY + qrSize + 10);

  // Footer - bottom bar text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(muted[0], muted[1], muted[2]);
  doc.text('ISDS — Intelligent Student Development System  |  Certificate Verification: isds-kappa.vercel.app/verify', pw / 2, ph - 7, { align: 'center' });

  // Watermark
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(60);
  doc.setTextColor(245, 245, 250);
  doc.text('ISDS', pw / 2, ph / 2 + 20, { align: 'center', angle: -30 });

  return Buffer.from(doc.output('arraybuffer'));
};

const generateDOCX = async (certData) => {
  const verificationUrl = `${FRONTEND_URL}/verify/${cert.certificateId}`;
  const grade = cert.grade || (cert.percentage ? getGradeFromPercentage(cert.percentage) : 'A');
  const completionDate = cert.completionDate
    ? new Date(cert.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';
  const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const doc = new Document({
    title: `Certificate - ${cert.certificateId}`,
    description: `Certificate of Completion for ${cert.studentName}`,
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 24, color: '1E293B' },
          paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 120 } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11908, height: 8418, orientation: 'landscape' },
          margin: { top: 720, bottom: 720, left: 720, right: 720 },
        },
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 480 },
          children: [
            new TextRun({ text: 'ISDS', font: 'Helvetica', size: 52, bold: true, color: '141E30' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            new TextRun({ text: 'Intelligent Student Development System', font: 'Helvetica', size: 18, color: '64748B' }),
          ],
        }),
        new Paragraph({ spacing: { before: 480 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          border: {
            top: { style: BorderStyle.SINGLE, size: 6, color: 'D4AF37', space: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D4AF37', space: 1 },
          },
          children: [
            new TextRun({ text: 'CERTIFICATE OF COMPLETION', font: 'Helvetica', size: 44, bold: true, color: '141E30' }),
          ],
        }),
        new Paragraph({ spacing: { before: 360 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'This is to certify that', font: 'Helvetica', size: 24, color: '64748B' }),
          ],
        }),
        new Paragraph({ spacing: { before: 240 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: cert.studentName || 'Student Name', font: 'Times New Roman', size: 52, bold: true, italics: true, color: '0F172A' }),
          ],
        }),
        new Paragraph({ spacing: { before: 120 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'has successfully completed the course', font: 'Helvetica', size: 24, color: '64748B' }),
          ],
        }),
        new Paragraph({ spacing: { before: 240 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: cert.courseName || 'Course Name', font: 'Helvetica', size: 36, bold: true, color: '1E40AF' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120 },
          children: [
            new TextRun({ text: cert.duration ? `Duration: ${cert.duration}` : '', font: 'Helvetica', size: 20, color: '64748B' }),
          ],
        }),
        new Paragraph({ spacing: { before: 480 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          border: {
            top: { style: BorderStyle.SINGLE, size: 2, color: 'D4AF37', space: 1 },
          },
          children: [],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: `Grade: ${grade}    |    Completion: ${completionDate}    |    ID: ${cert.certificateId}`, font: 'Helvetica', size: 20, color: '334155' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120 },
          children: [
            new TextRun({ text: `Issue Date: ${issueDate}`, font: 'Helvetica', size: 20, color: '334155' }),
          ],
        }),
        new Paragraph({ spacing: { before: 480 } }),
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 480 },
          children: [
            new TextRun({ text: 'Manikandan', font: 'Helvetica', size: 22, bold: true, color: '141E30' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 240 },
          children: [
            new TextRun({ text: 'Instructor', font: 'Helvetica', size: 18, color: '64748B' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: 'Mani K', font: 'Helvetica', size: 22, bold: true, color: '141E30' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: 'Director', font: 'Helvetica', size: 18, color: '64748B' }),
          ],
        }),
        new Paragraph({ spacing: { before: 480 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: `Verify: ${verificationUrl}`, font: 'Helvetica', size: 16, color: '1E40AF' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 480 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D4AF37', space: 1 },
          },
          children: [
            new TextRun({ text: 'ISDS — Intelligent Student Development System', font: 'Helvetica', size: 18, color: '94A3B8' }),
          ],
        }),
      ],
    }],
  });

  return await Packer.toBuffer(doc);
};

const getCertificateDir = () => {
  const dir = path.join(__dirname, '..', 'uploads', 'certificates');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const saveCertificateFiles = async (certData) => {
  const dir = getCertificateDir();
  const baseName = certData.certificateId.replace(/[^a-zA-Z0-9-]/g, '_');

  const pdfPath = path.join(dir, `${baseName}.pdf`);
  const pdfBuffer = await generatePDF(certData);
  fs.writeFileSync(pdfPath, pdfBuffer);

  const docxPath = path.join(dir, `${baseName}.docx`);
  const docxBuffer = await generateDOCX(certData);
  fs.writeFileSync(docxPath, docxBuffer);

  const qrPath = path.join(dir, `${baseName}.png`);
  try {
    const QRCode = require('qrcode');
    await QRCode.toFile(qrPath, `${FRONTEND_URL}/verify/${certData.certificateId}`, {
      width: 400, margin: 2, color: { dark: '#141e30', light: '#ffffff' }
    });
  } catch (e) {
    // QR generation failed
  }

  return {
    pdfUrl: `/uploads/certificates/${baseName}.pdf`,
    docxUrl: `/uploads/certificates/${baseName}.docx`,
    qrUrl: `/uploads/certificates/${baseName}.png`,
  };
};

module.exports = {
  generateCertificateId,
  generateVerificationHash,
  getGradeFromPercentage,
  generatePDF,
  generateDOCX,
  saveCertificateFiles,
  getCertificateDir,
  FRONTEND_URL,
};
