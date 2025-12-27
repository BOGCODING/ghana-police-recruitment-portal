'use client';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import styles from '../styles.module.css';

export default function TradesmenRequirements() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.detailHeader}>
        <Link href="/requirements" className={styles.backLink}>
          <FiArrowLeft /> Back to Requirements
        </Link>
        <h1 className={styles.detailTitle}>Tradesmen & Specialists</h1>
        <p className={styles.detailDesc}>
          For skilled artisans and technicians who want to apply their technical expertise 
          to support the operational readiness of the Ghana Police Service.
        </p>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.mainRequirements}>
          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Key Technical Trades</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
              Select a trade to view detailed entry requirements:
            </p>
            <div className={styles.categoryGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <Link href="/requirements/tradesmen/drivers" className={styles.categoryCard} style={{ padding: '1.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>Drivers & Mechanics</h4>
              </Link>
              <Link href="/requirements/tradesmen/sportsmen" className={styles.categoryCard} style={{ padding: '1.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>Musicians & Sportsmen</h4>
              </Link>
            </div>
            <ul className={styles.requirementList} style={{ marginTop: '1.5rem' }}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Carpenters, Electricians & Masons
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Plumbers & Welder-Fabricators
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                ICT Technicians & Radio Operators
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Trade Qualifications</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Intermediate or Craft Certificate from a recognized technical institution (NVTI, etc.).
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                A valid Driver’s License (Category D or above) for driver applicants.
              </li>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                Minimum of two (2) years practical experience in the relevant trade.
              </li>
            </ul>
          </section>

          <section className={styles.requirementGroup}>
            <h2 className={styles.groupTitle}>Academic Base</h2>
            <ul className={styles.requirementList}>
              <li className={styles.requirementItem}>
                <FiCheckCircle className={styles.checkIcon} />
                BECE/WASSCE/SSCE with at least passes in core subjects.
              </li>
            </ul>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.ctaBox}>
            <h4>Technical Expertise</h4>
            <p>Your skills are vital to our mission. Join the specialist units today.</p>
            <Link href="/register" className={styles.ctaBtn}>
              Tradesmen Entry
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
