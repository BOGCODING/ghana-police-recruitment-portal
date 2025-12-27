'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from './styles.module.css';

export default function VoucherValidationPage() {
  const [formData, setFormData] = useState({
    serialNumber: '',
    pinCode: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, validateVoucher } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const serial = searchParams.get('serial');
    const pin = searchParams.get('pin');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    if (serial || pin || email || phone) {
      setFormData(prev => ({
        ...prev,
        serialNumber: serial || prev.serialNumber,
        pinCode: pin || prev.pinCode,
        email: email || prev.email,
        phoneNumber: phone || prev.phoneNumber
      }));
    }
  }, [searchParams]);

  const formatPhone = (value) => {
    let clean = value.replace(/\D/g, '');
    if (clean.length > 3) clean = clean.slice(0, 3) + '-' + clean.slice(3);
    if (clean.length > 7) clean = clean.slice(0, 7) + '-' + clean.slice(7);
    return clean.slice(0, 12);
  };

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
      // 1. Validate Voucher
      const voucherResponse = await validateVoucher(
        formData.serialNumber,
        formData.pinCode,
        formData.email,
        formData.phoneNumber
      );

      // 2. Perform Registration with the generated serial/pin from validation
      await register({
        ...formData,
        serialNumber: voucherResponse.serialNumber,
        pinCode: voucherResponse.pinCode
      });
      
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
          <div className={styles.step}>Create Account</div>
        </div>

        <div className={styles.content}>
          <div className={styles.icon}>🎫</div>
          <h1>Validate & Register</h1>
          <p>Enter your voucher details and create your account</p>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Serial Number</label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                placeholder="Enter Serial Number"
                required
              />
            </div>

            <div className={styles.field}>
              <label>PIN Code</label>
              <input
                type="text"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                placeholder="Enter PIN Code"
                required
              />
            </div>

            <div className={styles.field}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className={styles.field}>
              <label>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: formatPhone(e.target.value) }))}
                placeholder="024-XXX-XXXX"
                required
              />
              <span className={styles.hint}>Ghana phone number (e.g. 024-XXX-XXXX)</span>
            </div>

            <div className={styles.field}>
              <label>Create Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
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

          <div className={styles.info}>
            <h3>📌 How to get a voucher?</h3>
            <p>Vouchers can be purchased from designated banks and authorized agents across Ghana.</p>
          </div>

          <div className={styles.login}>
            Already registered? <Link href="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
