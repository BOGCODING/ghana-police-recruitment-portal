#!/bin/bash
echo "Commencing deployment of GPS Recruitment Portal..."

# 1. Build project
pnpm build

# 2. Run migrations
node scripts/migrate.js

# 3. Restart services (using PM2 as an example)
# pm2 reload ecosystem.config.js --env production

echo "Deployment finished."
