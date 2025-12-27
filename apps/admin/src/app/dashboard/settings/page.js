'use client';
import { useState, useEffect, useCallback } from 'react';
import systemService from '@/services/systemService';
import styles from './page.module.css';

export default function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [error, setError] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      const res = await systemService.getSettings();
      if (res.success) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleUpdate = async (key, value) => {
    setUpdating(prev => ({ ...prev, [key]: true }));
    try {
      await systemService.updateSetting(key, value);
      await fetchSettings();
    } catch (err) {
      console.error(`Failed to update ${key}:`, err);
      alert(err.message || `Failed to update ${key}`);
    } finally {
      setUpdating(prev => ({ ...prev, [key]: false }));
    }
  };

  if (loading) return <div className={styles.loading}>Loading Settings...</div>;

  const renderSetting = (setting) => {
    const { key, value, description } = setting;
    const isUpdating = updating[key];

    // Determine input type based on key or value
    if (typeof value === 'boolean') {
      return (
        <div key={key} className={styles.settingItem}>
          <div className={styles.info}>
            <label>{key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</label>
            <p>{description}</p>
          </div>
          <div className={styles.control}>
            <button 
              className={`${styles.toggle} ${value ? styles.active : ''}`}
              onClick={() => handleUpdate(key, !value)}
              disabled={isUpdating}
            >
              {isUpdating ? '...' : (value ? 'ON' : 'OFF')}
            </button>
          </div>
        </div>
      );
    }

    if (key === 'recruitment_status') {
      return (
        <div key={key} className={styles.settingItem}>
          <div className={styles.info}>
            <label>Recruitment Status</label>
            <p>{description}</p>
          </div>
          <div className={styles.control}>
            <select 
              value={value} 
              onChange={(e) => handleUpdate(key, e.target.value)}
              disabled={isUpdating}
              className={styles.select}
            >
              <option value="OPEN">OPEN</option>
              <option value="CLOSED">CLOSED</option>
              <option value="PAUSED">PAUSED</option>
            </select>
          </div>
        </div>
      );
    }

    if (key === 'announcement_banner') {
      const bannerConfig = typeof value === 'string' ? JSON.parse(value) : value;
      return (
        <div key={key} className={styles.settingItemColumn}>
          <div className={styles.info}>
            <label>Announcement Banner</label>
            <p>Configure the global alert banner</p>
          </div>
          <div className={styles.bannerControls}>
             <div className={styles.row}>
               <label>Show Banner</label>
               <button 
                  className={`${styles.toggle} ${bannerConfig.show ? styles.active : ''}`}
                  onClick={() => handleUpdate(key, { ...bannerConfig, show: !bannerConfig.show })}
                  disabled={isUpdating}
               >
                 {bannerConfig.show ? 'ON' : 'OFF'}
               </button>
             </div>
             <div className={styles.row}>
               <label>Type</label>
               <select
                 value={bannerConfig.type}
                 onChange={(e) => handleUpdate(key, { ...bannerConfig, type: e.target.value })}
                 disabled={isUpdating}
                 className={styles.select}
               >
                 <option value="info">Info</option>
                 <option value="warning">Warning</option>
                 <option value="success">Success</option>
               </select>
             </div>
             <div className={styles.row}>
               <label>Message</label>
               <input
                 type="text"
                 value={bannerConfig.message}
                 onBlur={(e) => {
                   if (e.target.value !== bannerConfig.message) {
                      handleUpdate(key, { ...bannerConfig, message: e.target.value });
                   }
                 }}
                 onChange={(e) => {
                    // Local state update could be handled if extracted to sub-component, 
                    // relying on onBlur for now to avoid rapid API calls
                 }}
                 disabled={isUpdating}
                 className={styles.inputFull}
               />
             </div>
          </div>
        </div>
      );
    }

    const isPrice = key === 'voucher_price';
    const isDate = key === 'application_deadline';

    return (
      <div key={key} className={styles.settingItem}>
        <div className={styles.info}>
          <label>{key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</label>
          <p>{description}</p>
        </div>
        <div className={styles.control}>
          <input 
            type={isPrice ? 'number' : isDate ? 'datetime-local' : 'text'}
            defaultValue={isDate && value ? new Date(value).toISOString().slice(0, 16) : value}
            onBlur={(e) => {
              let newValue = e.target.value;
              if (isPrice) {
                newValue = parseFloat(newValue);
              } else if (isDate && newValue) {
                newValue = new Date(newValue).toISOString();
              }
              
              if (newValue !== value) handleUpdate(key, newValue);
            }}
            disabled={isUpdating}
            className={styles.input}
          />
          {isUpdating && <span className={styles.spinnerInline}></span>}
        </div>
      </div>
    );
  };

  const categories = {
    'Recruitment Control': ['recruitment_status', 'application_deadline', 'maintenance_mode', 'allow_new_registrations'],
    'Notifications & Alerts': ['announcement_banner', 'enable_email_notifications'],
    'Voucher Settings': ['voucher_price'],
    'Contact Info': ['contact_email', 'contact_phone']
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>System Settings</h1>
        <p>Global configuration for the recruitment portal</p>
      </header>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.grid}>
        {Object.entries(categories).map(([name, keys]) => (
          <section key={name} className={styles.card}>
            <h3>{name}</h3>
            <div className={styles.categoryItems}>
              {keys.map(key => {
                const setting = settings.find(s => s.key === key);
                return setting ? renderSetting(setting) : null;
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
