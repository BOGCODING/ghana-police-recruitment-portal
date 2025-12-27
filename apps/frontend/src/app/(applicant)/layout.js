'use client';
import { useState } from 'react';
import Sidebar from '@/components/common/Sidebar/Sidebar';
import ProtectedRoute from '@/components/common/ProtectedRoute/ProtectedRoute';
import PortalHeader from '@/components/application/PortalHeader/PortalHeader';
import styles from './styles.module.css';
import MobileSidebar from '@/components/common/Sidebar/MobileSidebar';
import PageTransition from '@/components/animations/PageTransition';
import { ApplicationProvider } from '@/contexts/ApplicationContext';

export default function ApplicantLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <ProtectedRoute>
      <ApplicationProvider>
        <div className={styles.layout}>
          {/* Desktop Sidebar */}
          <div className={`${styles.sidebarDesktop} ${isCollapsed ? styles.collapsed : ''}`}>
            <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
          </div>

          {/* Mobile Overlay & Sidebar */}
          <MobileSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

          <main className={styles.mainContent}>
            <PortalHeader onMenuClick={toggleSidebar} />
            <div className={styles.contentWrapper}>
              <PageTransition>
                {children}
              </PageTransition>
            </div>
          </main>
        </div>
      </ApplicationProvider>
    </ProtectedRoute>
  );
}
