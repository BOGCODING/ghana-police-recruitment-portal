'use client';
import Link from 'next/link';
import { FiTarget, FiEye, FiShield, FiUsers, FiAward, FiStar } from 'react-icons/fi';
import styles from './styles.module.css';

export default function AboutPage() {
  return (
    <div className={styles.pageContainer}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1>Serving with Integrity</h1>
        <p>Learn more about the Ghana Police Service, our rich history, and our unwavering commitment to safeguarding the nation.</p>
      </section>

      {/* Mission & Vision Grid */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <FiTarget />
          </div>
          <h2>Our Mission</h2>
          <p>
            The Ghana Police Service exists to deliver efficient and effective policing services by maintaining law and order, 
            and ensuring the protection of life and property in partnership with the community.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <FiEye />
          </div>
          <h2>Our Vision</h2>
          <p>
            To become a world-class Police Service capable of delivering planned, democratic, protective, 
            and peaceful services up to international standards of best practice.
          </p>
        </div>
      </div>

      {/* History Section */}
      <section className={styles.historySection}>
        <h2 className={styles.sectionTitle}>Our History</h2>
        <div className={styles.historyContent}>
          <p>
            Policing in Ghana (then Gold Coast) was originally performed by traditional authorities. 
            The first formal police force was established by the British colonial administration in 1894, 
            known as the Gold Coast Constabulary.
          </p>
          <p>
            Over the decades, the service has evolved from a colonial tool into a modern, democratic institution. 
            Following Ghana's independence in 1957, the service underwent significant restructuring to align with 
            national aspirations and the principles of democratic policing.
          </p>
          <p>
            Today, the Ghana Police Service is a cornerstone of the nation’s security architecture, 
            comprising multiple specialized units including the Criminal Investigations Department (CID), 
            Motor Traffic and Transport Department (MTTD), and various specialized tactical units.
          </p>
          <p>
            We continue to modernize through technology, enhanced training, and community engagement 
            to meet the security challenges of the 21st century.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className={styles.valuesSection}>
        <h2 className={styles.sectionTitle}>Core Values</h2>
        <div className={styles.valuesGrid}>
          <div className={styles.valueItem}>
            <FiShield className={styles.valueIcon} />
            <h3 className={styles.valueTitle}>Integrity</h3>
            <p>Adhering to the highest ethical and moral standards.</p>
          </div>
          <div className={styles.valueItem}>
            <FiAward className={styles.valueIcon} />
            <h3 className={styles.valueTitle}>Professionalism</h3>
            <p>Executing duties with skill, competence, and respect.</p>
          </div>
          <div className={styles.valueItem}>
            <FiUsers className={styles.valueIcon} />
            <h3 className={styles.valueTitle}>Accountability</h3>
            <p>Taking responsibility for our actions and decisions.</p>
          </div>
          <div className={styles.valueItem}>
            <FiStar className={styles.valueIcon} />
            <h3 className={styles.valueTitle}>Service</h3>
            <p>Prioritizing the safety and well-being of all citizens.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2>Become Part of the Force</h2>
        <p>
          We are looking for dedicated individuals ready to serve and protect. 
          Explore our requirements and start your journey with the Ghana Police Service today.
        </p>
        <Link href="/requirements" className={styles.ctaButton}>
          View Requirements
        </Link>
      </section>
    </div>
  );
}
