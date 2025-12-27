const { query } = require('../../config/database');
const { hashPassword } = require('../../utils/passwordHasher');

const seedAdmin = async () => {
  const pwd = await hashPassword('Bone@123');
  await query(
    `INSERT INTO admins (email, "passwordHash", "firstName", "lastName", role)
     VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
    ['boneforgames@gmail.com', pwd, 'Super', 'Admin', 'SUPER_ADMIN']
  );
  console.log('Super Admin seeded');
};

module.exports = { seedAdmin };
