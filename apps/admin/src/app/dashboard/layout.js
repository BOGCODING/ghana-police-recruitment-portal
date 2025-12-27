'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import Sidebar from '@/components/Sidebar';
import Breadcrumbs from '@/components/common/Breadcrumbs/Breadcrumbs';
import CommandPalette from '@/components/common/CommandPalette/CommandPalette';
import styles from './layout.module.css';

export default function DashboardLayout({ children }) {
  const { isAuthenticated, loading, admin, logout } = useAdminAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Close sidebar on navigation change (mobile)
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [router]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}></div>
        <p>Initializing Dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className={styles.layout}>
      <CommandPalette />
      
      {/* Sidebar with mobile drawer support */}
      <div className={`${styles.sidebarWrapper} ${isCollapsed ? styles.collapsed : ''} ${mobileSidebarOpen ? styles.open : ''}`}>
        <Sidebar admin={admin} isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
      </div>

      {/* Mobile Overlay */}
      <div 
        className={`${styles.overlay} ${mobileSidebarOpen ? styles.open : ''}`} 
        onClick={() => setMobileSidebarOpen(false)}
      />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button 
              className={styles.menuBtn}
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open Menu"
            >
              ☰
            </button>
            <div className={styles.searchWrapper}>
              <span>🔍</span>
              <input 
                type="text" 
                placeholder="Search resources... (Alt+K)" 
                className={styles.searchInput}
                onFocus={(e) => {
                  e.target.blur();
                  // Trigger command palette logic if integrated
                }}
              />
            </div>
          </div>

          <div className={styles.headerRight}>
            <button className={styles.iconBtn} aria-label="Notifications">
              🔔
              <span className={styles.badge} />
            </button>
            <button className={styles.iconBtn} aria-label="Help"> 
              ❓
            </button>
            
            <div className={styles.userProfile}>
              <div className={styles.avatar}>
                {admin?.firstName?.charAt(0)}{admin?.lastName?.charAt(0)}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{admin?.firstName} {admin?.lastName}</span>
                <span className={styles.userRole}>{admin?.role?.toLowerCase().replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <Breadcrumbs />
          {children}
        </div>
      </main>
    </div>
  );
}
