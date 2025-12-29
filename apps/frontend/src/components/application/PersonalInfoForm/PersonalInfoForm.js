'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useApplication } from '@/contexts/ApplicationContext';
import styles from './PersonalInfoForm.module.css';
import Input from '../../common/Input/Input';
import Select from '../../common/Input/Select';
import DatePicker from '../../common/Input/DatePicker';
import WizardNavigation from '../WizardNavigation';
import AutoSave from '../AutoSave/AutoSave';
import PassportUpload from '../../common/Input/PassportUpload';

const REGIONS = [
  { value: 'ASH', label: 'Ashanti' },
  { value: 'AHA', label: 'Ahafo' },
  { value: 'BOE', label: 'Bono East' },
  { value: 'BON', label: 'Bono' },
  { value: 'CEN', label: 'Central' },
  { value: 'EAS', label: 'Eastern' },
  { value: 'GAR', label: 'Greater Accra' },
  { value: 'NEA', label: 'North East' },
  { value: 'NOR', label: 'Northern' },
  { value: 'OTI', label: 'Oti' },
  { value: 'SAV', label: 'Savannah' },
  { value: 'UEA', label: 'Upper East' },
  { value: 'UWE', label: 'Upper West' },
  { value: 'VOL', label: 'Volta' },
  { value: 'WES', label: 'Western' },
  { value: 'WNO', label: 'Western North' }
];

export default function PersonalInfoForm() {
  const { formData, nextStep, dataLoaded } = useApplication();
  const hasInitializedRef = useRef(false);

  // Normalize snake_case data from backend to camelCase for form state
  const getNormalizedDefaultValues = useCallback(() => {
    const data = formData.personalInfo || {};
    const passportDoc = formData.documents?.find(doc => 
      doc.documentType === 'PASSPORT_PHOTO' || doc.documentType === 'passportPhoto'
    );

    const getPassportUrl = () => {
      const url = passportDoc?.url || '';
      // If it's a relative path start with /uploads, return as is
      if (url.startsWith('/uploads')) return url;
      // If it contains /uploads and is a full URL, attempt to extract the relative portion
      // This helps when switching between local (localhost:5000/uploads) and production
      if (url.includes('/uploads/')) {
        return url.substring(url.indexOf('/uploads'));
      }
      return url;
    };

    return {
      passportPhoto: getPassportUrl(),
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      middleName: data.middleName || '',
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
      gender: data.gender || '',
      maritalStatus: data.maritalStatus || '',
      nationality: data.nationality || 'GHANAIAN',
      region: data.region || '',
      hometown: data.hometown || '',
      ghanaCardNumber: data.ghanaCardNumber || '',
      heightCm: data.heightCm || '',
      weightKg: data.weightKg || ''
    };

  }, [formData.personalInfo, formData.documents]);

  const methods = useForm({
    defaultValues: getNormalizedDefaultValues()
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = methods;

  // Re-initialize form when data is loaded from context
  useEffect(() => {
    if (dataLoaded && !hasInitializedRef.current) {
      reset(getNormalizedDefaultValues());
      hasInitializedRef.current = true;
    }
  }, [dataLoaded, reset, getNormalizedDefaultValues]);

  // Optimize handler to prevent unnecessary re-renders in PassportUpload
  const handlePassportChange = useCallback((doc) => {
    setValue('passportPhoto', doc.url, { shouldValidate: true });
  }, [setValue]);

  // Watch for validation
  useEffect(() => {
    register('passportPhoto', { required: 'Passport photo is required' });
  }, [register]);

  const onSubmit = async (data) => {
    console.log('[Flow] PersonalInfoForm submitted:', data);
    try {
      // Create a clean data object for personal info (exclude passportPhoto as it's saved in documents)
      const personalInfoData = { ...data };
      delete personalInfoData.passportPhoto;
      
      await nextStep('personalInfo', personalInfoData);
    } catch (error) {
      console.error('[Flow] Failed to save personal info:', error);
    }
  };

  const onError = (errors) => {
    console.error('[Flow] PersonalInfoForm validation errors:', errors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, onError)} className={styles.formGrid}>
        <AutoSave stepKey="personalInfo" />
        
        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <PassportUpload 
            value={{ url: watch('passportPhoto') }}
            onChange={handlePassportChange}
            error={errors.passportPhoto?.message}
          />
        </div>

        <Input 
          label="First Name*" 
          {...register('firstName', { required: 'First name is required' })} 
          error={errors.firstName?.message} 
        />
        <Input 
          label="Middle Name" 
          {...register('middleName')} 
          error={errors.middleName?.message} 
        />
        <Input 
          label="Last Name*" 
          {...register('lastName', { required: 'Last name is required' })} 
          error={errors.lastName?.message} 
        />
        <DatePicker 
          label="Date of Birth*"
          {...register('dateOfBirth', { required: 'Date of birth is required' })}
          error={errors.dateOfBirth?.message}
        />
        <Select
          label="Gender*"
          options={[{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }]}
          {...register('gender', { required: 'Gender is required' })}
          error={errors.gender?.message}
        />
        <Select
          label="Marital Status*"
          options={[
            { value: 'SINGLE', label: 'Single' },
            { value: 'MARRIED', label: 'Married' },
            { value: 'DIVORCED', label: 'Divorced' },
            { value: 'WIDOWED', label: 'Widowed' }
          ]}
          {...register('maritalStatus', { required: 'Marital status is required' })}
          error={errors.maritalStatus?.message}
        />
        <Input 
          label="Nationality" 
          value="GHANAIAN"
          {...register('nationality', { required: 'Nationality is required' })} 
          error={errors.nationality?.message}
        />
        <Select
          label="Region of Origin*"
          options={REGIONS}
          {...register('region', { required: 'Region is required' })}
          error={errors.region?.message}
        />

        <Input 
          label="Hometown" 
          {...register('hometown', { required: 'Hometown is required' })} 
          error={errors.hometown?.message} 
        />
        <Input 
          label="Ghana Card Number*" 
          {...register('ghanaCardNumber', { required: 'Ghana card number is required' })} 
          error={errors.ghanaCardNumber?.message} 
        />
        <Input 
          label={`Height (cm)* ${watch('gender') === 'MALE' ? '(Min 173cm)' : watch('gender') === 'FEMALE' ? '(Min 163cm)' : ''}`} 
          type="number"
          step="0.1"
          {...register('heightCm', { 
            required: 'Height is required',
            min: { value: 100, message: 'Minimum height is 100cm' },
            max: { value: 250, message: 'Maximum height is 250cm' }
          })} 
          error={errors.heightCm?.message} 
        />
        <Input 
          label="Weight (kg)*" 
          type="number"
          step="0.1"
          {...register('weightKg', { 
            required: 'Weight is required',
            min: { value: 30, message: 'Minimum weight is 30kg' },
            max: { value: 200, message: 'Maximum weight is 200kg' }
          })} 
          error={errors.weightKg?.message} 
        />


        <div style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
          <WizardNavigation />
        </div>
      </form>
    </FormProvider>
  );
}
