'use client';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle, FiAward } from 'react-icons/fi';
import styles from '../styles.module.css';

export default function SportsRequirements() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.detailHeader}>
        <Link href="/requirements" className={styles.backLink}>
          <FiArrowLeft /> Back to Requirements
        </Link>
        <h1 className={styles.detailTitle}>Sportsmen & Athletes</h1>
        <p className={styles.detailDesc}>
          Represent the Ghana Police Service in national and international sporting competitions 
          while serving as a regular law enforcement officer.
        </p>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.mainRequirements}>
          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Sporting Achievements</h2>
            <div className={styles.infoBox} style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <FiAward style={{ color: '#15803d', fontSize: '1.5rem' }} />
              <p style={{ color: '#15803d', margin: 0, fontWeight: '500' }}>Must have represented the nation or a top-tier club in a recognized sporting discipline.</p>
            </div>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                National/Regional level athletes in Track and Field.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Professional Footballers (Men and Women).
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Boxing, Judo, Karate-Do, and other combat sports.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Volleyball, Basketball, and Handball professionals.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Academic Requirements</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                WASSCE/SSCE with at least six (6) credits including English and Mathematics.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Higher qualifications are an advantage.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Eligibility</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Age between 18 and 28 years.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Exceptional physical fitness and stamina.
              </li>
            </ul>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.ctaBox}>
            <h4>Athletic Pride</h4>
            <p>Combine your athletic talent with a career in law enforcement.</p>
            <Link href="/register" className={styles.ctaBtn}>
              Sports Entry
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
