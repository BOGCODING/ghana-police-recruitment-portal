require('dotenv').config();
const { seedRoles } = require('./roles.seed');
const { seedPermissions } = require('./permissions.seed');
const { seedRegional } = require('./regional.seed');
const { seedAdmin } = require('./admin.seed');
const { seedCategories } = require('./categories.seed');

const runSeeds = async () => {
  try {
    console.log('Starting seed process...');
    await seedRoles();
    await seedPermissions();
    await seedRegional();
    await seedAdmin();
    await seedCategories();
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

runSeeds();
