'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import styles from './Sidebar.module.css';
import Image from 'next/image';

import { FiChevronLeft, FiChevronRight, FiLogOut } from 'react-icons/fi';

const menuItems = [
  { icon: '📊', label: 'Overview', href: '/dashboard', roles: ['SUPER_ADMIN', 'MODERATOR', 'VIEWER', 'REGIONAL_ADMIN'] },
  { icon: '📝', label: 'Applications', href: '/dashboard/applications', roles: ['SUPER_ADMIN', 'MODERATOR', 'VIEWER', 'REGIONAL_ADMIN'] },
  { icon: '🎫', label: 'Vouchers', href: '/dashboard/vouchers', roles: ['SUPER_ADMIN', 'VOUCHER_MANAGER'] },
  { icon: '📈', label: 'Analytics', href: '/dashboard/analytics', roles: ['SUPER_ADMIN', 'MODERATOR', 'VIEWER'] },
  { icon: '🗺️', label: 'Regions', href: '/dashboard/regions', roles: ['SUPER_ADMIN', 'MODERATOR', 'VIEWER', 'REGIONAL_ADMIN'] },
  { icon: '💬', label: 'Communication', href: '/dashboard/communication', roles: ['SUPER_ADMIN', 'MODERATOR'] },
  { icon: '👥', label: 'Admin Users', href: '/dashboard/users', roles: ['SUPER_ADMIN'] },
  { icon: '📋', label: 'Audit Logs', href: '/dashboard/audit-logs', roles: ['SUPER_ADMIN'] },
  { icon: '🖥️', label: 'Sessions', href: '/dashboard/sessions', roles: ['SUPER_ADMIN'] },
  { icon: '⚙️', label: 'Settings', href: '/dashboard/settings', roles: ['SUPER_ADMIN'] },
];

export default function Sidebar({ admin, isCollapsed, onToggleCollapse }) {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  const visibleItems = menuItems.filter(item => 
    item.roles.includes(admin?.role)
  );

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
      <div className={`${styles.logo} ${isCollapsed ? styles.logoCollapsed : ''}`}>
        {!isCollapsed ? (
          <>
            <Image 
              src="/logo.png"
              alt="Logo" 
              width={40} 
              height={40} 
              className={styles.logoIcon} 
              priority
            />
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>GPS Admin</span>
              <span className={styles.logoSubtitle}>Recruitment</span>
            </div>
          </>
        ) : (
          <Image 
            src="/logo.png"
            alt="Logo" 
            width={32} 
            height={32} 
            className={styles.logoIconCollapsed} 
          />
        )}
        
        <button className={styles.toggleBtn} onClick={onToggleCollapse} aria-label="Toggle Sidebar">
          {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      <nav className={styles.nav}>
        {visibleItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''} ${isCollapsed ? styles.navItemCollapsed : ''}`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {!isCollapsed && <span className={styles.navLabel}>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={`${styles.adminInfo} ${isCollapsed ? styles.adminInfoCollapsed : ''}`}>
          <div className={styles.avatar}>
            {admin?.firstName?.charAt(0)}{admin?.lastName?.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className={styles.adminDetails}>
              <span className={styles.adminName}>{admin?.firstName} {admin?.lastName}</span>
              <span className={styles.adminRole}>{admin?.role?.replace('_', ' ')}</span>
            </div>
          )}
        </div>
        <button className={`${styles.logoutBtn} ${isCollapsed ? styles.logoutBtnCollapsed : ''}`} onClick={logout}>
          {isCollapsed ? <FiLogOut /> : <>🚪 Logout</>}
        </button>
      </div>
    </aside>
  );
}
