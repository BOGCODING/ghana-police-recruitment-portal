'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Breadcrumbs.module.css';

const ROUTE_MAP = {
  'dashboard': 'Overview',
  'applications': 'Applications',
  'vouchers': 'Voucher Management',
  'analytics': 'Recruitment Analytics',
  'regions': 'Regional Status',
  'communication': 'Communication Hub',
  'users': 'Admin Management',
  'audit-logs': 'System Activity',
  'sessions': 'Active Sessions',
  'settings': 'System Settings',
};

// UUID pattern matcher
const isDynamicSegment = (segment) => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const idPattern = /^[A-Z]{3}-\d+$/i; // e.g. GPS-123456
  const isNumeric = !isNaN(segment) && segment.length > 5;
  return uuidPattern.test(segment) || idPattern.test(segment) || isNumeric;
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment !== '');

  if (pathSegments.length === 0) return null;

  const getLabel = (segment, index) => {
    // Check for explicit mapping
    if (ROUTE_MAP[segment.toLowerCase()]) {
      return ROUTE_MAP[segment.toLowerCase()];
    }

    // Check for dynamic IDs
    if (isDynamicSegment(segment)) {
      // If the parent segment was 'applications', call it 'Application Detail'
      const parent = pathSegments[index - 1];
      if (parent === 'applications') return 'Application Details';
      if (parent === 'users') return 'User Profile';
      return 'Details';
    }

    // Fallback: Title case
    return segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <div className={styles.breadcrumbItem}>
        <Link href="/dashboard" className={styles.link}>
          <span className={styles.homeIcon}>🏠</span>
          <span>Dashboard</span>
        </Link>
      </div>

      {pathSegments.map((segment, index) => {
        // Skip root dashboard segment since we explicitly added it
        if (segment === 'dashboard') return null;

        const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;
        const label = getLabel(segment, index);

        return (
          <div key={href} className={styles.breadcrumbItem}>
            <span className={styles.chevron}>›</span>
            {isLast ? (
              <span className={styles.current}>{label}</span>
            ) : (
              <Link href={href} className={styles.link}>
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
