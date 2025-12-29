const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const logger = require('../utils/logger');
const QRCodeService = require('./qrCode.service');
const { getAbsolutePath } = require('../middleware/upload.middleware');

/**
 * PDF Service - Handles generation of application summaries and reports
 */
const PDFService = {
  /**
   * Generate a PDF summary of an application
   * @param {Object} data - Full application data
   * @param {string} outputPath - Optional path to save the PDF
   * @returns {Promise<Buffer|string>} PDF buffer or path
   */
  async generateApplicationPDF(data, outputPath = null) {
    logger.info('Starting Premium PDF Generation with data keys:', Object.keys(data));
    
    const { 
      application = {}, 
      personalInfo = {}, 
      contactInfo = {}, 
      education = {}, 
      passportPhoto = null,
      eligibilityReport = null
    } = data;
    
    let qrDataUrl = null;
    try {
      const qrContent = `GPS-REC-${application?.applicationId || application?.id || 'DRAFT'}`;
      qrDataUrl = await QRCodeService.generateQRCodeDataURL(qrContent);
    } catch (qrError) {
      logger.error('Failed to generate QR for PDF', qrError);
    }

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          margin: 25, 
          size: 'A4',
          info: {
            Title: `GPS Application Summary - ${application?.applicationId || 'DRAFT'}`,
            Author: 'Ghana Police Service'
          }
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(outputPath ? outputPath : Buffer.concat(buffers)));
        doc.on('error', (err) => {
          logger.error('PDFDocument stream error:', err);
          reject(err);
        });

        if (outputPath) {
          const stream = fs.createWriteStream(outputPath);
          doc.pipe(stream);
        }

        // --- Premium Header Section ---
        try {
          // National Color Strip (Ultra-Compact)
          const stripWidth = 595;
          doc.rect(0, 0, stripWidth, 6).fill('#006B3F');
          doc.rect(0, 6, stripWidth, 3).fill('#FCD116');
          doc.rect(0, 9, stripWidth, 1).fill('#CE1126');
          
          doc.moveDown(0.8);
          
          // Official Logo Placeholder/Text
          doc.fillColor('#006B3F').font('Helvetica-Bold').fontSize(16).text('GHANA POLICE SERVICE', { align: 'center', characterSpacing: 1 });
          doc.fillColor('#444444').font('Helvetica').fontSize(9).text('RECRUITMENT PORTAL - APPLICATION SUMMARY', { align: 'center', characterSpacing: 2 });
          
          doc.moveDown(0.3);
          doc.strokeColor('#EEEEEE').lineWidth(0.5).moveTo(25, doc.y).lineTo(570, doc.y).stroke();
          doc.moveDown(0.5);
        } catch (err) { logger.error('Error in PDF Header section:', err); }

        // --- Information Cards (Top Section) ---
        const topY = doc.y;
        const cardBg = '#F9F9F9';
        const accent = '#006B3F';
        
        // Background for the top info cluster
        doc.rect(25, topY, 300, 75).fill(cardBg);
        
        // App ID & Status
        doc.fillColor(accent).font('Helvetica-Bold').fontSize(8).text('APPLICATION IDENTIFICATION', 35, topY + 8);
        doc.fillColor('#333333').font('Helvetica-Bold').fontSize(11).text(application?.applicationId || 'DRAFT', 35, topY + 18);
        
        const isGeneralDuty = application?.category === 'GENERAL_DUTY';
        if (!isGeneralDuty) {
          doc.fillColor('#666666').font('Helvetica').fontSize(7.5).text('APPLICATION CATEGORY', 35, topY + 36);
          doc.fillColor('#333333').font('Helvetica-Bold').fontSize(8.5).text((application?.category || 'N/A').replace(/_/g, ' '), 35, topY + 45);
        }

        doc.fillColor('#666666').font('Helvetica').fontSize(7.5).text('PRE-SCREENING STATUS', 180, topY + 36);
        const appStatus = application?.status || 'DRAFT';
        const isEligible = eligibilityReport ? eligibilityReport.eligible : (appStatus !== 'REJECTED' && appStatus !== 'DISQUALIFIED');
        const displayStatus = isEligible ? 'QUALIFIED' : 'DISQUALIFIED';
        doc.fillColor(isEligible ? '#006B3F' : '#CE1126').font('Helvetica-Bold').fontSize(9.5).text(displayStatus, 180, topY + 45);

        // Passport & QR Alignment (Compacted)
        if (passportPhoto) {
          try {
            let photoPath = passportPhoto.filePath || passportPhoto.path;
            if (photoPath && !path.isAbsolute(photoPath)) {
              photoPath = getAbsolutePath(photoPath);
            }
            if (photoPath && fs.existsSync(photoPath)) {
              doc.image(photoPath, 365, topY, { width: 75, height: 75 });
              doc.rect(365, topY, 75, 75).lineWidth(1.5).strokeColor(accent).stroke();
            }
          } catch (err) { logger.error('Photo error:', err); }
        }

        if (qrDataUrl && qrDataUrl.includes(',')) {
          try {
            const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
            doc.image(qrBuffer, 465, topY, { width: 75 });
            doc.rect(465, topY, 75, 75).lineWidth(0.5).strokeColor('#DDDDDD').stroke();
            doc.fontSize(6).fillColor('#999999').text('VERIFIED BY GPS', 465, topY + 78, { width: 75, align: 'center' });
          } catch (imgErr) { logger.error('QR error', imgErr); }
        }

        doc.y = topY + 85;

        // --- Sections Logic ---
        const drawSection = (title, fields, columns = 2) => {
          doc.rect(25, doc.y, 545, 14).fill(accent);
          doc.fillColor('white').font('Helvetica-Bold').fontSize(8.5).text(title, 35, doc.y + 3.5);
          doc.moveDown(0.4);
          
          if (columns === 2) {
            PDFService._drawTwoColumnGrid(doc, fields);
          } else {
            PDFService._drawGrid(doc, fields, 35, 90);
          }
          doc.moveDown(0.2);
        };

        // 1. Personal Information
        try {
          const fields = [
            ['FULL NAME', `${personalInfo.firstName || ''} ${personalInfo.middleName || ''} ${personalInfo.lastName || ''}`.trim().toUpperCase()],
            ['GENDER', personalInfo.gender],
            ['DATE OF BIRTH', personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'],
            ['NATIONALITY', personalInfo.nationality],
            ['ID CARD NO.', personalInfo.ghanaCardNumber || 'N/A'],
            ['PHONE', contactInfo.phoneNumber || 'N/A'],
            ['EMAIL', contactInfo.email || 'N/A'],
            ['HOMETOWN', personalInfo.hometown || 'N/A'],
            ['EMERGENCY CONTACT', contactInfo.emergencyContactName?.toUpperCase() || 'N/A'],
            ['EMERGENCY TEL', contactInfo.emergencyContactPhone || 'N/A']
          ];
          drawSection('PERSONAL & CONTACT IDENTIFICATION', fields);
          
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#666666').text('RESIDENTIAL ADDRESS:', 35);
          doc.font('Helvetica').fontSize(8.5).fillColor('black').text(contactInfo.residentialAddress || 'N/A', 35, doc.y + 1);
          doc.moveDown(0.4);
        } catch (err) { logger.error('Personal fields error:', err); }

        // 2. Category Details
        try {
          const cat = application.category;
          const details = application.categoryDetails || {};
          let catFields = [];

          if (application.preferredRegion) catFields.push(['REF. REGION', application.preferredRegion]);
          if (cat === 'DRIVERS') {
            catFields.push(['LICENSE CLASS', details.driversLicenseClass]);
            catFields.push(['LICENSE NO.', details.driversLicenseNumber]);
          } else if (cat === 'TRADESMEN') {
            catFields.push(['TRADE', details.subCategory?.replace(/_/g, ' ')]);
            catFields.push(['QUALIFICATION', details.tradeQualification?.replace(/_/g, ' ')]);
          } else if (cat === 'MEDICAL_PROFESSIONALS') {
            catFields.push(['SPECIALIZATION', details.subCategory?.replace(/_/g, ' ')]);
            catFields.push(['PIN/REG NO.', details.professionalRegistrationNumber]);
          } else if (cat === 'RELIGIOUS_AFFAIRS') {
            catFields.push(['DENOMINATION', details.religiousDenomination]);
          }

          if (catFields.length > 0) {
            drawSection('CATEGORY & PROFESSIONAL DETAILS', catFields);
          }
        } catch (err) { logger.error('Category Details section error:', err); }

        // 3. Education (Compacted)
        try {
          const bece = education.bece;
          const wassceArr = Array.isArray(education.wassce) ? education.wassce : (education.wassce ? [education.wassce] : []);
          const tertiaryArr = Array.isArray(education.tertiary) ? education.tertiary : (education.tertiary ? [education.tertiary] : []);
          
          if (bece || wassceArr.length > 0 || tertiaryArr.length > 0) {
            doc.rect(25, doc.y, 545, 14).fill(accent);
            doc.fillColor('white').font('Helvetica-Bold').fontSize(8.5).text('EDUCATIONAL BACKGROUND', 35, doc.y + 3.5);
            doc.moveDown(0.4);

            if (bece) {
              const bFields = [
                ['BECE SCHOOL', bece.schoolName?.toUpperCase()], 
                ['BECE INDEX', bece.indexNumber],
                ['COMPLETION', bece.completionYear],
                ['CERT NO.', bece.certificateNumber]
              ];
              PDFService._drawTwoColumnGrid(doc, bFields);
              doc.moveDown(0.2);
            }

            wassceArr.forEach((w) => {
              const wFields = [
                ['WASSCE SCHOOL', w.schoolName?.toUpperCase()], 
                ['WASSCE INDEX', w.indexNumber],
                ['COMPLETION', w.completionYear],
                ['CERT NO.', w.certificateNumber]
              ];
              PDFService._drawTwoColumnGrid(doc, wFields);
              if (Array.isArray(w.results)) {
                const res = w.results.map(r => `${r.subject.substring(0,10)}: ${r.grade}`).join(' | ');
                doc.font('Helvetica-Oblique').fontSize(7).fillColor('#666666').text(`Results: ${res}`, 45, doc.y, { width: 500 });
                doc.moveDown(0.3);
              }
            });

            tertiaryArr.forEach(t => {
              const tFields = [
                ['INSTITUTION', t.institutionName?.toUpperCase()],
                ['QUALIFICATION', t.qualification],
                ['CLASS', t.classObtained],
                ['COMPLETION', t.completionYear],
                ['CERT NO.', t.certificateNumber],
                ['NSS NO.', t.nationalServiceNumber]
              ];
              PDFService._drawTwoColumnGrid(doc, tFields);
              doc.moveDown(0.2);
            });
          }
        } catch (err) { logger.error('Education section error:', err); }

        // 4. Eligibility & Declaration (Combined for space)
        try {
          if (eligibilityReport && eligibilityReport.checks) {
            const failedChecks = eligibilityReport.checks.filter(c => c.status === 'failed');
            if (failedChecks.length > 0) {
              doc.rect(25, doc.y, 545, 14).fill('#FFF5F5');
              doc.fillColor('#C53030').font('Helvetica-Bold').fontSize(8).text('ELIGIBILITY WARNINGS', 35, doc.y + 3.5);
              doc.moveDown(0.3);
              failedChecks.forEach(check => {
                doc.fillColor('#C53030').font('Helvetica').fontSize(7.5).text(`• ${check.name}: ${check.message}`, 45);
              });
              doc.moveDown(0.3);
            }
          }

          doc.rect(25, doc.y, 545, 14).fill('#F3F4F6');
          doc.fillColor('#374151').font('Helvetica-Bold').fontSize(8.5).text('DECLARATION & SIGNATURE', 35, doc.y + 3.5);
          doc.moveDown(0.4);
          
          doc.fontSize(7.5).font('Helvetica').fillColor('#4B5563').text(
            'I certify that all information provided in this application is true and complete. I understand that any false statements or omissions may result in my immediate disqualification from the Ghana Police Service recruitment process.',
            { align: 'justify', width: 525 }
          );
          
          doc.moveDown(1.5);
          const fY = doc.y;
          doc.strokeColor('#D1D5DB').lineWidth(0.5).moveTo(35, fY).lineTo(200, fY).stroke();
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#374151').text('Applicant Signature', 35, fY + 4, { width: 165, align: 'center' });
          
          doc.strokeColor('#D1D5DB').lineWidth(0.5).moveTo(405, fY).lineTo(570, fY).stroke();
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#374151').text('Date Signed', 405, fY + 4, { width: 165, align: 'center' });
          
          // Absolute bottom footer
          doc.fontSize(6.5).fillColor('#9CA3AF').text('Computer-generated summary via Ghana Police Service Recruitment Portal.', 25, 815, { align: 'center', width: 545 });
        } catch (err) { logger.error('Declaration error:', err); }

        doc.end();
      } catch (error) {
        logger.error('PDF Generation FATAL error:', error);
        reject(error);
      }
    });
  },
  
  _drawTwoColumnGrid(doc, fields) {
    const startX = 35;
    const col2X = 300;
    const labelW = 85;
    const rowH = 11.5;
    
    fields.forEach((f, i) => {
      const isEven = i % 2 === 0;
      const x = isEven ? startX : col2X;
      const y = doc.y;
      
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#6B7280').text(`${f[0]}:`, x, y, { width: labelW });
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#111827').text(String(f[1] || 'N/A'), x + labelW, y, { width: 175 });
      
      if (!isEven || i === fields.length - 1) doc.y = y + rowH;
    });
  },

  _drawGrid(doc, fields, startX, labelW) {
    fields.forEach(f => {
      const y = doc.y;
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#6B7280').text(`${f[0]}:`, startX, y, { width: labelW });
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#111827').text(String(f[1] || 'N/A'), startX + labelW, y, { width: 350 });
      doc.y = y + 10.5;
    });
  }
};

module.exports = PDFService;
