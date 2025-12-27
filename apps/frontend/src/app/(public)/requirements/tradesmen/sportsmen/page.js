'use client';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import styles from '../../styles.module.css';

export default function SportsRequirements() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.detailHeader}>
        <Link href="/requirements/tradesmen" className={styles.backLink}>
          <FiArrowLeft /> Back to Tradesmen
        </Link>
        <h1 className={styles.detailTitle}>Sportsmen & Women</h1>
        <p className={styles.detailDesc}>
          Represent the Ghana Police Service in national and international sporting competitions 
          while serving as a dedicated police officer.
        </p>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.mainRequirements}>
          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Sporting Achievements</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Must have represented the region or nation in a recognized sporting event.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Possession of medals or certificates of achievement from reputable bodies.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Disciplines Needed</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
              We are currently seeking athletes in:
            </p>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Football (Mens & Womens)
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Athletics (Track & Field)
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Volleyball & Handball
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Boxing & Martial Arts
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
            <h4>Strive for Gold</h4>
            <p>Combine your athletic talent with a career in policing.</p>
            <Link href="/register" className={styles.ctaBtn}>
              Sports Entry
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
