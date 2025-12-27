const { query } = require('../../config/database');

const seedRegional = async () => {
  const centers = [
    ['Accra - Police Headquarters', 'GA', 'Off Ring Road, Accra'],
    ['Kumasi - Regional Headquarters', 'AS', 'Adum, Kumasi'],
    ['Tamale - Regional Headquarters', 'NR', 'Tamale Central'],
    ['Takoradi - Regional Headquarters', 'WR', 'Sekondi'],
    ['Cape Coast - Regional Headquarters', 'CR', 'Cape Coast'],
    ['Koforidua - Regional Headquarters', 'ER', 'Koforidua']
  ];

  for (const [name, code, location] of centers) {
    await query(
      'INSERT INTO regional_centers (name, "regionCode", location) VALUES ($1, $2, $3)',
      [name, code, location]
    );
  }
  console.log('Regional centers seeded');
};

module.exports = { seedRegional };
