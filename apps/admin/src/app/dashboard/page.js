'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { analyticsService } from '@/services/analyticsService';
import voucherService from '@/services/voucherService';
import RegionalBreakdown from '@/components/dashboard/RegionalBreakdown/RegionalBreakdown';
import LineChart from '@/components/common/Charts/LineChart';
import PieChart from '@/components/common/Charts/PieChart';
import { useSocket } from '@/contexts/SocketContext';
import styles from './page.module.css';

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [voucherStats, setVoucherStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllStats = useCallback(async () => {
    try {
      setError(null);
      const [dashboardRes, voucherRes] = await Promise.all([
        analyticsService.getDashboardStats(),
        voucherService.getStats()
      ]);
      
      if (dashboardRes.success) {
        setStats(dashboardRes.data);
      }
      if (voucherRes.success) {
        setVoucherStats(voucherRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const socket = useSocket();

  useEffect(() => {
    fetchAllStats();
    // Refresh every 30 seconds as a fallback
    const interval = setInterval(fetchAllStats, 30000);
    return () => clearInterval(interval);
  }, [fetchAllStats]);

  useEffect(() => {
    if (socket) {
      const handleRefresh = () => {
        console.log('Real-time update received, refreshing stats...');
        fetchAllStats();
      };

      socket.on('stats:refresh', handleRefresh);
      socket.on('application:update', handleRefresh);
      socket.on('application:new', handleRefresh);

      return () => {
        socket.off('stats:refresh', handleRefresh);
        socket.off('application:update', handleRefresh);
        socket.off('application:new', handleRefresh);
      };
    }
  }, [socket, fetchAllStats]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={fetchAllStats} className={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const byCategory = stats?.byCategory || [];
  const trends = stats?.trends || [];
  const byGender = stats?.byGender || [];
  const recentApps = stats?.recentApplications || [];

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <div className={styles.headerTitleGroup}>
            <h1>System Overview</h1>
            <div className={styles.liveIndicator}>
              <span className={styles.pulse}></span>
              Live
            </div>
          </div>
          <p>Real-time recruitment statistics and management</p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={fetchAllStats} className={styles.refreshBtn}>
            🔄 Refresh
          </button>
        </div>
      </header>

      {/* Overview Stats */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>💰 Financial & Application Overview</h2>
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.revenue}`}>
            <div className={styles.statIcon}>💵</div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>GH₵ {overview.revenue?.toLocaleString() || 0}</span>
              <span className={styles.statLabel}>Total Revenue</span>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.total}`}>
            <div className={styles.statIcon}>📋</div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{overview.totalApplications || 0}</span>
              <span className={styles.statLabel}>Total Apps</span>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.pending}`}>
            <div className={styles.statIcon}>⏳</div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{overview.pending || 0}</span>
              <span className={styles.statLabel}>Pending Review</span>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.qualified}`}>
            <div className={styles.statIcon}>🌟</div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{overview.qualified || 0}</span>
              <span className={styles.statLabel}>Qualified (Screening)</span>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.disqualified}`}>
            <div className={styles.statIcon}>❌</div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{overview.disqualified || 0}</span>
              <span className={styles.statLabel}>Disqualified (Screening)</span>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.approved}`}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{overview.approved || 0}</span>
              <span className={styles.statLabel}>Approved (Final)</span>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.rejected}`}>
            <div className={styles.statIcon}>🚫</div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{overview.rejected || 0}</span>
              <span className={styles.statLabel}>Rejected (Final)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Analytics */}
      <div className={styles.analyticsGrid}>
        {/* Submission Trends */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📈 Submission Trends (Last 30 Days)</h2>
          <div className={styles.chartWrapper}>
            <LineChart 
              data={trends} 
              xKey="date" 
              lines={[{ key: 'count', color: '#006B3F' }]} 
            />
          </div>
        </section>

        {/* Gender Distribution */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>👫 Gender Distribution</h2>
          <div className={styles.chartWrapper}>
            <PieChart 
              data={byGender.map(g => ({ name: g.gender || 'Unknown', value: parseInt(g.count) }))} 
              colors={['#006B3F', '#001F3F', '#FFD700']}
            />
          </div>
        </section>
      </div>

      <div className={styles.breakdownGrid}>
        {/* Categories Breakdown */}
        {byCategory.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📂 Applications by Category</h2>
            <div className={styles.categoriesGrid}>
              {byCategory.map((cat, idx) => (
                <div key={idx} className={styles.categoryCard}>
                  <span className={styles.categoryName}>{cat.category || 'Uncategorized'}</span>
                  <span className={styles.categoryCount}>{cat.count}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Regional Breakdown */}
        <section className={styles.section}>
          <RegionalBreakdown data={stats?.byRegion || []} />
        </section>
      </div>

      {/* Activity and Management */}
      <div className={styles.bottomGrid}>
        {/* Recent Applications */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🕒 Recent Applications</h2>
          <div className={styles.activityCard}>
            <table className={styles.activityTable}>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map(app => (
                  <tr key={app.id}>
                    <td>
                      <Link href={`/dashboard/applications/${app.id}`} className={styles.applicantName}>
                        {app.firstName} {app.lastName}
                      </Link>
                    </td>
                    <td><span className={styles.badge}>{app.category}</span></td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[app.status?.toLowerCase()]}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className={styles.timeStr}>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link href="/dashboard/applications" className={styles.viewAllLink}>
              View All Applications →
            </Link>
          </div>
        </section>

        {/* Quick Actions */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>⚡ Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <Link href="/dashboard/applications?status=SUBMITTED" className={styles.actionCard}>
              <span className={styles.actionIcon}>📋</span>
              <span className={styles.actionTitle}>Review Pending</span>
              <span className={styles.actionCount}>{overview.pending || 0}</span>
            </Link>
            <Link href="/dashboard/vouchers" className={styles.actionCard}>
              <span className={styles.actionIcon}>🎫</span>
              <span className={styles.actionTitle}>Manage Vouchers</span>
              <span className={styles.actionCount}>{voucherStats?.available || 0} available</span>
            </Link>
            <Link href="/dashboard/audit-logs" className={styles.actionCard}>
              <span className={styles.actionIcon}>📜</span>
              <span className={styles.actionTitle}>Audit Logs</span>
              <span className={styles.actionCount}>View Activity</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
