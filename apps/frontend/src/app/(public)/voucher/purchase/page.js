'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FiSmartphone, 
  FiCreditCard, 
  FiChevronLeft, 
  FiChevronRight, 
  FiCheckCircle,
  FiAlertTriangle,
  FiCopy
} from 'react-icons/fi';
import styles from './styles.module.css';

import StepIndicator from './StepIndicator';

const STEPS = [
  { id: 'selection', label: 'Info' },
  { id: 'payment', label: 'Payment' },
  { id: 'confirmation', label: 'Success' }
];

export default function VoucherPurchasePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    paymentMethod: 'momo',
    paymentNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [voucher, setVoucher] = useState(null);
  const [price, setPrice] = useState(220);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/system/voucher-price`);
        const data = await response.json();
        if (data.success) {
          setPrice(data.data.price);
        }
      } catch (error) {
        console.error('Failed to fetch voucher price:', error);
      }
    };
    fetchPrice();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 0) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
      if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    } else if (currentStep === 1) {
      if (!formData.paymentNumber) newErrors.paymentNumber = 'Payment number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = async () => {
    if (!validateStep()) return;
    
    if (currentStep === 1) {
      await handlePurchase();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/vouchers/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Normalize response
        const voucherData = data.data;
        setVoucher({
          serial_number: voucherData.serial_number || voucherData.serialNumber,
          pin_code: voucherData.pin_code || voucherData.pinCode
        });
        setCurrentStep(2);
      } else {
        alert(data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('An error occurred during purchase');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className={styles.purchaseContainer}>
      <div className={styles.header}>
        <h1>Recruitment Voucher</h1>
        <p>Purchase your E-Voucher to begin your application</p>
      </div>

      <div className={styles.purchaseCard}>
        <div className={styles.cardContent}>
          <StepIndicator steps={STEPS} currentStep={currentStep} />

          {currentStep === 0 && (
            <div className={styles.formContainer}>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                  />
                  {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
                </div>
                <div className={styles.inputGroup}>
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                  />
                  {errors.lastName && <span className={styles.error}>{errors.lastName}</span>}
                </div>
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && <span className={styles.error}>{errors.email}</span>}
                </div>
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label>Phone Number (MTN/AirtelTigo/Telecel)</label>
                  <input 
                    type="tel" 
                    name="phoneNumber" 
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="024XXXXXXX"
                  />
                  {errors.phoneNumber && <span className={styles.error}>{errors.phoneNumber}</span>}
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className={styles.paymentContainer}>
              <div className={styles.paymentOptions}>
                <div 
                  className={`${styles.paymentOption} ${formData.paymentMethod === 'momo' ? styles.active : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'momo' }))}
                >
                  <FiSmartphone className={styles.paymentIcon} />
                  <span className={styles.paymentLabel}>Mobile Money</span>
                </div>
                <div 
                  className={`${styles.paymentOption} ${formData.paymentMethod === 'card' ? styles.active : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                >
                  <FiCreditCard className={styles.paymentIcon} />
                  <span className={styles.paymentLabel}>Debit/Credit Card</span>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>
                  {formData.paymentMethod === 'momo' ? 'Momo Number' : 'Card Number'}
                </label>
                <input 
                  type="text" 
                  name="paymentNumber" 
                  value={formData.paymentNumber}
                  onChange={handleInputChange}
                  placeholder={formData.paymentMethod === 'momo' ? '024XXXXXXX' : 'XXXX XXXX XXXX XXXX'}
                />
                {errors.paymentNumber && <span className={styles.error}>{errors.paymentNumber}</span>}
              </div>

              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p style={{ fontWeight: 600, fontSize: '1.2rem', color: 'var(--primary-700)' }}>
                  Total: GHC {price.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && voucher && (
            <div className={styles.successCard}>
              <FiCheckCircle className={styles.successIcon} />
              <h2>Payment Successful!</h2>
              <p>Your recruitment voucher has been generated. Please save these details safely.</p>

              <div className={styles.voucherBox}>
                <div className={styles.voucherItem}>
                  <label>Serial Number</label>
                  <div className={styles.voucherValue}>{voucher.serial_number}</div>
                  <button onClick={() => copyToClipboard(voucher.serial_number)} className={styles.copyBtn}>
                    <FiCopy /> Copy
                  </button>
                </div>
                <div className={styles.voucherItem}>
                  <label>PIN Code</label>
                  <div className={styles.voucherValue}>{voucher.pin_code}</div>
                  <button onClick={() => copyToClipboard(voucher.pin_code)} className={styles.copyBtn}>
                    <FiCopy /> Copy
                  </button>
                </div>
              </div>

              <div className={styles.warning}>
                <FiAlertTriangle className={styles.warningIcon} />
                <p>
                  <strong>IMPORTANT:</strong> Do not share these credentials with anyone. 
                  You will need them to register and log in to your application portal.
                </p>
              </div>

              <div className={styles.actions} style={{ justifyContent: 'center', marginTop: '3rem' }}>
                <Link 
                  href={`/voucher/validate?serial=${voucher.serial_number}&pin=${voucher.pin_code}&email=${formData.email}&phone=${formData.phoneNumber}`} 
                  className={styles.btn + ' ' + styles.btnPrimary}
                >
                  Proceed to Registration <FiChevronRight />
                </Link>
              </div>
            </div>
          )}

          {currentStep < 2 && (
            <div className={styles.actions}>
              {currentStep > 0 && (
                <button onClick={prevStep} className={styles.btn + ' ' + styles.btnSecondary}>
                  <FiChevronLeft /> Back
                </button>
              )}
              <button 
                onClick={nextStep} 
                className={styles.btn + ' ' + styles.btnPrimary}
                disabled={loading}
              >
                {loading ? 'Processing...' : currentStep === 1 ? 'Make Payment' : 'Next Step'} 
                {!loading && <FiChevronRight />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
