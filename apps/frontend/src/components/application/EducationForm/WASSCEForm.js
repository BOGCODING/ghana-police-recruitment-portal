import styles from './EducationForm.module.css';
import Input from '../../common/Input/Input';
import Select from '../../common/Input/Select';
import CustomCreatableSelect from '../../common/Input/CreatableSelect';
import { subjects } from '../../../data/subjects';
import { shsSchools } from '../../../data/shs_schools';

const SUBJECT_OPTIONS = subjects.electives.map(subject => ({
  value: subject,
  label: subject
}));

const SCHOOL_OPTIONS = shsSchools.map(school => ({
  value: school,
  label: school
}));

const GRADES = [
  { value: 'A1', label: 'A1' },
  { value: 'B2', label: 'B2' },
  { value: 'B3', label: 'B3' },
  { value: 'C4', label: 'C4' },
  { value: 'C5', label: 'C5' },
  { value: 'C6', label: 'C6' },
  { value: 'D7', label: 'D7' },
  { value: 'E8', label: 'E8' },
  { value: 'F9', label: 'F9' },
];

export default function WASSCEForm({ register, errors }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>WASSCE Details</h3>
      <div className={styles.formGrid}>
        <CustomCreatableSelect 
          label="School Name" 
          name="wassceSchool"
          options={SCHOOL_OPTIONS}
          placeholder="Select or type WASSCE school"
        />
        <Input 
          label="Month/Year of Exam" 
          {...register('wassceYear')} 
          error={errors.wassceYear?.message} 
          placeholder="MM/YYYY"
        />
        <Input 
          label="Index Number" 
          {...register('wassceIndexNumber')} 
          error={errors.wassceIndexNumber?.message} 
          placeholder="Enter index number"
        />
        <Input 
          label="Certificate Number" 
          {...register('wassceCertificateNumber')} 
          error={errors.wassceCertificateNumber?.message} 
          placeholder="Enter certificate number"
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Core Subjects</p>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
           <Input value="ENGLISH LANGUAGE" disabled {...register('englishName')} />
           <Select label="Grade" options={GRADES} {...register('wassceEnglish')} error={errors.wassceEnglish?.message} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
           <Input value="CORE MATHEMATICS" disabled {...register('mathName')} />
           <Select label="Grade" options={GRADES} {...register('wassceMath')} error={errors.wassceMath?.message} />
        </div>
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Subjects</p>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
           <Select 
             options={SUBJECT_OPTIONS} 
             placeholder="Select Subject" 
             {...register('elective1Name')} 
           />
           <Select options={GRADES} {...register('elective1Grade')} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
           <Select 
             options={SUBJECT_OPTIONS} 
             placeholder="Select Subject" 
             {...register('elective2Name')} 
           />
           <Select options={GRADES} {...register('elective2Grade')} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
           <Select 
             options={SUBJECT_OPTIONS} 
             placeholder="Select Subject" 
             {...register('elective3Name')} 
           />
           <Select options={GRADES} {...register('elective3Grade')} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
           <Select 
             options={SUBJECT_OPTIONS} 
             placeholder="Select Subject" 
             {...register('elective4Name')} 
           />
           <Select options={GRADES} {...register('elective4Grade')} />
        </div>
      </div>
    </div>
  );
}
