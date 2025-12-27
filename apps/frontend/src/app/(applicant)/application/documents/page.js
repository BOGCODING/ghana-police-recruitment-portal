'use client';
import { useApplication } from '@/contexts/ApplicationContext';
import styles from './styles.module.css';
import DocumentUpload from '@/components/application/DocumentUpload/DocumentUpload';
import WizardNavigation from '@/components/application/WizardNavigation';

export default function DocumentsPage() {
  const { nextStep, formData } = useApplication();

  const handleNext = async () => {
    // Validate required documents before proceeding
    const requiredKeys = ['passportPhoto', 'birthCertificate', 'wassceCertificate', 'ghanaCard'];
    const uploadedTypes = (formData.documents || []).map(d => d.documentType);
    const missing = requiredKeys.filter(k => !uploadedTypes.includes(k));

    if (missing.length > 0) {
      alert('Please upload all required documents before continuing.');
      return;
    }

    try {
      await nextStep('documents', formData.documents);
    } catch (error) {
      console.error('Failed to proceed to next step:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Document Uploads</h2>
        <p>Please upload clear copies of all required documents.</p>
      </div>
      
      <DocumentUpload />
      
      <WizardNavigation onClick={handleNext} />
    </div>
  );
}
