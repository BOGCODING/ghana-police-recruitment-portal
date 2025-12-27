'use client';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import styles from '../styles.module.css';

export default function GeneralDutyRequirements() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.detailHeader}>
        <Link href="/requirements" className={styles.backLink}>
          <FiArrowLeft /> Back to Requirements
        </Link>
        <h1 className={styles.detailTitle}>General Duty Requirements</h1>
        <p className={styles.detailDesc}>
          This category is for enthusiastic individuals ready to serve on the front lines, 
          ensuring public safety and maintaining law and order in communities across Ghana.
        </p>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.mainRequirements}>
          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Academic Qualifications</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Must possess WASSCE or SSCE certificate.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Minimum of six (6) credits (A1-C6) including English Language and Mathematics.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Age Requirements</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Applicants must be between the ages of 18 and 25 at the time of application.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Physical Standards</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Minimum height: 1.67m (5ft 6in) for males and 1.60m (5ft 3in) for females.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Good eyesight and no physical deformities.
              </li>
            </ul>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.ctaBox}>
            <h4>Ready to Apply?</h4>
            <p>If you meet all the criteria above, start your journey into the Ghana Police Service today.</p>
            <Link href="/register" className={styles.ctaBtn}>
              Register Now
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
