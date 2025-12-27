'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import styles from './AnalyticsCharts.module.css';

const COLORS = ['#006B3F', '#FFD700', '#000000', '#C0C0C0', '#4169E1', '#E31837'];

export default function AnalyticsCharts({ byCategory, byRegion }) {
  const categoryData = byCategory.map(item => ({
    name: item.category.replace('_', ' '),
    value: parseInt(item.count)
  }));

  const regionData = byRegion.map(item => ({
    name: item.region,
    count: parseInt(item.count)
  }));

  return (
    <div className={styles.chartsGrid}>
      <div className={styles.chartCard}>
        <h3>Applications by Category</h3>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.chartCard}>
        <h3>Regional Distribution</h3>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#006B3F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
