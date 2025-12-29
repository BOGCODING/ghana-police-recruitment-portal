'use client';

import { useRouter } from 'next/navigation';
import { useApplication } from '@/contexts/ApplicationContext';
import styles from './ReviewSummary.module.css';
import WizardNavigation from '../WizardNavigation';
import { format } from 'date-fns';

export default function ReviewSummary() {
  const { formData, goToStep, loading, nextStep } = useApplication();
  const router = useRouter();

  if (loading) {
    return <div className={styles.loading}>Loading application data...</div>;
  }

  const handleContinue = async () => {
    try {
      await nextStep('review', {});
      // Ensure navigation happens even if context logic didn't trigger it
      router.push('/application/declaration');
    } catch (error) {
      console.error('Failed to proceed to declaration:', error);
      alert('Failed to save review step. Please try again. ' + (error.message || ''));
    }
  };

  const {
    personalInfo = {},
    contactInfo = {},
    education = {}
  } = formData;


  const renderSection = (title, stepId, data, fields) => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3>{title}</h3>
        <button 
          onClick={() => goToStep(stepId)} 
          className={styles.editBtn}
        >
          Edit
        </button>
      </div>
      <div className={styles.grid}>
        {fields.map(({ label, value, fullWidth }) => (
          <div key={label} className={`${styles.field} ${fullWidth ? styles.fullWidth : ''}`}>
            <span className={styles.label}>{label}</span>
            <span className={styles.value}>{value || <span className={styles.missing}>Not provided</span>}</span>
          </div>
        ))}
      </div>
      
    </div>
  );

  return (
    <div className={styles.summary}>
      {renderSection('Personal Information', 1, personalInfo, [
        { label: 'First Name', value: personalInfo.firstName },
        { label: 'Middle Name', value: personalInfo.middleName },
        { label: 'Surname', value: personalInfo.lastName },
        { label: 'Date of Birth', value: personalInfo.dateOfBirth ? format(new Date(personalInfo.dateOfBirth), 'PPP') : '' },
        { label: 'Gender', value: personalInfo.gender },
        { label: 'Marital Status', value: personalInfo.maritalStatus },
        { label: 'Nationality', value: personalInfo.nationality },
        { label: 'Place of Birth', value: personalInfo.hometown }, // Hometown as a proxy for place of birth
        { label: 'Hometown', value: personalInfo.hometown },
        { label: 'Region of Birth', value: personalInfo.region },
        { label: 'National ID Type', value: 'Ghana Card' },
        { label: 'National ID Number', value: personalInfo.ghanaCardNumber },
        { label: 'Height (cm)', value: personalInfo.heightCm },
        { label: 'Weight (kg)', value: personalInfo.weightKg }
      ])}


      {renderSection('Contact Information', 2, contactInfo, [
        { label: 'Mobile Number', value: contactInfo.phoneNumber },
        { label: 'Email Address', value: contactInfo.email },
        { label: 'Residential Address', value: contactInfo.residentialAddress, fullWidth: true },
        { label: 'Digital Address (GPS)', value: contactInfo.digitalAddress },
        { label: 'Postal Address', value: contactInfo.postalAddress },
        { label: 'Emergency Contact Name', value: contactInfo.emergencyContactName },
        { label: 'Emergency Contact Phone', value: contactInfo.emergencyContactPhone },
        { label: 'Emergency Contact Relation', value: contactInfo.emergencyContactRelation }
      ])}


      {renderSection(formData.category === 'GENERAL_DUTY' ? 'Application Details' : 'Position & Category', 3, formData, [
        ...(formData.category !== 'GENERAL_DUTY' ? [{ label: 'Category', value: formData.category }] : []),
        ...(formData.category !== 'GENERAL_DUTY' ? [
          { label: 'Sub Category', value: formData.subCategory },
          { label: 'Specialization', value: formData.specialization }
        ] : []),
        { label: 'Preferred Region', value: formData.preferredRegion },
        { label: 'Alternate Region', value: formData.alternateRegion },
        // Dynamic Category Details
        ...(formData.category === 'DRIVERS' ? [
           { label: 'License Class', value: formData.driversLicenseClass },
           { label: 'License Number', value: formData.driversLicenseNumber }
        ] : []),
         ...(formData.category === 'TRADESMEN' ? [
           { label: 'Trade Qualification', value: formData.tradeQualification },
           { label: 'Years of Experience', value: formData.tradeExperienceYears }
        ] : []),
         ...(formData.category === 'SPORTSMEN' ? [
           { label: 'Discipline', value: formData.sportsDiscipline },
           { label: 'Achievements', value: formData.sportsAchievements }
        ] : []),
         ...(formData.category === 'MEDICAL_PROFESSIONALS' ? [
           { label: 'Medical Qualification', value: formData.medicalQualification },
           { label: 'Registration Number', value: formData.professionalRegistrationNumber },
           { label: 'Registration Body', value: formData.professionalRegistrationBody }
        ] : []),
         ...(formData.category === 'RELIGIOUS_AFFAIRS' ? [
           { label: 'Denomination', value: formData.religiousDenomination },
           { label: 'Qualification', value: formData.religiousQualification }
        ] : [])
      ])}


      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Education Records</h3>
          <button onClick={() => goToStep(4)} className={styles.editBtn}>Edit</button>
        </div>

        
        {/* BECE */}
        <div className={styles.subSection}>
          <h4>BECE Result</h4>
          <div className={styles.grid}>
             <div className={styles.field}><span className={styles.label}>School</span><span className={styles.value}>{education.bece?.schoolName || education.beceSchool}</span></div>
             <div className={styles.field}><span className={styles.label}>Year</span><span className={styles.value}>{education.bece?.completionYear || education.beceYear}</span></div>
             <div className={styles.field}><span className={styles.label}>Index No</span><span className={styles.value}>{education.bece?.indexNumber || education.beceIndexNumber}</span></div>
             <div className={styles.field}><span className={styles.label}>Cert No</span><span className={styles.value}>{education.bece?.certificateNumber || education.beceCertificateNumber}</span></div>
          </div>
        </div>

        {/* WASSCE */}
        {(education.wassce || education.wassceSchool) && (
          <div className={styles.subSection}>
            <h4>WASSCE Results</h4>
            {Array.isArray(education.wassce) ? education.wassce.map((w, idx) => (
              <div key={idx} className={styles.wassceEntry}>
                <div className={styles.grid}>
                  <div className={styles.field}><span className={styles.label}>School</span><span className={styles.value}>{w.schoolName}</span></div>
                  <div className={styles.field}><span className={styles.label}>Year</span><span className={styles.value}>{w.completionYear}</span></div>
                  <div className={styles.field}><span className={styles.label}>Index No</span><span className={styles.value}>{w.indexNumber}</span></div>
                  <div className={styles.field}><span className={styles.label}>Cert No</span><span className={styles.value}>{w.certificateNumber}</span></div>
                  <div className={styles.field}><span className={styles.label}>Type</span><span className={styles.value}>{w.isNovdec ? 'NOVDEC' : 'REGULAR'}</span></div>
                </div>
                <div className={styles.resultsGrid}>
                   {w.results?.map((r, rIdx) => (
                     <div key={rIdx} className={styles.resultItem}>
                       <span className={styles.subject}>{r.subject}</span>
                       <span className={styles.grade}>{r.grade}</span>
                     </div>
                   ))}
                </div>
              </div>
            )) : (
              <div className={styles.wassceEntry}>
                <div className={styles.grid}>
                  <div className={styles.field}><span className={styles.label}>School</span><span className={styles.value}>{education.wassceSchool}</span></div>
                  <div className={styles.field}><span className={styles.label}>Year</span><span className={styles.value}>{education.wassceYear}</span></div>
                  <div className={styles.field}><span className={styles.label}>Index No</span><span className={styles.value}>{education.wassceIndexNumber}</span></div>
                  <div className={styles.field}><span className={styles.label}>Cert No</span><span className={styles.value}>{education.wassceCertificateNumber}</span></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tertiary */}
        {(education.tertiary || education.tertiaryInstitution) && (
          <div className={styles.subSection}>
            <h4>Tertiary Education</h4>
            {Array.isArray(education.tertiary) ? education.tertiary.map((t, idx) => (
              <div key={idx} className={styles.tertiaryEntry}>
                <div className={styles.grid}>
                  <div className={styles.field}><span className={styles.label}>Institution</span><span className={styles.value}>{t.institutionName}</span></div>
                  <div className={styles.field}><span className={styles.label}>Qualification</span><span className={styles.value}>{t.qualification}</span></div>
                  <div className={styles.field}><span className={styles.label}>Course</span><span className={styles.value}>{t.courseOfStudy}</span></div>
                  <div className={styles.field}><span className={styles.label}>Class</span><span className={styles.value}>{t.classObtained}</span></div>
                  <div className={styles.field}><span className={styles.label}>Year</span><span className={styles.value}>{t.completionYear}</span></div>
                  <div className={styles.field}><span className={styles.label}>Cert No</span><span className={styles.value}>{t.certificateNumber}</span></div>
                  <div className={styles.field}><span className={styles.label}>NSS Year</span><span className={styles.value}>{t.nationalServiceYear}</span></div>
                  <div className={styles.field}><span className={styles.label}>NSS No</span><span className={styles.value}>{t.nationalServiceNumber}</span></div>
                </div>
              </div>
            )) : (
              <div className={styles.tertiaryEntry}>
                <div className={styles.grid}>
                  <div className={styles.field}><span className={styles.label}>Institution</span><span className={styles.value}>{education.tertiaryInstitution}</span></div>
                  <div className={styles.field}><span className={styles.label}>Qualification</span><span className={styles.value}>{education.tertiaryQualification}</span></div>
                  <div className={styles.field}><span className={styles.label}>Course</span><span className={styles.value}>{education.tertiaryCourse}</span></div>
                  <div className={styles.field}><span className={styles.label}>Class</span><span className={styles.value}>{education.tertiaryClass}</span></div>
                  <div className={styles.field}><span className={styles.label}>Year</span><span className={styles.value}>{education.tertiaryYear}</span></div>
                  <div className={styles.field}><span className={styles.label}>Cert No</span><span className={styles.value}>{education.certificateNumber}</span></div>
                  <div className={styles.field}><span className={styles.label}>NSS Year</span><span className={styles.value}>{education.nationalServiceYear}</span></div>
                  <div className={styles.field}><span className={styles.label}>NSS No</span><span className={styles.value}>{education.nationalServiceNumber}</span></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Documents */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Uploaded Documents</h3>
          <button onClick={() => goToStep(5)} className={styles.editBtn}>Edit</button>
        </div>
        <div className={styles.docsGrid}>
          {formData.documents && formData.documents.length > 0 ? (
            formData.documents.map((doc, idx) => (
              <div key={idx} className={styles.docItem}>
                <span className={styles.docIcon}>📄</span>
                <div className={styles.docInfo}>
                  <span className={styles.docType}>{doc.documentType?.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className={styles.docName}>{doc.originalName || doc.filename}</span>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.missing}>No documents uploaded yet.</p>
          )}
        </div>
      </div>

      <WizardNavigation 
        nextLabel="Continue to Declaration →" 
        onClick={handleContinue}
      />
    </div>
  );
}
