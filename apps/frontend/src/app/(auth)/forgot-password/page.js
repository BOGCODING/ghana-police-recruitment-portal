'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/utils/api';
import styles from './styles.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await api('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      setMessage(data.message || 'If this email exists, a reset link has been sent.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/login" className={styles.backLink}>← Back to Login</Link>
          <div className={styles.logo}>🛡️</div>
        </div>

        <div className={styles.content}>
          <h1>Reset Password</h1>
          <p>Enter your registered email address and we'll send you instructions to reset your password.</p>

          {message && <div className={styles.success}>{message}</div>}
          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className={styles.footer}>
            Need help? Contact <a href="mailto:support@gps.gov.gh">gps.support</a>
          </div>
        </div>
      </div>
    </main>
  );
}
