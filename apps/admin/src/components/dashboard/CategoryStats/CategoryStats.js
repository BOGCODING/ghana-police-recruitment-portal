import BarChart from '@/components/common/Charts/BarChart';

export default function CategoryStats({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border shadow-sm h-[400px] flex items-center justify-center text-slate-400">
        No category data available.
      </div>
    );
  }

  const bars = [
    { key: 'General Duty', color: '#3B82F6' },
  ];

  // If your data structure is different, you might need to adapt.
  // Assuming data comes as [{ name: 'Category', value: 100 }, ...]
  // Actually, bar chart usually takes [{ name: 'A', value: 100 }, ...]
  // Let's assume the passed data array is suitable for the charts library wrapper I made.
  // The generic BarChart wrapper I made expects `bars` config array which defines keys to look for.
  // If we want to show distribution, maybe just 'value' key is common.
  // Let's assume data = [{ name: 'Region', count: 10 }] and we map 'count'.
  
  const chartBars = [{ key: 'count', color: '#1E3A8A' }];

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="font-bold text-lg text-slate-800 mb-4">Applications by Category</h3>
      <BarChart data={data} xKey="name" bars={chartBars} />
    </div>
  );
}
