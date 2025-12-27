'use client';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import styles from '../../styles.module.css';

export default function DriversRequirements() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.detailHeader}>
        <Link href="/requirements/tradesmen" className={styles.backLink}>
          <FiArrowLeft /> Back to Tradesmen
        </Link>
        <h1 className={styles.detailTitle}>Police Drivers</h1>
        <p className={styles.detailDesc}>
          Join our transport and operations unit to provide safe and efficient 
          transportation services for the Ghana Police Service.
        </p>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.mainRequirements}>
          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>License & Documentation</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Must possess a valid Ghanaian Driver's License Category 'D' or 'E'.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Must have a clean driving record with no major traffic violations.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Experience & Skills</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                At least three (3) years of proven driving experience.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Possession of a Defensive Driving Certificate is an advantage.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Basic knowledge of vehicle troubleshooting and maintenance.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Academic Base</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Minimum of BECE or WASSCE Certificate.
              </li>
            </ul>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.ctaBox}>
            <h4>Drive for Results</h4>
            <p>Your driving skills are crucial to our operational readiness.</p>
            <Link href="/register" className={styles.ctaBtn}>
              Apply as a Driver
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
