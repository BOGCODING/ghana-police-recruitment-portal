'use client';
import styles from './styles.module.css';
import EducationForm from '@/components/application/EducationForm/EducationForm';

export default function EducationPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Educational Qualification</h2>
        <p>Please provide details of your educational background.</p>
      </div>
      
      <EducationForm />
    </div>
  );
}
