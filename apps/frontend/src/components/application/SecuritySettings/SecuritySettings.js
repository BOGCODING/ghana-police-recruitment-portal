'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import styles from '../ProfileForm/ProfileForm.module.css'; // Reusing form styles

const securitySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SecuritySettings({ onSubmit }) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(securitySchema)
  });

  const handleResetPassword = async (data) => {
    try {
      setError('');
      await onSubmit(data);
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleResetPassword)}>
      {success && (
        <div className={styles.successMessage}>
          Password changed successfully!
        </div>
      )}
      
      {error && (
        <div className={styles.error} style={{ marginBottom: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label}>Current Password</label>
          <input 
            type="password"
            {...register('currentPassword')} 
            className={styles.input} 
          />
          {errors.currentPassword && <span className={styles.error}>{errors.currentPassword.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>New Password</label>
          <input 
            type="password"
            {...register('newPassword')} 
            className={styles.input} 
          />
          {errors.newPassword && <span className={styles.error}>{errors.newPassword.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Confirm New Password</label>
          <input 
            type="password"
            {...register('confirmPassword')} 
            className={styles.input} 
          />
          {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword.message}</span>}
        </div>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
        {isSubmitting ? 'Updating Password...' : 'Change Password'}
      </button>
    </form>
  );
}
