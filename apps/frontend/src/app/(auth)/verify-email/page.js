'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import styles from './styles.module.css';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token. Please check your link.');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/auth/verify-email/${token}`);
        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setMessage('Your email has been successfully verified. You can now log into your account.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. The link may be expired or invalid.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('A network error occurred. Please try again later.');
      }
    };

    verifyToken();
  }, [token, API_URL]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={`${styles.iconWrapper} ${styles[status]}`}>
          {status === 'loading' && <div className={styles.spinner} />}
          {status === 'success' && <FiCheckCircle />}
          {status === 'error' && <FiXCircle />}
        </div>

        <h1 className={styles.title}>
          {status === 'loading' && 'Verifying Email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h1>

        <p className={styles.message}>{message || 'Please wait while we secure your account...'}</p>

        {status === 'success' && (
          <Link href="/login" className={styles.actionBtn}>
            Proceed to Login
          </Link>
        )}

        {status === 'error' && (
          <Link href="/register" className={`${styles.actionBtn} ${styles.retryBtn}`}>
            Back to Registration
          </Link>
        )}
      </div>
    </div>
  );
}
