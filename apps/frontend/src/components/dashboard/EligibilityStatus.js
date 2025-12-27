'use client';
import { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import styles from './EligibilityStatus.module.css';

export default function EligibilityStatus() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1];
        const res = await fetch(`${API_URL}/api/eligibility/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setReport(data.data);
        }
      } catch (error) {
        console.error('Eligibility fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [API_URL]);

  if (loading) return <div className={styles.skeleton}>Checking eligibility...</div>;
  if (!report) return null;

  return (
    <div className={`${styles.card} ${report.eligible ? styles.eligible : styles.ineligible}`}>
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          {report.eligible ? (
            <FiCheckCircle className={styles.mainIcon} />
          ) : (
            <FiXCircle className={styles.mainIcon} />
          )}
          <div>
            <h3>{report.eligible ? 'Eligible for Recruitment' : 'Ineligible for Recruitment'}</h3>
            <p>{report.eligible ? 'You meet all the basic requirements for your category.' : 'Some requirements are not yet met. See details below.'}</p>
          </div>
        </div>
        <div className={styles.score}>
          <span className={styles.scoreLabel}>Screening Status</span>
          <span className={styles.scoreValue}>{report.eligible ? 'PASSED' : 'FAILED'}</span>
        </div>
      </div>

      <div className={styles.checksGrid}>
        {report.checks.map((check, idx) => (
          <div key={idx} className={`${styles.checkItem} ${styles[check.status]}`}>
            <div className={styles.checkIcon}>
              {check.status === 'passed' ? <FiCheckCircle /> : <FiAlertCircle />}
            </div>
            <div className={styles.checkContent}>
              <div className={styles.checkTop}>
                <span className={styles.checkName}>{check.name}</span>
                <span className={styles.checkValue}>{check.value}</span>
              </div>
              <p className={styles.checkMessage}>{check.message}</p>
            </div>
          </div>
        ))}
      </div>

      {report.recommendations.length > 0 && (
        <div className={styles.recommendations}>
          <h4><FiTrendingUp /> Recommendations</h4>
          <ul>
            {report.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
