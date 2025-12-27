import Link from 'next/link';
import styles from './PendingActions.module.css';

export default function PendingActions({ actions }) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="font-bold text-lg text-slate-800 mb-4">Pending Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium text-red-900">{action.title}</p>
                <p className="text-sm text-red-700">{action.description}</p>
              </div>
            </div>
            <Link href={action.link} className="text-sm font-semibold text-red-600 hover:text-red-800">
              Review &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
