'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRole } from '@/utils/roleHelper';
import styles from './Sidebar.module.css';
import { FiChevronLeft, FiChevronRight, FiLogOut } from 'react-icons/fi';

export default function Sidebar({ onMobileClose, isCollapsed, onToggleCollapse }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const profileImage = user?.profileImage;

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'My Application', href: '/application', icon: '🛡️' },
    { label: 'Help & FAQ', href: '/faq', icon: '❓' },
  ];

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
      <div className={`${styles.brand} ${isCollapsed ? styles.brandCollapsed : ''}`}>
        {!isCollapsed && (
          <div className={styles.brandInfo}>
            <div className={styles.brandIcon}>
              <Image 
                src="/images/ghana-police-logo.png" 
                alt="GPS Logo" 
                width={40} 
                height={40} 
              />
            </div>
            <div className={styles.brandText}>
              <strong>GPS Portal</strong>
              <span>{getUserRole(user?.applicationStatus)}</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className={styles.brandIconCollapsed}>
            <Image 
              src="/images/ghana-police-logo.png" 
              alt="GPS Logo" 
              width={32} 
              height={32} 
            />
          </div>
        )}
        
        <button className={styles.toggleBtn} onClick={onToggleCollapse} aria-label="Toggle Sidebar">
          {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>

        <button className={styles.closeBtn} onClick={onMobileClose} aria-label="Close Sidebar">
          ✕
        </button>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
             <Link 
              key={item.href} 
              href={item.href} 
              className={`${styles.link} ${isActive ? styles.active : ''} ${isCollapsed ? styles.linkCollapsed : ''}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              {!isCollapsed && <span className={styles.label}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

       <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {profileImage ? (
               <Image 
               src={profileImage} 
               alt="Profile" 
               width={40}
               height={40}
               className={styles.avatarImage}
               unoptimized
               style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
             />
            ) : (
              (typeof user?.fullName === 'string' ? user.fullName.charAt(0) : 'U')
            )}
          </div>
          {!isCollapsed && (
            <div className={styles.userDetails}>
              <strong>{typeof user?.fullName === 'object' ? JSON.stringify(user.fullName) : (user?.fullName || 'Applicant')}</strong>
              <span>{typeof user?.serialNumber === 'object' ? JSON.stringify(user.serialNumber) : user?.serialNumber}</span>
            </div>
          )}
        </div>
        <button onClick={logout} className={`${styles.logoutBtn} ${isCollapsed ? styles.logoutBtnCollapsed : ''}`}>
          <span className={styles.logoutIcon}><FiLogOut /></span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
