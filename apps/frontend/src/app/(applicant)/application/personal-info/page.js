'use client';
import styles from './styles.module.css';
import PersonalInfoForm from '@/components/application/PersonalInfoForm/PersonalInfoForm';

export default function PersonalInfoPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Personal Information</h2>
        <p>Update your personal details as they appear on your documents.</p>
      </div>
      
      <PersonalInfoForm />
    </div>
  );
}
