'use client';
import { useState, useEffect } from 'react';
import { analyticsService } from '@/services/analyticsService';
import Sidebar from '@/components/Sidebar';
import styles from './page.module.css';
import PieChart from '@/components/common/Charts/PieChart';
import { FiMapPin, FiUsers, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function RegionalAnalytics() {
  const [loading, setLoading] = useState(true);
  const [regionalData, setRegionalData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    topRegion: { name: 'N/A', count: 0 }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await analyticsService.getRegionalStats();
        if (res.success) {
          const data = res.data;
          setRegionalData(data);
          
          // Calculate high-level stats
          const total = data.reduce((acc, curr) => acc + curr.total, 0);
          const top = data.reduce((prev, current) => (prev.total > current.total) ? prev : current, { name: 'N/A', total: 0 });
          
          setStats({
            total,
            topRegion: { name: top.name, count: top.total }
          });
        }
      } catch (error) {
        console.error('Error fetching regional stats:', error);
        toast.error('Failed to load regional data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading regional intelligence...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Regional Distribution</h1>
          <p>Detailed breakdown of applications across all 16 regions of Ghana</p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.miniStat}>
            <span className={styles.statLabel}>Total National Applications</span>
            <span className={styles.statValue}>{stats.total.toLocaleString()}</span>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.statLabel}>Highest Activity Region</span>
            <span className={styles.statValue}>{stats.topRegion.name} ({stats.topRegion.count})</span>
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        {regionalData.map((region) => (
          <div key={region.name} className={styles.regionCard}>
            <div className={region.total > 0 ? styles.regionHeader : styles.regionHeaderEmpty}>
              <div className={styles.regionTitle}>
                <FiMapPin className={styles.icon} />
                <h2>{region.name}</h2>
              </div>
              <div className={styles.totalBadge}>{region.total} Apps</div>
            </div>
            
            <div className={styles.regionContent}>
              {region.total > 0 ? (
                <>
                  <div className={styles.distributionSection}>
                    <h3>Application Status</h3>
                    <div className={styles.statusBars}>
                      <div className={styles.statusBarWrapper}>
                        <div className={styles.statusLabel}>
                          <span>Approved</span>
                          <span>{region.statuses.APPROVED || 0}</span>
                        </div>
                        <div className={styles.progressBar}>
                          <div 
                            className={`${styles.progress} ${styles.approved}`} 
                            style={{ width: `${(region.statuses.APPROVED || 0) / region.total * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className={styles.statusBarWrapper}>
                        <div className={styles.statusLabel}>
                          <span>Under Review</span>
                          <span>{region.statuses.SUBMITTED || 0}</span>
                        </div>
                        <div className={styles.progressBar}>
                          <div 
                            className={`${styles.progress} ${styles.review}`} 
                            style={{ width: `${(region.statuses.SUBMITTED || 0) / region.total * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.categoriesSection}>
                    <h3>Categories</h3>
                    <div className={styles.categoryPills}>
                      {Object.entries(region.categories).map(([cat, count]) => (
                        <div key={cat} className={styles.catPill}>
                          <span className={styles.catName}>{cat.replace('_', ' ')}</span>
                          <span className={styles.catCount}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.emptyState}>
                  <p>No applications registered for this region yet.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
