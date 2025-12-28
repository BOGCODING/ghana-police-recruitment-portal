'use client';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import styles from '../styles.module.css';

export default function ReligiousRequirements() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.detailHeader}>
        <Link href="/requirements" className={styles.backLink}>
          <FiArrowLeft /> Back to Requirements
        </Link>
        <h1 className={styles.detailTitle}>Religious Professionals</h1>
        <p className={styles.detailDesc}>
          Join the Police Chaplaincy and Imamate units to provide spiritual guidance, 
          counseling, and religious services to the force.
        </p>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.mainRequirements}>
          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Chaplains (Christian)</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Must possess a Degree in Theology/Biblical Studies from a recognized University/Seminary.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Must be an ordained Minister of a recognized Christian denomination.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Minimum of three (3) years post-ordination experience.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Muslim Imams</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Must possess a Degree in Islamic Studies/Arabic from a recognized University.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Must be a practicing Imam with a recognized Islamic organization.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Demonstrated leadership and counseling skills.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Common Requirements</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Age between 21 and 35 years.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Physically and mentally fit as per GPS standards.
              </li>
            </ul>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.ctaBox}>
            <h4>Spiritual Leadership</h4>
            <p>Guide those who protect. Serve the nation with faith and integrity.</p>
            <Link href="/register" className={styles.ctaBtn}>
              Religious Entry
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
