'use client';
import { useState, useEffect } from 'react';
import { useApplication } from '@/contexts/ApplicationContext';
import styles from './FormStep.module.css';

const WASSCE_SUBJECTS = [
  'ENGLISH LANGUAGE', 'MATHEMATICS (CORE)', 'INTEGRATED SCIENCE', 'SOCIAL STUDIES',
  'MATHEMATICS (ELECTIVE)', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'GEOGRAPHY',
  'ECONOMICS', 'GOVERNMENT', 'HISTORY', 'LITERATURE', 'FRENCH',
  'ACCOUNTING', 'BUSINESS MANAGEMENT', 'COSTING', 'TYPING'
];

const GRADES = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

export default function EducationForm() {
  const { formData, nextStep, prevStep, updateStepData, saving } = useApplication();
  const [data, setData] = useState({
    beceSchool: '',
    beceYear: '',
    beceIndexNumber: '',
    beceResults: [],
    hasWassce: true,
    wassceSchool: '',
    wassceYear: '',
    wassceIndexNumber: '',
    wassceResults: [
      { subject: 'ENGLISH LANGUAGE', grade: '' },
      { subject: 'MATHEMATICS (CORE)', grade: '' },
      { subject: 'INTEGRATED SCIENCE', grade: '' },
      { subject: 'SOCIAL STUDIES', grade: '' },
      { subject: '', grade: '' },
      { subject: '', grade: '' },
      { subject: '', grade: '' },
      { subject: '', grade: '' }
    ],
    hasTertiary: false,
    tertiaryInstitution: '',
    tertiaryQualification: '',
    tertiaryCourse: '',
    tertiaryClass: '',
    tertiaryYear: '',
    certificateNumber: '',
    hasNationalService: false,
    nationalServiceYear: '',
    nationalServiceNumber: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (formData.education && Object.keys(formData.education).length) {
      // Hydrate nested data back to flat form state
      const edu = formData.education;
      const bece = edu.bece || {};
      const wassce = (edu.wassce && edu.wassce.length > 0) ? edu.wassce[0] : {};
      const tertiary = (edu.tertiary && edu.tertiary.length > 0) ? edu.tertiary[0] : {};

      setData(prev => ({
        ...prev,
        // BECE
        beceSchool: bece.school_name || bece.schoolName || prev.beceSchool,
        beceYear: bece.completion_year || bece.completionYear || prev.beceYear,
        beceIndexNumber: bece.index_number || bece.indexNumber || prev.beceIndexNumber,
        beceResults: bece.results ? (typeof bece.results === 'string' ? JSON.parse(bece.results) : bece.results) : prev.beceResults,
        
        // WASSCE
        hasWassce: edu.education?.has_wassce ?? true,
        wassceSchool: wassce.school_name || wassce.schoolName || prev.wassceSchool,
        wassceYear: wassce.completion_year || wassce.completionYear || prev.wassceYear,
        wassceIndexNumber: wassce.index_number || wassce.indexNumber || prev.wassceIndexNumber,
        wassceResults: wassce.results ? (typeof wassce.results === 'string' ? JSON.parse(wassce.results) : wassce.results) : prev.wassceResults,

        // Tertiary
        hasTertiary: edu.education?.has_tertiary || !!(tertiary.institution_name || tertiary.institutionName),
        tertiaryInstitution: tertiary.institution_name || tertiary.institutionName || prev.tertiaryInstitution,
        tertiaryQualification: tertiary.qualification || prev.tertiaryQualification,
        tertiaryCourse: tertiary.course_of_study || tertiary.courseOfStudy || prev.tertiaryCourse,
        tertiaryClass: tertiary.class_obtained || tertiary.classObtained || prev.tertiaryClass || '',
        tertiaryYear: tertiary.completion_year || tertiary.completionYear || prev.tertiaryYear,
        certificateNumber: tertiary.certificate_number || tertiary.certificateNumber || prev.certificateNumber || '',
        
        // National Service
        hasNationalService: edu.education?.has_completed_national_service || !!(tertiary.national_service_number || tertiary.nationalServiceNumber),
        nationalServiceNumber: tertiary.national_service_number || tertiary.nationalServiceNumber || prev.nationalServiceNumber,
        nationalServiceYear: tertiary.national_service_year || tertiary.nationalServiceYear || prev.nationalServiceYear
      }));
    }
  }, [formData.education]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value.toUpperCase();
    setData(prev => ({ ...prev, [name]: newValue }));
    updateStepData('education', { ...data, [name]: newValue });
  };

  const handleWassceChange = (index, field, value) => {
    const newResults = [...data.wassceResults];
    newResults[index] = { ...newResults[index], [field]: value };
    setData(prev => ({ ...prev, wassceResults: newResults }));
    updateStepData('education', { ...data, wassceResults: newResults });
  };

  const validate = () => {
    const newErrors = {};
    if (!data.wassceSchool) newErrors.wassceSchool = 'School name is required';
    if (!data.wassceYear) newErrors.wassceYear = 'Year is required';
    if (!data.wassceIndexNumber) newErrors.wassceIndexNumber = 'Index number is required';
    
    // Core subjects validation
    const coreSubjects = data.wassceResults.slice(0, 4);
    const hasAllCores = coreSubjects.every(r => r.grade);
    if (!hasAllCores) {
      newErrors.wassceResults = 'All 4 core subjects are required';
    }
    
    // Check for passing grades (at least C6)
    const passingGrades = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'];
    const filledResults = data.wassceResults.filter(r => r.subject && r.grade);
    const passCount = filledResults.filter(r => passingGrades.includes(r.grade)).length;
    if (passCount < 6) {
      newErrors.wassceResults = 'Minimum 6 passes (C6 or better) required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await nextStep('education', data);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>
        <h2>Educational Qualification</h2>
        <p>Enter your WASSCE/SSCE results and other qualifications</p>
      </div>

      {errors.submit && <div className={styles.submitError}>{errors.submit}</div>}

      <h3 style={{ fontSize: '1rem', color: 'var(--gray-700)', marginBottom: '1rem' }}>
        WASSCE / SSCE Results
      </h3>

      <div className={styles.row3}>
        <div className={styles.field}>
          <label>School Name *</label>
          <input
            type="text"
            name="wassceSchool"
            value={data.wassceSchool}
            onChange={handleChange}
            placeholder="SCHOOL NAME"
            className={errors.wassceSchool ? styles.error : ''}
          />
        </div>
        <div className={styles.field}>
          <label>Year *</label>
          <input
            type="number"
            name="wassceYear"
            value={data.wassceYear}
            onChange={handleChange}
            placeholder="2020"
            min="1990"
            max={new Date().getFullYear()}
            className={errors.wassceYear ? styles.error : ''}
          />
        </div>
        <div className={styles.field}>
          <label>Index Number *</label>
          <input
            type="text"
            name="wassceIndexNumber"
            value={data.wassceIndexNumber}
            onChange={handleChange}
            placeholder="INDEX NUMBER"
            className={errors.wassceIndexNumber ? styles.error : ''}
          />
        </div>
      </div>

      {errors.wassceResults && (
        <div className={styles.submitError}>{errors.wassceResults}</div>
      )}

      <div style={{ marginTop: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
          Core Subjects (Required):
        </p>
        {data.wassceResults.slice(0, 4).map((result, idx) => (
          <div key={idx} className={styles.row2} style={{ marginBottom: '0.5rem' }}>
            <div className={styles.field}>
              <input type="text" value={result.subject} disabled style={{ background: '#f3f4f6' }} />
            </div>
            <div className={styles.field}>
              <select
                value={result.grade}
                onChange={(e) => handleWassceChange(idx, 'grade', e.target.value)}
              >
                <option value="">Grade</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        ))}

        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '1rem', marginBottom: '0.5rem' }}>
          Elective Subjects:
        </p>
        {data.wassceResults.slice(4).map((result, idx) => (
          <div key={idx + 4} className={styles.row2} style={{ marginBottom: '0.5rem' }}>
            <div className={styles.field}>
              <select
                value={result.subject}
                onChange={(e) => handleWassceChange(idx + 4, 'subject', e.target.value)}
              >
                <option value="">Select Subject</option>
                {WASSCE_SUBJECTS.filter(s => 
                  !data.wassceResults.some(r => r.subject === s) || result.subject === s
                ).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <select
                value={result.grade}
                onChange={(e) => handleWassceChange(idx + 4, 'grade', e.target.value)}
                disabled={!result.subject}
              >
                <option value="">Grade</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.field} style={{ marginTop: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" name="hasTertiary" checked={data.hasTertiary} onChange={handleChange} />
          <span>I have a tertiary qualification</span>
        </label>
      </div>

      {data.hasTertiary && (
        <>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Institution</label>
              <input
                type="text"
                name="tertiaryInstitution"
                value={data.tertiaryInstitution}
                onChange={handleChange}
                placeholder="UNIVERSITY/POLYTECHNIC NAME"
              />
            </div>
            <div className={styles.field}>
              <label>Qualification</label>
              <select name="tertiaryQualification" value={data.tertiaryQualification} onChange={handleChange}>
                <option value="">Select</option>
                <option value="CERTIFICATE">CERTIFICATE</option>
                <option value="DIPLOMA">DIPLOMA</option>
                <option value="HND">HND</option>
                <option value="DEGREE">DEGREE</option>
                <option value="MASTERS">MASTERS</option>
                <option value="PHD">PHD</option>
              </select>
            </div>
          </div>
          <div className={styles.row2}>
             <div className={styles.field}>
               <label>Class Obtained</label>
               <input
                 type="text"
                 name="tertiaryClass"
                 value={data.tertiaryClass}
                 onChange={handleChange}
                 placeholder="e.g. FIRST CLASS"
               />
             </div>
             <div className={styles.field}>
                <label>Certificate Number</label>
                <input
                  type="text"
                  name="certificateNumber"
                  value={data.certificateNumber}
                  onChange={handleChange}
                  placeholder="CERTIFICATE NO."
                />
             </div>
          </div>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Course</label>
              <input
                type="text"
                name="tertiaryCourse"
                value={data.tertiaryCourse}
                onChange={handleChange}
                placeholder="COURSE NAME"
              />
            </div>
            <div className={styles.field}>
              <label>Year Completed</label>
              <input
                type="number"
                name="tertiaryYear"
                value={data.tertiaryYear}
                onChange={handleChange}
                min="1990"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
          <div className={styles.row2}>
             <div className={styles.field}>
                <label>National Service Number</label>
                <input
                  type="text"
                  name="nationalServiceNumber"
                  value={data.nationalServiceNumber}
                  onChange={handleChange}
                  placeholder="NSS/REG/XXX/XXX"
                />
             </div>
             <div className={styles.field}>
                <label>National Service Year</label>
                <input
                  type="number"
                  name="nationalServiceYear"
                  value={data.nationalServiceYear}
                  onChange={handleChange}
                  placeholder="2022"
                  min="1990"
                  max={new Date().getFullYear()}
                />
             </div>
          </div>
        </>
      )}

      <div className={styles.actions}>
        <button type="button" onClick={prevStep} className={styles.prevBtn}>← Back</button>
        <button type="submit" className={styles.nextBtn} disabled={saving}>
          {saving ? 'Saving...' : 'Continue →'}
        </button>
      </div>
    </form>
  );
}
