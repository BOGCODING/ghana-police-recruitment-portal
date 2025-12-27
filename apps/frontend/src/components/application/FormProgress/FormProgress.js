'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useApplication } from '@/contexts/ApplicationContext';
import styles from './FormProgress.module.css';

export default function FormProgress() {
  const { steps, currentStep } = useApplication();
  
  if (!steps || steps.length === 0) return null;

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;
  const currentStepData = steps.find(s => s.id === currentStep) || steps[0];
  const nextStepData = steps.find(s => s.id === currentStep + 1);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.stepInfo}>
          <span className={styles.currentLabel}>Current Progress</span>
          <h3 className={styles.stepName}>{currentStepData.name}</h3>
        </div>
        <div className={styles.percentage}>
          {Math.round(progress)}%
        </div>
      </div>

      <div className={styles.progressBar}>
        <motion.div 
          className={styles.fill}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "circOut" }}
        />
      </div>

      <div className={styles.footer}>
        <div className={styles.stepCounter}>
          Step <span className={styles.activeNumber}>{currentStep}</span> of {steps.length}
        </div>
        <AnimatePresence mode="wait">
          {nextStepData && (
            <motion.div 
              key={nextStepData.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className={styles.nextStep}
            >
              Next: <span>{nextStepData.name}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
