'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function MaintenanceCheck({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Skip check for maintenance page itself to avoid loop
    if (pathname === '/maintenance') {
      setChecking(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}/system/public-settings`);
        
        // If 503 Service Unavailable, it means we are in maintenance mode
        // Or if we specifically check the setting value
        if (res.status === 503) {
           router.push('/maintenance');
           return;
        }

        const data = await res.json();
        const settings = data.data || [];
        const maintenanceMode = settings.find(s => s.key === 'maintenance_mode');

        
        if (maintenanceMode && maintenanceMode.value === true) {
          router.push('/maintenance');
        }
      } catch (err) {
        // If API fails with 503 (caught by middleware), redirect
        if (err.response && err.response.status === 503) {
            router.push('/maintenance');
        }
      } finally {
        setChecking(false);
      }
    };

    checkStatus();
  }, [pathname, router]);

  if (checking) return null; // Or a loading spinner

  return <>{children}</>;
}
