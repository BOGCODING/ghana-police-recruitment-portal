'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiArrowLeft, FiCheck, FiX, FiAlertCircle, FiPrinter, FiEye, FiClock, FiMessageSquare, FiUser, FiClipboard, FiCheckSquare, FiSquare } from 'react-icons/fi';
import styles from './page.module.css';
import StatusTimeline from '@/components/applications/StatusTimeline/StatusTimeline';
import ApplicationNotes from '@/components/applications/ApplicationNotes/ApplicationNotes';
import { applicationService } from '@/services/applicationService';
import api, { API_URL } from '@/lib/axios';

export default function ApplicationDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [reviewData, setReviewData] = useState({ comments: '', reason: '' });
  const [activeTab, setActiveTab] = useState('details'); // details, notes, timeline
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [requestDocsData, setRequestDocsData] = useState({
    isOpen: false,
    selectedDocs: [],
    message: ''
  });

  
  useEffect(() => {
    const fetchApp = async () => {
      try {
        
        // Get current admin info
        const adminRes = await api.get('/admin/me');
        if (adminRes.data.success) {
          setCurrentAdmin(adminRes.data.data);
        }

        // Fetch application using new service method
        const data = await applicationService.getOne(id);
        
        if (data.success) {
          setApp(data.data);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error.response?.data?.message || 'Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  const handleDocumentVerify = async (docId, status) => {
    try {
      const { data } = await api.post(`/admin/applications/${id}/documents/${docId}/verify`, { status });
      if (data.success) {
        // Update local state
        setApp(prev => ({
          ...prev,
          documents: prev.documents.map(d => d.id === docId ? { ...d, verificationStatus: status } : d)
        }));
      }
    } catch (error) {
      console.error('Verify doc error:', error);
    }
  };

  const handleAction = async (action) => {
    setProcessing(true);
    try {
      const result = action === 'approve' 
        ? await applicationService.approve(id, reviewData.comments)
        : await applicationService.reject(id, reviewData.reason, reviewData.comments);
      
      if (result.success) {
        alert(`Application ${action}d successfully`);
        // Refresh app data
        const data = await applicationService.getOne(id);
        if (data.success) setApp(data.data);
      }
    } catch (error) {
      console.error(`${action} error:`, error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestDocuments = async () => {
    if (requestDocsData.selectedDocs.length === 0) {
      alert('Please select at least one document to request');
      return;
    }
    
    setProcessing(true);
    try {
      const result = await applicationService.requestDocuments(
        id, 
        requestDocsData.selectedDocs, 
        requestDocsData.message
      );
      
      if (result.success) {
        alert('Document request sent successfully');
        setRequestDocsData({ isOpen: false, selectedDocs: [], message: '' });
        // Refresh app data
        const data = await applicationService.getOne(id);
        if (data.success) setApp(data.data);
      }
    } catch (error) {
      console.error('Request documents error:', error);
      alert('Failed to send document request');
    } finally {
      setProcessing(false);
    }
  };

  const toggleDocSelection = (docType) => {
    setRequestDocsData(prev => ({
      ...prev,
      selectedDocs: prev.selectedDocs.includes(docType)
        ? prev.selectedDocs.filter(d => d !== docType)
        : [...prev.selectedDocs, docType]
    }));
  };

  const handleCreateNote = async (content, isPrivate) => {
    const result = await applicationService.addNote(id, content, isPrivate);
    if (result.success) {
      setApp(prev => ({
        ...prev,
        notes: [result.data, ...(prev.notes || [])]
      }));
    }
    return result;
  };

  const handleDeleteNote = async (noteId) => {
    const result = await applicationService.deleteNote(id, noteId);
    if (result.success) {
      setApp(prev => ({
        ...prev,
        notes: prev.notes.filter(n => n.id !== noteId)
      }));
    }
    return result;
  };

  const handlePrint = () => {
    // Navigate to print view
    window.open(`/dashboard/applications/${id}/print`, '_blank');
  };

  if (loading) return <div className={styles.loading}>Loading application...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!app) return <div className={styles.error}>Application not found.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={() => router.back()} className={styles.backBtn}>
            <FiArrowLeft /> Back
          </button>
          <div className={styles.headerInfo}>
            <h1>Review Application</h1>
            <span className={styles.appId}>{app.applicationId}</span>
          </div>
        </div>
        <button onClick={handlePrint} className={styles.printBtn}>
          <FiPrinter /> Print Summary
        </button>
      </header>

      <div className={styles.topCard}>
        <div className={styles.applicantHeader}>
          <div className={styles.photoContainer}>
            {app.passportPhoto ? (
              <Image 
                src={`${API_URL}/uploads/${app.passportPhoto.filePath}`} 
                alt="Passport Photo" 
                width={120} 
                height={120} 
                className={styles.passportPhoto}
              />
            ) : (
              <div className={styles.noPhoto}>
                <FiUser size={40} />
              </div>
            )}
            <span className={`${styles.statusBadge} ${styles[app.status.toLowerCase()]}`}>
              {app.status.replace(/_/g, ' ')}
            </span>
          </div>
          
          <div className={styles.applicantMeta}>
            <h2>{app.personalInfo?.firstName} {app.personalInfo?.lastName}</h2>
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Category</span>
                <span className={styles.metaValue}>{app.category?.replace(/_/g, ' ')}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Region</span>
                <span className={styles.metaValue}>{app.preferredRegion}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Submitted</span>
                <span className={styles.metaValue}>
                  {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Phone</span>
                <span className={styles.metaValue}>{app.contactInfo?.phoneNumber}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'details' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <FiEye /> Application Details
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'notes' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <FiMessageSquare /> Internal Notes 
            <span className={styles.countBadge}>{app.notes?.length || 0}</span>
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'timeline' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            <FiClock /> Status History
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainContent}>
          
          {activeTab === 'details' && (
            <div className={styles.detailsContent}>
              {/* Personal Info */}
              <section className={styles.section}>
                <h3>Personal Information</h3>
                {app.personalInfo ? (
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Full Name</span>
                      <span className={styles.value}>{`${app.personalInfo.firstName} ${app.personalInfo.middleName || ''} ${app.personalInfo.lastName}`}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Date of Birth</span>
                      <span className={styles.value}>{new Date(app.personalInfo.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Gender</span>
                      <span className={styles.value}>{app.personalInfo.gender}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Nationality</span>
                      <span className={styles.value}>{app.personalInfo.nationality}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Hometown</span>
                      <span className={styles.value}>{app.personalInfo.hometown}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Height (cm)</span>
                      <span className={styles.value}>{app.personalInfo.heightCm || 'N/A'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Weight (kg)</span>
                      <span className={styles.value}>{app.personalInfo.weightKg || 'N/A'}</span>
                    </div>
                  </div>

                ) : <p className={styles.noData}>No personal information available.</p>}
              </section>

              {/* Contact Info */}
              <section className={styles.section}>
                <h3>Contact Details</h3>
                {app.contactInfo ? (
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Email</span>
                      <span className={styles.value}>{app.contactInfo.email}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Phone</span>
                      <span className={styles.value}>{app.contactInfo.phoneNumber}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Address</span>
                      <span className={styles.value}>{app.contactInfo.residentialAddress}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Digital Address</span>
                      <span className={styles.value}>{app.contactInfo.digitalAddress}</span>
                    </div>
                  </div>
                ) : <p className={styles.noData}>No contact information available.</p>}
              </section>


              {/* Education */}
              <section className={styles.section}>
                <h3>Educational Background</h3>
                {app.education ? (
                  <div className={styles.educationList}>
                    {/* BECE */}
                    {app.education.bece && (
                      <div className={styles.educationCard}>
                        <h4>BECE: {app.education.bece.schoolName} ({app.education.bece.completionYear})</h4>
                        <p>Index: {app.education.bece.indexNumber}</p>
                      </div>
                    )}

                    {/* WASSCE / NovDec */}
                    {app.education.wassce && app.education.wassce.length > 0 && app.education.wassce.map((w, idx) => (
                      <div key={idx} className={styles.educationCard}>
                        <h4>{w.isNovdec ? 'WASSCE (Nov/Dec)' : 'WASSCE'}: {w.schoolName} ({w.completionYear})</h4>
                        <p>Index: {w.indexNumber}</p>
                        {w.results && (
                          <div className={styles.resultsGrid}>
                            {typeof w.results === 'string' ? JSON.parse(w.results).map((res, i) => (
                              <div key={i} className={styles.resultItem}>
                                <span>{res.subject}</span>
                                <strong>{res.grade}</strong>
                              </div>
                            )) : Array.isArray(w.results) ? w.results.map((res, i) => (
                              <div key={i} className={styles.resultItem}>
                                <span>{res.subject}</span>
                                <strong>{res.grade}</strong>
                              </div>
                            )) : null}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Tertiary */}
                    {app.education.tertiary && app.education.tertiary.length > 0 && app.education.tertiary.map((t, idx) => (
                      <div key={idx} className={styles.educationCard}>
                        <h4>Tertiary: {t.institutionName} ({t.completionYear})</h4>
                        <p>{t.qualification} in {t.courseOfStudy}</p>
                        <p>Class: {t.classObtained} | Cert #: {t.certificateNumber}</p>
                        <p>National Service: {t.nationalServiceNumber} ({t.nationalServiceYear})</p>
                      </div>
                    ))}
                  </div>
                ) : <p className={styles.noData}>No educational background available.</p>}
              </section>

              {/* Documents */}
              <section className={styles.section}>
                <h3>Uploaded Documents</h3>
                <div className={styles.documentsGrid}>
                  {app.documents && app.documents.map((doc, i) => (
                    <div key={i} className={styles.docCard}>
                      <div className={styles.docInfo}>
                        <span className={styles.docType}>{doc.documentType.replace(/([A-Z])/g, ' $1')}</span>
                        <a href={`${API_URL}/uploads/${doc.filePath}`} target="_blank" className={styles.viewDoc}>
                          <FiEye /> View File
                        </a>
                      </div>
                      <div className={styles.docStatus}>
                        <span className={`${styles.badge} ${styles[(doc.verificationStatus || 'PENDING').toLowerCase()]}`}>
                          {doc.verificationStatus || 'PENDING'}
                        </span>
                        <div className={styles.docActions}>
                          <button 
                            onClick={() => handleDocumentVerify(doc.id, 'VERIFIED')}
                            className={styles.verifySmall}
                            title="Verify"
                          >
                            <FiCheck />
                          </button>
                          <button 
                            onClick={() => handleDocumentVerify(doc.id, 'REJECTED')}
                            className={styles.rejectSmall}
                            title="Reject"
                          >
                            <FiX />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!app.documents || app.documents.length === 0) && (
                    <p className={styles.noData}>No documents uploaded yet.</p>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className={styles.notesContainer}>
              <ApplicationNotes 
                applicationId={id}
                notes={app.notes || []}
                currentAdminId={currentAdmin?.id}
                isSuperAdmin={currentAdmin?.role === 'SUPER_ADMIN'}
                onAddNote={handleCreateNote}
                onDeleteNote={handleDeleteNote}
              />
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className={styles.timelineContainer}>
              <StatusTimeline timeline={app.timeline || []} />
            </div>
          )}

        </div>

        <div className={styles.sidebar}>
          {/* Eligibility Report */}
          {app.eligibility && (
            <div className={styles.eligibilityCard}>
              <h3>Eligibility Report</h3>
              <div className={styles.eligibilitySummary}>
                <span className={app.eligibility.eligible ? styles.eligiblePass : styles.eligibleFail}>
                  {app.eligibility.eligible ? <FiCheck /> : <FiAlertCircle />}
                  {app.eligibility.eligible ? 'Recommended for Approval' : 'Review Required'}
                </span>
              </div>
              
              <div className={styles.checkList}>
                {app.eligibility.checks.map((check, i) => (
                  <div key={i} className={styles.checkItem}>
                    <div className={styles.checkHeader}>
                      <span className={styles.checkName}>{check.name}</span>
                      <span className={`${styles.checkStatus} ${styles[check.status]}`}>
                        {check.status === 'passed' ? <FiCheck /> : <FiX />}
                      </span>
                    </div>
                    <div className={styles.checkDetail}>
                      <span className={styles.checkValue}>{check.value}</span>
                      <p className={styles.checkMessage}>{check.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {app.eligibility.recommendations?.length > 0 && (
                <div className={styles.recommendations}>
                  <h4>Recommendations</h4>
                  <ul>
                    {app.eligibility.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className={styles.actionCard}>
            <h3>Review Workflow</h3>
            <div className={styles.currentStatus}>
              Current Status: <span className={styles[app.status.toLowerCase()]}>{app.status}</span>
            </div>

            <div className={styles.formGroup}>
              <label>Review Comments</label>
              <textarea 
                value={reviewData.comments}
                onChange={(e) => setReviewData({...reviewData, comments: e.target.value})}
                placeholder="Internal notes for this review..."
                rows={4}
              />
            </div>

            {['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUIRED'].includes(app.status) && (
              <div className={styles.buttonGroup}>
                <button 
                  className={styles.approveBtn} 
                  onClick={() => handleAction('approve')}
                  disabled={processing}
                >
                  <FiCheck /> Approve
                </button>
                
                <button 
                  className={styles.requestDocsBtn}
                  onClick={() => setRequestDocsData(prev => ({ ...prev, isOpen: !prev.isOpen }))}
                  disabled={processing}
                >
                  <FiClipboard /> Request Documents
                </button>

                {requestDocsData.isOpen && (
                  <div className={styles.requestDocsForm}>
                    <div className={styles.docSelection}>
                      <p>Select documents to query:</p>
                      {[
                        'passportPhoto', 'birthCertificate', 'wassceCertificate', 
                        'beceCertificate', 'tertiaryCertificate', 'nationalServiceCert'
                      ].map(docType => (
                        <label key={docType} className={styles.checkboxItem}>
                          <input 
                            type="checkbox" 
                            checked={requestDocsData.selectedDocs.includes(docType)}
                            onChange={() => toggleDocSelection(docType)}
                          />
                          <span>{docType.replace(/([A-Z])/g, ' $1')}</span>
                        </label>
                      ))}
                    </div>
                    <textarea 
                      placeholder="Instructions for the applicant..."
                      value={requestDocsData.message}
                      onChange={(e) => setRequestDocsData(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                    />
                    <button 
                      className={styles.sendRequestBtn}
                      onClick={handleRequestDocuments}
                      disabled={processing || requestDocsData.selectedDocs.length === 0}
                    >
                      Send Request
                    </button>
                  </div>
                )}

                <div className={styles.divider}>OR</div>
                <div className={styles.formGroup}>
                  <label>Rejection Reason</label>
                  <select 
                    value={reviewData.reason}
                    onChange={(e) => setReviewData({...reviewData, reason: e.target.value})}
                  >
                    <option value="">Select a reason...</option>
                    <option value="INELIGIBLE_AGE">Ineligible Age</option>
                    <option value="INELIGIBLE_HEIGHT">Ineligible Height</option>
                    <option value="INCORRECT_DOCUMENTS">Incorrect Documents</option>
                    <option value="FAIL_ACADEMIC">Does not meet academic requirements</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <button 
                  className={styles.rejectBtn} 
                  onClick={() => handleAction('reject')}
                  disabled={processing || !reviewData.reason}
                >
                  <FiX /> Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
