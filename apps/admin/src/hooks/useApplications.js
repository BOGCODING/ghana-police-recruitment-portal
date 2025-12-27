import useSWR from 'swr';
import { applicationService } from '@/services/applicationService';

export function useApplications(params) {
  const fetcher = () => applicationService.getAll(params);
  
  const { data, error, mutate, isLoading } = useSWR(
     params ? ['/admin/applications', params] : null,
     fetcher
  );

  return {
    applications: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate
  };
}

export function useApplication(id) {
   const fetcher = () => applicationService.getOne(id);
   const { data, error, mutate, isLoading } = useSWR(
      id ? [`/admin/applications/${id}`] : null,
      fetcher
   );

   return {
     application: data?.data,
     isLoading,
     isError: error,
     mutate
   };
}
