'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useApplication } from '@/contexts/ApplicationContext';
import styles from './styles.module.css';
import DeclarationForm from '@/components/application/DeclarationForm/DeclarationForm';
import WizardNavigation from '@/components/application/WizardNavigation';
import Animation from '@/components/common/Animation/Animation';
import AutoSave from '@/components/application/AutoSave/AutoSave';

const declarationSchema = z.object({
  acceptsDeclarations: z.boolean().refine(val => val === true, {
    message: 'You must confirm the declaration to proceed'
  }),
  signature: z.string().min(5, 'Full name as signature is required (min 5 characters)'),
});

export default function DeclarationPage() {
  const { formData, submitApplication, saving, dataLoaded, applicationId: contextAppId } = useApplication();
  const [isSuccess, setIsSuccess] = useState(false);
  const [appId, setAppId] = useState('');
  const router = useRouter();
  const hasInitializedRef = useRef(false);
  
  const getNormalizedDefaultValues = useCallback(() => {
    const data = formData.declaration || {};
    return {
      acceptsDeclarations: data.acceptsDeclarations ?? true,
      signature: data.signature || ''
    };
  }, [formData.declaration]);

  const methods = useForm({
    resolver: zodResolver(declarationSchema),
    defaultValues: getNormalizedDefaultValues()
  });

  const { handleSubmit, register, reset, formState: { errors } } = methods;

  // Re-initialize form when data is loaded from context
  useEffect(() => {
    if (dataLoaded && !hasInitializedRef.current) {
      reset(getNormalizedDefaultValues());
      hasInitializedRef.current = true;
    }
  }, [dataLoaded, reset, getNormalizedDefaultValues]);

  const onSubmit = async (data) => {
    try {
      const result = await submitApplication(data);
      if (result && result.applicationId) { // Check camelCase first as per context
        setAppId(result.applicationId);
        setIsSuccess(true);
      } else if (result && result.application_id) { // Fallback to snake_case
        setAppId(result.application_id);
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Submission failed:', error);
      // Handle case where application is already submitted
      if (error.message?.includes('Application already submitted') || error.data?.message?.includes('Application already submitted')) {
         setAppId(contextAppId || formData.applicationId || 'SUBMITTED'); 
         setIsSuccess(true);
      }
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.animationWrapper}>
          <Animation animationPath="/animations/success.json" loop={false} />
        </div>
        <h1 className={styles.successTitle}>Application Submitted!</h1>
        <p className={styles.successText}>Your application has been received and is under review.</p>
        <div className={styles.appIdBox}>
          <span>Application Number</span>
          <div className={styles.appIdValue}>{appId}</div>
        </div>
        <p className={styles.note}>
          Please keep this number safe. You will need it to track your application status.
        </p>
        <button 
          onClick={() => router.push('/dashboard')}
          className={styles.dashboardBtn}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AutoSave stepKey="declaration" />
          <div className={styles.header}>
            <h2>Final Declaration</h2>
            <p>Please review all declarations and sign below to submit your application.</p>
          </div>
          
          <DeclarationForm register={register} errors={errors} />
          
          <WizardNavigation isLastStep={true} isSubmitting={saving} />
        </form>
      </FormProvider>
    </div>
  );
}
