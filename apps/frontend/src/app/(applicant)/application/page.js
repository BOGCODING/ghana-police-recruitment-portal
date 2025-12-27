'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApplication } from '@/contexts/ApplicationContext';
import { useAuth } from '@/contexts/AuthContext';

export default function ApplicationEntry() {
  const router = useRouter();
  const { user } = useAuth();
  const { steps, maxStepAllowed, loading } = useApplication();

  useEffect(() => {
    if (loading) return;

    const currentStepNum = maxStepAllowed || 1;
    const stepObj = steps.find(s => s.id === currentStepNum);
    if (stepObj) {
      router.replace(`/application/${stepObj.path}`);
    } else {
      router.replace(`/application/personal-info`);
    }
  }, [maxStepAllowed, steps, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">
          {user ? `Loading application for ${user.firstName || user.email || 'applicant'}...` : 'Loading your application...'}
        </p>
      </div>
    </div>
  );
}
