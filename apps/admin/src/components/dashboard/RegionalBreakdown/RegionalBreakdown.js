'use client';
import PieChart from '@/components/common/Charts/PieChart';
import styles from './RegionalBreakdown.module.css';

const COLORS = [
  '#006B3F', '#001F3F', '#FFD700', '#FF8C00', '#C0C0C0', 
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#2563eb', '#7c3aed', '#db2777', '#dc2626'
];

export default function RegionalBreakdown({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyState}>
        No regional data available.
      </div>
    );
  }

  // Sort data by count descending
  const sortedData = [...data].sort((a, b) => b.count - a.count);
  const totalCount = sortedData.reduce((acc, curr) => acc + parseInt(curr.count), 0);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Regional Distribution</h3>
        <div className={styles.totalBadge}>Total: {totalCount}</div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.chartContainer}>
          <PieChart 
            data={sortedData.map(d => ({ name: d.region || 'Unknown', value: parseInt(d.count) }))} 
            colors={COLORS} 
          />
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Region</th>
                <th>Count</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, index) => {
                const count = parseInt(item.count);
                const percentage = ((count / totalCount) * 100).toFixed(1);
                
                return (
                  <tr key={item.region || index} className={styles.tableRow}>
                    <td className={styles.regionName}>
                      <span 
                        className={styles.colorIndicator} 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      {item.region || 'Unknown'}
                    </td>
                    <td className={styles.regionCount}>{count}</td>
                    <td className={styles.regionPercent}>{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
