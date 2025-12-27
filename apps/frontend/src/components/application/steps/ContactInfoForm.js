'use client';
import { useState, useEffect } from 'react';
import { useApplication } from '@/contexts/ApplicationContext';
import styles from './FormStep.module.css';

export default function ContactInfoForm() {
  const { formData, nextStep, prevStep, updateStepData, saving } = useApplication();
  const [data, setData] = useState({
    email: '',
    phoneNumber: '',
    alternatePhone: '',
    residentialAddress: '',
    postalAddress: '',
    digitalAddress: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (formData.contactInfo) {
      const info = formData.contactInfo;
      setData(prev => ({ 
        ...prev, 
        ...info,
        // Map snake_case from DB to camelCase for state
        phoneNumber: info.phone_number || info.phoneNumber || prev.phoneNumber,
        alternatePhone: info.alternate_phone || info.alternatePhone || prev.alternatePhone,
        residentialAddress: info.residential_address || info.residentialAddress || prev.residentialAddress,
        postalAddress: info.postal_address || info.postalAddress || prev.postalAddress,
        digitalAddress: info.digital_address || info.digitalAddress || prev.digitalAddress,
        emergencyContactName: info.emergency_contact_name || info.emergencyContactName || prev.emergencyContactName,
        emergencyContactPhone: info.emergency_contact_phone || info.emergencyContactPhone || prev.emergencyContactPhone,
        emergencyContactRelation: info.emergency_contact_relation || info.emergencyContactRelation || prev.emergencyContactRelation
      }));
    }
  }, [formData.contactInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const upperValue = ['residentialAddress', 'postalAddress', 'emergencyContactName'].includes(name)
      ? value.toUpperCase()
      : value;
    
    setData(prev => ({ ...prev, [name]: upperValue }));
    setErrors(prev => ({ ...prev, [name]: null }));
    updateStepData('contactInfo', { ...data, [name]: upperValue });
  };

  const validate = () => {
    const newErrors = {};
    if (!data.email) newErrors.email = 'Email is required';
    if (!data.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!data.residentialAddress) newErrors.residentialAddress = 'Residential address is required';
    if (!data.emergencyContactName) newErrors.emergencyContactName = 'Emergency contact name is required';
    if (!data.emergencyContactPhone) newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    
    const phoneRegex = /^0[235][0-9]{8}$/;
    if (data.phoneNumber && !phoneRegex.test(data.phoneNumber.replace(/[-\s]/g, ''))) {
      newErrors.phoneNumber = 'Invalid Ghana phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await nextStep('contactInfo', data);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>
        <h2>Contact Details</h2>
        <p>Provide your contact information for communication</p>
      </div>

      {errors.submit && <div className={styles.submitError}>{errors.submit}</div>}

      <div className={styles.row2}>
        <div className={styles.field}>
          <label>Email Address *</label>
          <input
            type="email"
            name="email"
            value={data.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            className={errors.email ? styles.error : ''}
          />
          {errors.email && <span className={styles.errorText}>{errors.email}</span>}
        </div>
        <div className={styles.field}>
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={data.phoneNumber}
            onChange={handleChange}
            placeholder="024XXXXXXX"
            className={errors.phoneNumber ? styles.error : ''}
          />
          {errors.phoneNumber && <span className={styles.errorText}>{errors.phoneNumber}</span>}
        </div>
      </div>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label>Alternate Phone</label>
          <input
            type="tel"
            name="alternatePhone"
            value={data.alternatePhone}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>
        <div className={styles.field}>
          <label>Digital Address (GPS)</label>
          <input
            type="text"
            name="digitalAddress"
            value={data.digitalAddress}
            onChange={handleChange}
            placeholder="GA-XXX-XXXX"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label>Residential Address *</label>
        <textarea
          name="residentialAddress"
          value={data.residentialAddress}
          onChange={handleChange}
          placeholder="HOUSE NUMBER, STREET, AREA, CITY"
          rows={2}
          className={errors.residentialAddress ? styles.error : ''}
        />
        {errors.residentialAddress && <span className={styles.errorText}>{errors.residentialAddress}</span>}
      </div>

      <div className={styles.field}>
        <label>Postal Address</label>
        <input
          type="text"
          name="postalAddress"
          value={data.postalAddress}
          onChange={handleChange}
          placeholder="P.O. BOX XXX, CITY"
        />
      </div>

      <h3 style={{ marginTop: '1rem', fontSize: '1rem', color: 'var(--gray-700)' }}>Emergency Contact</h3>

      <div className={styles.row3}>
        <div className={styles.field}>
          <label>Contact Name *</label>
          <input
            type="text"
            name="emergencyContactName"
            value={data.emergencyContactName}
            onChange={handleChange}
            placeholder="FULL NAME"
            className={errors.emergencyContactName ? styles.error : ''}
          />
          {errors.emergencyContactName && <span className={styles.errorText}>{errors.emergencyContactName}</span>}
        </div>
        <div className={styles.field}>
          <label>Contact Phone *</label>
          <input
            type="tel"
            name="emergencyContactPhone"
            value={data.emergencyContactPhone}
            onChange={handleChange}
            placeholder="024XXXXXXX"
            className={errors.emergencyContactPhone ? styles.error : ''}
          />
          {errors.emergencyContactPhone && <span className={styles.errorText}>{errors.emergencyContactPhone}</span>}
        </div>
        <div className={styles.field}>
          <label>Relationship</label>
          <select name="emergencyContactRelation" value={data.emergencyContactRelation} onChange={handleChange}>
            <option value="">Select</option>
            <option value="PARENT">PARENT</option>
            <option value="SIBLING">SIBLING</option>
            <option value="SPOUSE">SPOUSE</option>
            <option value="RELATIVE">RELATIVE</option>
            <option value="FRIEND">FRIEND</option>
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={prevStep} className={styles.prevBtn}>← Back</button>
        <button type="submit" className={styles.nextBtn} disabled={saving}>
          {saving ? 'Saving...' : 'Continue →'}
        </button>
      </div>
    </form>
  );
}
