'use client';
import { useState } from 'react';
import styles from './track.module.css';
import { api } from '@/utils/api';

export default function TrackApplicationPage() {
  const [appId, setAppId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!appId.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await api(`/api/applications/track/${appId.trim().toUpperCase()}`);
      setResult(data.data);
    } catch (err) {
      setError(err.message || 'Application not found. Please verify your ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Track Application</h1>
          <p>Enter your Application ID to check your recruitment status</p>
        </div>

        <form onSubmit={handleTrack} className={styles.searchSection}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="E.G. GPS-2025-XXXXXX"
              className={styles.input}
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              required
            />
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Searching...' : 'Track Status'}
            </button>
          </div>
        </form>

        {error && <div className={styles.error}>{error}</div>}

        {result && (
          <div className={styles.results}>
            <div className={styles.statusCard}>
              <div className={styles.info}>
                <h3>Tracking Results</h3>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Applicant Name:</span>
                  <span className={styles.value}>{result.applicantName}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Application ID:</span>
                  <span className={styles.value}>{result.applicationId}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Date Submitted:</span>
                  <span className={styles.value}>
                    {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>
              </div>
              <div className={styles.statusWrapper}>
                <span className={`${styles.statusBadge} ${styles['status_' + result.status]}`}>
                  {result.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
