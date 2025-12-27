'use client';
import styles from './styles.module.css';
import ReviewSummary from '@/components/application/Review/ReviewSummary';

export default function ReviewPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Review Your Application</h2>
        <p>Please double-check all information before final submission. You can edit any section if needed.</p>
      </div>
      
      <ReviewSummary />
    </div>
  );
}
