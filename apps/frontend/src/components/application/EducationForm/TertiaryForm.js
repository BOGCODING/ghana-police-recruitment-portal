import styles from './EducationForm.module.css';
import Input from '../../common/Input/Input';
import Select from '../../common/Input/Select';
import CustomCreatableSelect from '../../common/Input/CreatableSelect';
import { schools } from '../../../data/schools';
import { courses } from '../../../data/courses';

const QUALIFICATIONS = [
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'HND', label: 'HND' },
  { value: 'DEGREE', label: 'Degree' },
  { value: 'MASTERS', label: 'Masters' },
  { value: 'PHD', label: 'PhD' },
];

const CLASS_OPTIONS = [
  { value: 'FIRST CLASS', label: 'First Class' },
  { value: 'SECOND CLASS UPPER', label: 'Second Class Upper' },
  { value: 'SECOND CLASS LOWER', label: 'Second Class Lower' },
  { value: 'THIRD CLASS', label: 'Third Class' },
  { value: 'PASS', label: 'Pass' },
  { value: 'DISTINCTION', label: 'Distinction' },
  { value: 'MERIT', label: 'Merit' },
  { value: 'CREDIT', label: 'Credit' },
];


const SCHOOL_OPTIONS = schools.map(school => ({
  value: school,
  label: school
}));

const COURSE_OPTIONS = courses.map(course => ({
  value: course,
  label: course
}));

export default function TertiaryForm({ register, errors }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Tertiary Education Details</h3>
      <div className={styles.formGrid}>
        <CustomCreatableSelect 
          label="Institution Name" 
          name="tertiaryInstitution"
          options={SCHOOL_OPTIONS}
          placeholder="Select or type university/college"
        />
        <Select 
          label="Qualification" 
          options={QUALIFICATIONS}
          {...register('tertiaryQualification')} 
          error={errors.tertiaryQualification?.message} 
        />
        <CustomCreatableSelect 
          label="Course of Study" 
          name="tertiaryCourse"
          options={COURSE_OPTIONS}
          placeholder="Select or type course name"
        />
        <Select 
          label="Class Obtained" 
          options={CLASS_OPTIONS}
          {...register('tertiaryClass')} 
          error={errors.tertiaryClass?.message} 
          placeholder="Select Class"
        />
        <Input 
          label="Year of Completion" 
          type="number"
          {...register('tertiaryYear')} 
          error={errors.tertiaryYear?.message} 
          placeholder="YYYY"
        />
        <Input 
          label="Certificate Number" 
          {...register('certificateNumber')} 
          error={errors.certificateNumber?.message} 
          placeholder="Enter certificate number"
        />
        <Input 
          label="National Service Number" 
          {...register('nationalServiceNumber')} 
          error={errors.nationalServiceNumber?.message} 
          placeholder="NSS/..."
        />
        <Input 
          label="National Service Year" 
          type="number"
          {...register('nationalServiceYear')} 
          error={errors.nationalServiceYear?.message} 
          placeholder="YYYY"
        />
      </div>
    </div>
  );
}
