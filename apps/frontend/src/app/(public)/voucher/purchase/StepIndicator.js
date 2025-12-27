'use client';
import { FiCheck } from 'react-icons/fi';
import styles from './styles.module.css';

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className={styles.stepIndicator}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div 
            key={step.id} 
            className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
          >
            <div className={styles.stepCircle}>
              {isCompleted ? <FiCheck /> : index + 1}
            </div>
            <span className={styles.stepLabel}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
