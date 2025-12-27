'use client';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ReviewPanel({ applicationId, currentStatus, onStatusUpdate }) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async (status) => {
    if (!confirm(`Are you sure you want to mark this application as ${status}?`)) return;
    
    setLoading(true);
    try {
        // Mock API call
        // const response = await api.post(`/applications/${applicationId}/${status.toLowerCase()}`, { comment });
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        
        toast.success(`Application marked as ${status}`);
        if (onStatusUpdate) onStatusUpdate(status);
        setComment('');
    } catch (error) {
        toast.error('Failed to update status');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm h-fit sticky top-6">
      <h3 className="font-bold text-lg text-slate-800 mb-4">Review Action</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Reviewer Comments
        </label>
        <textarea
          className="w-full p-3 border rounded-lg text-sm h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Add internal notes or rejection reasons..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleAction('REJECTED')}
          disabled={loading || currentStatus === 'REJECTED'}
          className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium transition-colors disabled:opacity-50"
        >
          Reject
        </button>
        <button
          onClick={() => handleAction('APPROVED')}
          disabled={loading || currentStatus === 'APPROVED'}
          className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 font-medium transition-colors disabled:opacity-50"
        >
          Approve
        </button>
      </div>

       <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-slate-500 text-center">
             Actions are logged for audit purposes.
          </p>
       </div>
    </div>
  );
}
