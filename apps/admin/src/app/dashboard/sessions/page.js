'use client';
import { useState, useEffect, useCallback } from 'react';
import { FiMonitor, FiUser, FiGlobe, FiClock, FiXCircle, FiShield, FiAlertTriangle } from 'react-icons/fi';
import api from '@/lib/axios';
import styles from './page.module.css';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [terminating, setTerminating] = useState(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/sessions');
      if (data.success) {
        setSessions(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleTerminate = async (adminId, sessionId) => {
    if (!confirm('Are you sure you want to terminate this session? The user will be logged out.')) return;
    
    setTerminating(sessionId);
    try {
      const { data } = await api.delete(`/admin/sessions/${adminId}/${sessionId}`);
      if (data.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      }
    } catch (err) {
      console.error('Failed to terminate session:', err);
      alert('Failed to terminate session.');
    } finally {
      setTerminating(null);
    }
  };

  if (loading && sessions.length === 0) return <div className={styles.loading}>Loading active sessions...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleInfo}>
          <FiShield className={styles.headerIcon} />
          <div>
            <h1>Active Admin Sessions</h1>
            <p>Monitor real-time access to the administrative panel</p>
          </div>
        </div>
        <button onClick={fetchSessions} className={styles.refreshBtn}>Refresh</button>
      </header>

      {sessions.length === 0 ? (
        <div className={styles.emptyState}>
          <FiAlertTriangle size={48} />
          <p>No active sessions found (Redis session tracking might be disabled or empty)</p>
        </div>
      ) : (
        <div className={styles.sessionGrid}>
          {sessions.map(session => (
            <div key={session.id} className={styles.sessionCard}>
              <div className={styles.cardHeader}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>{session.email[0].toUpperCase()}</div>
                  <div className={styles.nameGroup}>
                    <span className={styles.email}>{session.email}</span>
                    <span className={styles.roleBadge}>{session.role}</span>
                  </div>
                </div>
                <button 
                  className={styles.terminateBtn}
                  onClick={() => handleTerminate(session.adminId, session.id)}
                  disabled={terminating === session.id}
                >
                  {terminating === session.id ? '...' : <FiXCircle />}
                </button>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.metaRow}>
                  <FiGlobe /> <span><strong>IP:</strong> {session.ip}</span>
                </div>
                <div className={styles.metaRow}>
                  <FiClock /> <span><strong>Login:</strong> {new Date(session.loginAt).toLocaleString()}</span>
                </div>
                <div className={styles.metaRow}>
                  <FiMonitor /> 
                  <span className={styles.userAgent} title={session.userAgent}>
                    {session.userAgent.split(') ')[1] || session.userAgent.substring(0, 30)}...
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
