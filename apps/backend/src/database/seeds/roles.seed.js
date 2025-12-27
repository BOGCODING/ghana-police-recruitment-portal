const { query } = require('../../config/database');

const seedRoles = async () => {
  const roles = [
    ['SUPER_ADMIN', 'Full system access'],
    ['MODERATOR', 'Application review and document verification'],
    ['VIEWER', 'Data viewing and reporting'],
    ['VOUCHER_MANAGER', 'Voucher generation and tracking'],
    ['REGIONAL_ADMIN', 'Regional screening management']
  ];

  for (const [name, desc] of roles) {
    await query(
      'INSERT INTO roles (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
      [name, desc]
    );
  }
  console.log('Roles seeded');
};

module.exports = { seedRoles };
