'use client';

import CategorySelectionForm from '@/components/application/CategorySelectionForm/CategorySelectionForm';
import styles from './page.module.css';

export default function CategorySelectionPage() {
  return (
    <div className={styles.container}>
      <CategorySelectionForm />
    </div>
  );
}
