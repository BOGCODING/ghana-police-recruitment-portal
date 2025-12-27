'use client';
import DataTable from '@/components/common/DataTable/DataTable';

export default function VoucherList({ vouchers }) {
  const columns = [
    {
      header: 'Serial Number',
      accessorKey: 'serial',
      cell: info => <span className="font-mono">{info.getValue()}</span>
    },
    {
      header: 'Voucher Code',
      accessorKey: 'code',
      cell: info => <span className="font-mono font-bold">{info.getValue()}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: info => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          info.getValue() === 'USED' ? 'bg-red-100 text-red-700' :
          'bg-green-100 text-green-700'
        }`}>
          {info.getValue()}
        </span>
      )
    },
    {
      header: 'Used By',
      accessorKey: 'usedBy', // Assumes 'usedBy' might be null or applicant name
      cell: info => info.getValue() || <span className="text-slate-400 italic">Unused</span>
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
         <h3 className="font-bold text-lg text-slate-800">Voucher Log</h3>
         <button className="text-blue-600 text-sm font-medium hover:underline">Export CSV</button>
      </div>
      <DataTable data={vouchers} columns={columns} searchPlaceholder="Search vouchers..." />
    </div>
  );
}
