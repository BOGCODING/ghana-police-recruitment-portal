'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './ApplicationStatus.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import successAnim from '../../../../public/animations/success.json';
import loadingAnim from '../../../../public/animations/loading.json';

import { api } from '../../../utils/api';

export default function ApplicationStatus() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api('/api/applications/history');
        if (data && data.data) {
          setHistory(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchHistory();
    }
  }, [user]);

  const getActionLabel = (action) => {
    const labels = {
      'SUBMIT_APPLICATION': 'Application Submitted',
      'APPROVE_APPLICATION': 'Application Approved',
      'REJECT_APPLICATION': 'Application Rejected',
      'REQUEST_DOCUMENTS': 'Documents Requested',
      'LOGIN': 'Logged In',
      'REGISTER': 'Account Created'
    };
    return labels[action] || action.replace(/_/g, ' ');
  };

  const getStatusClass = (action) => {
    if (action.includes('APPROVE') || action.includes('SUBMIT') || action.includes('REGISTER')) return styles.completed;
    if (action.includes('REJECT')) return styles.rejected;
    if (action.includes('REQUEST')) return styles.warning;
    return '';
  };

  if (loading) {
    return <div className={styles.container}>Loading status...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.statusHeader}>
        <h3>Application History</h3>
        <div className={styles.statusIllustration}>
          {user?.applicationStatus === 'APPROVED' ? (
            <Lottie animationData={successAnim} loop={false} className={styles.lottie} style={{ width: 40, height: 40 }} />
          ) : user?.applicationStatus === 'SUBMITTED' || user?.applicationStatus === 'UNDER_REVIEW' ? (
            <Lottie animationData={loadingAnim} className={styles.lottie} style={{ width: 40, height: 40 }} />
          ) : null}
        </div>
      </div>
      
      <div className={styles.timeline}>
        {history.length > 0 ? (
          <AnimatePresence>
            {history.map((item, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${styles.item} ${getStatusClass(item.action)} ${index === 0 ? styles.active : ''}`}
              >
              <div className={styles.dot}></div>
              <div className={styles.info}>
                <h4>{getActionLabel(item.action)}</h4>
                <p>
                  {item.created_at && !isNaN(new Date(item.created_at).getTime()) 
                    ? `${new Date(item.created_at).toLocaleDateString()} at ${new Date(item.created_at).toLocaleTimeString()}`
                    : 'Recently'
                  }
                </p>
               
                {item.details && item.details.applicationId && (
                  <p className={styles.applicationId}>
                    ID: {typeof item.details.applicationId === 'object' ? JSON.stringify(item.details.applicationId) : item.details.applicationId}
                  </p>
                )}

                {item.details && item.details.reason && (
                  <p className={styles.reason}>Reason: {typeof item.details.reason === 'string' ? item.details.reason : JSON.stringify(item.details.reason)}</p>
                )}
                {item.details && item.details.comments && (
                  <p className={styles.comments}>Note: {typeof item.details.comments === 'string' ? item.details.comments : JSON.stringify(item.details.comments)}</p>
                )}
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${styles.item} ${styles.active}`}
          >
            <div className={styles.dot}></div>
            <div className={styles.info}>
              <h4>Application Started</h4>
              <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Just now'}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
