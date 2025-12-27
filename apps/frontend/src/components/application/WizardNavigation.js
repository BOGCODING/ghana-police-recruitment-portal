'use client';
import { useApplication } from '@/contexts/ApplicationContext';
import styles from './WizardNavigation.module.css';

export default function WizardNavigation({ isLastStep = false, isSubmitting = false, nextLabel = 'Continue →', onClick }) {
  const { currentStep, prevStep, saving } = useApplication();
  const isFirstStep = currentStep === 1;

  return (
    <div className={styles.actions}>
      {!isFirstStep && (
        <button 
          type="button" 
          onClick={prevStep} 
          className={styles.prevBtn}
          disabled={saving || isSubmitting}
        >
          ← Back
        </button>
      )}
      <button 
        type={onClick ? "button" : "submit"}
        onClick={onClick}
        className={isLastStep ? styles.submitBtn : styles.nextBtn} 
        disabled={saving || isSubmitting}
      >
        {isSubmitting || saving ? (
          'Saving...'
        ) : isLastStep ? (
          '✓ Submit Application'
        ) : (
          nextLabel
        )}
      </button>
    </div>
  );
}
