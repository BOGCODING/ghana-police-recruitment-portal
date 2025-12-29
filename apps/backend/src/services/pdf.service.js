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
          // National Color Strip (Ultra Compact)
          const stripWidth = 595;
          doc.rect(0, 0, stripWidth, 6).fill('#006B3F');
          doc.rect(0, 6, stripWidth, 2).fill('#FCD116');
          doc.rect(0, 8, stripWidth, 1).fill('#CE1126');
          
          doc.moveDown(0.5);
          // Official Logo Placeholder/Text
          doc.fillColor('#006B3F').font('Helvetica-Bold').fontSize(14).text('GHANA POLICE SERVICE', { align: 'center', characterSpacing: 1 });
          doc.fillColor('#444444').font('Helvetica').fontSize(8).text('RECRUITMENT PORTAL - APPLICATION SUMMARY', { align: 'center', characterSpacing: 2 });
          
          doc.moveDown(0.2);
          doc.strokeColor('#EEEEEE').lineWidth(0.5).moveTo(25, doc.y).lineTo(570, doc.y).stroke();
          doc.moveDown(0.3);
        } catch (err) { logger.error('Error in PDF Header section:', err); }

        // --- Information Cards (Top Section) ---
        const topY = doc.y;
        const cardBg = '#F9F9F9';
        const accent = '#006B3F';
        
        // Background for the top info cluster
        doc.rect(25, topY, 320, 70).fill(cardBg);
        
        // App ID & Status
        doc.fillColor(accent).font('Helvetica-Bold').fontSize(8).text('APPLICATION IDENTIFICATION', 35, topY + 7);
        doc.fillColor('#333333').font('Helvetica-Bold').fontSize(10.5).text(application?.applicationId || 'DRAFT', 35, topY + 16);
        
        if (application?.category !== 'GENERAL_DUTY') {
          doc.fillColor('#666666').font('Helvetica').fontSize(7).text('APPLICATION CATEGORY', 35, topY + 32);
          doc.fillColor('#333333').font('Helvetica-Bold').fontSize(8).text((application?.category || 'N/A').replace(/_/g, ' '), 35, topY + 39);
        }

        doc.fillColor('#666666').font('Helvetica').fontSize(7).text('PRE-SCREENING STATUS', 190, topY + 32);
        const appStatus = application?.status || 'DRAFT';
        const isEligible = eligibilityReport ? eligibilityReport.eligible : (appStatus !== 'REJECTED' && appStatus !== 'DISQUALIFIED');
        const displayStatus = isEligible ? 'QUALIFIED' : 'DISQUALIFIED';
        doc.fillColor(isEligible ? '#006B3F' : '#CE1126').font('Helvetica-Bold').fontSize(9).text(displayStatus, 190, topY + 39);

        // Passport & QR Alignment
        if (passportPhoto) {
          try {
            let photoPath = passportPhoto.filePath || passportPhoto.path;
            logger.info('PDF Gen: Passport photo object found', { 
              hasFilePath: !!passportPhoto.filePath, 
              hasPath: !!passportPhoto.path,
              filePath: passportPhoto.filePath
            });
            
            if (photoPath && !path.isAbsolute(photoPath)) {
              photoPath = getAbsolutePath(photoPath);
            }
            
            logger.info('PDF Gen: Resolved photo path', { photoPath, exists: photoPath ? fs.existsSync(photoPath) : false });

            if (photoPath && fs.existsSync(photoPath)) {
              doc.image(photoPath, 375, topY, { width: 70, height: 70 });
              doc.rect(375, topY, 70, 70).lineWidth(1).strokeColor(accent).stroke();
            } else {
              logger.warn('PDF Gen: Passport photo file NOT FOUND at path:', photoPath);
            }
          } catch (err) { logger.error('Photo error:', err); }
        } else {
          logger.warn('PDF Gen: No passport photo document provided in data');
        }

        if (qrDataUrl && qrDataUrl.includes(',')) {
          try {
            const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
            doc.image(qrBuffer, 465, topY, { width: 70 });
            doc.rect(465, topY, 70, 70).lineWidth(0.5).strokeColor('#DDDDDD').stroke();
            doc.fontSize(6).fillColor('#999999').text('VERIFIED BY GPS', 465, topY + 73, { width: 70, align: 'center' });
          } catch (imgErr) { logger.error('QR error', imgErr); }
        }

        doc.y = topY + 85;

        // --- Sections Logic ---
        const drawSection = (title, fields, columns = 2) => {
          // Section Header with Color Block
          doc.rect(25, doc.y, 545, 12).fill(accent);
          doc.fillColor('white').font('Helvetica-Bold').fontSize(7.5).text(title, 35, doc.y + 2.5);
          doc.moveDown(0.4);
          
          if (columns === 2) {
            PDFService._drawTwoColumnGrid(doc, fields);
          } else {
            PDFService._drawGrid(doc, fields, 35, 90);
          }
          doc.moveDown(0.3);
        };

        // 1. Personal Information
        try {
          const fields = [
            ['FULL NAME', `${personalInfo.firstName || ''} ${personalInfo.middleName || ''} ${personalInfo.lastName || ''}`.trim().toUpperCase()],
            ['GENDER', personalInfo.gender],
            ['DATE OF BIRTH', personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'],
            ['NATIONALITY', personalInfo.nationality],
            ['MARITAL STATUS', personalInfo.maritalStatus],
            ['ID CARD NO.', personalInfo.ghanaCardNumber || 'N/A'],
            ['PHONE', contactInfo.phoneNumber || 'N/A'],
            ['EMAIL', contactInfo.email || 'N/A'],
            ['HOMETOWN', personalInfo.hometown || 'N/A'],
            ['EMERGENCY CONTACT', contactInfo.emergencyContactName?.toUpperCase() || 'N/A'],
            ['EMERGENCY TEL', contactInfo.emergencyContactPhone || 'N/A'],
            ['RELATION', contactInfo.emergencyContactRelation?.toUpperCase() || 'N/A']
          ];
          drawSection('PERSONAL & CONTACT IDENTIFICATION', fields);
        } catch (err) { logger.error('Personal fields error:', err); }

        // 2. Residential
        try {
          doc.font('Helvetica-Bold').fontSize(7).fillColor('#666666').text('RESIDENTIAL ADDRESS:', 35);
          doc.font('Helvetica').fontSize(7.5).fillColor('black').text(contactInfo.residentialAddress || 'N/A', 35, doc.y + 0.5);
          doc.moveDown(0.3);
        } catch (err) { logger.error('Residential error:', err); }

        // 3. Category Details
        try {
          const cat = application.category;
          const details = application.categoryDetails || {};
          let catFields = [];

          if (application.preferredRegion) {
            catFields.push(['PREFERRED REGION', application.preferredRegion]);
          }
          if (application.alternateRegion) {
            catFields.push(['ALTERNATE REGION', application.alternateRegion]);
          }

          if (cat === 'DRIVERS') {
            catFields.push(['LICENSE CLASS', details.driversLicenseClass]);
            catFields.push(['LICENSE NO.', details.driversLicenseNumber]);
          } else if (cat === 'TRADESMEN') {
            catFields.push(['TRADE', details.subCategory?.replace(/_/g, ' ')]);
            catFields.push(['QUALIFICATION', details.tradeQualification?.replace(/_/g, ' ')]);
            catFields.push(['EXPERIENCE', `${details.tradeExperienceYears} Years`]);
          } else if (cat === 'MEDICAL_PROFESSIONALS') {
            catFields.push(['SPECIALIZATION', details.subCategory?.replace(/_/g, ' ')]);
            catFields.push(['QUALIFICATION', details.medicalQualification?.replace(/_/g, ' ')]);
            catFields.push(['PIN/REG NO.', details.professionalRegistrationNumber]);
          } else if (cat === 'RELIGIOUS_AFFAIRS') {
            catFields.push(['DENOMINATION', details.religiousDenomination]);
            catFields.push(['QUALIFICATION', details.religiousQualification?.replace(/_/g, ' ')]);
          } else if (cat === 'SPORTSMEN') {
            catFields.push(['DISCIPLINE', details.sportsDiscipline?.replace(/_/g, ' ')]);
          }

          if (catFields.length > 0) {
            drawSection('CATEGORY & PROFESSIONAL DETAILS', catFields);
          }
        } catch (err) { logger.error('Category Details section error:', err); }

        // 4. Education
        try {
          const bece = education.bece;
          const wassceArr = Array.isArray(education.wassce) ? education.wassce : (education.wassce ? [education.wassce] : []);
          const tertiaryArr = Array.isArray(education.tertiary) ? education.tertiary : (education.tertiary ? [education.tertiary] : []);
          
          if (bece || wassceArr.length > 0 || tertiaryArr.length > 0) {
            // Header for Education
            doc.rect(25, doc.y, 545, 12).fill(accent);
            doc.fillColor('white').font('Helvetica-Bold').fontSize(7.5).text('EDUCATIONAL BACKGROUND', 35, doc.y + 2.5);
            doc.moveDown(0.4);

            if (bece) {
              doc.fillColor(accent).font('Helvetica-Bold').fontSize(7.5).text('BECE Results', 40);
              const bFields = [
                ['SCHOOL', bece.schoolName?.toUpperCase()], 
                ['YEAR', bece.completionYear],
                ['INDEX NO.', bece.indexNumber]
              ];
              PDFService._drawGrid(doc, bFields, 50, 80);
              doc.moveDown(0.2);
            }

            wassceArr.forEach((w, idx) => {
              doc.fillColor(accent).font('Helvetica-Bold').fontSize(7.5).text(w.isNovdec ? 'WASSCE (Nov/Dec)' : 'WASSCE/SSCE Certificate Details', 40);
              const wFields = [
                ['SCHOOL', w.schoolName?.toUpperCase()], 
                ['YEAR', w.completionYear],
                ['INDEX NO.', w.indexNumber],
                ['CERT NO.', w.certificateNumber]
              ];
              PDFService._drawGrid(doc, wFields, 50, 80);
              if (Array.isArray(w.results)) {
                // Ensure results are formatted clearly
                const res = w.results.map(r => `${r.subject}: ${r.grade}`).join('  |  ');
                // Increased font size for readability
                doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#222222').text(res, 50, doc.y, { width: 500 });
                doc.moveDown(0.15);
              }
              if (idx < wassceArr.length - 1) doc.moveDown(0.05);
            });

            tertiaryArr.forEach(t => {
              doc.moveDown(0.1);
              doc.fillColor(accent).font('Helvetica-Bold').fontSize(7.5).text('Tertiary Qualification', 40);
              const tFields = [
                ['INSTITUTION', t.institutionName?.toUpperCase()],
                ['QUALIFICATION', `${t.qualification} - ${t.courseOfStudy}`],
                ['CLASS/YEAR', `${t.classObtained} | ${t.completionYear}`],
                ['CERT/NSS NO.', `${t.certificateNumber} | ${t.nationalServiceNumber}`]
              ];
              PDFService._drawGrid(doc, tFields, 50, 80);
            });
          }
        } catch (err) { logger.error('Education section error:', err); }

        // 5. Eligibility Report (Reasons for Disqualification)
        try {
          if (eligibilityReport && eligibilityReport.checks) {
            doc.moveDown(0.2);
            doc.rect(25, doc.y, 545, 12).fill('#F8F9FA');
            doc.fillColor('#1F2937').font('Helvetica-Bold').fontSize(7.5).text('ELIGIBILITY PRE-SCREENING REPORT', 35, doc.y + 2.5);
            doc.moveDown(0.4);

            const failedChecks = eligibilityReport.checks.filter(c => c.status === 'failed');
            
            if (failedChecks.length > 0) {
              doc.fillColor('#CE1126').font('Helvetica-Bold').fontSize(7.5).text('Potential Reasons for Disqualification:', 40);
              doc.moveDown(0.1);
              failedChecks.forEach(check => {
                doc.fillColor('#CE1126').font('Helvetica').fontSize(6.5).text(`• ${check.name}: ${check.message}`, 50);
                doc.moveDown(0.05);
              });
            } else {
              doc.fillColor('#006B3F').font('Helvetica-Bold').fontSize(7.5).text('Applicant meets all baseline eligibility requirements.', 40);
            }
            doc.moveDown(0.2);
          }
        } catch (err) { logger.error('Eligibility Report section error:', err); }

        // --- Declaration area (Compact) ---
        try {
          doc.moveDown(0.4);
          doc.rect(25, doc.y, 545, 12).fill('#EEEEEE');
          doc.fillColor('#333333').font('Helvetica-Bold').fontSize(7.5).text('DECLARATION & SIGNATORY', 35, doc.y + 2.5);
          doc.moveDown(0.4);
          
          doc.fontSize(6.5).font('Helvetica').fillColor('#444444').text(
            'I certify that all information provided in this application is true and complete to the best of my knowledge. I understand that any false statements or omissions may result in my immediate disqualification from the Ghana Police Service recruitment process.',
            { align: 'justify', width: 525 }
          );
          
          doc.moveDown(1.5);
          const fY = doc.y;
          doc.strokeColor('#AAAAAA').lineWidth(0.5).moveTo(35, fY).lineTo(210, fY).stroke();
          doc.font('Helvetica-Bold').fontSize(7).fillColor('#333333').text('Applicant Signature', 35, fY + 4, { width: 175, align: 'center' });
          
          doc.strokeColor('#AAAAAA').lineWidth(0.5).moveTo(375, fY).lineTo(540, fY).stroke();
          doc.font('Helvetica-Bold').fontSize(7).fillColor('#333333').text('Date Signed', 375, fY + 4, { width: 165, align: 'center' });
          
          // Absolute bottom footer (Moved even lower to ensure it's the last element)
          doc.fontSize(6).fillColor('#BBBBBB').text('This document is a computer-generated summary of the electronic application submitted via the Ghana Police Service Portal.', 25, 825, { align: 'center', width: 545 });
        } catch (err) { logger.error('Declaration error:', err); }

        doc.end();
      } catch (error) {
        logger.error('PDF Generation FATAL error:', error);
        reject(error);
      }
    });
  },
  
  _drawSectionHeader(doc, title) {
    // Utility for generic headers if needed, but we use inline custom blocks now
    doc.fillColor('#006B3F').font('Helvetica-Bold').fontSize(10).text(title);
    doc.strokeColor('#006B3F').lineWidth(1).moveTo(40, doc.y + 1).lineTo(555, doc.y + 1).stroke();
    doc.moveDown(0.4);
  },

  _drawTwoColumnGrid(doc, fields) {
    const startX = 35;
    const col2X = 300;
    const labelW = 75;
    const rowH = 10;
    
    fields.forEach((f, i) => {
      const isEven = i % 2 === 0;
      const x = isEven ? startX : col2X;
      const y = doc.y;
      
      doc.font('Helvetica-Bold').fontSize(7).fillColor('#777777').text(`${f[0]}:`, x, y, { width: labelW });
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#222222').text(String(f[1] || 'N/A'), x + labelW, y, { width: 175 });
      
      if (!isEven || i === fields.length - 1) doc.y = y + rowH;
    });
  },

  _drawGrid(doc, fields, startX, labelW) {
    fields.forEach(f => {
      const y = doc.y;
      doc.font('Helvetica-Bold').fontSize(7).fillColor('#777777').text(`${f[0]}:`, startX, y, { width: labelW });
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#222222').text(String(f[1] || 'N/A'), startX + labelW, y, { width: 350 });
      doc.y = y + 9.5;
    });
  }
};

module.exports = PDFService;
