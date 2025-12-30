const BaseDTO = require('./Base.dto');

class ApplicationDTO extends BaseDTO {
  
  /**
   * Transform Personal Info Input (Sanitization)
   * Prevents Mass Assignment of read-only fields like 'id', 'applicationId'
   */
  static toPersonalInfoInput(data) {
    const allowedFields = [
      'firstName', 'lastName', 'middleName', 'previousName',
      'dateOfBirth', 'gender', 'placeOfBirth', 'nationality',
      'maritalStatus', 'numberOfChildren',
      'fatherName', 'motherName', 'guardianName',
      'hometown', 'district', 'region',
      'height', 'weight', 'complexion', 'eyeColor', 'hairColor',
      'distinctiveMarks', 'languagesSpoken',
      'ghanaCardNumber', 'tinNumber', 'ssnitNumber'
    ];
    
    // 1. Filter allowed fields
    const filtered = this.filter(data, allowedFields);
    
    // 2. Perform Transformations (e.g., Uppercase)
    const upperFields = ['firstName', 'lastName', 'middleName', 'hometown'];
    upperFields.forEach(field => {
      if (filtered[field] && typeof filtered[field] === 'string') {
        filtered[field] = filtered[field].toUpperCase();
      }
    });

    return filtered;
  }

  /**
   * Transform Contact Info Input
   */
  static toContactInfoInput(data) {
    const allowedFields = [
      'email', 'phoneNumber', 'alternatePhone',
      'residentialAddress', 'postalAddress', 'digitalAddress',
      'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation'
    ];

    const filtered = this.filter(data, allowedFields);

    // Transformations
    if (filtered.residentialAddress) filtered.residentialAddress = filtered.residentialAddress.toUpperCase();
    if (filtered.emergencyContactName) filtered.emergencyContactName = filtered.emergencyContactName.toUpperCase();

    return filtered;
  }

  /**
   * Format Application Summary Output
   * Removes internal IDs if necessary, formats dates
   */
  static toSummaryResponse(data) {
    const { application, personalInfo, contactInfo, education, passportPhoto, eligibilityReport } = data;

    return {
      application: this.exclude(application, ['id', 'applicantId']), // Hide internal DB IDs
      personalInfo: this.exclude(personalInfo, ['id', 'applicationId', 'createdAt', 'updatedAt']),
      contactInfo: this.exclude(contactInfo, ['id', 'applicationId', 'createdAt', 'updatedAt']),
      education: education, // Education logic is already complex, assume it's handled in model for now
      passportPhoto: passportPhoto ? {
        url: passportPhoto.url || passportPhoto.processedUrl,
        filename: passportPhoto.filename
      } : null,
      status: {
        currentStep: application.currentStep,
        status: application.status,
        submittedAt: application.submittedAt
      },
      eligibility: eligibilityReport ? {
        eligible: eligibilityReport.eligible,
        reasons: eligibilityReport.checks?.filter(c => c.status === 'failed').map(c => c.message)
      } : null
    };
  }
}

module.exports = ApplicationDTO;
