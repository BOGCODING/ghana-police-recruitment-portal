'use client';
import { useState } from 'react';

export default function VoucherGenerator() {
  const [loading, setLoading] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    // Mock API call
    setTimeout(() => {
       const code = `GPS-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
       setGeneratedVoucher({
          code,
          pin: Math.floor(100000 + Math.random() * 900000),
          serial: `SN${Date.now()}`
       });
       setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm max-w-md">
      <h3 className="font-bold text-lg text-slate-800 mb-4">Generate Single Voucher</h3>
      <p className="text-slate-500 text-sm mb-6">Create a unified voucher code for applicant registration access.</p>
      
      {generatedVoucher ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
           <p className="text-green-800 text-sm font-semibold mb-1">Voucher Generated Successfully</p>
           <div className="text-2xl font-mono font-bold text-slate-900 my-2">{generatedVoucher.code}</div>
           <div className="flex justify-center gap-4 text-sm text-slate-600">
              <span>PIN: <strong className="text-slate-900">{generatedVoucher.pin}</strong></span>
              <span>Ref: <strong className="text-slate-900">{generatedVoucher.serial}</strong></span>
           </div>
           <button 
             onClick={() => setGeneratedVoucher(null)}
             className="mt-4 text-sm text-green-700 underline"
           >
             Generate Another
           </button>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate New Voucher'}
        </button>
      )}
    </div>
  );
}
