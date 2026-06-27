import { jsPDF } from 'jspdf';

export const downloadCertificate = async (cert) => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 12;
  const borderPadding = 14;
  const contentWidth = pageWidth - margin * 2 - borderPadding * 2;
  const contentHeight = pageHeight - margin * 2 - borderPadding * 2;

  // Outer border (double line)
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.8);
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);
  doc.rect(margin + 2, margin + 2, pageWidth - margin * 2 - 4, pageHeight - margin * 2 - 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 64, 175);

  // Corner decorations
  const corners = [
    [margin + 5, margin + 5],
    [pageWidth - margin - 5, margin + 5],
    [margin + 5, pageHeight - margin - 5],
    [pageWidth - margin - 5, pageHeight - margin - 5],
  ];
  corners.forEach(([x, y]) => {
    doc.text('✦', x, y, { align: 'center' });
  });

  // Seal icon (circle with person)
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.circle(pageWidth / 2, 40, 10);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('IS', pageWidth / 2, 43, { align: 'center' });

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(30, 64, 175);
  doc.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 65, { align: 'center' });

  // Divider line
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.3);
  doc.line(pageWidth / 2 - 30, 70, pageWidth / 2 + 30, 70);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text('This is to certify that', pageWidth / 2, 84, { align: 'center' });

  // Student name
  doc.setFont('times', 'italic');
  doc.setFontSize(30);
  doc.setTextColor(15, 23, 42);
  doc.text(cert.studentName, pageWidth / 2, 102, { align: 'center' });

  // Name underline
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(pageWidth / 2 - 50, 107, pageWidth / 2 + 50, 107);

  // Course info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text('has successfully completed the course', pageWidth / 2, 122, { align: 'center' });

  // Course name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175);
  doc.text(cert.courseName, pageWidth / 2, 140, { align: 'center' });

  // Details table
  const detailsY = 160;
  const col1X = pageWidth / 2 - 90;
  const col2X = pageWidth / 2;
  const col3X = pageWidth / 2 + 50;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);

  const issueDate = cert.issueDate || cert.createdAt;
  const formattedDate = issueDate ? new Date(issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  const rows = [
    ['Issue Date', 'Grade', 'Certificate ID'],
    [formattedDate, cert.grade || '-', cert.certificateId],
  ];

  rows[0].forEach((text, i) => {
    const x = col1X + i * 70;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 64, 175);
    doc.text(text, x + 35, detailsY, { align: 'center' });
    if (i < 2) {
      doc.line(x + 70, detailsY - 6, x + 70, detailsY + 14);
    }
  });

  rows[1].forEach((text, i) => {
    const x = col1X + i * 70;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(text, x + 35, detailsY + 14, { align: 'center' });
    if (i < 2) {
      doc.line(x + 70, detailsY + 8, x + 70, detailsY + 22);
    }
  });

  // Bottom section
  const bottomY = pageHeight - 35;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin + borderPadding + 10, bottomY - 5, pageWidth - margin - borderPadding - 10, bottomY - 5);

  // Signature
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.line(margin + borderPadding + 10, bottomY + 8, margin + borderPadding + 80, bottomY + 8);
  doc.text('Authorized Signature', margin + borderPadding + 10, bottomY + 15);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('ISDS — Intelligent Student Development System', pageWidth - margin - borderPadding - 10, bottomY + 15, { align: 'right' });

  const fileName = `${cert.certificateId || 'certificate'}.pdf`;
  doc.save(fileName);
};
