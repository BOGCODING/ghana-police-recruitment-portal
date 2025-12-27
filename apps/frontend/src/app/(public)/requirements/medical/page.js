'use client';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import styles from '../styles.module.css';

export default function MedicalRequirements() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.detailHeader}>
        <Link href="/requirements" className={styles.backLink}>
          <FiArrowLeft /> Back to Requirements
        </Link>
        <h1 className={styles.detailTitle}>Medical Professionals</h1>
        <p className={styles.detailDesc}>
          Join the Police Hospital and medical units to provide specialized healthcare 
          and medical services to the force and the general public.
        </p>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.mainRequirements}>
          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Medical Roles we Enlist</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
              Select a specialized role to view detailed entry requirements:
            </p>
            <div className={styles.categoryGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <Link href="/requirements/medical/doctors" className={styles.categoryCard} style={{ padding: '1.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>Medical Officers & Specialists</h4>
              </Link>
              <Link href="/requirements/medical/nurses" className={styles.categoryCard} style={{ padding: '1.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>Professional Nurses</h4>
              </Link>
            </div>
            <ul className={styles.requirementList} style={{ marginTop: '1.5rem' }}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Pharmacists & Lab Technicians
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Diagnostic Radiographers
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Anaesthetists
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Registration & Certification</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Valid registration with the relevant Professional Body (MDC, GNMCC, etc.).
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Must have a valid and up-to-date Practicing License.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Successful completion of Internship (Housemanship) where applicable.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Eligibility</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Age between 18 and 35, depending on the specialty.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Completed National Service.
              </li>
            </ul>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.ctaBox}>
            <h4>Medical Excellence</h4>
            <p>Save lives while serving with integrity in the Ghana Police Service.</p>
            <Link href="/register" className={styles.ctaBtn}>
              Medical Entry
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
