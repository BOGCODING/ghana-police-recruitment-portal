const { query } = require('../../config/database');

const seedPermissions = async () => {
  const permissions = [
    ['MANAGE_USERS', 'admin', 'Create and manage admin users'],
    ['VIEW_ANALYTICS', 'dashboard', 'View system-wide statistics'],
    ['REVIEW_APPLICATIONS', 'applications', 'Approve or reject applications'],
    ['VERIFY_DOCUMENTS', 'applications', 'Verify individual applicant documents'],
    ['GENERATE_VOUCHERS', 'vouchers', 'Create and send registration vouchers'],
    ['EXPORT_DATA', 'reports', 'Export recruitment data to Excel']
  ];

  for (const [name, module, desc] of permissions) {
    await query(
      'INSERT INTO permissions (name, module, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
      [name, module, desc]
    );
  }
  console.log('Permissions seeded');
};

module.exports = { seedPermissions };
