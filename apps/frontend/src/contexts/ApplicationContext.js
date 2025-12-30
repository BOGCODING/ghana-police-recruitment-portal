'use client';
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '../utils/api';

const ApplicationContext = createContext(null);

const STEPS = [
  { id: 1, name: 'Personal Info', key: 'personalInfo', path: 'personal-info' },
  { id: 2, name: 'Contact Details', key: 'contactInfo', path: 'contact-details' },
  { id: 3, name: 'Category Selection', key: 'categoryDetails', path: 'category-selection' },
  { id: 4, name: 'Education', key: 'education', path: 'education' },
  { id: 5, name: 'Documents', key: 'documents', path: 'documents' },
  { id: 6, name: 'Review', key: 'review', path: 'review' },
  { id: 7, name: 'Declaration', key: 'declaration', path: 'declaration' }
];


const STEP_API_PATHS = {
  personalInfo: '/api/applications/personal-info',
  contactInfo: '/api/applications/contact-info',
  education: '/api/applications/education',
  categoryDetails: '/api/applications/category',
  documents: '/api/applications/documents',
  declaration: '/api/applications/declaration',
  review: '/api/applications/review'
};


export function ApplicationProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {
      heightCm: '',
      weightKg: ''
    },

    contactInfo: {},
    education: {},
    categoryDetails: {},
    documents: [],
    declaration: {}
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [status, setStatus] = useState('DRAFT');
  const [maxStepAllowed, setMaxStepAllowed] = useState(1);
  const [dataLoaded, setDataLoaded] = useState(false);

  const autoSaveTimerRef = useRef(null);
  const pendingDataRef = useRef({});
  const pendingStepRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  const loadApplication = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api('/api/applications/current');
      if (data.success && data.data) {
        const appData = data.data;
        setApplicationId(appData.applicationId);  // Use formatted Application ID (GPS-YYYY-XXXXXX), not numeric id
        setCurrentStep(appData.currentStep || 1);
        setStatus(appData.status);
        
        let initialFormData = {
          personalInfo: appData.personalInfo || {},
          contactInfo: appData.contactInfo || {},
          education: appData.education || {},
          categoryDetails: appData.categoryDetails || {},
          category: appData.category,
          subCategory: appData.subCategory,
          specialization: appData.specialization,
          preferredRegion: appData.preferredRegion,
          alternateRegion: appData.alternateRegion,
          documents: appData.documents || [],
          declaration: appData.declaration || {}
        };


        // Fetch draft data (auto-save) if it exists
        try {
          const draftResponse = await api('/api/applications/auto-save');
          if (draftResponse.success && draftResponse.data) {
            const draft = draftResponse.data;
            initialFormData = {
              ...initialFormData,
              personalInfo: { ...initialFormData.personalInfo, ...(draft.personalInfo || {}) },
              contactInfo: { ...initialFormData.contactInfo, ...(draft.contactInfo || {}) },
              education: { ...initialFormData.education, ...(draft.education || {}) },
              categoryDetails: { ...initialFormData.categoryDetails, ...(draft.categoryDetails || {}) },
              category: draft.categoryDetails?.category || initialFormData.category,
              subCategory: draft.categoryDetails?.subCategory || initialFormData.subCategory,
              specialization: draft.categoryDetails?.specialization || initialFormData.specialization,
              preferredRegion: draft.categoryDetails?.preferredRegion || initialFormData.preferredRegion,
              alternateRegion: draft.categoryDetails?.alternateRegion || initialFormData.alternateRegion,
              declaration: { ...initialFormData.declaration, ...(draft.declaration || {}) }
            };

          }
        } catch (draftError) {
          console.error('Failed to load draft data:', draftError);
        }

        setFormData(initialFormData);
        setMaxStepAllowed(appData.currentStep || 1);
        setDataLoaded(true);

      }
    } catch (error) {
      console.error('Failed to load application:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplication();
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [loadApplication]);

  useEffect(() => {
    if (!dataLoaded) return;

    // Robust pathname parsing: get the last non-empty segment
    const segments = pathname.split('/').filter(Boolean);
    const currentPath = segments[segments.length - 1];
    const stepMatch = STEPS.find(s => s.path === currentPath);
    
    console.log(`[Flow] Path Changed: ${pathname} -> Step: ${stepMatch?.id}, currentStep: ${currentStep}, maxStepAllowed: ${maxStepAllowed}, pending: ${pendingStepRef.current}`);
    
    if (stepMatch) {
      // Security Check: Redirect back if accessing a step beyond maxStepAllowed
      // BUT skip check if this is an intentional navigation we just triggered
      if (stepMatch.id > maxStepAllowed && pendingStepRef.current !== stepMatch.id) {
        console.warn(`[Flow] REDIRECT: Step ${stepMatch.id} exceeds max ${maxStepAllowed}. Redirecting...`);
        const allowedStepObj = STEPS.find(s => s.id === maxStepAllowed);
        if (allowedStepObj) {
          router.replace(`/application/${allowedStepObj.path}`);
          return;
        }
      }

      // State Sync: Update currentStep if URL navigated to a valid step
      if (stepMatch.id !== currentStep) {
        console.log(`[Flow] SYNC: Setting currentStep to ${stepMatch.id}`);
        setCurrentStep(stepMatch.id);
      }
      
      // Clear pending step if matched
      if (pendingStepRef.current === stepMatch.id) {
        console.log(`[Flow] PENDING CLEARED: Reached step ${stepMatch.id}`);
        pendingStepRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, maxStepAllowed, dataLoaded]);


  const autoSave = useCallback(async (stepKey, data) => {
    if (status !== 'DRAFT') return;
    setSaving(true);
    try {
      await api('/api/applications/auto-save', {
        method: 'POST',
        body: JSON.stringify({ step: stepKey, data })
      });
      // Clear pending data for this step if it matches
      if (pendingDataRef.current.step === stepKey) {
        pendingDataRef.current = {};
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  }, [status]);

  const autoSaveNow = useCallback(async () => {
    const { step, data } = pendingDataRef.current;
    if (step && data) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      await autoSave(step, data);
    }
  }, [autoSave]);

  const scheduleAutoSave = useCallback((stepKey, data) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    pendingDataRef.current = { step: stepKey, data };
    autoSaveTimerRef.current = setTimeout(() => {
      autoSave(stepKey, data);
    }, 2000);
  }, [autoSave]);

  const updateStepData = useCallback((stepKey, data) => {
    setFormData(prev => {
      const updatedValue = Array.isArray(data) 
        ? data 
        : { ...prev[stepKey], ...data };
      return {
        ...prev,
        [stepKey]: updatedValue
      };
    });
    scheduleAutoSave(stepKey, data);
  }, [scheduleAutoSave]);

  // Flush pending changes on unmount or before important transitions
  useEffect(() => {
    return () => {
      // Cleanup timer on unmount
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const saveStep = useCallback(async (stepKey, data) => {
    console.log(`[Flow] saveStep called for ${stepKey}`);
    setSaving(true);
    try {
      const endpoint = STEP_API_PATHS[stepKey];
      if (!endpoint) throw new Error(`Invalid step key: ${stepKey}`);
      
      const response = await api(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (response.success) {
        console.log(`[Flow] saveStep SUCCESS for ${stepKey}`);
        setFormData(prev => ({
          ...prev,
          [stepKey]: data
        }));
        return response.data;
      } else {
        console.error(`[Flow] saveStep FAILED for ${stepKey}:`, response);
        throw new Error(response.message || 'Save failed');
      }
    } catch (error) {
      console.error(`[Flow] saveStep ERROR for ${stepKey}:`, error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  const nextStep = useCallback(async (stepKey, data) => {
    console.log(`[Flow] nextStep started for ${stepKey}. currentStep: ${currentStep}`);
    try {
      await saveStep(stepKey, data);
      console.log(`[Flow] saveStep success for ${stepKey}`);
      
      const nextStepNum = currentStep + 1;
      if (nextStepNum <= STEPS.length) {
        console.log(`[Flow] Preparing to navigate to step ${nextStepNum}`);
        
        // 1. Update maxStepAllowed first
        setMaxStepAllowed(prev => {
          const newMax = Math.max(prev, nextStepNum);
          console.log(`[Flow] maxStepAllowed updating: ${prev} -> ${newMax}`);
          return newMax;
        });
        
        // 2. Update backend
        console.log(`[Flow] Updating backend step state to ${nextStepNum}...`);
        await api('/api/applications/current-step', {
          method: 'PUT',
          body: JSON.stringify({ currentStep: nextStepNum })
        });
        
        // 3. Navigate
        const nextStepObj = STEPS.find(s => s.id === nextStepNum);
        if (nextStepObj) {
          console.log(`[Flow] Triggering navigation to /application/${nextStepObj.path}`);
          pendingStepRef.current = nextStepNum;
          
          // Re-add immediate fallback to see if it helps visibility
          setCurrentStep(nextStepNum); 
          
          router.push(`/application/${nextStepObj.path}`);
        }
      }

    } catch (error) {
      console.error(`[Flow] nextStep error:`, error);
      throw error;
    }
  }, [currentStep, saveStep, router]);


  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      const prevStepNum = currentStep - 1;
      const prevStepObj = STEPS.find(s => s.id === prevStepNum);
      if (prevStepObj) {
        router.push(`/application/${prevStepObj.path}`);
      }
    }
  }, [currentStep, router]);

  const goToStep = useCallback((step) => {
    // Only allow going to completed steps or the next available step
    if (step >= 1 && step <= maxStepAllowed) {
      const stepObj = STEPS.find(s => s.id === step);
      if (stepObj) {
        router.push(`/application/${stepObj.path}`);
      }
    }
  }, [router, maxStepAllowed]);



  const submitApplication = useCallback(async (declarationData) => {
    setSaving(true);
    try {
      // Save declaration data if provided
      if (declarationData) {
        await saveStep('declaration', declarationData);
      }

      const data = await api('/api/applications/submit', {
        method: 'POST'
      });
      setStatus('SUBMITTED');
      setApplicationId(data.data.applicationId);
      return data.data;
    } catch (error) {
      throw error;
    } finally {
      setSaving(false);
    }
  }, [saveStep]);

  const value = {
    steps: STEPS,
    currentStep,
    formData,
    loading,
    saving,
    dataLoaded,
    applicationId,
    status,
    maxStepAllowed,
    updateStepData,

    autoSaveNow,
    saveStep,
    nextStep,
    prevStep,
    goToStep,
    submitApplication,
    loadApplication
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication() {
  const context = useContext(ApplicationContext);
  if (!context) {
    return {
      formData: { documents: [] },
      loading: true,
      saving: false,
      dataLoaded: false,
      currentStep: 1,
      updateStepData: () => {},
      autoSaveNow: async () => {},
      saveStep: async () => {},
      nextStep: async () => {},
      prevStep: () => {},
      goToStep: () => {},
      submitApplication: async () => {},
      loadApplication: async () => {}
    };
  }
  return context;
}

