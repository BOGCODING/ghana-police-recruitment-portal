'use client';
import styles from './styles.module.css';
import ContactInfoForm from '@/components/application/ContactInfoForm/ContactInfoForm';

export default function ContactDetailsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Contact Details</h2>
        <p>Provide your contact information.</p>
      </div>
      
      <ContactInfoForm />
    </div>
  );
}
