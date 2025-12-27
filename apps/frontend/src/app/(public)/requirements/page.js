'use client';
import Link from 'next/link';
import { 
  FiCheckCircle, 
  FiArrowRight, 
  FiShield, 
  FiBriefcase, 
  FiUserPlus, 
  FiActivity, 
  FiSettings,
  FiInfo
} from 'react-icons/fi';
import styles from './styles.module.css';

const CATEGORIES = [
  {
    title: 'General Duty',
    desc: 'Core operational roles including patrol, law enforcement, and community safety.',
    icon: <FiShield />,
    link: '/requirements/general-duty'
  },
  {
    title: 'Graduate Professionals',
    desc: 'Specialized roles for degree holders in various fields including administration, law, and engineering.',
    icon: <FiBriefcase />,
    link: '/requirements/graduates'
  },
  {
    title: 'Medical Professionals',
    desc: 'Opportunities for doctors, nurses, and allied health professionals in the Police Hospital.',
    icon: <FiActivity />,
    link: '/requirements/medical'
  },
  {
    title: 'Tradesmen & Specialists',
    desc: 'Technical roles for skilled artisans, drivers, mechanics, and specialized technicians.',
    icon: <FiSettings />,
    link: '/requirements/tradesmen'
  }
];

const GENERAL_REQUIREMENTS = [
  'Be a Ghanaian citizen by birth',
  'Be of good character and have no criminal record',
  'Be physically and medically fit by GPS standards',
  'Minimum height: 1.67m (5ft 6in) for males, 1.60m (5ft 3in) for females',
  'Not be in any other employment or bound by bond to any institution',
  'Possess a valid email address and phone number',
  'Have the capacity to work under pressure and in difficult environments'
];

export default function RequirementsPage() {
  return (
    <div className={styles.pageContainer}>
      <header className={styles.hero}>
        <h1>Entry Requirements</h1>
        <p>Explore the diverse career paths available within the Ghana Police Service and find the one that matches your qualifications and passion.</p>
      </header>

      {/* General Requirements Hub */}
      <section className={styles.generalSection}>
        <h2 className={styles.sectionTitle}>
          <FiInfo className={styles.icon} />
          General Eligibility Criteria
        </h2>
        <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
          Regardless of the category you choose, all applicants must meet these foundational requirements to be considered for enlistment.
        </p>
        <ul className={styles.requirementList}>
          {GENERAL_REQUIREMENTS.map((req, index) => (
            <li key={index} className={styles.requirementItem}>
              <FiCheckCircle className={styles.checkIcon} />
              {req}
            </li>
          ))}
        </ul>
      </section>

      {/* Category Selection */}
      <h2 className={styles.sectionTitle}>
        <FiUserPlus className={styles.icon} />
        Recruitment Categories
      </h2>
      <div className={styles.categoryGrid}>
        {CATEGORIES.map((cat, index) => (
          <Link key={index} href={cat.link} className={styles.categoryCard}>
            <div className={styles.cardIcon}>{cat.icon}</div>
            <h3>{cat.title}</h3>
            <p>{cat.desc}</p>
            <div className={styles.learnMore}>
              View Details <FiArrowRight />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
