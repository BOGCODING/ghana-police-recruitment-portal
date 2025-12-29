const { 
  AGE_REQUIREMENTS, 
  AGE_CUTOFF_DATE 
} = require('../config/constants');

const { calculateAge, meetsHeightRequirement } = require('../utils/helpers');

const { validateWassceForRecruitment } = require('../utils/educationValidator');

/**
 * Eligibility Service - Centralizes business logic for recruitment standards
 */
const EligibilityService = {
  /**
   * Comprehensive eligibility check
   * @param {Object} data - Full application bundle
   */
  check(data) {
    const { application, personalInfo, education } = data;

    const category = application.category;
    
    const report = {
      eligible: true,
      checks: [],
      recommendations: []
    };

    if (!application || !personalInfo) {
      return { eligible: false, message: 'Insufficient data for eligibility check' };
    }

    // 1. Age Check
    if (personalInfo.dateOfBirth) {
      const age = calculateAge(personalInfo.dateOfBirth, AGE_CUTOFF_DATE);
      const req = AGE_REQUIREMENTS[category] || AGE_REQUIREMENTS.GENERAL_DUTY;
      
      let min = req.min;
      let max = req.max;

      // Handle nested requirements (e.g. Graduates -> Degree/HND)
      if (!min && application.subCategory) {
        const subReq = req[application.subCategory] || req.DEFAULT || req;
        min = subReq.min;
        max = subReq.max;
      }

      const ageCheck = {
        name: 'Age Requirement',
        value: `${age} years`,
        status: (age >= min && age <= max) ? 'passed' : 'failed',
        message: (age >= min && age <= max) 
          ? `Meets the age requirement of ${min}-${max} years` 
          : `Does not meet age requirement (${min}-${max} years for ${category})`
      };
      report.checks.push(ageCheck);
      if (ageCheck.status === 'failed') report.eligible = false;
    }

    // 2. Height Check
    if (personalInfo.heightCm) {
      const isHeightEligible = meetsHeightRequirement(personalInfo.heightCm, personalInfo.gender, category);
      const heightCheck = {
        name: 'Height Requirement',
        value: `${personalInfo.heightCm} cm`,
        status: isHeightEligible ? 'passed' : 'failed',
        message: isHeightEligible 
          ? 'Meets the minimum height requirement' 
          : `Does not meet minimum height requirement for ${personalInfo.gender}`
      };
      report.checks.push(heightCheck);
      if (!isHeightEligible) report.eligible = false;
    }


    // 3. Educational Check (WASSCE)
    if (education && (education.wassce || education.wassceResults)) {
      const wassceResults = education.wassce || education.wassceResults;
      const primaryWassce = Array.isArray(wassceResults) ? wassceResults[0] : wassceResults;
      
      if (primaryWassce && primaryWassce.results) {
        const results = typeof primaryWassce.results === 'string' 
          ? JSON.parse(primaryWassce.results) 
          : primaryWassce.results;
          
        const wassceValidation = validateWassceForRecruitment(results, category);
        
        const wassceCheck = {
          name: 'Academic Requirement (WASSCE)',
          value: `Aggregate ${wassceValidation.aggregate}`,
          status: wassceValidation.eligible ? 'passed' : 'failed',
          message: wassceValidation.eligible 
            ? 'Meets academic requirements for this category' 
            : wassceValidation.errors.join('. ')
        };
        report.checks.push(wassceCheck);
        if (wassceCheck.status === 'failed') report.eligible = false;
        
        if (wassceValidation.recommendations) {
          report.recommendations.push(...wassceValidation.recommendations);
        }
      }
    }

    // 4. Nationality Check
    if (personalInfo.nationality) {
      const nationalityCheck = {
        name: 'Nationality',
        value: personalInfo.nationality,
        status: (personalInfo.nationality.toUpperCase() === 'GHANAIAN' || personalInfo.nationality.toUpperCase() === 'GHANA') ? 'passed' : 'failed',
        message: (personalInfo.nationality.toUpperCase() === 'GHANAIAN' || personalInfo.nationality.toUpperCase() === 'GHANA')
          ? 'Applicant is a Ghanaian citizen' 
          : 'Only Ghanaian citizens are typically eligible'
      };
      report.checks.push(nationalityCheck);
      if (nationalityCheck.status === 'failed') report.eligible = false;
    }

    // 5. Declarations Check
    if (application.declaration) {
      const decl = typeof application.declaration === 'string' 
        ? JSON.parse(application.declaration) 
        : application.declaration;
      
      const declCheck = {
        name: 'Mandatory Declarations',
        value: decl.acceptsDeclarations ? 'Confirmed' : 'Not Confirmed',
        status: decl.acceptsDeclarations ? 'passed' : 'failed',
        message: decl.acceptsDeclarations 
          ? 'All mandatory declarations confirmed' 
          : 'Missing confirmation for mandatory declarations'
      };
      report.checks.push(declCheck);
      if (declCheck.status === 'failed') report.eligible = false;
    }

    return report;
  }
};

module.exports = EligibilityService;
