'use client';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import styles from '../../styles.module.css';

export default function MechanicsRequirements() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.detailHeader}>
        <Link href="/requirements/tradesmen" className={styles.backLink}>
          <FiArrowLeft /> Back to Tradesmen
        </Link>
        <h1 className={styles.detailTitle}>Auto-Mechanics</h1>
        <p className={styles.detailDesc}>
          Join the mechanical workshop to maintain and repair the diverse fleet 
          of the Ghana Police Service, ensuring vehicle availability.
        </p>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.mainRequirements}>
          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Technical Qualifications</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                NVTI Grade I or II in Motor Vehicle Mechanics (MVM).
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                MET Part I or II or equivalent technical certification.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Skills & Specialization</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Proficiency in Petrol and Diesel engine repairs.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Knowledge in Auto-Electrical systems is a plus.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Ability to diagnose complex mechanical faults.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Experience</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Minimum of two (2) years practical experience in a reputable workshop.
              </li>
            </ul>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.ctaBox}>
            <h4>Technical Excellence</h4>
            <p>Ensure our fleet is always ready for the road. Join the workshop today.</p>
            <Link href="/register" className={styles.ctaBtn}>
              Apply as a Mechanic
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
