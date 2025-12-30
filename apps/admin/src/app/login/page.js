import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import styles from './login.module.css';

export default function AdminLogin() {
  const recaptchaRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedAdminEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem('rememberedAdminEmail', email);
      } else {
        localStorage.removeItem('rememberedAdminEmail');
      }

      const captchaToken = recaptchaRef.current?.getValue();
      if (!captchaToken && process.env.NODE_ENV === 'production') {
        setError('Please complete the CAPTCHA verification');
        setLoading(false);
        return;
      }

      await login(email, password, captchaToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo}>🛡️</div>
          <h1>Admin Portal</h1>
          <p>Ghana Police Service Recruitment</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="boglogodwin@gps.gov.gh"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className={styles.options}>
            <label className={styles.remember}>
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
          </div>

          <div className={styles.captcha}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
              theme="light"
            />
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className={styles.footer}>
          Authorized personnel only. All access is logged.
        </p>
      </div>
    </main>
  );
}
