'use client';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import styles from '../../styles.module.css';

export default function EngineeringRequirements() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.detailHeader}>
        <Link href="/requirements/graduates" className={styles.backLink}>
          <FiArrowLeft /> Back to Graduates
        </Link>
        <h1 className={styles.detailTitle}>Engineering Professionals</h1>
        <p className={styles.detailDesc}>
          Join our technical divisions to maintain infrastructure, energy systems, 
          and the police fleet through specialized engineering expertise.
        </p>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.mainRequirements}>
          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Disciplines</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Civil Engineering
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Electrical/Electronic Engineering
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Mechanical/Automobile Engineering
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Geomatic Engineering
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Academic Requirements</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                BSc or BTech in any of the relevant Engineering fields.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Minimum of Second Class Lower division.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Professional Certification</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Registered member of the Ghana Institution of Engineering (GhIE).
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Must have completed a minimum of two (2) years post-qualification practice.
              </li>
            </ul>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.ctaBox}>
            <h4>Build the Future</h4>
            <p>Apply your engineering skills to strengthen the operational capability of the force.</p>
            <Link href="/register" className={styles.ctaBtn}>
              Apply for Engineering
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
