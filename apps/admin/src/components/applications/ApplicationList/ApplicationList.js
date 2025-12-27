import DataTable from '@/components/common/DataTable/DataTable';
import Link from 'next/link';

export default function ApplicationList({ data }) {


  const columns = [
    {
      header: 'Application ID',
      accessorKey: 'applicationId',
      cell: info => <span className="font-mono text-slate-600">{info.getValue()}</span>
    },
    {
      header: 'Applicant',
      accessorFn: row => `${row.firstName} ${row.lastName}`,
    },
    {
      header: 'Category',
      accessorKey: 'category',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: info => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          info.getValue() === 'APPROVED' ? 'bg-green-100 text-green-700' :
          info.getValue() === 'REJECTED' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {info.getValue()}
        </span>
      )
    },
    {
      header: 'Date',
      accessorKey: 'createdAt',
      cell: info => new Date(info.getValue()).toLocaleDateString(),
    },
    {
       header: 'Actions',
       id: 'actions',
       cell: info => (
         <Link 
           href={`/applications/${info.row.original.id}`}
           className="text-blue-600 hover:text-blue-800 text-sm font-medium"
         >
           View Details
         </Link>
       )
    }
  ];

  return <DataTable data={data} columns={columns} searchPlaceholder="Search applications..." />;
}
