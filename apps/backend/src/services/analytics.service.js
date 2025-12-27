const { query } = require('../config/database');
const {
  Application,
  Applicant,
  Voucher,
  PersonalInfo,
  Regional,
  AuditLog,
  User
} = require('../models');



/**
 * Analytics Service - Provides comprehensive analytics and reporting
 */
const AnalyticsService = {
  /**
   * Get main dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats() {
    const [
      applicationStats,
      voucherStats,
      recentActivity,
      userCount
    ] = await Promise.all([
      this.getApplicationStats(),
      this.getVoucherStats(),
      this.getRecentActivityCount(),
      User.count()
    ]);

    return {
      applications: applicationStats,
      vouchers: voucherStats,
      recentActivity,
      totalUsers: userCount
    };
  },

  /**
   * Get application statistics
   * @returns {Promise<Object>} Application statistics
   */
  async getApplicationStats() {
    const result = await query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'SUBMITTED' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status = 'UNDER_REVIEW' THEN 1 ELSE 0 END) as under_review,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'DOCUMENTS_REQUIRED' THEN 1 ELSE 0 END) as documents_required,
        SUM(CASE WHEN status IN ('SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUIRED') THEN 1 ELSE 0 END) as pending
      FROM applications
    `);

    const stats = result.rows[0];
    return {
      total: parseInt(stats.total) || 0,
      draft: parseInt(stats.draft) || 0,
      submitted: parseInt(stats.submitted) || 0,
      underReview: parseInt(stats.underReview) || 0,
      approved: parseInt(stats.approved) || 0,
      rejected: parseInt(stats.rejected) || 0,
      documentsRequired: parseInt(stats.documentsRequired) || 0,
      pending: parseInt(stats.pending) || 0
    };
  },

  /**
   * Get voucher statistics
   * @returns {Promise<Object>} Voucher statistics
   */
  async getVoucherStats() {
    return await Voucher.countByStatus();
  },

  /**
   * Get recent activity count (last 24 hours)
   * @returns {Promise<Object>} Recent activity counts
   */
  async getRecentActivityCount() {
    const result = await query(`
      SELECT
        COUNT(*) FILTER (WHERE action LIKE '%LOGIN%') as logins,
        COUNT(*) FILTER (WHERE action LIKE '%APPLICATION%') as "applicationActions",
        COUNT(*) FILTER (WHERE action LIKE '%VOUCHER%') as "voucherActions"
      FROM audit_logs
      WHERE "createdAt" >= NOW() - INTERVAL '24 hours'
    `);

    const stats = result.rows[0];
    return {
      logins: parseInt(stats.logins) || 0,
      applicationActions: parseInt(stats['applicationActions']) || 0,
      voucherActions: parseInt(stats['voucherActions']) || 0
    };
  },

  /**
   * Get applications by status over time
   * @param {number} days - Number of days to look back
   * @returns {Promise<Array>} Daily application counts
   */
  async getApplicationTrends(days = 30) {
    const result = await query(`
      SELECT
        DATE("createdAt") as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'SUBMITTED' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected
      FROM applications
      WHERE "createdAt" >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `);

    return result.rows.map(row => ({
      date: row.date,
      total: parseInt(row.total) || 0,
      submitted: parseInt(row.submitted) || 0,
      approved: parseInt(row.approved) || 0,
      rejected: parseInt(row.rejected) || 0
    }));
  },

  /**
   * Get regional parity analysis
   * @returns {Promise<Array>} Regional application distribution
   */
  async getRegionalParity() {
    const result = await query(`
      SELECT
        rc."regionCode",
        rc.name as "regionName",
        rc.capacity,
        COUNT(app.id) as "applicationCount",
        SUM(CASE WHEN app.status = 'APPROVED' THEN 1 ELSE 0 END) as "approvedCount",
        SUM(CASE WHEN app.status = 'REJECTED' THEN 1 ELSE 0 END) as "rejectedCount",
        ROUND(COUNT(app.id)::numeric / NULLIF(rc.capacity, 0) * 100, 2) as "capacityPercentage"
      FROM regional_centers rc
      LEFT JOIN applications app ON app."preferredRegion" = rc."regionCode"
      WHERE rc."isActive" = TRUE
      GROUP BY rc.id, rc."regionCode", rc.name, rc.capacity
      ORDER BY "applicationCount" DESC
    `);

    return result.rows.map(row => ({
      regionCode: row.regionCode,
      regionName: row.regionName,
      capacity: parseInt(row.capacity) || 0,
      applicationCount: parseInt(row.applicationCount) || 0,
      approvedCount: parseInt(row.approvedCount) || 0,
      rejectedCount: parseInt(row.rejectedCount) || 0,
      capacityPercentage: parseFloat(row.capacityPercentage) || 0
    }));
  },

  /**
   * Get demographic statistics
   * @returns {Promise<Object>} Demographic breakdown
   */
  async getDemographicStats() {
    const [gender, ageDistribution, maritalStatus, region] = await Promise.all([
      PersonalInfo.countByGender(),
      PersonalInfo.getAgeDistribution(),
      PersonalInfo.countByMaritalStatus(),
      PersonalInfo.countByRegion()
    ]);

    return {
      gender,
      ageDistribution,
      maritalStatus,
      region
    };
  },


  /**
   * Get application processing metrics
   * @returns {Promise<Object>} Processing metrics
   */
  async getProcessingMetrics() {
    const result = await query(`
      SELECT
        AVG(EXTRACT(EPOCH FROM ("reviewedAt" - "submittedAt")) / 86400) as "avgReviewDays",
        MIN(EXTRACT(EPOCH FROM ("reviewedAt" - "submittedAt")) / 86400) as "minReviewDays",
        MAX(EXTRACT(EPOCH FROM ("reviewedAt" - "submittedAt")) / 86400) as "maxReviewDays",
        COUNT(*) FILTER (WHERE "reviewedAt" IS NOT NULL) as "reviewedCount",
        COUNT(*) FILTER (WHERE "reviewedAt" IS NULL AND status = 'SUBMITTED') as "awaitingReview"
      FROM applications
      WHERE "submittedAt" IS NOT NULL
    `);

    const stats = result.rows[0];
    return {
      averageReviewDays: parseFloat(stats.avgReviewDays) || 0,
      minReviewDays: parseFloat(stats.minReviewDays) || 0,
      maxReviewDays: parseFloat(stats.maxReviewDays) || 0,
      reviewedCount: parseInt(stats.reviewedCount) || 0,
      awaitingReview: parseInt(stats.awaitingReview) || 0
    };
  },

  /**
   * Get application category breakdown
   * @returns {Promise<Array>} Category statistics
   */
  async getCategoryStats() {
    const result = await query(`
      SELECT
        category,
        "subCategory",
        COUNT(*) as total,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
        ROUND(SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END)::numeric / 
              NULLIF(COUNT(*), 0) * 100, 2) as "approvalRate"
      FROM applications
      WHERE category IS NOT NULL
      GROUP BY category, "subCategory"
      ORDER BY total DESC
    `);

    return result.rows.map(row => ({
      category: row.category,
      subCategory: row.subCategory,
      total: parseInt(row.total) || 0,
      approved: parseInt(row.approved) || 0,
      rejected: parseInt(row.rejected) || 0,
      approvalRate: parseFloat(row.approvalRate) || 0
    }));
  },

  /**
   * Get admin activity statistics
   * @returns {Promise<Array>} Admin activity breakdown
   */
  async getAdminActivityStats() {
    const result = await query(`
      SELECT
        adm.id as "adminId",
        adm."firstName" || ' ' || adm."lastName" as "adminName",
        COUNT(app.id) as "reviewsCount",
        SUM(CASE WHEN app.status = 'APPROVED' THEN 1 ELSE 0 END) as "approvedCount",
        SUM(CASE WHEN app.status = 'REJECTED' THEN 1 ELSE 0 END) as "rejectedCount",
        MAX(app."reviewedAt") as "lastReview"
      FROM admins adm
      LEFT JOIN applications app ON app."reviewedBy" = adm.id
      WHERE adm."isActive" = TRUE
      GROUP BY adm.id, adm."firstName", adm."lastName"
      ORDER BY "reviewsCount" DESC
    `);

    return result.rows.map(row => ({
      adminId: row.adminId,
      adminName: row.adminName,
      reviewsCount: parseInt(row.reviewsCount) || 0,
      approvedCount: parseInt(row.approvedCount) || 0,
      rejectedCount: parseInt(row.rejectedCount) || 0,
      lastReview: row.lastReview
    }));
  },

  /**
   * Get hourly activity distribution
   * @param {number} days - Number of days to analyze
   * @returns {Promise<Array>} Hourly activity counts
   */
  async getHourlyActivityDistribution(days = 7) {
    const result = await query(`
      SELECT
        EXTRACT(HOUR FROM "createdAt") as hour,
        COUNT(*) as "activityCount"
      FROM audit_logs
      WHERE "createdAt" >= NOW() - INTERVAL '${days} days'
      GROUP BY EXTRACT(HOUR FROM "createdAt")
      ORDER BY hour
    `);

    return result.rows.map(row => ({
      hour: parseInt(row.hour),
      activityCount: parseInt(row.activityCount) || 0
    }));
  },

  /**
   * Get weekly submission trends
   * @param {number} weeks - Number of weeks to look back
   * @returns {Promise<Array>} Weekly submission counts
   */
  async getWeeklySubmissionTrends(weeks = 12) {
    const result = await query(`
      SELECT
        DATE_TRUNC('week', "submittedAt") as "weekStart",
        COUNT(*) as submissions
      FROM applications
      WHERE "submittedAt" IS NOT NULL
        AND "submittedAt" >= NOW() - INTERVAL '${weeks} weeks'
      GROUP BY DATE_TRUNC('week', "submittedAt")
      ORDER BY "weekStart" ASC
    `);

    return result.rows.map(row => ({
      weekStart: row.weekStart,
      submissions: parseInt(row.submissions) || 0
    }));
  },

  /**
   * Get document upload statistics
   * @returns {Promise<Object>} Document statistics
   */
  async getDocumentStats() {
    const result = await query(`
      SELECT
        "documentType",
        COUNT(*) as total,
        SUM(CASE WHEN "verificationStatus" = 'VERIFIED' THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN "verificationStatus" = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN "verificationStatus" = 'PENDING' OR "verificationStatus" IS NULL THEN 1 ELSE 0 END) as pending
      FROM documents
      GROUP BY "documentType"
      ORDER BY total DESC
    `);

    return result.rows.map(row => ({
      documentType: row.documentType,
      total: parseInt(row.total) || 0,
      verified: parseInt(row.verified) || 0,
      rejected: parseInt(row.rejected) || 0,
      pending: parseInt(row.pending) || 0
    }));
  },

  /**
   * Get comprehensive analytics report
   * @returns {Promise<Object>} Complete analytics report
   */
  async getFullReport() {
    const [
      dashboard,
      applicationTrends,
      regionalParity,
      demographics,
      processingMetrics,
      categoryStats,
      documentStats
    ] = await Promise.all([
      this.getDashboardStats(),
      this.getApplicationTrends(30),
      this.getRegionalParity(),
      this.getDemographicStats(),
      this.getProcessingMetrics(),

      this.getCategoryStats(),
      this.getDocumentStats()
    ]);

    return {
      generatedAt: new Date().toISOString(),
      dashboard,
      trends: {
        applications: applicationTrends
      },
      regionalParity,
      demographics,
      processingMetrics,
      categoryStats,
      documentStats
    };

  },

  /**
   * Get real-time metrics (for live dashboard)
   * @returns {Promise<Object>} Real-time metrics
   */
  async getRealTimeMetrics() {
    const [todayStats, onlineUsers, pendingActions] = await Promise.all([
      this.getTodayStats(),
      this.getActiveSessionCount(),
      this.getPendingActionsCount()
    ]);

    return {
      timestamp: new Date().toISOString(),
      today: todayStats,
      onlineUsers,
      pendingActions
    };
  },

  /**
   * Get today's statistics
   * @returns {Promise<Object>} Today's stats
   */
  async getTodayStats() {
    const result = await query(`
      SELECT
        COUNT(*) FILTER (WHERE DATE("createdAt") = CURRENT_DATE) as "newApplications",
        COUNT(*) FILTER (WHERE DATE("submittedAt") = CURRENT_DATE) as "submissionsToday",
        COUNT(*) FILTER (WHERE DATE("reviewedAt") = CURRENT_DATE) as "reviewsToday"
      FROM applications
    `);

    const stats = result.rows[0];
    return {
      newApplications: parseInt(stats.newApplications) || 0,
      submissionsToday: parseInt(stats.submissionsToday) || 0,
      reviewsToday: parseInt(stats.reviewsToday) || 0
    };
  },

  /**
   * Get active session count (from audit logs)
   * @returns {Promise<number>} Active session estimate
   */
  async getActiveSessionCount() {
    const result = await query(`
      SELECT COUNT(DISTINCT "userId") as "activeUsers"
      FROM audit_logs
      WHERE "createdAt" >= NOW() - INTERVAL '15 minutes'
        AND "userId" IS NOT NULL
    `);
    return parseInt(result.rows[0].activeUsers) || 0;
  },

  /**
   * Get pending actions count
   * @returns {Promise<Object>} Pending actions
   */
  async getPendingActionsCount() {
    const result = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'SUBMITTED') as "pendingReviews",
        COUNT(*) FILTER (WHERE status = 'DOCUMENTS_REQUIRED') as "awaitingDocuments"
      FROM applications
    `);

    const stats = result.rows[0];
    return {
      pendingReviews: parseInt(stats.pendingReviews) || 0,
      awaitingDocuments: parseInt(stats.awaitingDocuments) || 0
    };
  },

  // ============================================
  // APPLICANT ANALYTICS (using Applicant model)
  // ============================================

  /**
   * Get applicant statistics
   * @returns {Promise<Object>} Applicant statistics
   */
  async getApplicantStats() {
    const [total, byStatus, recentRegistrations] = await Promise.all([
      Applicant.count(),
      Applicant.countByStatus(),
      this.getRecentRegistrations(7)
    ]);

    return {
      total,
      byStatus,
      recentRegistrations
    };
  },

  /**
   * Get recent registrations
   * @param {number} days - Number of days to look back
   * @returns {Promise<Array>} Daily registration counts
   */
  async getRecentRegistrations(days = 30) {
    const result = await query(`
      SELECT
        DATE("createdAt") as date,
        COUNT(*) as registrations
      FROM applicants
      WHERE "createdAt" >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `);

    return result.rows.map(row => ({
      date: row.date,
      registrations: parseInt(row.registrations) || 0
    }));
  },

  /**
   * Get applicant email verification stats
   * @returns {Promise<Object>} Email verification statistics
   */
  async getEmailVerificationStats() {
    const result = await query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN "emailVerified" = TRUE THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN "emailVerified" = FALSE THEN 1 ELSE 0 END) as unverified,
        ROUND(SUM(CASE WHEN "emailVerified" = TRUE THEN 1 ELSE 0 END)::numeric /
              NULLIF(COUNT(*), 0) * 100, 2) as "verificationRate"
      FROM applicants
    `);

    const stats = result.rows[0];
    return {
      total: parseInt(stats.total) || 0,
      verified: parseInt(stats.verified) || 0,
      unverified: parseInt(stats.unverified) || 0,
      verificationRate: parseFloat(stats.verificationRate) || 0
    };
  },

  /**
   * Get applicant activity metrics
   * @returns {Promise<Object>} Activity metrics
   */
  async getApplicantActivityMetrics() {
    const result = await query(`
      SELECT
        COUNT(*) FILTER (WHERE "lastLogin" IS NOT NULL) as "hasLoggedIn",
        COUNT(*) FILTER (WHERE "lastLogin" >= NOW() - INTERVAL '7 days') as "activeLastWeek",
        COUNT(*) FILTER (WHERE "lastLogin" >= NOW() - INTERVAL '30 days') as "activeLastMonth",
        COUNT(*) FILTER (WHERE "lastLogin" IS NULL) as "neverLoggedIn"
      FROM applicants
    `);

    const stats = result.rows[0];
    return {
      hasLoggedIn: parseInt(stats.hasLoggedIn) || 0,
      activeLastWeek: parseInt(stats.activeLastWeek) || 0,
      activeLastMonth: parseInt(stats.activeLastMonth) || 0,
      neverLoggedIn: parseInt(stats.neverLoggedIn) || 0
    };
  },

  // ============================================
  // APPLICATION ANALYTICS (using Application model)
  // ============================================

  /**
   * Get detailed application analytics
   * @returns {Promise<Object>} Detailed application analytics
   */
  async getDetailedApplicationStats() {
    const [
      statusCounts,
      categoryCounts,
      regionCounts,
      recentApplications
    ] = await Promise.all([
      Application.countByStatus(),
      Application.countByCategory(),
      Application.countByRegion(),
      Application.findRecent(10)
    ]);

    return {
      byStatus: statusCounts,
      byCategory: categoryCounts,
      byRegion: regionCounts,
      recent: recentApplications
    };
  },

  /**
   * Get application completion rate
   * @returns {Promise<Object>} Completion statistics
   */
  async getApplicationCompletionStats() {
    const result = await query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as incomplete,
        SUM(CASE WHEN status != 'DRAFT' THEN 1 ELSE 0 END) as completed,
        ROUND(SUM(CASE WHEN status != 'DRAFT' THEN 1 ELSE 0 END)::numeric /
              NULLIF(COUNT(*), 0) * 100, 2) as "completionRate",
        AVG("currentStep") as "avgStepReached"
      FROM applications
    `);

    const stats = result.rows[0];
    return {
      total: parseInt(stats.total) || 0,
      incomplete: parseInt(stats.incomplete) || 0,
      completed: parseInt(stats.completed) || 0,
      completionRate: parseFloat(stats.completionRate) || 0,
      averageStepReached: parseFloat(stats.avgStepReached) || 0
    };
  },

  /**
   * Get application funnel analysis
   * @returns {Promise<Object>} Funnel stages
   */
  async getApplicationFunnel() {
    const result = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'DRAFT') as draft,
        COUNT(*) FILTER (WHERE status IN ('SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUIRED', 'APPROVED', 'REJECTED')) as submitted,
        COUNT(*) FILTER (WHERE status IN ('UNDER_REVIEW', 'APPROVED', 'REJECTED')) as reviewed,
        COUNT(*) FILTER (WHERE status = 'APPROVED') as approved
      FROM applications
    `);

    const stats = result.rows[0];
    const draft = parseInt(stats.draft) || 0;
    const submitted = parseInt(stats.submitted) || 0;
    const reviewed = parseInt(stats.reviewed) || 0;
    const approved = parseInt(stats.approved) || 0;

    return {
      stages: [
        { name: 'Started', count: draft + submitted, dropoff: 0 },
        { name: 'Submitted', count: submitted, dropoff: draft },
        { name: 'Reviewed', count: reviewed, dropoff: submitted - reviewed },
        { name: 'Approved', count: approved, dropoff: reviewed - approved }
      ],
      conversionRates: {
        startToSubmit: draft + submitted > 0 ? (submitted / (draft + submitted) * 100).toFixed(2) : 0,
        submitToReview: submitted > 0 ? (reviewed / submitted * 100).toFixed(2) : 0,
        reviewToApprove: reviewed > 0 ? (approved / reviewed * 100).toFixed(2) : 0
      }
    };
  },

  // ============================================
  // REGIONAL ANALYTICS (using Regional model)
  // ============================================

  /**
   * Get comprehensive regional statistics
   * @returns {Promise<Object>} Regional statistics
   */
  async getRegionalStats() {
    const [
      allCenters,
      activeCount,
      totalCapacity,
      applicationsByRegion
    ] = await Promise.all([
      Regional.getAll(),
      Regional.countActive(),
      Regional.getTotalCapacity(),
      Regional.countApplicationsByRegion()
    ]);

    return {
      totalCenters: allCenters.length,
      activeCenters: activeCount,
      totalCapacity,
      applicationsByRegion,
      capacityUtilization: totalCapacity > 0 
        ? applicationsByRegion.reduce((sum, r) => sum + parseInt(r.application_count || 0), 0) / totalCapacity * 100 
        : 0
    };
  },

  /**
   * Get regional comparison metrics
   * @returns {Promise<Array>} Regional comparison data
   */
  async getRegionalComparison() {
    const result = await query(`
      SELECT
        rc."regionCode",
        rc.name,
        rc.capacity,
        COUNT(app.id) as "totalApplications",
        SUM(CASE WHEN app.status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN app.status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN app.status IN ('SUBMITTED', 'UNDER_REVIEW') THEN 1 ELSE 0 END) as pending,
        ROUND(AVG(CASE WHEN app.status IN ('APPROVED', 'REJECTED') THEN 
          EXTRACT(EPOCH FROM (app."reviewedAt" - app."submittedAt")) / 86400 
        END), 2) as "avgProcessingDays"
      FROM regional_centers rc
      LEFT JOIN applications app ON app."preferredRegion" = rc."regionCode"
      WHERE rc."isActive" = TRUE
      GROUP BY rc.id, rc."regionCode", rc.name, rc.capacity
      ORDER BY "totalApplications" DESC
    `);

    return result.rows.map(row => ({
      regionCode: row.regionCode,
      name: row.name,
      capacity: parseInt(row.capacity) || 0,
      totalApplications: parseInt(row.totalApplications) || 0,
      approved: parseInt(row.approved) || 0,
      rejected: parseInt(row.rejected) || 0,
      pending: parseInt(row.pending) || 0,
      avgProcessingDays: parseFloat(row.avgProcessingDays) || 0
    }));
  },

  // ============================================
  // AUDIT LOG ANALYTICS (using AuditLog model)
  // ============================================

  /**
   * Get comprehensive audit log analytics
   * @returns {Promise<Object>} Audit log analytics
   */
  async getAuditLogStats() {
    const [actionCounts, entityCounts, recentLogs] = await Promise.all([
      AuditLog.countByAction(),
      AuditLog.countByEntityType(),
      AuditLog.findRecent(20)
    ]);

    return {
      byAction: actionCounts,
      byEntityType: entityCounts,
      recentLogs
    };
  },

  /**
   * Get security-related audit metrics
   * @returns {Promise<Object>} Security metrics
   */
  async getSecurityMetrics() {
    const result = await query(`
      SELECT
        COUNT(*) FILTER (WHERE action LIKE '%LOGIN%') as "loginAttempts",
        COUNT(*) FILTER (WHERE action = 'LOGIN_SUCCESS') as "successfulLogins",
        COUNT(*) FILTER (WHERE action = 'LOGIN_FAILED') as "failedLogins",
        COUNT(*) FILTER (WHERE action LIKE '%PASSWORD%') as "passwordChanges",
        COUNT(DISTINCT "ipAddress") as "uniqueIps"
      FROM audit_logs
      WHERE "createdAt" >= NOW() - INTERVAL '24 hours'
    `);

    const stats = result.rows[0];
    return {
      loginAttempts: parseInt(stats.loginAttempts) || 0,
      successfulLogins: parseInt(stats.successfulLogins) || 0,
      failedLogins: parseInt(stats.failedLogins) || 0,
      passwordChanges: parseInt(stats.passwordChanges) || 0,
      uniqueIps: parseInt(stats.uniqueIps) || 0,
      loginSuccessRate: stats.loginAttempts > 0 
        ? ((stats.successfulLogins / stats.loginAttempts) * 100).toFixed(2)
        : 100
    };
  },

  /**
   * Get user activity by hour
   * @param {string} userId - Optional user ID to filter
   * @returns {Promise<Array>} Hourly activity
   */
  async getUserActivityByHour(userId = null) {
    let whereClause = 'WHERE "createdAt" >= NOW() - INTERVAL \'7 days\'';
    const values = [];

    if (userId) {
      whereClause += ' AND "userId" = $1';
      values.push(userId);
    }

    const result = await query(`
      SELECT
        EXTRACT(HOUR FROM "createdAt") as hour,
        COUNT(*) as "activityCount",
        COUNT(DISTINCT "userId") as "uniqueUsers"
      FROM audit_logs
      ${whereClause}
      GROUP BY EXTRACT(HOUR FROM "createdAt")
      ORDER BY hour
    `, values);

    return result.rows.map(row => ({
      hour: parseInt(row.hour),
      activityCount: parseInt(row.activityCount) || 0,
      uniqueUsers: parseInt(row.uniqueUsers) || 0
    }));
  },

  /**
   * Get top actions performed
   * @param {number} days - Number of days to analyze
   * @param {number} limit - Number of top actions to return
   * @returns {Promise<Array>} Top actions
   */
  async getTopActions(days = 7, limit = 10) {
    const result = await query(`
      SELECT
        action,
        COUNT(*) as count,
        COUNT(DISTINCT "userId") as "uniqueUsers"
      FROM audit_logs
      WHERE "createdAt" >= NOW() - INTERVAL '${days} days'
      GROUP BY action
      ORDER BY count DESC
      LIMIT $1
    `, [limit]);

    return result.rows.map(row => ({
      action: row.action,
      count: parseInt(row.count) || 0,
      uniqueUsers: parseInt(row.uniqueUsers) || 0
    }));
  },

  /**
   * Get user activity summary
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} User activity summary
   */
  async getUserActivitySummary(userId) {
    const activitySummary = await AuditLog.getUserActivitySummary(userId, 30);
    
    const result = await query(`
      SELECT
        COUNT(*) as "totalActions",
        MIN("createdAt") as "firstAction",
        MAX("createdAt") as "lastAction"
      FROM audit_logs
      WHERE "userId" = $1
    `, [userId]);

    const stats = result.rows[0];
    return {
      totalActions: parseInt(stats.total_actions) || 0,
      firstAction: stats.first_action,
      lastAction: stats.last_action,
      activityByAction: activitySummary
    };
  },

  // ============================================
  // COMPREHENSIVE REPORTS
  // ============================================

  /**
   * Get executive summary report
   * @returns {Promise<Object>} Executive summary
   */
  async getExecutiveSummary() {
    const [
      applicationStats,
      applicantStats,
      regionalStats,
      securityMetrics,
      processingMetrics
    ] = await Promise.all([
      this.getApplicationStats(),
      this.getApplicantStats(),
      this.getRegionalStats(),
      this.getSecurityMetrics(),
      this.getProcessingMetrics()
    ]);

    return {
      generatedAt: new Date().toISOString(),
      applications: {
        total: applicationStats.total,
        approved: applicationStats.approved,
        rejected: applicationStats.rejected,
        pending: applicationStats.pending,
        approvalRate: applicationStats.total > 0 
          ? ((applicationStats.approved / applicationStats.total) * 100).toFixed(2)
          : 0
      },
      applicants: {
        total: applicantStats.total,
        recentRegistrations: applicantStats.recentRegistrations
      },
      regions: {
        activeCenters: regionalStats.activeCenters,
        totalCapacity: regionalStats.totalCapacity,
        capacityUtilization: regionalStats.capacityUtilization.toFixed(2)
      },
      processing: {
        averageReviewDays: processingMetrics.averageReviewDays.toFixed(1),
        awaitingReview: processingMetrics.awaitingReview
      },
      security: {
        loginSuccessRate: securityMetrics.loginSuccessRate,
        uniqueIpsToday: securityMetrics.uniqueIps
      }
    };
  }
};

module.exports = AnalyticsService;
