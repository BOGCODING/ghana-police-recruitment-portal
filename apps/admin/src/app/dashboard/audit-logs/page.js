'use client';
import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiActivity, FiClock, FiUser } from 'react-icons/fi';
import api from '@/lib/axios';
import styles from './page.module.css';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ action: '', entityType: '', search: '' });
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/audit-logs', {
        params: {
          page,
          limit: meta.limit,
          ...filters
        }
      });
      if (data.success) {
        setLogs(data.data);
        setMeta(data.pagination);
      }
    } catch (error) {
      console.error('Fetch logs error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, meta.limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getActionColor = (action) => {
    if (action.includes('LOGIN')) return '#3B82F6';
    if (action.includes('APPROVE')) return '#10B981';
    if (action.includes('REJECT')) return '#EF4444';
    if (action.includes('CREATE')) return '#8B5CF6';
    return '#6B7280';
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleInfo}>
          <FiActivity className={styles.headerIcon} />
          <div>
            <h1>System Audit Trail</h1>
            <p>Track all administrative actions and security events</p>
          </div>
        </div>
      </header>

      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <FiSearch />
          <input 
            type="text" 
            name="search" 
            placeholder="Search logs..."
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>
        <select name="action" value={filters.action} onChange={handleFilterChange}>
          <option value="">All Actions</option>
          <option value="LOGIN">Login</option>
          <option value="APPROVE_APPLICATION">Approve</option>
          <option value="REJECT_APPLICATION">Reject</option>
          <option value="VERIFY_DOCUMENT">Verify Doc</option>
          <option value="CREATE_VOUCHERS">Vouchers</option>
        </select>
        <select name="entityType" value={filters.entityType} onChange={handleFilterChange}>
          <option value="">All Entities</option>
          <option value="application">Application</option>
          <option value="admin">Admin</option>
          <option value="voucher">Voucher</option>
          <option value="document">Document</option>
        </select>
      </div>

      <div className={styles.logList}>
        {loading ? (
          <div className={styles.loading}>Loading audit trail...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={styles.logItem}>
              <div className={styles.logMain}>
                <div className={styles.actionMark} style={{ background: getActionColor(log.action) }} />
                <div className={styles.logInfo}>
                  <div className={styles.logTop}>
                    <span className={styles.action}>{log.action.replace(/_/g, ' ')}</span>
                    <span className={styles.entity}>{log.entityType} ID: {log.entityId}</span>
                  </div>
                  <div className={styles.details}>
                    {log.details && Object.entries(typeof log.details === 'string' ? JSON.parse(log.details) : log.details).map(([key, val], i) => (
                      <span key={i} className={styles.detailTag}>
                        <strong>{key}:</strong> {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.logMeta}>
                <div className={styles.metaItem}>
                  <FiUser /> 
                  <span>
                    {log.adminFirstName ? `${log.adminFirstName} ${log.adminLastName}` : `${log.userType} (ID: ${log.userId})`}
                    {log.adminEmail && <small className={styles.adminEmail}> ({log.adminEmail})</small>}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <FiClock /> <span>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
        
        {!loading && logs.length === 0 && (
          <div className={styles.empty}>No audit logs found.</div>
        )}
      </div>

      <div className={styles.pagination}>
        <span>Total Logs: {meta.total}</span>
        <div className={styles.pageBtns}>
          <button 
            disabled={meta.page <= 1} 
            onClick={() => fetchLogs(meta.page - 1)}
          >Previous</button>
          <button 
            disabled={meta.page * meta.limit >= meta.total} 
            onClick={() => fetchLogs(meta.page + 1)}
          >Next</button>
        </div>
      </div>
    </div>
  );
}
