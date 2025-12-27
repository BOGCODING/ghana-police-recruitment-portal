'use client';
import { useState, useEffect } from 'react';
import { useApplication } from '@/contexts/ApplicationContext';
import styles from './FormStep.module.css';

const DECLARATIONS = [
  'I declare that all information provided in this application is true and accurate to the best of my knowledge.',
  'I understand that providing false information will result in immediate disqualification.',
  'I confirm that I have read and understood the requirements for the Ghana Police Service.',
  'I am aware that this application does not guarantee employment.',
  'I agree to undergo medical examination, background checks, and physical fitness tests as required.',
  'I consent to the Ghana Police Service verifying any information provided in this application.',
  'I understand that if selected, I may be posted to any region in Ghana.',
  'I agree to abide by the rules and regulations of the Ghana Police Service.'
];

export default function DeclarationForm() {
  const { formData, prevStep, submitApplication, saving, applicationId, updateStepData } = useApplication();
  const [agreements, setAgreements] = useState(DECLARATIONS.map(() => false));
  const [signature, setSignature] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [hasAutoPopulated, setHasAutoPopulated] = useState(false);

  useEffect(() => {
    if (formData.declaration) {
      if (formData.declaration.agreements) setAgreements(formData.declaration.agreements);
      if (formData.declaration.signature) setSignature(formData.declaration.signature);
      if (formData.declaration.date) setDate(formData.declaration.date);
    }
  }, [formData.declaration]);

  // Auto-populate signature with applicant's full name on first load
  useEffect(() => {
    if (!hasAutoPopulated && !signature && formData.personalInfo) {
      const { firstName, middleName, lastName } = formData.personalInfo;
      if (firstName && lastName) {
        const fullName = `${firstName} ${middleName || ''} ${lastName}`.trim().toUpperCase();
        setSignature(fullName);
        setHasAutoPopulated(true);
        updateStepData('declaration', { agreements, signature: fullName, date });
      }
    }
  }, [hasAutoPopulated, signature, formData.personalInfo, agreements, date, updateStepData]);

  const allAgreed = agreements.every(a => a);

  const handleAgreementChange = (index) => {
    const newAgreements = [...agreements];
    newAgreements[index] = !newAgreements[index];
    setAgreements(newAgreements);
    updateStepData('declaration', { agreements: newAgreements, signature, date });
  };

  const handleSignatureChange = (val) => {
    const upperVal = val.toUpperCase();
    setSignature(upperVal);
    updateStepData('declaration', { agreements, signature: upperVal, date });
  };

  const handleDateChange = (val) => {
    setDate(val);
    updateStepData('declaration', { agreements, signature, date: val });
  };

  const validate = () => {
    const newErrors = {};
    if (!allAgreed) newErrors.agreements = 'You must agree to all declarations';
    if (!signature) newErrors.signature = 'Signature is required';
    if (signature && signature.length < 3) newErrors.signature = 'Enter your full name as signature';
    if (!date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      await submitApplication();
      setSubmitted(true);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ color: '#006B3F', marginBottom: '0.5rem' }}>Application Submitted!</h2>
        <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
          Your application ID: <strong>{applicationId}</strong>
        </p>
        <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
          We will review your application and contact you via email.
        </p>
        <a
          href="/dashboard"
          style={{
            display: 'inline-block',
            padding: '0.875rem 2rem',
            background: 'linear-gradient(135deg, #006B3F 0%, #004D2C 100%)',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          Go to Dashboard
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>
        <h2>Declaration & Submission</h2>
        <p>Read and agree to the following declarations to submit your application</p>
      </div>

      {errors.submit && <div className={styles.submitError}>{errors.submit}</div>}

      <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        {DECLARATIONS.map((declaration, index) => (
          <label
            key={index}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.75rem 0',
              borderBottom: index < DECLARATIONS.length - 1 ? '1px solid #e5e7eb' : 'none',
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={agreements[index]}
              onChange={() => handleAgreementChange(index)}
              style={{ marginTop: '3px', accentColor: '#006B3F' }}
            />
            <span style={{ fontSize: '0.875rem', color: '#374151' }}>{declaration}</span>
          </label>
        ))}
      </div>

      {errors.agreements && <span className={styles.errorText}>{errors.agreements}</span>}

      <div className={styles.row2}>
        <div className={styles.field}>
          <label>Signature (Type your full name) *</label>
          <input
            type="text"
            value={signature}
            onChange={(e) => handleSignatureChange(e.target.value)}
            placeholder="YOUR FULL NAME"
            className={errors.signature ? styles.error : ''}
            style={{ fontFamily: 'cursive', fontSize: '1.25rem' }}
          />
          {errors.signature && <span className={styles.errorText}>{errors.signature}</span>}
        </div>
        <div className={styles.field}>
          <label>Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => handleDateChange(e.target.value)}
            className={errors.date ? styles.error : ''}
          />
          {errors.date && <span className={styles.errorText}>{errors.date}</span>}
        </div>
      </div>

      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: '#fef3c7',
        borderRadius: '8px',
        border: '1px solid #fcd34d'
      }}>
        <p style={{ fontSize: '0.875rem', color: '#92400e', margin: 0 }}>
          <strong>⚠️ Important:</strong> Once submitted, you cannot edit your application. 
          Please review all information before submitting.
        </p>
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={prevStep} className={styles.prevBtn}>← Back</button>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={saving || !allAgreed}
        >
          {saving ? 'Submitting...' : '✓ Submit Application'}
        </button>
      </div>
    </form>
  );
}
