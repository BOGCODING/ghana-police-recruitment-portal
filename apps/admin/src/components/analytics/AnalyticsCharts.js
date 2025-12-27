'use client';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend
} from 'recharts';
import styles from './AnalyticsCharts.module.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const STATUS_COLORS = {
  APPROVED: '#10B981',
  REJECTED: '#EF4444',
  SUBMITTED: '#4338CA',
  DRAFT: '#9CA3AF',
  UNDER_REVIEW: '#F59E0B',
  DOCUMENTS_REQUIRED: '#F97316'
};

export const TrendChart = ({ data }) => (
  <div className={styles.chartContainer}>
    <h3>Application Trends (Last 30 Days)</h3>
    <div className={styles.chartWrapper}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip />
          <Area type="monotone" dataKey="count" stroke="#10B981" fillOpacity={1} fill="url(#colorCount)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const StatusPieChart = ({ data }) => {
  const preparedData = data.map(item => ({
    name: item.status.replace(/_/g, ' '),
    value: parseInt(item.count),
    color: STATUS_COLORS[item.status] || '#CBD5E1'
  }));

  return (
    <div className={styles.chartContainer}>
      <h3>Application Status Distribution</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={preparedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {preparedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const RegionBarChart = ({ data }) => (
  <div className={styles.chartContainer}>
    <h3>Applications by Region</h3>
    <div className={styles.chartWrapper}>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" />
          <YAxis dataKey="region" type="category" width={100} />
          <Tooltip />
          <Bar dataKey="count" fill="#4338CA" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const DemographicsCard = ({ genderData, ageData }) => (
  <div className={styles.chartContainer}>
    <h3>Demographics Overview</h3>
    <div className={styles.demographicsGrid}>
      <div className={styles.miniChart}>
        <h4>Gender</h4>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={genderData}
              cx="50%"
              cy="50%"
              outerRadius={60}
              dataKey="count"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {genderData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#EC4899'} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.miniChart}>
        <h4>Age Group</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ageData}>
            <XAxis dataKey="age_group" />
            <Tooltip />
            <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);
