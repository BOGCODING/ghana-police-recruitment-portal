'use client';

import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { useApplication } from '@/contexts/ApplicationContext';

export default function AutoSave({ stepKey }) {
  const { watch } = useFormContext();
  const { updateStepData, autoSaveNow, dataLoaded } = useApplication();
  const data = watch();
  const stringifiedData = JSON.stringify(data);
  const firstRender = useRef(true);

  // Auto-save on data change
  useEffect(() => {
    // Only save if data has finished loading from the server
    // and this is not the first render of the form
    if (!dataLoaded) return;

    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (stepKey && stringifiedData) {
      const currentData = JSON.parse(stringifiedData);
      updateStepData(stepKey, currentData);
    }
  }, [stringifiedData, stepKey, updateStepData, dataLoaded]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      autoSaveNow();
    };
  }, [autoSaveNow]);

  return null;
}
