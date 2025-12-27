'use client';
import { useState, useEffect } from 'react';
import { FiInfo, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const AnnouncementBanner = () => {
  const [banner, setBanner] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}/system/public-settings`);
        if (res.ok) {
          const data = await res.json();
          // Find announcement_banner setting - backend wraps in .data
          const settings = data.data || [];
          const setting = settings.find(s => s.key === 'announcement_banner');
          if (setting && setting.value) {

             // Handle case where value might be a string or object
             const parsed = typeof setting.value === 'string' 
                ? JSON.parse(setting.value) 
                : setting.value;
             
             if (parsed.show) {
               setBanner(parsed);
             }
          }
        }
      } catch (err) {
        console.error('Failed to fetch banner settings', err);
      }
    };

    fetchSettings();
  }, []);

  if (!banner || !visible) return null;

  const getIcon = () => {
    switch (banner.type) {
      case 'warning': return <FiAlertTriangle />;
      case 'success': return <FiCheckCircle />;
      default: return <FiInfo />;
    }
  };

  const getStyles = () => {
    switch (banner.type) {
      case 'warning': return { bg: '#fff7ed', text: '#c2410c', border: '#fdba74' };
      case 'success': return { bg: '#f0fdf4', text: '#15803d', border: '#86efac' };
      default: return { bg: '#eff6ff', text: '#1d4ed8', border: '#93c5fd' }; // info
    }
  };

  const styles = getStyles();

  return (
    <div style={{
      backgroundColor: styles.bg,
      color: styles.text,
      borderBottom: `1px solid ${styles.border}`,
      padding: '0.75rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      position: 'relative',
      fontSize: '0.9rem',
      fontWeight: '500'
    }}>
      {getIcon()}
      <span>{banner.message}</span>
      <button 
        onClick={() => setVisible(false)}
        style={{
          position: 'absolute',
          right: '1rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: styles.text,
          opacity: 0.7
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default AnnouncementBanner;
