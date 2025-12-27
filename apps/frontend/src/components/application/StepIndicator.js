'use client';
import { useApplication } from '@/contexts/ApplicationContext';
import styles from './StepIndicator.module.css';

export default function StepIndicator() {
  const { steps, currentStep, goToStep } = useApplication();

  const progressWidth = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className={styles.stepIndicator}>
      <div className={styles.line}>
        <div 
          className={styles.progress} 
          style={{ width: `${progressWidth}%` }}
        />
      </div>
      
      {steps.map((step) => {
        const isComplete = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        
        return (
          <div 
            key={step.id} 
            className={`${styles.step} ${isComplete ? styles.complete : ''} ${isCurrent ? styles.current : ''}`}
            onClick={() => goToStep(step.id)}
          >
            <div className={styles.dot}>
              {isComplete ? '✓' : step.id}
            </div>
            <span className={styles.label}>{step.name}</span>
          </div>
        );
      })}
    </div>
  );
}
