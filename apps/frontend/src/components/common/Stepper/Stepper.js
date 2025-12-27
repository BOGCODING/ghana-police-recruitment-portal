import styles from './Stepper.module.css';

export default function Stepper({ steps, currentStep }) {
  return (
    <div className={styles.stepper}>
      {steps.map((step, index) => (
        <div 
          key={index} 
          className={`${styles.step} ${index <= currentStep ? styles.active : ''} ${index === currentStep ? styles.current : ''}`}
        >
          <div className={styles.circle}>{index + 1}</div>
          <div className={styles.label}>{step.label}</div>
          {index < steps.length - 1 && <div className={styles.line}></div>}
        </div>
      ))}
    </div>
  );
}
