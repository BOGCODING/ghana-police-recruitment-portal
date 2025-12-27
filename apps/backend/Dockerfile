FROM node:18-alpine

WORKDIR /app

RUN npm install -g pnpm

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy shared package
COPY shared ./shared

# Copy all apps package.json to satisfy workspace dependencies during install
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/admin/package.json ./apps/admin/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy backend source code
COPY apps/backend ./apps/backend

# Expose port
EXPOSE 5000

# Start command
CMD ["pnpm", "--filter", "backend", "start"]
