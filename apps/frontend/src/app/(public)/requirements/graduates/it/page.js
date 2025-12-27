'use client';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import styles from '../../styles.module.css';

export default function ITRequirements() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.detailHeader}>
        <Link href="/requirements/graduates" className={styles.backLink}>
          <FiArrowLeft /> Back to Graduates
        </Link>
        <h1 className={styles.detailTitle}>IT & Cyber Security</h1>
        <p className={styles.detailDesc}>
          Leverage your technical expertise to protect the nation's digital infrastructure 
          and support modern policing through advanced technology.
        </p>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.mainRequirements}>
          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Academic Background</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                BSc/BTech in Computer Science, Information Technology, Cyber Security, or related field.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Minimum of Second Class Lower division.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Technical Competencies</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Networking & Infrastructure Management
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Information Security & Ethical Hacking
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Software Development & Systems Analysis
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Database Administration (SQL/NoSQL)
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Professional Certification</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '1rem' }}>
              Possession of any of the following is a significant advantage:
            </p>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                CompTIA Security+ / CEH
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                CCNA / CCNP
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Microsoft Certified Professionals (MCP)
              </li>
            </ul>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.ctaBox}>
            <h4>Secure the Digital Front</h4>
            <p>Join our elite cyber units and lead the digital transformation of the Ghana Police Service.</p>
            <Link href="/register" className={styles.ctaBtn}>
              Apply for IT Entry
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
