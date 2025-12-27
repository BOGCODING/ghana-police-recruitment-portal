'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiSearch, FiFilter, FiEye, FiDownload, FiCheck, FiX, FiCalendar, FiCheckSquare, FiSquare, FiMoreVertical, FiAlertCircle, FiClipboard } from 'react-icons/fi';
import api from '@/lib/axios';
import { applicationService } from '@/services/applicationService';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ 
    status: '', 
    category: '', 
    search: '',
    startDate: '',
    endDate: '',
    gender: '',
    minAge: '',
    maxAge: '',
    minHeight: ''
  });
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkReason, setBulkReason] = useState('');
  const [bulkComments, setBulkComments] = useState('');

  // Individual Action State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    app: null,
    type: null, // 'approve', 'reject', 'request'
  });
  const [actionData, setActionData] = useState({
    reason: '',
    comments: '',
    documents: []
  });
  const [actionProcessing, setActionProcessing] = useState(false);

  const fetchApplications = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/applications', {
        params: {
          page,
          limit: meta.limit,
          ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
        }
      });
      if (data.success) {
        setApplications(data.data);
        setMeta(data.pagination);
        setSelectedIds([]); 
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, meta.limit]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleExport = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('adminToken');
    const queryParams = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    );
    window.open(`${API_URL}/api/admin/applications/export?${queryParams}&token=${token}`, '_blank');
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === applications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applications.map(app => app.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    
    if (bulkAction === 'reject' && !bulkReason) {
      alert('Please select a rejection reason');
      return;
    }
    
    setBulkProcessing(true);
    try {
      const endpoint = bulkAction === 'approve' ? '/admin/applications/bulk/approve' : '/admin/applications/bulk/reject';
      const body = bulkAction === 'approve' 
        ? { applicationIds: selectedIds, comments: bulkComments }
        : { applicationIds: selectedIds, reason: bulkReason, comments: bulkComments };
      
      const { data } = await api.post(endpoint, body);
      
      if (data.success) {
        const count = bulkAction === 'approve' ? data.data.approved.length : data.data.rejected.length;
        alert(`Successfully ${bulkAction}d ${count} applications`);
        fetchApplications(meta.page);
        setBulkAction(null);
        setBulkReason('');
        setBulkComments('');
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      alert('Failed to process bulk action');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleAction = async () => {
    const { app, type } = actionModal;
    if (!app || !type) return;

    if (type === 'reject' && !actionData.reason) {
      alert('Please select a rejection reason');
      return;
    }

    if (type === 'request' && actionData.documents.length === 0) {
      alert('Please enter at least one document to request');
      return;
    }

    setActionProcessing(true);
    try {
      let result;
      if (type === 'approve') {
        result = await applicationService.approve(app.id, actionData.comments);
      } else if (type === 'reject') {
        result = await applicationService.reject(app.id, actionData.reason, actionData.comments);
      } else if (type === 'request') {
        result = await applicationService.requestDocuments(app.id, actionData.documents, actionData.comments);
      }

      if (result.success) {
        alert(`Application ${type}d successfully`);
        fetchApplications(meta.page);
        closeActionModal();
      }
    } catch (error) {
      console.error(`${type} action error:`, error);
      alert('Failed to process action');
    } finally {
      setActionProcessing(false);
    }
  };

  const closeActionModal = () => {
    setActionModal({ isOpen: false, app: null, type: null });
    setActionData({ reason: '', comments: '', documents: [] });
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'DRAFT': styles.draft,
      'SUBMITTED': styles.submitted,
      'UNDER_REVIEW': styles.underReview,
      'APPROVED': styles.approved,
      'REJECTED': styles.rejected,
      'DOCUMENTS_REQUIRED': styles.docsRequired,
      'SHORTLISTED': styles.shortlisted
    };
    return statusMap[status] || '';
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Application Management</h1>
          <span className={styles.totalCount}>{meta.total} total applications</span>
        </div>
        <div className={styles.headerActions}>
          <button onClick={handleExport} className={styles.exportBtn}>
            <FiDownload /> Export
          </button>
        </div>
      </header>

      {/* Advanced Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <FiSearch />
          <input 
            type="text" 
            name="search" 
            placeholder="Search by ID, name, email..."
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>
        
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="DOCUMENTS_REQUIRED">Docs Required</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SHORTLISTED">Shortlisted</option>
        </select>
        
        <select name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">All Categories</option>
          <option value="GENERAL_DUTY">General Duty</option>
          <option value="TRADESMEN">Tradesmen</option>
          <option value="GRADUATES">Graduates</option>
          <option value="MEDICAL_PROFESSIONALS">Medical Professionals</option>
          <option value="RELIGIOUS_AFFAIRS">Religious Affairs</option>
          <option value="SPORTSMEN">Sportsmen</option>
        </select>

        <div className={styles.dateFilter}>
          <FiCalendar />
          <input 
            type="date" 
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            placeholder="From"
          />
          <span>to</span>
          <input 
            type="date" 
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            placeholder="To"
          />
        </div>

        <div className={styles.moreFilters}>
          <select name="gender" value={filters.gender} onChange={handleFilterChange}>
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          
          <input 
            type="number" 
            name="minAge" 
            placeholder="Min Age"
            value={filters.minAge}
            onChange={handleFilterChange}
            className={styles.smallInput}
          />
          
          <input 
            type="number" 
            name="maxAge" 
            placeholder="Max Age"
            value={filters.maxAge}
            onChange={handleFilterChange}
            className={styles.smallInput}
          />

          <input 
            type="number" 
            name="minHeight" 
            placeholder="Min Height (cm)"
            value={filters.minHeight}
            onChange={handleFilterChange}
            className={styles.smallInput}
          />
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className={styles.bulkToolbar}>
          <div className={styles.bulkInfo}>
            <FiCheckSquare />
            <span>{selectedIds.length} selected</span>
          </div>
          
          <div className={styles.bulkActions}>
            {!bulkAction ? (
              <>
                <button 
                  className={styles.bulkApproveBtn}
                  onClick={() => setBulkAction('approve')}
                >
                  <FiCheck /> Approve Selected
                </button>
                <button 
                  className={styles.bulkRejectBtn}
                  onClick={() => setBulkAction('reject')}
                >
                  <FiX /> Reject Selected
                </button>
              </>
            ) : (
              <div className={styles.bulkForm}>
                {bulkAction === 'reject' && (
                  <select 
                    value={bulkReason} 
                    onChange={(e) => setBulkReason(e.target.value)}
                    className={styles.bulkSelect}
                  >
                    <option value="">Select reason...</option>
                    <option value="INELIGIBLE_AGE">Ineligible Age</option>
                    <option value="INELIGIBLE_HEIGHT">Ineligible Height</option>
                    <option value="INCORRECT_DOCUMENTS">Incorrect Documents</option>
                    <option value="FAIL_ACADEMIC">Academic Requirements Not Met</option>
                  </select>
                )}
                <input 
                  type="text" 
                  placeholder="Comments (optional)"
                  value={bulkComments}
                  onChange={(e) => setBulkComments(e.target.value)}
                  className={styles.bulkInput}
                />
                <button 
                  onClick={handleBulkAction}
                  disabled={bulkProcessing}
                  className={bulkAction === 'approve' ? styles.confirmApprove : styles.confirmReject}
                >
                  {bulkProcessing ? 'Processing...' : `Confirm ${bulkAction}`}
                </button>
                <button 
                  onClick={() => {
                    setBulkAction(null);
                    setBulkReason('');
                    setBulkComments('');
                  }}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          <button onClick={() => setSelectedIds([])} className={styles.clearSelection}>
            Clear Selection
          </button>
        </div>
      )}

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>Loading applications...</span>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxCol}>
                  <button onClick={toggleSelectAll} className={styles.selectAllBtn}>
                    {selectedIds.length === applications.length && applications.length > 0 ? <FiCheckSquare /> : <FiSquare />}
                  </button>
                </th>
                <th>Applicant</th>
                <th>App ID</th>
                <th>Category</th>
                <th>Region</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className={selectedIds.includes(app.id) ? styles.selectedRow : ''}>
                  <td className={styles.checkboxCol}>
                    <button onClick={() => toggleSelect(app.id)} className={styles.checkboxBtn}>
                      {selectedIds.includes(app.id) ? <FiCheckSquare /> : <FiSquare />}
                    </button>
                  </td>
                  <td>
                    <div className={styles.applicantCell}>
                      <div className={styles.photoThumb}>
                        {app.passportPhotoPath ? (
                          <Image 
                            src={`${API_URL}/uploads/${app.passportPhotoPath}`}
                            alt="Photo"
                            width={40}
                            height={40}
                            className={styles.thumbImg}
                          />
                        ) : (
                          <div className={styles.noPhoto}>
                            {app.firstName?.[0]}{app.lastName?.[0]}
                          </div>
                        )}
                      </div>
                      <div className={styles.nameInfo}>
                        <span className={styles.fullName}>
                          {`${app.firstName || ''} ${app.lastName || ''}`.trim() || 'N/A'}
                        </span>
                        <span className={styles.email}>{app.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className={styles.appId}>{app.applicationId || 'N/A'}</td>
                  <td><span className={styles.categoryBadge}>{app.category || 'N/A'}</span></td>
                  <td>{app.preferredRegion || 'N/A'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(app.status)}`}>
                      {app.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className={styles.actions}>
                    <div className={styles.actionButtons}>
                      <button 
                        onClick={() => router.push(`/dashboard/applications/${app.id}`)}
                        className={styles.viewBtn} 
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      {app.status === 'SUBMITTED' && (
                        <>
                          <button 
                            className={styles.rowApproveBtn} 
                            onClick={() => setActionModal({ isOpen: true, app, type: 'approve' })}
                            title="Approve"
                          >
                            <FiCheck />
                          </button>
                          <button 
                            className={styles.rowRejectBtn} 
                            onClick={() => setActionModal({ isOpen: true, app, type: 'reject' })}
                            title="Reject"
                          >
                            <FiX />
                          </button>
                          <button 
                            className={styles.rowRequestBtn} 
                            onClick={() => setActionModal({ isOpen: true, app, type: 'request' })}
                            title="Request Documents"
                          >
                            <FiClipboard />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!loading && applications.length === 0 && (
          <div className={styles.empty}>
            <p>No applications found matching your filters.</p>
          </div>
        )}
      </div>

      <div className={styles.pagination}>
        <span>Showing {applications.length} of {meta.total} results</span>
        <div className={styles.pageBtns}>
          <button 
            disabled={meta.page <= 1} 
            onClick={() => fetchApplications(meta.page - 1)}
          >Previous</button>
          <span className={styles.pageNum}>Page {meta.page}</span>
          <button 
            disabled={meta.page * meta.limit >= meta.total} 
            onClick={() => fetchApplications(meta.page + 1)}
          >Next</button>
        </div>
      </div>

      {/* Action Modal */}
      {actionModal.isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>
                {actionModal.type === 'approve' && 'Approve Application'}
                {actionModal.type === 'reject' && 'Reject Application'}
                {actionModal.type === 'request' && 'Request Documents'}
              </h2>
              <button onClick={closeActionModal} className={styles.closeModal}><FiX /></button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.appSummary}>
                <strong>{actionModal.app.firstName} {actionModal.app.lastName}</strong>
                <span>ID: {actionModal.app.applicationId}</span>
              </div>

              {actionModal.type === 'reject' && (
                <div className={styles.formGroup}>
                  <label>Rejection Reason *</label>
                  <select 
                    value={actionData.reason} 
                    onChange={(e) => setActionData({...actionData, reason: e.target.value})}
                  >
                    <option value="">Select reason...</option>
                    <option value="INELIGIBLE_AGE">Ineligible Age</option>
                    <option value="INELIGIBLE_HEIGHT">Ineligible Height</option>
                    <option value="INCORRECT_DOCUMENTS">Incorrect Documents</option>
                    <option value="FAIL_ACADEMIC">Does not meet academic requirements</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              )}

              {actionModal.type === 'request' && (
                <div className={styles.formGroup}>
                  <label>Documents Required (one per line) *</label>
                  <textarea 
                    placeholder="e.g. Passport Photo&#10;WASSCE Certificate"
                    rows={4}
                    onChange={(e) => setActionData({...actionData, documents: e.target.value.split('\n').filter(d => d.trim())})}
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label>
                  {actionModal.type === 'request' ? 'Instructions for Applicant' : 'Comments (Internal)'}
                </label>
                <textarea 
                  value={actionData.comments}
                  onChange={(e) => setActionData({...actionData, comments: e.target.value})}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              {actionModal.type === 'approve' && (
                <div className={styles.warningBox}>
                  <FiAlertCircle />
                  <span>Are you sure you want to approve this application? This will notify the applicant.</span>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.modalCancelBtn} 
                onClick={closeActionModal}
                disabled={actionProcessing}
              >
                Cancel
              </button>
              <button 
                className={`${styles.modalConfirmBtn} ${styles[actionModal.type]}`}
                onClick={handleAction}
                disabled={actionProcessing}
              >
                {actionProcessing ? 'Processing...' : `Confirm ${actionModal.type}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
