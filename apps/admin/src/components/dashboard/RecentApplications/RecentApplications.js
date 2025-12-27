import Link from 'next/link';
import Badge from '@/components/common/Badge/Badge'; // You might need to copy Badge from frontend if shared, or create new.
// For now, I'll create a simple local badge or assume Badge exists.
// Actually, I should check if Badge exists in admin/components/common yet. It doesn't.
// I'll create a simple inline badge styling or assume I'll port it.
// Let's use simple Tailwind classes for now to avoid dependency on missing components.

export default function RecentApplications({ applications }) {
  if (!applications || applications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 min-h-[400px] flex items-center justify-center text-slate-400">
        No recent applications found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800">Recent Applications</h3>
        <Link href="/applications" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All
        </Link>
      </div>
      <div className="divide-y">
        {applications.map((app) => (
          <div key={app.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                 {/* Placeholder for avatar */}
                 <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                    {app.applicant?.firstName?.[0]}
                 </div>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">
                  {app.applicant?.firstName} {app.applicant?.lastName}
                </h4>
                <p className="text-xs text-slate-500">{app.applicationId}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                app.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {app.status}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(app.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
