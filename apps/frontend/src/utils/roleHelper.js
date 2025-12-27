/**
 * Role and status helper utilities
 * Dynamic Applicant/Candidate terminology based on application status
 */

// Statuses that indicate the application has been submitted
const SUBMITTED_STATUSES = ['SUBMITTED', 'APPROVED', 'UNDER_REVIEW', 'DOCUMENTS_REQUIRED', 'QUALIFIED', 'DISQUALIFIED'];

/**
 * Get user role label based on application status
 * @param {string} applicationStatus - Current application status
 * @returns {string} "Applicant" or "Candidate"
 */
export const getUserRole = (applicationStatus) => {
  return SUBMITTED_STATUSES.includes(applicationStatus) ? 'Candidate' : 'Applicant';
};

/**
 * Get formatted status label
 * @param {string} status - Raw status string
 * @returns {string} Human-readable status
 */
export const getStatusLabel = (status) => {
  if (!status) return 'Draft';
  
  const labels = {
    REGISTERED: 'Registered',
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    DOCUMENTS_REQUIRED: 'Documents Required',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    QUALIFIED: 'Qualified',
    DISQUALIFIED: 'Disqualified'
  };
  
  return labels[status] || status.replace(/_/g, ' ');
};

/**
 * Get status color for UI display
 * @param {string} status - Application status
 * @returns {string} Hex color code
 */
export const getStatusColor = (status) => {
  const colors = {
    REGISTERED: '#3B82F6',   // Blue
    DRAFT: '#F59E0B',        // Amber
    SUBMITTED: '#8B5CF6',    // Purple
    UNDER_REVIEW: '#6366F1', // Indigo
    DOCUMENTS_REQUIRED: '#F97316', // Orange
    APPROVED: '#10B981',     // Green
    QUALIFIED: '#10B981',    // Green
    REJECTED: '#EF4444',     // Red
    DISQUALIFIED: '#EF4444'  // Red
  };
  return colors[status] || '#6B7280'; // Gray default
};

/**
 * Get status badge class name
 * @param {string} status - Application status
 * @returns {string} CSS class suffix
 */
export const getStatusClass = (status) => {
  const classes = {
    REGISTERED: 'info',
    DRAFT: 'warning',
    SUBMITTED: 'primary',
    UNDER_REVIEW: 'info',
    DOCUMENTS_REQUIRED: 'warning',
    APPROVED: 'success',
    QUALIFIED: 'success',
    REJECTED: 'danger',
    DISQUALIFIED: 'danger'
  };
  return classes[status] || 'neutral';
};
