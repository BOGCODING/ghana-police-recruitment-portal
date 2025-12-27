'use client';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import styles from '../../styles.module.css';

export default function DoctorsRequirements() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.detailHeader}>
        <Link href="/requirements/medical" className={styles.backLink}>
          <FiArrowLeft /> Back to Medical Requirements
        </Link>
        <h1 className={styles.detailTitle}>Medical Doctors</h1>
        <p className={styles.detailDesc}>
          Join the Ghana Police Medical Service as a Medical Officer or Specialist 
          to provide exceptional healthcare to our personnel and the public.
        </p>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.mainRequirements}>
          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Academic Qualifications</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                MBChB, MB BS or equivalent degree from a recognized University.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Post-graduate qualification (FWACS, GCPS, etc.) for Specialist roles.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Registration & Internship</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Must be registered with the Medical and Dental Council (MDC), Ghana.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Successfully completed two (2) years of Housemanship.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Must have a valid and current Permanent Registration Certificate.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Eligibility</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Must have completed National Service.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Maximum age of 35 years for Medical Officers and 40 years for Specialists.
              </li>
            </ul>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.ctaBox}>
            <h4>Medical Excellence</h4>
            <p>Combine your medical passion with a career in national security.</p>
            <Link href="/register" className={styles.ctaBtn}>
              Apply as a Doctor
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
