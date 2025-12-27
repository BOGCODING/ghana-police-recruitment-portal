'use client';
import { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiDollarSign, FiClock, FiDownload } from 'react-icons/fi';
import { analyticsService } from '@/services/analyticsService';
import { TrendChart, StatusPieChart, RegionBarChart, DemographicsCard } from '@/components/analytics/AnalyticsCharts';
import styles from './page.module.css';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    overview: {
      totalApplications: 0,
      totalRevenue: 0,
      pendingReviews: 0,
      vouchersSold: 0
    },
    trends: [],
    statusDistribution: [],
    demographics: { gender: [], region: [], age: [] }
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [overview, trends, status, demographics] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getTrends(),
          analyticsService.getStatusDistribution(),
          analyticsService.getDemographics()
        ]);

        if (overview.success && trends.success && status.success && demographics.success) {
          setData({
            overview: overview.data,
            trends: trends.data,
            statusDistribution: status.data,
            demographics: demographics.data
          });
        }
      } catch (error) {
        console.error('Analytics fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Loading Analytics Dashboard...</span>
      </div>
    );
  }

  const { overview, trends, statusDistribution, demographics } = data;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Analytics Dashboard</h1>
          <p>Real-time insights and recruitment metrics</p>
        </div>
        <button className={styles.exportBtn} onClick={() => window.print()}>
          <FiDownload /> Export Report
        </button>
      </header>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.blue}`}>
            <FiUsers />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Applications</span>
            <span className={styles.statValue}>{overview.totalApplications.toLocaleString()}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.green}`}>
            <FiDollarSign />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Revenue</span>
            <span className={styles.statValue}>GH₵ {overview.totalRevenue.toLocaleString()}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.orange}`}>
            <FiClock />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Pending Reviews</span>
            <span className={styles.statValue}>{overview.pendingReviews.toLocaleString()}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.purple}`}>
            <FiTrendingUp />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Vouchers Sold</span>
            <span className={styles.statValue}>{overview.vouchersSold.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        <div className={styles.fullWidth}>
          <TrendChart data={trends} />
        </div>
        
        <div className={styles.halfWidth}>
          <StatusPieChart data={statusDistribution} />
        </div>
        
        <div className={styles.halfWidth}>
          <DemographicsCard 
            genderData={demographics.gender} 
            ageData={demographics.age} 
          />
        </div>

        <div className={styles.fullWidth}>
          <RegionBarChart data={demographics.region} />
        </div>
      </div>
    </div>
  );
}
