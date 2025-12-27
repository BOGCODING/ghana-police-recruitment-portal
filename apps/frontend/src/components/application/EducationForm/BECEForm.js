import styles from './EducationForm.module.css';
import CustomCreatableSelect from '../../common/Input/CreatableSelect';
import Input from '../../common/Input/Input';
import { jhsSchools } from '../../../data/jhs_schools';

const SCHOOL_OPTIONS = jhsSchools.map(school => ({
  value: school,
  label: school
}));

export default function BECEForm({ register, errors }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>BECE Details</h3>
      <div className={styles.formGrid}>
        <CustomCreatableSelect 
          label="School Name" 
          name="beceSchool"
          options={SCHOOL_OPTIONS}
          placeholder="Select or type BECE school"
        />
        <Input 
          label="Year of Completion" 
          type="number"
          {...register('beceYear')} 
          error={errors.beceYear?.message} 
          placeholder="YYYY"
        />
        <Input 
          label="Index Number" 
          {...register('beceIndexNumber')} 
          error={errors.beceIndexNumber?.message} 
          placeholder="Enter index number"
        />
        <Input 
          label="Certificate Number" 
          {...register('beceCertificateNumber')} 
          error={errors.beceCertificateNumber?.message} 
          placeholder="Enter certificate number"
        />
      </div>
    </div>
  );
}
