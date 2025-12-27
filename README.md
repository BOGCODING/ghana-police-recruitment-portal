# Ghana Police Service Recruitment Portal

A comprehensive, production-ready recruitment portal system built with React.js, Next.js, Node.js, Express.js, and PostgreSQL.

## 🏗️ Architecture

```
ghana-police-recruitment-portal/
├── apps/
│   ├── backend/      # Express.js API (localhost:5000)
│   ├── frontend/     # Next.js Applicant Portal (localhost:3000)
│   └── admin/        # Next.js Admin Dashboard (localhost:3002)
├── shared/           # Shared utilities
└── scripts/          # Deployment scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- pnpm v8+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Clone and install
cd ghana-police-recruitment-portal
pnpm install

# Start PostgreSQL and Redis (via Docker)
docker-compose up -d

# Copy environment files
cp apps/backend/.env.example apps/backend/.env

# Run database migrations
cd apps/backend && npm run migrate

# Start all services
cd ../.. && pnpm dev
```

### Access URLs
- **Frontend**: http://localhost:3000
- **Admin Portal**: http://localhost:3002
- **API**: http://localhost:5000

## 👤 Super Admin

Initialize the super admin account:
```bash
curl -X POST http://localhost:5000/api/admin/init-super-admin
```

Login credentials:
- Email: `boneforgames@gmail.com`
- Password: `Bone@123`

## 📋 Features

### Phase 1 (Complete)
- ✅ Project structure and configuration
- ✅ Database schema with migrations
- ✅ Express.js API with middleware
- ✅ JWT authentication
- ✅ Redis caching
- ✅ WebSocket real-time updates
- ✅ Frontend homepage with animations
- ✅ Admin login page

### Upcoming Phases
- Phase 2: Full authentication system
- Phase 3: Voucher system
- Phase 4: Multi-step application forms
- Phase 5-13: Complete features

## 🔒 Security

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Input sanitization
- File upload validation

## 📄 License

Proprietary - Ghana Police Service
