export default function AdminHeader() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
          🔔
        </button>
        <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
      </div>
    </header>
  );
}
