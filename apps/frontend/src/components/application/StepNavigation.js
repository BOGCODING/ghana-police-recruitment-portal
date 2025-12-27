'use client';
import { useApplication } from '@/contexts/ApplicationContext';
import styles from './StepNavigation.module.css';

export default function StepNavigation() {
  const { steps, currentStep, goToStep, formData } = useApplication();

  const isStepComplete = (stepKey) => {
    const data = formData[stepKey];
    if (!data) return false;
    return Object.keys(data).length > 0;
  };

  return (
    <nav className={styles.nav}>
      <h3>Form Progress</h3>
      <ul className={styles.steps}>
        {steps.map((step) => {
          const isComplete = isStepComplete(step.key);
          const isCurrent = currentStep === step.id;
          const isAccessible = step.id <= currentStep;

          return (
            <li key={step.id} className={styles.stepItem}>
              <button
                onClick={() => goToStep(step.id)}
                disabled={!isAccessible}
                className={`
                  ${styles.stepButton}
                  ${isCurrent ? styles.current : ''}
                  ${isComplete ? styles.complete : ''}
                  ${!isAccessible ? styles.locked : ''}
                `}
              >
                <span className={styles.stepNumber}>
                  {isComplete && !isCurrent ? '✓' : step.id}
                </span>
                <span className={styles.stepName}>{step.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
