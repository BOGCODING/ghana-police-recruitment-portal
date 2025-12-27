import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateApplicationPDF = (user, fullApplicationData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // -- Header --
  // Logo (Placeholder if not available, or draw simple shapes)
  doc.setFontSize(22);
  doc.setTextColor(0, 107, 63); // GP Green
  doc.text('GHANA POLICE SERVICE', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Recruitment Application Summary', pageWidth / 2, 30, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(20, 35, pageWidth - 20, 35);

  let finalY = 45;

  // -- Applicant Details --
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Applicant Information', 14, finalY);
  finalY += 6;

  const personalInfo = [
    ['Full Name', user?.fullName || 'N/A'],
    ['Serial Number', user?.serialNumber || 'N/A'],
    ['Email', user?.email || 'N/A'],
    ['Phone', user?.phoneNumber || 'N/A'],
    ['Application Status', user?.applicationStatus || 'N/A'],
    ['Application ID', user?.applicationId || 'N/A'],
  ];

  doc.autoTable({
    startY: finalY,
    head: [['Field', 'Value']],
    body: personalInfo,
    theme: 'striped',
    headStyles: { fillColor: [0, 107, 63] },
    columnStyles: { 0: { fontStyle: 'bold', width: 60 } },
  });

  finalY = doc.lastAutoTable.finalY + 15;

  // -- Personal Details from Form Data --
  if (fullApplicationData?.personalInfo) {
    doc.text('Personal Details', 14, finalY);
    finalY += 6;

    const pData = fullApplicationData.personalInfo;
    const pRows = [
      ['Date of Birth', pData.dateOfBirth ? new Date(pData.dateOfBirth).toLocaleDateString() : 'N/A'],
      ['Gender', pData.gender || 'N/A'],
      ['Nationality', pData.nationality || 'N/A'],
      ['Marital Status', pData.maritalStatus || 'N/A'],
    ];

    doc.autoTable({
      startY: finalY,
      body: pRows,
      theme: 'plain',
      columnStyles: { 0: { fontStyle: 'bold', width: 60 } },
    });
    finalY = doc.lastAutoTable.finalY + 10;
  }

  // -- Education --
  if (fullApplicationData?.education && fullApplicationData.education.length > 0) {
    doc.text('Education History', 14, finalY);
    finalY += 6;

    const eduRows = fullApplicationData.education.map(edu => [
      edu.institutionName,
      edu.certificateType,
      `${new Date(edu.startDate).getFullYear()} - ${new Date(edu.endDate).getFullYear()}`
    ]);

    doc.autoTable({
      startY: finalY,
      head: [['Institution', 'Certificate', 'Duration']],
      body: eduRows,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] },
    });
    finalY = doc.lastAutoTable.finalY + 15;
  }

  // -- Documents --
  if (fullApplicationData?.documents && fullApplicationData.documents.length > 0) {
     // Check if we need a new page
    if (finalY > 250) {
        doc.addPage();
        finalY = 20;
    }
    
    doc.text('Uploaded Documents', 14, finalY);
    finalY += 6;

    const docRows = fullApplicationData.documents.map(d => [
      d.documentType.replace(/_/g, ' '),
      'Uploaded'
    ]);

    doc.autoTable({
      startY: finalY,
      head: [['Document Type', 'Status']],
      body: docRows,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] },
    });
    finalY = doc.lastAutoTable.finalY + 15;
  }

  // -- Footer --
  const date = new Date().toLocaleDateString();
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on ${date}`, 14, 280);
  doc.text('Ghana Police Service Recruitment Portal', pageWidth - 14, 280, { align: 'right' });

  // Save
  doc.save(`GPS_Application_${user?.serialNumber || 'Summary'}.pdf`);
};
