'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from './styles.module.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    serialNumber: '',
    pinCode: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [voucherData, setVoucherData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkSettings = async () => {
      try {
        const data = await api('/api/system/public-settings');
        const settings = data.data || [];
        const allowReg = settings.find(s => s.key === 'allow_new_registrations');

        if (allowReg && allowReg.value === false) {
          alert('New registrations are currently disabled.');
          router.push('/');
        }
      } catch (err) {
        console.error('Failed to check registration settings', err);
      }
    };
    checkSettings();

    const stored = sessionStorage.getItem('voucherData');
    if (stored) {
      const data = JSON.parse(stored);
      setVoucherData(data);
      setFormData(prev => ({
        ...prev,
        serialNumber: data.serialNumber,
        pinCode: data.pinCode,
        email: data.email,
        phoneNumber: data.phoneNumber
      }));
    } else {
      router.push('/voucher/validate');
    }
  }, [router]);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('One special character');
    return errors;
  };

  const passwordErrors = validatePassword(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwordErrors.length > 0) {
      setError('Please fix password requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      sessionStorage.removeItem('voucherData');
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!voucherData) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/voucher/validate" className={styles.backLink}>← Back</Link>
          <div className={styles.step}>Step 2 of 2</div>
        </div>

        <div className={styles.content}>
          <h1>Create Your Account</h1>
          <p>Use your credentials to complete registration</p>

          <div className={styles.credentials}>
            <div className={styles.credItem}>
              <span className={styles.credLabel}>Serial Number</span>
              <span className={styles.credValue}>{voucherData.serialNumber}</span>
            </div>
            <div className={styles.credItem}>
              <span className={styles.credLabel}>PIN Code</span>
              <span className={styles.credValue}>{voucherData.pinCode}</span>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className={styles.disabled}
              />
            </div>

            <div className={styles.field}>
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                disabled
                className={styles.disabled}
              />
            </div>

            <div className={styles.field}>
              <label>Create Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <div className={styles.passwordRequirements}>
                {['At least 8 characters', 'One uppercase letter', 'One lowercase letter', 'One number', 'One special character'].map((req, i) => (
                  <div key={i} className={`${styles.req} ${!passwordErrors.includes(req) ? styles.reqMet : ''}`}>
                    {!passwordErrors.includes(req) ? '✓' : '○'} {req}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label>Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                required
              />
              {formData.confirmPassword && (
                <div className={passwordsMatch ? styles.match : styles.noMatch}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading || passwordErrors.length > 0 || !passwordsMatch}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
