'use client';
import { useApplication } from '@/contexts/ApplicationContext';
import StepIndicator from '@/components/application/StepIndicator';
import FormProgress from '@/components/application/FormProgress/FormProgress';
import styles from './layout.module.css';

function ApplicationContent({ children }) {
  const { dataLoaded, loading } = useApplication();

  if (loading && !dataLoaded) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your application...</p>
      </div>
    );
  }

  return (
    <div className={styles.wizardLayout}>
      <header className={styles.wizardHeader}>
        <FormProgress />
        <div className={styles.indicatorContainer}>
          <StepIndicator />
        </div>
      </header>

      <main className={styles.wizardBody}>
        {children}
      </main>
    </div>
  );
}

export default function ApplicationLayout({ children }) {
  return (
    <ApplicationContent>
      {children}
    </ApplicationContent>
  );
}
