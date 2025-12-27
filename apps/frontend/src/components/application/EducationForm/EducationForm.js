'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useApplication } from '@/contexts/ApplicationContext';
import { shouldShowTertiaryForm } from '@/config/categoryRequirements';
import styles from './EducationForm.module.css';
import BECEForm from './BECEForm';
import WASSCEForm from './WASSCEForm';
import TertiaryForm from './TertiaryForm';
import WizardNavigation from '../WizardNavigation';
import AutoSave from '../AutoSave/AutoSave';

export default function EducationForm() {
  const { formData, nextStep, dataLoaded } = useApplication();
  const [serverError, setServerError] = useState(null);
  const hasInitializedRef = useRef(false);
  // Get the selected category from form data to determine which forms to show
  const selectedCategory = formData.categoryDetails?.category || formData.category || '';
  const showTertiary = shouldShowTertiaryForm(selectedCategory);

  // Normalize structured data from backend to flat form state
  const getNormalizedDefaultValues = useCallback(() => {
    const fullData = formData.education || {};
    const edu = fullData.education || {};
    const bece = fullData.bece || {};
    const wassceArr = fullData.wassce || [];
    const tertiaryArr = fullData.tertiary || [];
    
    // Find main WASSCE (not NovDec)
    const wassce = wassceArr.find(w => !w.isNovdec) || {};
    const wassceResults = wassce.results || [];
    
    // Helper to get grade by subject name
    const getGrade = (results, subject) => results.find(r => r.subject === subject)?.grade || '';

    // Proper elective mapping for up to 4 subjects
    const coreSubjects = ['CORE ENGLISH', 'CORE MATHEMATICS'];
    const electives = wassceResults.filter(r => !coreSubjects.includes(r.subject.toUpperCase()));

    return {
      educationLevel: edu.educationLevel || 'WASSCE',
      
      // BECE
      beceSchool: bece.schoolName || '',
      beceYear: bece.completionYear || '',
      beceIndexNumber: bece.indexNumber || '',
      beceCertificateNumber: bece.certificateNumber || '',
      
      // WASSCE
      wassceSchool: wassce.schoolName || '',
      wassceYear: wassce.completionYear || '',
      wassceIndexNumber: wassce.indexNumber || '',
      wassceCertificateNumber: wassce.certificateNumber || '',
      wassceEnglish: getGrade(wassceResults, 'CORE ENGLISH') || '',
      wassceMath: getGrade(wassceResults, 'CORE MATHEMATICS') || '',
      
      // Electives
      elective1Name: electives[0]?.subject || '',
      elective1Grade: electives[0]?.grade || '',
      elective2Name: electives[1]?.subject || '',
      elective2Grade: electives[1]?.grade || '',
      elective3Name: electives[2]?.subject || '',
      elective3Grade: electives[2]?.grade || '',
      elective4Name: electives[3]?.subject || '',
      elective4Grade: electives[3]?.grade || '',
      
      // Tertiary
      tertiaryInstitution: tertiaryArr[0]?.institutionName || '',
      tertiaryQualification: tertiaryArr[0]?.qualification || '',
      tertiaryCourse: tertiaryArr[0]?.courseOfStudy || '',
      tertiaryClass: tertiaryArr[0]?.classObtained || '',
      tertiaryYear: tertiaryArr[0]?.completionYear || '',
      certificateNumber: tertiaryArr[0]?.certificateNumber || '',
      nationalServiceNumber: tertiaryArr[0]?.nationalServiceNumber || '',
      nationalServiceYear: tertiaryArr[0]?.nationalServiceYear || ''
    };
  }, [formData.education]);

  const methods = useForm({
    defaultValues: getNormalizedDefaultValues()
  });

  const { register, handleSubmit, formState: { errors }, reset } = methods;

  // Re-initialize form when data is loaded from context
  useEffect(() => {
    if (dataLoaded && !hasInitializedRef.current) {
      reset(getNormalizedDefaultValues());
      hasInitializedRef.current = true;
    }
  }, [dataLoaded, reset, getNormalizedDefaultValues]);

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      await nextStep('education', data);
    } catch (error) {
      console.error('Failed to save education info:', error);
      const message = error.data?.message || error.message || 'Failed to save education info';
      setServerError(message);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.container}>
        <AutoSave stepKey="education" />

        {serverError && (
          <div className={styles.serverError}>
            {typeof serverError === 'string' ? serverError : JSON.stringify(serverError)}
          </div>
        )}
        <BECEForm register={register} errors={errors} />
        {/* WASSCE is required for all categories */}
        <WASSCEForm register={register} errors={errors} />
        {/* Tertiary form only for GRADUATES, MEDICAL_PROFESSIONALS, RELIGIOUS_AFFAIRS */}
        {showTertiary && (
          <TertiaryForm register={register} errors={errors} />
        )}
        
        <div style={{ marginTop: '2rem' }}>
          <WizardNavigation />
        </div>
      </form>
    </FormProvider>
  );
}
