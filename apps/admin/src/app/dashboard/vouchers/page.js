'use client';
import { useState, useEffect, useCallback } from 'react';
import voucherService from '@/services/voucherService';
import systemService from '@/services/systemService';
import api, { API_URL } from '@/lib/axios';
import styles from './page.module.css';

// Helper function to safely format dates
const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
};

// Helper function to check if a voucher is expired
const isExpired = (dateValue) => {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return false;
  return date < new Date();
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount || 0);
};

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [user, setUser] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [updatingPrice, setUpdatingPrice] = useState(false);


  const fetchVouchers = useCallback(async () => {
    try {
      const params = {
        page,
        limit: 20,
        ...(filter !== 'all' && { status: filter }),
        ...(search && { search })
      };
      
      const res = await voucherService.getAll(params);
      if (res.success) {
        setVouchers(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await voucherService.getStats();
      if (res.success) setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get('/admin/me');
      if (res.data.success) setUser(res.data.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
    fetchStats();
    fetchUser();
  }, [fetchVouchers, fetchStats, fetchUser]);

  const handleUpdatePrice = async () => {
    if (!newPrice || isNaN(newPrice)) {
      alert('Please enter a valid price');
      return;
    }

    setUpdatingPrice(true);
    try {
      await systemService.updateSetting('voucher_price', parseFloat(newPrice));
      alert('Voucher price updated successfully');
      setNewPrice('');
      fetchStats();
    } catch (error) {
      console.error('Failed to update price:', error);
      alert(error.message || 'Failed to update price');
    } finally {
      setUpdatingPrice(false);
    }
  };

  const handleDeactivate = async (code) => {
    if (!confirm('Are you sure you want to deactivate this voucher?')) return;
    try {
      await voucherService.deactivate(code);
      fetchVouchers();
      fetchStats();
    } catch (error) {
      console.error('Failed to deactivate:', error);
      alert(error.response?.data?.message || 'Failed to deactivate voucher');
    }
  };

  const handleDelete = async (code) => {
    if (!confirm('Are you sure you want to PERMANENTLY delete this voucher? This cannot be undone.')) return;
    try {
      await voucherService.delete(code);
      fetchVouchers();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert(error.response?.data?.message || 'Failed to delete voucher');
    }
  };

  const handleExportCSV = async () => {
    const token = localStorage.getItem('adminAccessToken');
    const params = new URLSearchParams({ status: filter !== 'all' ? filter : '' });
    window.open(`${API_URL}/api/vouchers/export-csv?${params}&token=${token}`, '_blank');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Voucher Management</h1>
        <div className={styles.headerActions}>
          <button onClick={() => setShowGenerateModal(true)} className={styles.btnPrimary}>
            + Generate Single
          </button>
          <button onClick={() => setShowBulkModal(true)} className={styles.btnSecondary}>
            📦 Bulk Generate
          </button>
          <button onClick={handleExportCSV} className={styles.btnOutline}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.total || 0}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={`${styles.statCard} ${styles.available}`}>
            <span className={styles.statValue}>{stats.available || 0}</span>
            <span className={styles.statLabel}>Available</span>
          </div>
          <div className={`${styles.statCard} ${styles.used}`}>
            <span className={styles.statValue}>{stats.used || 0}</span>
            <span className={styles.statLabel}>Used</span>
          </div>
          <div className={`${styles.statCard} ${styles.expired}`}>
            <span className={styles.statValue}>{stats.expired || 0}</span>
            <span className={styles.statLabel}>Expired</span>
          </div>
          <div className={`${styles.statCard} ${styles.deactivated}`}>
            <span className={styles.statValue}>{stats.deactivated || 0}</span>
            <span className={styles.statLabel}>Deactivated</span>
          </div>
          <div className={`${styles.statCard} ${styles.revenue}`}>
            <div className={styles.statGroup}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{formatCurrency(stats.totalRevenue)}</span>
                <span className={styles.statLabel}>Total Potential Revenue</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{formatCurrency(stats.realizedRevenue)}</span>
                <span className={styles.statLabel}>Realized Revenue (Used)</span>
              </div>
            </div>
            {user?.role === 'SUPER_ADMIN' && (
              <div className={styles.priceAdjustment}>
                <input 
                  type="number" 
                  placeholder={`Current: GHC ${stats.voucherPrice || 100}`}
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className={styles.priceInput}
                />
                <button 
                  onClick={handleUpdatePrice} 
                  disabled={updatingPrice}
                  className={styles.priceBtn}
                >
                  {updatingPrice ? '...' : 'Set Price'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by code, phone, or serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterButtons}>
          {['all', 'unused', 'used', 'expired', 'deactivated'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading vouchers...</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>SerialNumber</span>
            <span>PINCode</span>
            <span>Phone/Email</span>
            <span>Status</span>
            <span>Expires</span>
            <span>Actions</span>
          </div>
          {vouchers.map(v => (
            <div key={v.id} className={styles.tableRow}>
              <span>{v.serialNumber || '-'}</span>
              <span style={{ fontWeight: 'bold' }}>{v.pinCode || '-'}</span>
              <span>
                {v.phoneNumber ? (
                  <div>
                    <div>{v.phoneNumber}</div>
                    {v.email && <small style={{ color: '#666' }}>{v.email}</small>}
                  </div>
                ) : (
                  v.email || '-'
                )}
              </span>
              <span className={`${styles.status} ${v.isUsed ? styles.used : v.deactivatedAt ? styles.deactivated : isExpired(v.expiresAt) ? styles.expired : styles.available}`}>
                {v.isUsed ? 'Used' : v.deactivatedAt ? 'Deactivated' : isExpired(v.expiresAt) ? 'Expired' : 'Available'}
              </span>
              <span className={isExpired(v.expiresAt) ? styles.expiredDate : ''}>{formatDate(v.expiresAt)}</span>
              <span>
                {!v.isUsed && (
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => handleDeactivate(v.code)}
                      className={styles.deactivateBtn}
                      title="Deactivate"
                    >
                      Deactivate
                    </button>
                    <button
                      onClick={() => handleDelete(v.code)}
                      className={styles.deleteBtn}
                      title="Delete Permanently"
                      style={{ marginLeft: '8px', backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </span>
            </div>
          ))}
          {vouchers.length === 0 && (
            <div className={styles.noData}>No vouchers found</div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      {showGenerateModal && (
        <GenerateSingleModal
          onClose={() => setShowGenerateModal(false)}
          onSuccess={() => { fetchVouchers(); fetchStats(); }}
        />
      )}

      {showBulkModal && (
        <BulkGenerateModal
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => { fetchVouchers(); fetchStats(); }}
        />
      )}
    </div>
  );
}

function GenerateSingleModal({ onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Clean payload: empty strings -> undefined
      const payload = {
        email: email || undefined,
        phoneNumber: phoneNumber || undefined,
        notes: notes || undefined
      };

      const res = await voucherService.generateSingle(payload);
      if (res.success) {
          setResult(res.data);
          onSuccess();
      } else {
          setError(res.message || 'Failed to generate voucher');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Generate Single Voucher</h2>
        
        {result ? (
          <div className={styles.result}>
            <div className={styles.resultCode}>{result.code}</div>
            
            <div className={styles.voucherDetails} style={{ margin: '1rem 0', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>PIN Code:</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{result.pinCode}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Serial Number:</span>
                <span style={{ fontWeight: 'bold' }}>{result.serialNumber}</span>
              </div>
            </div>

            <p style={{ color: 'green', fontWeight: 'bold' }}>Voucher generated successfully!</p>
            <p className={styles.resultExpiry}>Expires: {formatDate(result.expiresAt)}</p>
            <button onClick={onClose} className={styles.btnPrimary} style={{ marginTop: '1rem' }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className={styles.error} style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            <div className={styles.field}>
              <label>Phone Number (Recommended)</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="024-XXX-XXXX"
              />
            </div>
            <div className={styles.field}>
              <label>Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recipient@email.com"
              />
            </div>
            <div className={styles.field}>
              <label>Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes..."
                rows={2}
              />
            </div>
            <div className={styles.modalActions}>
              <button type="button" onClick={onClose} className={styles.btnCancel}>Cancel</button>
              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function BulkGenerateModal({ onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(10);
  const [expiryDays, setExpiryDays] = useState(31);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        quantity: parseInt(quantity),
        expiryDays: parseInt(expiryDays),
        notes: notes || undefined
      };
      
      const res = await voucherService.generateBulk(payload);
      if (res.success) {
        setResult(res.data);
        onSuccess();
      } else {
        setError(res.message || 'Failed to generate vouchers');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const text = result.vouchers.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vouchers_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Bulk Generate Vouchers</h2>
        
        {result ? (
          <div className={styles.result}>
            <div className={styles.resultSuccess} style={{ color: 'green', fontWeight: 'bold', marginBottom: '1rem' }}>✅ {result.count} vouchers generated!</div>
            <p className={styles.resultExpiry}>Expires: {formatDate(result.expiresAt)}</p>
            <div className={styles.voucherList} style={{ maxHeight: '200px', overflowY: 'auto', background: '#f1f1f1', padding: '1rem', borderRadius: '4px', margin: '1rem 0' }}>
              {result.vouchers.slice(0, 5).map((v, i) => (
                <div key={i} className={styles.voucherItem} style={{ fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #ddd' }}>
                  <div>S/N: {v.serialNumber}</div>
                  <div>PIN: <strong>{v.pinCode}</strong></div>
                </div>
              ))}
              {result.vouchers.length > 5 && (
                <div className={styles.moreVouchers}>...and {result.vouchers.length - 5} more</div>
              )}
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleDownload} className={styles.btnSecondary}>📥 Download CSV</button>
              <button onClick={onClose} className={styles.btnPrimary}>Close</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className={styles.error} style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            <div className={styles.field}>
              <label>Quantity (1-1000)</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Expiry Days</label>
              <input
                type="number"
                min="1"
                max="90"
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Batch Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Batch for Accra distribution"
                rows={2}
              />
            </div>
            <div className={styles.modalActions}>
              <button type="button" onClick={onClose} className={styles.btnCancel}>Cancel</button>
              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? 'Generating...' : `Generate ${quantity} Vouchers`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
