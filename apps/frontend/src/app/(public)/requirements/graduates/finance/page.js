'use client';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import styles from '../../styles.module.css';

export default function FinanceRequirements() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.detailHeader}>
        <Link href="/requirements/graduates" className={styles.backLink}>
          <FiArrowLeft /> Back to Graduates
        </Link>
        <h1 className={styles.detailTitle}>Accounting & Finance</h1>
        <p className={styles.detailDesc}>
          Ensure financial integrity and accountability through meticulous record-keeping, 
          auditing, and financial planning for the service.
        </p>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.mainRequirements}>
          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Academic Qualifications</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                BSc in Accounting, Finance, or related business discipline.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Minimum of Second Class Lower division.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Professional Certification</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '1rem' }}>
              Final part or professional membership of any of the following is mandatory:
            </p>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                ICAG (Institute of Chartered Accountants, Ghana)
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                ACCA (Association of Chartered Certified Accountants)
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                CIMA (Chartered Institute of Management Accountants)
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Experience</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                At least two (2) years of relevant working experience in a professional environment.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Proficiency in accounting software (SAP, Tally, etc.).
              </li>
            </ul>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.ctaBox}>
            <h4>Guardian of Resources</h4>
            <p>Maintain the highest standards of financial ethics within the GPS.</p>
            <Link href="/register" className={styles.ctaBtn}>
              Apply for Finance Entry
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
