'use client';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import styles from '../../styles.module.css';

export default function NursesRequirements() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.detailHeader}>
        <Link href="/requirements/medical" className={styles.backLink}>
          <FiArrowLeft /> Back to Medical Requirements
        </Link>
        <h1 className={styles.detailTitle}>Professional Nurses</h1>
        <p className={styles.detailDesc}>
          We are looking for dedicated nursing professionals to join our various 
          medical units and provide compassionate care in the field and hospital.
        </p>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.mainRequirements}>
          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Nursing Disciplines</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                General Nursing (RGN)
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Midwifery (RM)
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Critical Care or Peri-Operative Nursing
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Emergency & Trauma Nursing
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Academic & Professional</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                BSc in Nursing/Midwifery or Diploma from a recognized institution.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Must be registered with the Nursing and Midwifery Council (GNMC), Ghana.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Must possess a valid and up-to-date Practicing License (PIN).
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Experience</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Successful completion of National Service / Rotation.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                At least one (1) year of post-registration working experience.
              </li>
            </ul>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.ctaBox}>
            <h4>Compassionate Care</h4>
            <p>Join the ranks of medical professionals serving those who serve.</p>
            <Link href="/register" className={styles.ctaBtn}>
              Apply as a Nurse
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
