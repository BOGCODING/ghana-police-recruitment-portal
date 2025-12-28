# Deployment Guide: Ghana Police Recruitment Portal

This project is structured as a monorepo and is ready for production deployment.

## Deployment Options

### 1. Render (Recommended)
The project includes a `render.yaml` file that defines three services:
- **gps-backend**: Express API
- **gps-frontend**: Applicant Portal (Next.js)
- **gps-admin**: Admin Dashboard (Next.js)

#### Steps:
1. Push your code to GitHub.
2. Log into [Render](https://render.com).
3. Click **New** -> **Blueprint**.
4. Connect your repository.
5. Render will automatically detect the `render.yaml` and prompt you for the required environment variables:
   - `DATABASE_URL` (Supabase or Render PostgreSQL)
   - `REDIS_URL` (Internal or external Redis)
   - `JWT_SECRET` (Secure random string)
   - `ADMIN_SECRET` (Secure random string)
   - `CORS_ORIGIN` (Your frontend/admin URLs)
   - `NEXT_PUBLIC_API_URL` (Backend service URL)

### 2. Docker (Production-ready)
Each app contains a production-optimized `Dockerfile`.

#### Steps:
1. Ensure you have your `.env` file ready (use `.env.docker` as a template).
2. Build and run:
   ```bash
   docker-compose build
   docker-compose up -d
   ```
3. Run migrations:
   ```bash
   docker exec gps_backend npm run migrate
   docker exec gps_backend npm run seed
   ```

### 3. Manual Deployment (Linux/VPS)
Each directory (`apps/backend`, `apps/frontend`, `apps/admin`) can be deployed independently.

#### Requirements:
- Node.js 18+
- PostgreSQL
- Redis (Optional but recommended for rate limiting)

---

## Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for auth tokens | `a-very-long-random-string` |
| `ADMIN_SECRET` | Secret for admin API access | `another-long-random-string` |
| `NEXT_PUBLIC_API_URL` | Pulsing backend URL for frontend | `https://api.yourdomain.com` |

## Post-Deployment Checklist
- [ ] Run database migrations: `npm run migrate` in backend.
- [ ] Verify CORS settings match your production domains.
- [ ] Set up SSL certificates (automated if using Render/Vercel).
