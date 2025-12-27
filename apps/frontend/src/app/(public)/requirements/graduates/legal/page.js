'use client';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import styles from '../../styles.module.css';

export default function LegalRequirements() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.detailHeader}>
        <Link href="/requirements/graduates" className={styles.backLink}>
          <FiArrowLeft /> Back to Graduates
        </Link>
        <h1 className={styles.detailTitle}>Legal Practitioners</h1>
        <p className={styles.detailDesc}>
          Provide expert legal counsel and representation to the Ghana Police Service 
          in criminal prosecutions and civil litigations.
        </p>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.mainRequirements}>
          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Qualifications</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                LLB (Bachelor of Laws) degree from a recognized university.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                BL (Professional Law Course) certificate.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Must be called to the Ghana Bar.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Experience & Membership</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Minimum of two (2) years post-call experience in active legal practice.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Current member in good standing with the Ghana Bar Association (GBA).
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Skills</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Exceptional litigation and court-room advocacy skills.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Proficiency in legal drafting and research.
              </li>
            </ul>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.ctaBox}>
            <h4>Advocate for Justice</h4>
            <p>Your legal expertise is vital to maintaining the rule of law within the service.</p>
            <Link href="/register" className={styles.ctaBtn}>
              Apply for Legal Entry
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
