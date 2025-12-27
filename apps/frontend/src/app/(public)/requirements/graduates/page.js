'use client';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import styles from '../styles.module.css';

export default function GraduateRequirements() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.detailHeader}>
        <Link href="/requirements" className={styles.backLink}>
          <FiArrowLeft /> Back to Requirements
        </Link>
        <h1 className={styles.detailTitle}>Graduate Professionals</h1>
        <p className={styles.detailDesc}>
          We seek highly skilled degree holders to join our professional ranks in specialized 
          and administrative roles within the service.
        </p>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.mainRequirements}>
          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Academic Requirements</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Must possess a minimum of a first degree from a recognized university.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Minimum of Second Class Lower division.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Completed National Service (mandatory).
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Age Requirements</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Applicants must be between 18 and 32 years of age.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Professional Background</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
              Select a specialized field to view detailed entry requirements:
            </p>
            <div className={styles.categoryGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <Link href="/requirements/graduates/it" className={styles.categoryCard} style={{ padding: '1.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>IT & Cyber Security</h4>
              </Link>
              <Link href="/requirements/graduates/legal" className={styles.categoryCard} style={{ padding: '1.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>Legal Practitioners</h4>
              </Link>
              <Link href="/requirements/graduates/finance" className={styles.categoryCard} style={{ padding: '1.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>Accounting & Finance</h4>
              </Link>
              <Link href="/requirements/graduates/engineering" className={styles.categoryCard} style={{ padding: '1.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>Engineering</h4>
              </Link>
            </div>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.ctaBox}>
            <h4>Join the High Command</h4>
            <p>Contribute your professional expertise to the safety of our nation.</p>
            <Link href="/register" className={styles.ctaBtn}>
              Start Professional Entry
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
