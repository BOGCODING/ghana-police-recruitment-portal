import StatCard from '@/components/common/StatCard/StatCard';
import styles from './OverviewStats.module.css';

export default function OverviewStats({ stats }) {
  if (!stats) return null;

  return (
    <div className={styles.grid}>
      <StatCard
        title="Total Applications"
        value={stats.totalApplications}
        trend={stats.trends?.total}
        icon="📝"
        color="bg-blue-500 text-blue-500"
      />
      <StatCard
        title="Pending Review"
        value={stats.pendingReview}
        trend={stats.trends?.pending}
        icon="⏳"
        color="bg-yellow-500 text-yellow-500"
      />
      <StatCard
        title="Approved"
        value={stats.approved}
        trend={stats.trends?.approved}
        icon="✅"
        color="bg-green-500 text-green-500"
      />
      <StatCard
        title="Rejected"
        value={stats.rejected}
        trend={stats.trends?.rejected}
        icon="❌"
        color="bg-red-500 text-red-500"
      />
    </div>
  );
}
