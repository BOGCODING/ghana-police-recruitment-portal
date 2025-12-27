const { query } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * Get high-level overview statistics
 */
const getOverviewStats = async (req, res) => {
  try {
    // Parallelize queries for performance
    const [totalApps, pendingReviews, voucherCount, voucherPrice] = await Promise.all([
      query('SELECT COUNT(*) FROM applications'),
      query('SELECT COUNT(*) FROM applications WHERE status = \'SUBMITTED\''),
      query('SELECT COUNT(*) as count FROM vouchers WHERE "isUsed" = true'),
      query('SELECT value FROM system_settings WHERE key = \'voucher_price\'')
    ]);

    const price = voucherPrice.rows[0]?.value ? parseFloat(voucherPrice.rows[0].value) : 0;
    const usedCount = parseInt(voucherCount.rows[0].count);
    const revenue = usedCount * price;

    const stats = {
      totalApplications: parseInt(totalApps.rows[0].count),
      pendingReviews: parseInt(pendingReviews.rows[0].count),
      totalRevenue: revenue,
      vouchersSold: usedCount // Now reflects realized/used vouchers as requested
    };

    return successResponse(res, stats);
  } catch (error) {
    logger.error('Analytics Overview Error:', error);
    return errorResponse(res, 'Failed to fetch overview stats', 500);
  }
};

/**
 * Get application submission trends (last 30 days)
 */
const getAppTrends = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM-DD') as date,
        COUNT(*) as count
      FROM applications
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date ASC
    `);

    return successResponse(res, result.rows);
  } catch (error) {
    logger.error('Analytics Trends Error:', error);
    return errorResponse(res, 'Failed to fetch application trends', 500);
  }
};

/**
 * Get application status distribution
 */
const getStatusDistribution = async (req, res) => {
  try {
    const result = await query(`
      SELECT status, COUNT(*) as count
      FROM applications
      GROUP BY status
    `);

    return successResponse(res, result.rows);
  } catch (error) {
    logger.error('Analytics Status Distribution Error:', error);
    return errorResponse(res, 'Failed to fetch status distribution', 500);
  }
};

/**
 * Get demographics data (Gender, Region, Age)
 */
const getDemographics = async (req, res) => {
  try {
    const [gender, region, age] = await Promise.all([
      // Gender Distribution
      query(`
        SELECT gender, COUNT(*) as count 
        FROM personal_info 
        GROUP BY gender
      `),
      
      // Region Distribution
      query(`
        SELECT region, COUNT(*) as count 
        FROM personal_info 
        GROUP BY region
        ORDER BY count DESC
      `),

      // Age Distribution (Calculated)
      query(`
        SELECT 
          CASE 
            WHEN EXTRACT(YEAR FROM AGE("dateOfBirth")) BETWEEN 18 AND 21 THEN '18-21'
            WHEN EXTRACT(YEAR FROM AGE("dateOfBirth")) BETWEEN 22 AND 25 THEN '22-25'
            WHEN EXTRACT(YEAR FROM AGE("dateOfBirth")) BETWEEN 26 AND 30 THEN '26-30'
            ELSE '30+'
          END as age_group,
          COUNT(*) as count
        FROM personal_info
        WHERE "dateOfBirth" IS NOT NULL
        GROUP BY age_group
        ORDER BY age_group
      `)
    ]);

    return successResponse(res, {
      gender: gender.rows,
      region: region.rows,
      age: age.rows
    });
  } catch (error) {
    logger.error('Analytics Demographics Error:', error);
    return errorResponse(res, 'Failed to fetch demographics', 500);
  }
};

// Migrated/Stubbed methods to prevent routing crash
const getStatsByCategory = async (req, res) => {
  const result = await query('SELECT category, COUNT(*) as count FROM applications GROUP BY category');
  return successResponse(res, result.rows);
};

const getStatsByRegion = async (req, res) => {
  const result = await query(`
    SELECT region, COUNT(*) as count 
    FROM personal_info 
    GROUP BY region
  `);
  return successResponse(res, result.rows);
};

// Main Dashboard compatibility endpoint
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalApps, 
      byStatus, 
      byCategory, 
      byRegion, 
      today,
      trends,
      byGender,
      recentApps,
      voucherCount,
      voucherPrice
    ] = await Promise.all([
      query('SELECT COUNT(*) FROM applications'),
      query('SELECT status, COUNT(*) as count FROM applications GROUP BY status'),
      query('SELECT category, COUNT(*) as count FROM applications GROUP BY category'),
      query('SELECT "preferredRegion" as region, COUNT(*) as count FROM applications GROUP BY "preferredRegion"'),
      query('SELECT COUNT(*) FROM applications WHERE "createdAt" >= NOW() - INTERVAL \'24 hours\''),
      query(`
        SELECT 
          TO_CHAR("createdAt", 'YYYY-MM-DD') as date,
          COUNT(*) as count
        FROM applications
        WHERE "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY date
        ORDER BY date ASC
      `),
      query('SELECT gender, COUNT(*) as count FROM personal_info GROUP BY gender'),
      query(`
        SELECT 
          a.id, 
          p."firstName", 
          p."lastName", 
          a.category, 
          a.status, 
          a."createdAt"
        FROM applications a
        LEFT JOIN personal_info p ON a."id" = p."applicationId"
        ORDER BY a."createdAt" DESC
        LIMIT 5
      `),
      query('SELECT COUNT(*) as count FROM vouchers WHERE "isUsed" = true'),
      query('SELECT value FROM system_settings WHERE key = \'voucher_price\'')
    ]);

    const statusMap = byStatus.rows.reduce((acc, curr) => {
      acc[curr.status] = parseInt(curr.count);
      return acc;
    }, {});

    const price = voucherPrice.rows[0]?.value ? parseFloat(voucherPrice.rows[0].value) : 0;
    const usedCount = parseInt(voucherCount.rows[0].count);
    const revenue = usedCount * price;

    const stats = {
      overview: {
        totalApplications: parseInt(totalApps.rows[0].count),
        pending: statusMap['SUBMITTED'] || 0,
        under_review: statusMap['UNDER_REVIEW'] || 0,
        disqualified: (statusMap['DISQUALIFIED'] || 0) + (statusMap['REJECTED'] || 0),
        qualified: parseInt(totalApps.rows[0].count) - (statusMap['DRAFT'] || 0) - ((statusMap['DISQUALIFIED'] || 0) + (statusMap['REJECTED'] || 0)),
        approved: statusMap['APPROVED'] || 0,
        rejected: statusMap['REJECTED'] || 0,
        drafts: statusMap['DRAFT'] || 0,
        today: parseInt(today.rows[0].count),
        revenue: revenue
      },
      byCategory: byCategory.rows,
      byRegion: byRegion.rows,
      byGender: byGender.rows,
      trends: trends.rows,
      recentApplications: recentApps.rows
    };

    return successResponse(res, stats);
  } catch (error) {
    logger.error('Get Dashboard Stats Error:', error);
    return errorResponse(res, 'Failed to fetch dashboard stats', 500);
  }
};

const getStatsByStatus = getStatusDistribution;
const getTrendAnalysis = getAppTrends;

const getDetailedRegionalStats = async (req, res) => {
  try {
    const [counts, statuses, categories] = await Promise.all([
      // Total counts per region
      query(`
        SELECT region, COUNT(*) as total 
        FROM personal_info 
        GROUP BY region
        ORDER BY total DESC
      `),
      // Status distribution per region
      query(`
        SELECT p.region, a.status, COUNT(*) as count
        FROM personal_info p
        JOIN applications a ON p."applicationId" = a.id
        GROUP BY p.region, a.status
      `),
      // Category distribution per region
      query(`
        SELECT p.region, a.category, COUNT(*) as count
        FROM personal_info p
        JOIN applications a ON p."applicationId" = a.id
        GROUP BY p.region, a.category
      `)
    ]);

    // Process data into a usable format
    const regions = {};
    
    counts.rows.forEach(r => {
      regions[r.region] = {
        name: r.region,
        total: parseInt(r.total),
        statuses: {},
        categories: {}
      };
    });

    statuses.rows.forEach(r => {
      if (regions[r.region]) {
        regions[r.region].statuses[r.status] = parseInt(r.count);
      }
    });

    categories.rows.forEach(r => {
      if (regions[r.region]) {
        regions[r.region].categories[r.category] = parseInt(r.count);
      }
    });

    return successResponse(res, Object.values(regions));
  } catch (error) {
    logger.error('Detailed Regional Stats Error:', error);
    return errorResponse(res, 'Failed to fetch detailed regional stats', 500);
  }
};

const getVoucherAnalytics = async (req, res) => {
  return successResponse(res, { sold: 0, revenue: 0 });
};

const getRealtimeStats = getOverviewStats;

const getComplianceStats = async (req, res) => {
  return successResponse(res, { compliant: true });
};

module.exports = {
  getOverviewStats,
  getAppTrends,
  getStatusDistribution,
  getDemographics,
  // Detailed implementations
  getDashboardStats,
  getStatsByCategory,
  getStatsByRegion,
  getStatsByStatus,
  getTrendAnalysis,
  getVoucherAnalytics,
  getDetailedRegionalStats,
  getRealtimeStats,
  getComplianceStats
};
