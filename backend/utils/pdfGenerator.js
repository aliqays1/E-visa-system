const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateVisaPdf = async (application) => {
  return new Promise((resolve, reject) => {
    try {
      const pdfsDir = path.join(__dirname, '../uploads/pdfs');
      if (!fs.existsSync(pdfsDir)) {
        fs.mkdirSync(pdfsDir, { recursive: true });
      }

      const fileName = `visa-${application._id}.pdf`;
      const filePath = path.join(pdfsDir, fileName);
      
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Colors
      const primaryColor = '#0b3c5d';
      const secondaryColor = '#328cc1';
      const darkColor = '#1d2731';

      // Header Banner
      doc.rect(0, 0, 595, 15).fill(primaryColor);

      // Somalia National Header
      doc.moveDown(1.5);
      doc.fontSize(18).fillColor(primaryColor).text('FEDERAL REPUBLIC OF SOMALIA', { align: 'center', stroke: false });
      doc.fontSize(10).fillColor(secondaryColor).text('MINISTRY OF INTERNAL SECURITY', { align: 'center' });
      doc.fontSize(11).fillColor(darkColor).text('IMMIGRATION AND CITIZENSHIP SERVICE (ICS)', { align: 'center' });
      
      doc.moveDown(1.5);
      
      // Divider
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').lineWidth(1).stroke();
      doc.moveDown(1.5);

      // Document Title
      doc.fontSize(14).fillColor(primaryColor).text('OFFICIAL ELECTRONIC VISA (E-VISA) APPROVAL LETTER', { align: 'center', underline: true });
      doc.moveDown(1.5);

      // Content Layout
      const startY = doc.y;

      // Left Column: Applicant Details
      doc.fontSize(11).fillColor(secondaryColor).text('APPLICANT INFORMATION', 50, startY);
      doc.moveDown(0.5);
      
      const name = `${application.personalDetails?.firstName || ''} ${application.personalDetails?.lastName || ''}`.trim();
      doc.fontSize(10).fillColor(darkColor);
      doc.text(`Full Name: ${name}`);
      doc.moveDown(0.3);
      doc.text(`Passport No: ${application.personalDetails?.passportNumber || 'N/A'}`);
      doc.moveDown(0.3);
      doc.text(`Nationality: ${application.personalDetails?.nationality || 'N/A'}`);
      doc.moveDown(0.3);
      doc.text(`Email: ${application.personalDetails?.email || 'N/A'}`);

      // Right Column: Visa Validity details
      doc.fontSize(11).fillColor(secondaryColor).text('VISA DETAILS', 300, startY);
      doc.moveDown(0.5);
      
      doc.fontSize(10).fillColor(darkColor);
      doc.text(`Visa Reference: ${application._id}`, 300);
      doc.moveDown(0.3);
      doc.text(`Visa Type: ${application.visaType} Visa`, 300);
      const lastRenewalDays = (application.renewalHistory && application.renewalHistory.length > 0)
        ? application.renewalHistory[application.renewalHistory.length - 1].addedDays
        : null;
      const durationText = `${lastRenewalDays || application.stayDuration || application.visaDuration || 30} Days`;
      const durationDays = Number(application.visaDuration) || Number(application.stayDuration) || 30;
      const baseTime = application.approvalDate ? new Date(application.approvalDate).getTime() : (application.issueDate ? new Date(application.issueDate).getTime() : new Date(application.createdAt).getTime());
      const preEntryExpiry = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000);
      const issueDateStr = application.issueDate ? new Date(application.issueDate).toLocaleDateString() : new Date(application.approvalDate || application.createdAt).toLocaleDateString();
      const expiryDateStr = application.stayExpiryDate ? new Date(application.stayExpiryDate).toLocaleDateString() : preEntryExpiry.toLocaleDateString();

      doc.text(`Duration: ${durationText}`, 300);
      doc.moveDown(0.3);
      doc.text(`Issue Date: ${issueDateStr}`, 300);
      doc.moveDown(0.3);
      doc.text(`Expiry Date: ${expiryDateStr}`, 300);
      if (application.renewalCount && application.renewalCount > 0) {
        doc.moveDown(0.3);
        doc.text(`Status: Renewed (${application.renewalCount} Extension${application.renewalCount > 1 ? 's' : ''})`, 300);
      }

      doc.moveDown(3);

      // Warning/Rules Box
      const alertY = doc.y;
      doc.rect(50, alertY, 495, 80).fill('#f8fafc');
      doc.rect(50, alertY, 3, 80).fill(secondaryColor);
      
      doc.fontSize(9.5).fillColor(primaryColor).text('IMPORTANT NOTICE FOR TRAVELERS', 65, alertY + 10);
      doc.fontSize(8.5).fillColor(darkColor);
      doc.text('1. This e-Visa is valid for entry into Somalia within the specified dates.', 65, alertY + 28);
      doc.text('2. Please print and present a physical copy of this document upon arrival at Mogadishu Aden Adde International Airport.', 65, alertY + 40);
      doc.text('3. Possession of an e-Visa does not guarantee entry. Normal immigration rules apply.', 65, alertY + 52);

      doc.moveDown(4);

      // Footer signature and QR Code
      const footerY = doc.y;

      // QR Code
      if (application.qrCodeUrl) {
        const base64Data = application.qrCodeUrl.replace(/^data:image\/png;base64,/, "");
        doc.image(Buffer.from(base64Data, 'base64'), 425, footerY - 10, { width: 100, height: 100 });
      }

      // Official Stamp / Signature block
      doc.fontSize(10).fillColor(primaryColor).text('APPROVED BY:', 50, footerY);
      doc.fontSize(9).fillColor(darkColor);
      doc.moveDown(0.5);
      doc.text('Director General of Immigration');
      doc.text('Immigration & Citizenship Service (ICS)');
      doc.text('Federal Government of Somalia');

      // Footer Banner
      doc.rect(0, 827, 595, 15).fill(primaryColor);

      doc.end();

      stream.on('finish', () => {
        resolve(`uploads/pdfs/${fileName}`);
      });
      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateVisaPdf };
