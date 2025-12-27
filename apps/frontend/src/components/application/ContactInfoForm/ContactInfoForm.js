'use client';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCallback, useEffect, useRef } from 'react';
import { useApplication } from '@/contexts/ApplicationContext';
import styles from './ContactInfoForm.module.css';
import Input from '../../common/Input/Input';
import WizardNavigation from '../WizardNavigation';
import AutoSave from '../AutoSave/AutoSave';

// Ghana phone number regex: (+233|233|0) followed by 2 digits, optional separator, 3 digits, optional separator, 4 digits
const ghanaPhoneRegex = /^(\+233|233|0)\d{2}[-\s]?\d{3}[-\s]?\d{4}$/;
const gpsAddressRegex = /^[A-Z]{2}-\d{3,4}-\d{4}$/;

const contactSchema = z.object({
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string()
    .regex(ghanaPhoneRegex, 'Invalid phone number format (e.g., 024 123 4567)'),
  alternatePhone: z.string()
    .regex(ghanaPhoneRegex, 'Invalid phone number format')
    .or(z.literal(''))
    .optional(),
  residentialAddress: z.string().min(5, 'Residential address is required').max(200),
  postalAddress: z.string().max(200).optional().or(z.literal('')),
  digitalAddress: z.string()
    .regex(gpsAddressRegex, 'Invalid Ghana Post GPS format (e.g., GA-123-4567)')
    .or(z.literal(''))
    .optional(),
  emergencyContactName: z.string().min(3, 'Emergency contact name is required').max(100),
  emergencyContactPhone: z.string()
    .regex(ghanaPhoneRegex, 'Invalid phone number format'),
  emergencyContactRelation: z.string().min(2, 'Relationship is required').max(50),
});

export default function ContactInfoForm() {
  const { formData, nextStep, dataLoaded } = useApplication();
  const hasInitializedRef = useRef(false);

  // Normalize snake_case data from backend to camelCase for form state
  const getNormalizedDefaultValues = useCallback(() => {
    const data = formData.contactInfo || {};
    return {
      email: data.email || '',
      phoneNumber: data.phoneNumber || '',
      alternatePhone: data.alternatePhone || '',
      residentialAddress: data.residentialAddress || '',
      digitalAddress: data.digitalAddress || '',
      postalAddress: data.postalAddress || '',
      emergencyContactName: data.emergencyContactName || '',
      emergencyContactPhone: data.emergencyContactPhone || '',
      emergencyContactRelation: data.emergencyContactRelation || ''
    };
  }, [formData.contactInfo]);

  const methods = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: getNormalizedDefaultValues()
  });

  const { register, handleSubmit, reset, formState: { errors } } = methods;

  // Re-initialize form when data is loaded from context
  useEffect(() => {
    if (dataLoaded && !hasInitializedRef.current) {
      reset(getNormalizedDefaultValues());
      hasInitializedRef.current = true;
    }
  }, [dataLoaded, reset, getNormalizedDefaultValues]);

  const onSubmit = async (data) => {
    try {
      await nextStep('contactInfo', data);
    } catch (error) {
      console.error('Failed to save contact info:', error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.formSection}>
        <AutoSave stepKey="contactInfo" />
        <h3 className={styles.sectionTitle}>Basic Contact</h3>
        <div className={styles.formGrid}>
          <Input 
            label="Email Address" 
            type="email"
            {...register('email')} 
            error={errors.email?.message} 
            placeholder="example@email.com"
          />
          <Input 
            label="Primary Phone Number" 
            {...register('phoneNumber')} 
            error={errors.phoneNumber?.message} 
            placeholder="024 XXX XXXX"
          />
          <Input 
            label="Alternate Phone Number (Optional)" 
            {...register('alternatePhone')} 
            error={errors.alternatePhone?.message} 
          />
        </div>

        <h3 className={styles.sectionTitle}>Address Information</h3>
        <div className={styles.formGrid}>
          <Input 
            label="Residential Address" 
            {...register('residentialAddress')} 
            error={errors.residentialAddress?.message} 
            placeholder="House No, Street Name, Area"
          />
          <Input 
            label="Digital Address (GhanaPost GPS)" 
            {...register('digitalAddress')} 
            error={errors.digitalAddress?.message} 
            placeholder="GA-123-4567"
          />
          <Input 
            label="Postal Address (Optional)" 
            {...register('postalAddress')} 
            error={errors.postalAddress?.message} 
            placeholder="P.O. Box..."
          />
        </div>

        <h3 className={styles.sectionTitle}>Emergency Contact</h3>
        <div className={styles.formGrid}>
          <Input 
            label="Full Name" 
            {...register('emergencyContactName')} 
            error={errors.emergencyContactName?.message} 
          />
          <Input 
            label="Phone Number" 
            {...register('emergencyContactPhone')} 
            error={errors.emergencyContactPhone?.message} 
          />
          <Input 
            label="Relationship" 
            {...register('emergencyContactRelation')} 
            error={errors.emergencyContactRelation?.message} 
            placeholder="e.g. Parent, Sibling, Spouse"
          />
        </div>

        <div style={{ marginTop: '2rem' }}>
          <WizardNavigation />
        </div>
      </form>
    </FormProvider>
  );
}
