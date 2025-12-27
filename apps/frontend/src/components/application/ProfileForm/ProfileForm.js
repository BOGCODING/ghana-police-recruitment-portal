'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import styles from './ProfileForm.module.css';

const profileSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().regex(/^[0-9+]{10,15}$/, 'Invalid phone number format'),
});

export default function ProfileForm({ initialData, onSubmit }) {
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      email: initialData?.email || '',
      phoneNumber: initialData?.phoneNumber || '',
    }
  });

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
      {success && (
        <div className={styles.successMessage}>
          Profile updated successfully!
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label}>Full Name</label>
          <input 
            {...register('fullName')} 
            className={styles.input} 
            placeholder="John Doe"
          />
          {errors.fullName && <span className={styles.error}>{errors.fullName.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email Address</label>
          <input 
            {...register('email')} 
            className={styles.input} 
            placeholder="john@example.com"
          />
          {errors.email && <span className={styles.error}>{errors.email.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Phone Number</label>
          <input 
            {...register('phoneNumber')} 
            className={styles.input} 
            placeholder="024XXXXXXX"
          />
          {errors.phoneNumber && <span className={styles.error}>{errors.phoneNumber.message}</span>}
        </div>
        
        <div className={styles.field}>
          <label className={styles.label}>Serial Number</label>
          <input 
            className={styles.input} 
            value={initialData?.serialNumber || ''} 
            disabled 
          />
          <span className={styles.label} style={{ fontSize: '0.75rem', fontWeight: 400 }}>
            Serial number cannot be changed.
          </span>
        </div>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
        {isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}
      </button>
    </form>
  );
}
