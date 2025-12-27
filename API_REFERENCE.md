# Ghana Police Service Recruitment Portal - API Reference

Comprehensive documentation for the backend API of the Ghana Police Service (GPS) Recruitment Portal.

## Base URL

`http://localhost:5000/api` (Development)

---

## 1. Authentication & Security

All protected routes require a Bearer JWT Token in the `Authorization` header or an `accessToken` cookie.

### 1.1 Public Auth

- `POST /auth/validate-voucher`: Validate a voucher before registration.
- `POST /auth/register`: Register a new applicant using a valid voucher.
- `POST /auth/login`: Login for applicants. Returns `accessToken` (JWT) and `user` data.
- `POST /auth/refresh-token`: Get a new access token using a valid refresh token.
- `POST /auth/forgot-password`: Send a password reset email.
- `POST /auth/reset-password`: Reset password using a reset token.
- `GET /auth/verify-email/:token`: Verify email address.

### 1.2 Protected Auth

- `GET /auth/me`: Get current authenticated user (applicant) details.
- `POST /auth/logout`: Invalidate session and clear auth cookies.

---

## 2. Applicant Portal (Applications)

All routes (except `/track/:id`) require applicant authentication.

### 2.1 Management

- `GET /applications/status`: Get current application progress and status.
- `GET /applications/history`: Get application status transition history.
- `GET /applications/full`: Get complete application dataset (Personal, Contact, Education, etc.).
- `POST /applications/submit`: Final submission of the recruitment application.
- `GET /applications/download-pdf`: Generate and download the official application summary PDF.

### 2.2 Multi-Step Application Flow

- `POST /applications/personal-info`: Save/Update step 1 personal data.
- `POST /applications/contact-info`: Save/Update step 2 contact details.
- `POST /applications/education`: Save/Update step 4 educational history (WASSCE/BECE).
- `POST /applications/category`: Save/Update step 5 category selection.
- `POST /applications/declaration`: Sign the legal declaration (final step before submission).

### 2.3 Utilities

- `GET /applications/track/:applicationId`: Publicly check application status using a unique ID.
- `POST /applications/auto-save`: Save partial form drafts automatically.
- `GET /applications/qr-code`: Get a unique QR code for the application.

---

## 3. Administration

All routes require `Admin` authentication. Some require `Super Admin` privileges.

### 3.1 Admin Auth & Settings

- `POST /admin/login`: Secure login for administrative personnel.
- `GET /admin/me`: Get current admin profile.
- `GET /admin/audit-logs`: (Super Admin) View system-wide security and action logs.
- `GET /admin/sessions`: (Super Admin) Monitor active administrative sessions.

### 3.2 Applicant Management

- `GET /admin/applications`: List all applications with advanced filtering (status, region, category).
- `GET /admin/applications/:id`: View granular application details (all data + documents).
- `POST /admin/applications/:id/approve`: Approve an application with comments.
- `POST /admin/applications/:id/reject`: Reject an application with specific reasons.
- `POST /admin/applications/bulk/approve`: Approve multiple selected applications.
- `POST /admin/applications/bulk/reject`: Reject multiple selected applications.

### 3.3 Communication Hub

- `POST /admin/notifications/send-bulk`: Send targeted notifications to applicants based on status or category.
- `GET /admin/notifications/templates`: List available notification templates.

---

## 4. Analytics & Statistics

- `GET /analytics/overview`: High-level recruitment funnel overview.
- `GET /analytics/trends`: Track application volume over time (daily/weekly).
- `GET /analytics/distribution`: Breakdown by status, gender, and category.
- `GET /analytics/regions`: Detailed regional and district-level statistics.
- `GET /analytics/realtime`: Live connection stats for dashboard synchronization.

---

## 5. Vouchers & Payments

- `POST /vouchers/check`: Public utility to verify voucher status.
- `POST /vouchers/purchase`: Public endpoint for online voucher purchasing.
- `POST /vouchers/generate`: (Admin) Manually generate a single recruitment voucher.
- `POST /vouchers/generate-bulk`: (Admin) Generate thousands of vouchers for regional distribution.
- `GET /vouchers/stats`: (Admin) Track voucher sales and usage metrics.

---

## 6. System & Utilities

- `GET /health`: Basic API health and connectivity check.
- `GET /system/public-settings`: Fetch announcement banner and registration lock states.
- `GET /regions`: Get Ghana regional and district data for dropdowns.
- `GET /education/schools`: Searchable database of accredited SHS and Tertiary institutions.
- `GET /notifications`: Get real-time notifications for the logged-in user (Admin or Applicant).

---

## Security Layers

1. **JWT Authentication**: Industry-standard JSON Web Tokens for session management.
2. **Maintenance Mode**: Admin-controlled switch to lock the portal for system updates.
3. **Rate Limiting**: Intelligent limits to prevent brute-force attacks on Auth and Voucher endpoints.
4. **Regional Access Control**: Restricts local admins to data from their specific assigned regions.
5. **Role-Based Access (RBAC)**: Segregated permissions for Super Admins, Data Officers, and Regional Commanders.
