'use client';
import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import ProfileForm from '@/components/application/ProfileForm/ProfileForm';
import SecuritySettings from '@/components/application/SecuritySettings/SecuritySettings';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import styles from './styles.module.css';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (data) => {
    const updated = await userService.updateProfile(data);
    setProfile(updated);
  };

  const handlePasswordChange = async (data) => {
    await userService.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/dashboard" className={styles.backBtn}>
          <FiArrowLeft /> Back to Dashboard
        </Link>
        <h1>Account Settings</h1>
        <p>Manage your account preferences and security settings.</p>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          General Information
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'security' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security & Password
        </button>
      </div>

      <div className={styles.section}>
        {activeTab === 'profile' ? (
          <>
            <h2>Personal Details</h2>
            <ProfileForm initialData={profile} onSubmit={handleProfileUpdate} />
          </>
        ) : (
          <>
            <h2>Security Settings</h2>
            <SecuritySettings onSubmit={handlePasswordChange} />
          </>
        )}
      </div>
    </div>
  );
}
