# Ghana Police Service Recruitment Portal - Detailed Directory Structure

This document provides a comprehensive view of the entire project structure, including backend, frontend (applicant), and admin components.

ghana-police-recruitment-portal/
├── .env.example
├── .gitignore
├── .prettierrc
├── ARCHITECTURE.md
├── DEPLOYMENT.md
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── docker-compose.yml
├── apps/
│   ├── admin/
│   │   ├── .env.local
│   │   ├── .eslintrc.json
│   │   ├── jsconfig.json
│   │   ├── next.config.js
│   │   ├── package.json
│   │   ├── postcss.config.js
│   │   ├── tailwind.config.js
│   │   ├── public/
│   │   │   ├── favicon.ico
│   │   │   ├── admin-logo.png
│   │   │   ├── manifest.json
│   │   │   ├── images/
│   │   │   │   ├── admin-background.jpg
│   │   │   │   └── dashboard-bg.jpg
│   │   │   └── icons/
│   │   │       ├── dashboard.svg
│   │   │       ├── applications.svg
│   │   │       ├── vouchers.svg
│   │   │       ├── users.svg
│   │   │       └── analytics.svg
│   │   ├── src/
│   │   │   ├── middleware.js
│   │   │   ├── app/
│   │   │   │   ├── globals.css
│   │   │   │   ├── layout.js
│   │   │   │   ├── loading.js
│   │   │   │   ├── error.js
│   │   │   │   ├── not-found.js
│   │   │   │   ├── page.js
│   │   │   │   ├── login/
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── styles.module.css
│   │   │   │   └── (dashboard)/
│   │   │   │       ├── layout.js
│   │   │   │       ├── dashboard/
│   │   │   │       │   ├── page.js
│   │   │   │       │   └── styles.module.css
│   │   │   │       ├── applications/
│   │   │   │       │   ├── page.js
│   │   │   │       │   ├── styles.module.css
│   │   │   │       │   ├── [id]/
│   │   │   │       │   │   ├── page.js
│   │   │   │       │   │   └── styles.module.css
│   │   │   │       │   ├── pending/
│   │   │   │       │   │   └── page.js
│   │   │   │       │   ├── approved/
│   │   │   │       │   │   └── page.js
│   │   │   │       │   ├── rejected/
│   │   │   │       │   │   └── page.js
│   │   │   │       │   └── review/
│   │   │   │       │       └── page.js
│   │   │   │       ├── vouchers/
│   │   │   │       │   ├── page.js
│   │   │   │       │   ├── styles.module.css
│   │   │   │       │   ├── generate/
│   │   │   │       │   │   ├── page.js
│   │   │   │       │   │   └── styles.module.css
│   │   │   │       │   ├── bulk/
│   │   │   │       │   │   ├── page.js
│   │   │   │       │   │   └── styles.module.css
│   │   │   │       │   └── analytics/
│   │   │   │       │       ├── page.js
│   │   │   │       │       └── styles.module.css
│   │   │   │       ├── users/
│   │   │   │       │   ├── page.js
│   │   │   │       │   ├── styles.module.css
│   │   │   │       │   ├── create/
│   │   │   │       │   │   ├── page.js
│   │   │   │       │   │   └── styles.module.css
│   │   │   │       │   └── [id]/
│   │   │   │       │       ├── page.js
│   │   │   │       │       └── styles.module.css
│   │   │   │       ├── roles/
│   │   │   │       │   ├── page.js
│   │   │   │       │   ├── styles.module.css
│   │   │   │       │   └── permissions/
│   │   │   │       │       └── page.js
│   │   │   │       ├── analytics/
│   │   │   │       │   ├── page.js
│   │   │   │       │   ├── styles.module.css
│   │   │   │       │   ├── regional/
│   │   │   │       │   │   └── page.js
│   │   │   │       │   ├── categories/
│   │   │   │       │   │   └── page.js
│   │   │   │       │   └── trends/
│   │   │   │       │       └── page.js
│   │   │   │       ├── documents/
│   │   │   │       │   ├── page.js
│   │   │   │       │   ├── styles.module.css
│   │   │   │       │   ├── pending/
│   │   │   │       │   │   └── page.js
│   │   │   │       │   └── verified/
│   │   │   │       │       └── page.js
│   │   │   │       ├── notifications/
│   │   │   │       │   ├── page.js
│   │   │   │       │   ├── styles.module.css
│   │   │   │       │   ├── send/
│   │   │   │       │   │   └── page.js
│   │   │   │       │   └── templates/
│   │   │   │       │       └── page.js
│   │   │   │       ├── reports/
│   │   │   │       │   ├── page.js
│   │   │   │       │   ├── styles.module.css
│   │   │   │       │   ├── export/
│   │   │   │       │   │   └── page.js
│   │   │   │       │   └── custom/
│   │   │   │       │       └── page.js
│   │   │   │       ├── audit-logs/
│   │   │   │       │   ├── page.js
│   │   │   │       │   └── styles.module.css
│   │   │   │       ├── settings/
│   │   │   │       │   ├── page.js
│   │   │   │       │   ├── styles.module.css
│   │   │   │       │   ├── general/
│   │   │   │       │   │   └── page.js
│   │   │   │       │   ├── security/
│   │   │   │       │   │   └── page.js
│   │   │   │       │   └── system/
│   │   │   │       │       └── page.js
│   │   │   │       └── profile/
│   │   │   │           ├── page.js
│   │   │   │           └── styles.module.css
│   │   │   ├── components/
│   │   │   │   ├── common/
│   │   │   │   │   ├── AdminHeader/
│   │   │   │   │   │   ├── AdminHeader.js
│   │   │   │   │   │   ├── AdminHeader.module.css
│   │   │   │   │   │   ├── NotificationBell.js
│   │   │   │   │   │   └── ProfileMenu.js
│   │   │   │   │   ├── AdminSidebar/
│   │   │   │   │   │   ├── AdminSidebar.js
│   │   │   │   │   │   ├── AdminSidebar.module.css
│   │   │   │   │   │   ├── SidebarMenu.js
│   │   │   │   │   │   └── MenuCollapse.js
│   │   │   │   │   ├── DataTable/
│   │   │   │   │   │   ├── DataTable.js
│   │   │   │   │   │   ├── DataTable.module.css
│   │   │   │   │   │   ├── TableFilters.js
│   │   │   │   │   │   ├── TableActions.js
│   │   │   │   │   │   └── ExportButton.js
│   │   │   │   │   ├── Charts/
│   │   │   │   │   │   ├── LineChart.js
│   │   │   │   │   │   ├── BarChart.js
│   │   │   │   │   │   ├── PieChart.js
│   │   │   │   │   │   ├── DoughnutChart.js
│   │   │   │   │   │   └── Charts.module.css
│   │   │   │   │   ├── StatCard/
│   │   │   │   │   │   ├── StatCard.js
│   │   │   │   │   │   └── StatCard.module.css
│   │   │   │   │   └── SearchBar/
│   │   │   │   │       ├── SearchBar.js
│   │   │   │   │       └── SearchBar.module.css
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── OverviewStats/
│   │   │   │   │   │   ├── OverviewStats.js
│   │   │   │   │   │   └── OverviewStats.module.css
│   │   │   │   │   ├── RecentApplications/
│   │   │   │   │   │   ├── RecentApplications.js
│   │   │   │   │   │   └── RecentApplications.module.css
│   │   │   │   │   ├── RegionalBreakdown/
│   │   │   │   │   │   ├── RegionalBreakdown.js
│   │   │   │   │   │   └── RegionalBreakdown.module.css
│   │   │   │   │   ├── CategoryStats/
│   │   │   │   │   │   ├── CategoryStats.js
│   │   │   │   │   │   └── CategoryStats.module.css
│   │   │   │   │   ├── PendingActions/
│   │   │   │   │   │   ├── PendingActions.js
│   │   │   │   │   │   └── PendingActions.module.css
│   │   │   │   │   └── ActivityFeed/
│   │   │   │   │       ├── ActivityFeed.js
│   │   │   │   │       └── ActivityFeed.module.css
│   │   │   │   ├── applications/
│   │   │   │   │   ├── ApplicationList/
│   │   │   │   │   │   ├── ApplicationList.js
│   │   │   │   │   │   └── ApplicationList.module.css
│   │   │   │   │   ├── ApplicationDetail/
│   │   │   │   │   │   ├── ApplicationDetail.js
│   │   │   │   │   │   ├── ApplicationDetail.module.css
│   │   │   │   │   │   ├── PersonalInfoView.js
│   │   │   │   │   │   ├── EducationView.js
│   │   │   │   │   │   └── DocumentsView.js
│   │   │   │   │   ├── ReviewPanel/
│   │   │   │   │   │   ├── ReviewPanel.js
│   │   │   │   │   │   ├── ReviewPanel.module.css
│   │   │   │   │   │   ├── ApprovalButtons.js
│   │   │   │   │   │   └── ReviewComments.js
│   │   │   │   │   ├── ApplicationFilters/
│   │   │   │   │   │   ├── ApplicationFilters.js
│   │   │   │   │   │   └── ApplicationFilters.module.css
│   │   │   │   │   └── BulkActions/
│   │   │   │   │       ├── BulkActions.js
│   │   │   │   │       └── BulkActions.module.css
│   │   │   │   ├── vouchers/
│   │   │   │   │   ├── VoucherGenerator/
│   │   │   │   │   │   ├── VoucherGenerator.js
│   │   │   │   │   │   └── VoucherGenerator.module.css
│   │   │   │   │   ├── BulkVoucherGenerator/
│   │   │   │   │   │   ├── BulkVoucherGenerator.js
│   │   │   │   │   │   └── BulkVoucherGenerator.module.css
│   │   │   │   │   ├── VoucherList/
│   │   │   │   │   │   ├── VoucherList.js
│   │   │   │   │   │   └── VoucherList.module.css
│   │   │   │   │   └── VoucherAnalytics/
│   │   │   │   │       ├── VoucherAnalytics.js
│   │   │   │   │       └── VoucherAnalytics.module.css
│   │   │   │   ├── users/
│   │   │   │   │   ├── UserList/
│   │   │   │   │   │   ├── UserList.js
│   │   │   │   │   │   └── UserList.module.css
│   │   │   │   │   ├── CreateUserForm/
│   │   │   │   │   │   ├── CreateUserForm.js
│   │   │   │   │   │   └── CreateUserForm.module.css
│   │   │   │   │   ├── RoleAssignment/
│   │   │   │   │   │   ├── RoleAssignment.js
│   │   │   │   │   │   └── RoleAssignment.module.css
│   │   │   │   │   └── PermissionMatrix/
│   │   │   │   │       ├── PermissionMatrix.js
│   │   │   │   │       └── PermissionMatrix.module.css
│   │   │   │   └── analytics/
│   │   │   │       ├── TrendAnalysis/
│   │   │   │       │   ├── TrendAnalysis.js
│   │   │   │       │   └── TrendAnalysis.module.css
│   │   │   │       ├── RegionalReport/
│   │   │   │       │   ├── RegionalReport.js
│   │   │   │       │   └── RegionalReport.module.css
│   │   │   │       └── CategoryReport/
│   │   │   │           ├── CategoryReport.js
│   │   │   │           └── CategoryReport.module.css
│   │   │   ├── contexts/
│   │   │   │   ├── AdminAuthContext.js
│   │   │   │   ├── AdminNotificationContext.js
│   │   │   │   └── AdminWebSocketContext.js
│   │   │   ├── hooks/
│   │   │   │   ├── useAdminAuth.js
│   │   │   │   ├── useApplications.js
│   │   │   │   ├── useVouchers.js
│   │   │   │   ├── useAnalytics.js
│   │   │   │   ├── useExport.js
│   │   │   │   └── useRealtime.js
│   │   │   ├── lib/
│   │   │   │   ├── api.js
│   │   │   │   ├── axios.js
│   │   │   │   ├── constants.js
│   │   │   │   ├── validators.js
│   │   │   │   ├── formatters.js
│   │   │   │   └── export-utils.js
│   │   │   ├── services/
│   │   │   │   ├── adminAuthService.js
│   │   │   │   ├── applicationService.js
│   │   │   │   ├── voucherService.js
│   │   │   │   ├── userService.js
│   │   │   │   ├── analyticsService.js
│   │   │   │   ├── notificationService.js
│   │   │   │   └── exportService.js
│   │   │   └── styles/
│   │   │       ├── variables.css
│   │   │       ├── admin-animations.css
│   │   │       └── admin-utilities.css
│   ├── backend/
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── .eslintrc.json
│   │   ├── .prettierrc
│   │   ├── nodemon.json
│   │   ├── package.json
│   │   ├── server.js
│   │   ├── src/
│   │   │   ├── app.js
│   │   │   ├── config/
│   │   │   │   ├── database.js
│   │   │   │   ├── redis.js
│   │   │   │   ├── email.js
│   │   │   │   ├── cloudinary.js
│   │   │   │   ├── websocket.js
│   │   │   │   ├── cors.js
│   │   │   │   ├── jwt.js
│   │   │   │   └── constants.js
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── application.controller.js
│   │   │   │   ├── voucher.controller.js
│   │   │   │   ├── admin.controller.js
│   │   │   │   ├── user.controller.js
│   │   │   │   ├── upload.controller.js
│   │   │   │   ├── notification.controller.js
│   │   │   │   ├── analytics.controller.js
│   │   │   │   ├── regional.controller.js
│   │   │   │   └── audit.controller.js
│   │   │   ├── database/
│   │   │   │   ├── migrate.js
│   │   │   │   ├── migrations/
│   │   │   │   │   ├── 001_create_users_table.sql
│   │   │   │   │   ├── 002_create_admins_table.sql
│   │   │   │   │   ├── 003_create_applicants_table.sql
│   │   │   │   │   ├── 004_create_applications_table.sql
│   │   │   │   │   ├── 005_create_personal_info_table.sql
│   │   │   │   │   ├── 006_create_contact_info_table.sql
│   │   │   │   │   ├── 007_create_physical_attributes_table.sql
│   │   │   │   │   ├── 008_create_education_table.sql
│   │   │   │   │   ├── 009_create_bece_results_table.sql
│   │   │   │   │   ├── 010_create_wassce_results_table.sql
│   │   │   │   │   ├── 011_create_tertiary_education_table.sql
│   │   │   │   │   ├── 012_create_employment_history_table.sql
│   │   │   │   │   ├── 013_create_documents_table.sql
│   │   │   │   │   ├── 014_create_vouchers_table.sql
│   │   │   │   │   ├── 015_create_notifications_table.sql
│   │   │   │   │   ├── 016_create_audit_logs_table.sql
│   │   │   │   │   ├── 017_create_roles_table.sql
│   │   │   │   │   ├── 018_create_permissions_table.sql
│   │   │   │   │   ├── 019_create_role_permissions_table.sql
│   │   │   │   │   ├── 020_create_regional_centers_table.sql
│   │   │   │   │   ├── 021_create_indexes.sql
│   │   │   │   │   └── 022_seed_data.sql
│   │   │   │   └── seeds/
│   │   │   │       ├── admin.seed.js
│   │   │   │       ├── categories.seed.js
│   │   │   │       ├── index.js
│   │   │   │       ├── permissions.seed.js
│   │   │   │       ├── regional.seed.js
│   │   │   │       └── roles.seed.js
│   │   │   ├── jobs/
│   │   │   │   ├── autoSave.job.js
│   │   │   │   ├── cleanup.job.js
│   │   │   │   ├── emailQueue.job.js
│   │   │   │   ├── index.js
│   │   │   │   └── voucherExpiry.job.js
│   │   │   ├── middleware/
│   │   │   │   ├── admin.middleware.js
│   │   │   │   ├── auth.middleware.js
│   │   │   │   ├── cors.middleware.js
│   │   │   │   ├── errorHandler.middleware.js
│   │   │   │   ├── logger.middleware.js
│   │   │   │   ├── rateLimiter.middleware.js
│   │   │   │   ├── role.middleware.js
│   │   │   │   ├── sanitize.middleware.js
│   │   │   │   ├── upload.middleware.js
│   │   │   │   └── validation.middleware.js
│   │   │   ├── models/
│   │   │   │   ├── Admin.model.js
│   │   │   │   ├── Applicant.model.js
│   │   │   │   ├── Application.model.js
│   │   │   │   ├── AuditLog.model.js
│   │   │   │   ├── BECEResults.model.js
│   │   │   │   ├── ContactInfo.model.js
│   │   │   │   ├── Documents.model.js
│   │   │   │   ├── Education.model.js
│   │   │   │   ├── EmploymentHistory.model.js
│   │   │   │   ├── index.js
│   │   │   │   ├── Notification.model.js
│   │   │   │   ├── Permission.model.js
│   │   │   │   ├── PersonalInfo.model.js
│   │   │   │   ├── PhysicalAttributes.model.js
│   │   │   │   ├── Regional.model.js
│   │   │   │   ├── Role.model.js
│   │   │   │   ├── TertiaryEducation.model.js
│   │   │   │   ├── User.model.js
│   │   │   │   ├── Voucher.model.js
│   │   │   │   └── WASSCEResults.model.js
│   │   │   ├── routes/
│   │   │   │   ├── admin.routes.js
│   │   │   │   ├── analytics.routes.js
│   │   │   │   ├── application.routes.js
│   │   │   │   ├── audit.routes.js
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── index.js
│   │   │   │   ├── notification.routes.js
│   │   │   │   ├── regional.routes.js
│   │   │   │   ├── upload.routes.js
│   │   │   │   ├── user.routes.js
│   │   │   │   └── voucher.routes.js
│   │   │   ├── services/
│   │   │   │   ├── analytics.service.js
│   │   │   │   ├── application.service.js
│   │   │   │   ├── audit.service.js
│   │   │   │   ├── auth.service.js
│   │   │   │   ├── cache.service.js
│   │   │   │   ├── email.service.js
│   │   │   │   ├── export.service.js
│   │   │   │   ├── notification.service.js
│   │   │   │   ├── pdf.service.js
│   │   │   │   ├── qrcode.service.js
│   │   │   │   ├── upload.service.js
│   │   │   │   ├── validation.service.js
│   │   │   │   └── voucher.service.js
│   │   │   ├── utils/
│   │   │   │   ├── applicationIdGenerator.js
│   │   │   │   ├── dateFormatter.js
│   │   │   │   ├── errorHandler.js
│   │   │   │   ├── fileProcessor.js
│   │   │   │   ├── helpers.js
│   │   │   │   ├── imageProcessor.js
│   │   │   │   ├── logger.js
│   │   │   │   ├── passwordHasher.js
│   │   │   │   ├── phoneFormatter.js
│   │   │   │   ├── pinCodeGenerator.js
│   │   │   │   ├── responseHandler.js
│   │   │   │   ├── serialNumberGenerator.js
│   │   │   │   ├── tokenGenerator.js
│   │   │   │   └── voucherGenerator.js
│   │   │   ├── validators/
│   │   │   │   ├── admin.validator.js
│   │   │   │   ├── application.validator.js
│   │   │   │   ├── auth.validator.js
│   │   │   │   ├── contact.validator.js
│   │   │   │   ├── documents.validator.js
│   │   │   │   ├── education.validator.js
│   │   │   │   ├── personalInfo.validator.js
│   │   │   │   └── voucher.validator.js
│   │   │   └── websocket/
│   │   │       ├── handlers/
│   │   │       │   ├── application.handler.js
│   │   │       │   ├── dashboard.handler.js
│   │   │       │   └── notification.handler.js
│   │   │       ├── index.js
│   │   │       └── middleware/
│   │   │           └── socket.auth.js
│   │   └── uploads/
│   │       ├── certificates/
│   │       ├── documents/
│   │       ├── passports/
│   │       └── temp/
│   └── frontend/
│       ├── .env.local
│       ├── .eslintrc.json
│       ├── jsconfig.json
│       ├── next.config.js
│       ├── package.json
│       ├── postcss.config.js
│       ├── tailwind.config.js
│       ├── public/
│       │   ├── favicon.ico
│       │   ├── logo.png
│       │   ├── police-badge.svg
│       │   ├── ghana-flag.svg
│       │   ├── manifest.json
│       │   ├── robots.txt
│       │   ├── sitemap.xml
│       │   ├── images/
│       │   │   ├── categories/
│       │   │   │   ├── general-duty.jpg
│       │   │   │   ├── graduates.jpg
│       │   │   │   ├── medical.jpg
│       │   │   │   ├── religious.jpg
│       │   │   │   └── tradesmen.jpg
│       │   │   ├── regional-centers/
│       │   │   │   ├── accra-center.jpg
│       │   │   │   ├── kumasi-center.jpg
│       │   │   │   ├── takoradi-center.jpg
│       │   │   │   └── tamale-center.jpg
│       │   │   ├── success-stories/
│       │   │   │   ├── officer-1.jpg
│       │   │   │   ├── officer-2.jpg
│       │   │   │   └── officer-3.jpg
│       │   │   ├── hero-background.jpg
│       │   │   ├── police-training.jpg
│       │   │   └── recruitment-banner.jpg
│       │   ├── icons/
│       │   │   ├── icon-128x128.png
│       │   │   ├── icon-144x144.png
│       │   │   ├── icon-152x152.png
│       │   │   ├── icon-192x192.png
│       │   │   ├── icon-384x384.png
│       │   │   ├── icon-512x512.png
│       │   │   ├── icon-72x72.png
│       │   │   └── icon-96x96.png
│       │   ├── fonts/
│       │   │   ├── inter-var.woff2
│       │   │   ├── poppins-bold.woff2
│       │   │   └── roboto-regular.woff2
│       │   └── animations/
│       │       ├── error.json
│       │       ├── loading.json
│       │       └── success.json
│       ├── src/
│       │   ├── middleware.js
│       │   ├── app/
│       │   │   ├── globals.css
│       │   │   ├── layout.js
│       │   │   ├── loading.js
│       │   │   ├── error.js
│       │   │   ├── not-found.js
│       │   │   ├── page.js
│       │   │   ├── (auth)/
│       │   │   │   ├── layout.js
│       │   │   │   ├── login/
│       │   │   │   │   ├── page.js
│       │   │   │   │   └── styles.module.css
│   │   │   │   ├── register/
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── styles.module.css
│   │   │   │   ├── forgot-password/
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── styles.module.css
│   │   │   │   ├── reset-password/
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── styles.module.css
│   │   │   │   └── verify-email/
│   │   │   │       ├── page.js
│   │   │   │       └── styles.module.css
│   │   │   ├── (public)/
│   │   │   │   ├── layout.js
│   │   │   │   ├── about/
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── styles.module.css
│   │   │   │   ├── requirements/
│   │   │   │   │   ├── page.js
│   │   │   │   │   ├── styles.module.css
│   │   │   │   │   ├── general-duty/
│   │   │   │   │   │   └── page.js
│   │   │   │   │   ├── graduates/
│   │   │   │   │   │   └── page.js
│   │   │   │   │   ├── medical/
│   │   │   │   │   │   ├── allied-health/
│   │   │   │   │   │   │   └── page.js
│   │   │   │   │   │   ├── doctors/
│   │   │   │   │   │   │   └── page.js
│   │   │   │   │   │   ├── laboratory/
│   │   │   │   │   │   │   └── page.js
│   │   │   │   │   │   ├── nurses/
│   │   │   │   │   │   │   └── page.js
│   │   │   │   │   │   ├── page.js
│   │   │   │   │   │   ├── pharmacists/
│   │   │   │   │   │   │   └── page.js
│   │   │   │   │   │   └── specialists/
│   │   │   │   │   │       └── page.js
│   │   │   │   │   ├── religious/
│   │   │   │   │   │   └── page.js
│   │   │   │   │   ├── sportsmen/
│   │   │   │   │   │   └── page.js
│   │   │   │   │   └── tradesmen/
│   │   │   │   │       ├── carpenters/
│   │   │   │   │       │   └── page.js
│   │   │   │   │       ├── drivers/
│   │   │   │   │       │   └── page.js
│   │   │   │   │       ├── electricians/
│   │   │   │   │       │   └── page.js
│   │   │   │   │       ├── mechanics/
│   │   │   │   │       │   └── page.js
│   │   │   │   │       ├── page.js
│   │   │   │   │       ├── painters/
│   │   │   │   │       │   └── page.js
│   │   │   │   │       ├── plumbers/
│   │   │   │   │       │   └── page.js
│   │   │   │   │       ├── refrigeration/
│   │   │   │   │       │   └── page.js
│   │   │   │   │       ├── tailors/
│   │   │   │   │       │   └── page.js
│   │   │   │   │       └── welders/
│   │   │   │   │           └── page.js
│   │   │   │   ├── regional-centers/
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── styles.module.css
│   │   │   │   ├── faq/
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── styles.module.css
│   │   │   │   ├── contact/
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── styles.module.css
│   │   │   │   ├── voucher/
│   │   │   │   │   ├── page.js
│   │   │   │   │   ├── purchase/
│   │   │   │   │   │   ├── page.js
│   │   │   │   │   │   └── styles.module.css
│   │   │   │   │   └── validate/
│   │   │   │   │       ├── page.js
│   │   │   │   │       └── styles.module.css
│   │   │   │   └── news/
│   │   │   │       ├── page.js
│   │   │   │       ├── styles.module.css
│   │   │   │       └── [slug]/
│   │   │   │           └── page.js
│   │   │   ├── (applicant)/
│   │   │   │   ├── layout.js
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── styles.module.css
│   │   │   │   ├── application/
│   │   │   │   │   ├── layout.js
│   │   │   │   │   ├── page.js
│   │   │   │   │   ├── styles.module.css
│   │   │   │   │   ├── personal-info/
│   │   │   │   │   │   ├── page.js
│   │   │   │   │   │   └── styles.module.css
│   │   │   │   │   ├── contact-details/
│   │   │   │   │   │   ├── page.js
│   │   │   │   │   │   └── styles.module.css
│   │   │   │   │   ├── physical-attributes/
│   │   │   │   │   │   ├── page.js
│   │   │   │   │   │   └── styles.module.css
│   │   │   │   │   ├── education/
│   │   │   │   │   │   ├── page.js
│   │   │   │   │   │   ├── styles.module.css
│   │   │   │   │   │   ├── bece/
│   │   │   │   │   │   │   ├── page.js
│   │   │   │   │   │   │   └── styles.module.css
│   │   │   │   │   │   ├── wassce/
│   │   │   │   │   │   │   ├── page.js
│   │   │   │   │   │   │   └── styles.module.css
│   │   │   │   │   │   └── tertiary/
│   │   │   │   │   │       ├── page.js
│   │   │   │   │   │       └── styles.module.css
│   │   │   │   │   ├── employment-history/
│   │   │   │   │   │   ├── page.js
│   │   │   │   │   │   └── styles.module.css
│   │   │   │   │   ├── documents/
│   │   │   │   │   │   ├── page.js
│   │   │   │   │   │   └── styles.module.css
│   │   │   │   │   ├── category-selection/
│   │   │   │   │   │   ├── page.js
│   │   │   │   │   │   └── styles.module.css
│   │   │   │   │   ├── declaration/
│   │   │   │   │   │   ├── page.js
│   │   │   │   │   │   └── styles.module.css
│   │   │   │   │   └── review/
│   │   │   │   │       ├── page.js
│   │   │   │   │       └── styles.module.css
│   │   │   │   ├── track/
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── styles.module.css
│   │   │   │   ├── profile/
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── styles.module.css
│   │   │   │   ├── notifications/
│   │   │   │   │   ├── page.js
│   │   │   │   │   └── styles.module.css
│   │   │   │   └── download/
│   │   │   │       ├── summary/
│   │   │   │       │   ├── page.js
│   │   │   │       │   └── styles.module.css
│   │   │   │       └── receipt/
│   │   │   │           ├── page.js
│   │   │   │           └── styles.module.css
│   │   │   ├── api/
│   │   │   │   ├── health/
│   │   │   │   │   └── route.js
│   │   │   │   └── test/
│   │   │   │       └── route.js
│   │   │   ├── components/
│   │   │   │   ├── common/
│   │   │   │   │   ├── Accordion/
│   │   │   │   │   │   ├── Accordion.js
│   │   │   │   │   │   ├── AccordionContent.js
│   │   │   │   │   │   ├── AccordionItem.js
│   │   │   │   │   │   └── Accordion.module.css
│   │   │   │   │   ├── Alert/
│   │   │   │   │   │   ├── Alert.js
│   │   │   │   │   │   ├── AlertProvider.js
│   │   │   │   │   │   └── Alert.module.css
│   │   │   │   │   ├── Badge/
│   │   │   │   │   │   ├── Badge.js
│   │   │   │   │   │   ├── StatusBadge.js
│   │   │   │   │   │   └── Badge.module.css
│   │   │   │   │   ├── Breadcrumb/
│   │   │   │   │   │   ├── Breadcrumb.js
│   │   │   │   │   │   └── Breadcrumb.module.css
│   │   │   │   │   ├── Button/
│   │   │   │   │   │   ├── Button.js
│   │   │   │   │   │   ├── IconButton.js
│   │   │   │   │   │   ├── LoadingButton.js
│   │   │   │   │   │   └── Button.module.css
│   │   │   │   │   ├── Card/
│   │   │   │   │   │   ├── Card.js
│   │   │   │   │   │   ├── CardBody.js
│   │   │   │   │   │   ├── CardFooter.js
│   │   │   │   │   │   ├── CardHeader.js
│   │   │   │   │   │   └── Card.module.css
│   │   │   │   │   ├── Dropdown/
│   │   │   │   │   │   ├── Dropdown.js
│   │   │   │   │   │   ├── DropdownItem.js
│   │   │   │   │   │   ├── DropdownMenu.js
│   │   │   │   │   │   └── Dropdown.module.css
│   │   │   │   │   ├── ErrorBoundary/
│   │   │   │   │   │   ├── ErrorBoundary.js
│   │   │   │   │   │   └── ErrorBoundary.module.css
│   │   │   │   │   ├── Footer/
│   │   │   │   │   │   ├── Footer.js
│   │   │   │   │   │   ├── FooterLinks.js
│   │   │   │   │   │   ├── SocialLinks.js
│   │   │   │   │   │   └── Footer.module.css
│   │   │   │   │   ├── Header/
│   │   │   │   │   │   ├── Header.js
│   │   │   │   │   │   ├── MobileMenu.js
│   │   │   │   │   │   ├── NavLinks.js
│   │   │   │   │   │   ├── UserMenu.js
│   │   │   │   │   │   └── Header.module.css
│   │   │   │   │   ├── Input/
│   │   │   │   │   │   ├── DatePicker.js
│   │   │   │   │   │   ├── FileUpload.js
│   │   │   │   │   │   ├── Input.js
│   │   │   │   │   │   ├── PhoneInput.js
│   │   │   │   │   │   ├── SearchInput.js
│   │   │   │   │   │   ├── Select.js
│   │   │   │   │   │   ├── TextArea.js
│   │   │   │   │   │   └── Input.module.css
│   │   │   │   │   ├── Loader/
│   │   │   │   │   │   ├── Loader.js
│   │   │   │   │   │   ├── ProgressBar.js
│   │   │   │   │   │   ├── SkeletonLoader.js
│   │   │   │   │   │   ├── Spinner.js
│   │   │   │   │   │   └── Loader.module.css
│   │   │   │   │   ├── Modal/
│   │   │   │   │   │   ├── ConfirmModal.js
│   │   │   │   │   │   ├── Modal.js
│   │   │   │   │   │   ├── ModalBody.js
│   │   │   │   │   │   ├── ModalFooter.js
│   │   │   │   │   │   ├── ModalHeader.js
│   │   │   │   │   │   └── Modal.module.css
│   │   │   │   │   ├── Pagination/
│   │   │   │   │   │   ├── Pagination.js
│   │   │   │   │   │   └── Pagination.module.css
│   │   │   │   │   ├── ProtectedRoute/
│   │   │   │   │   │   ├── ApplicantRoute.js
│   │   │   │   │   │   └── ProtectedRoute.js
│   │   │   │   │   ├── Sidebar/
│   │   │   │   │   │   ├── Sidebar.js
│   │   │   │   │   │   ├── SidebarCollapse.js
│   │   │   │   │   │   ├── SidebarItem.js
│   │   │   │   │   │   └── Sidebar.module.css
│   │   │   │   │   ├── Stepper/
│   │   │   │   │   │   ├── Step.js
│   │   │   │   │   │   ├── StepLabel.js
│   │   │   │   │   │   ├── Stepper.js
│   │   │   │   │   │   └── Stepper.module.css
│   │   │   │   │   ├── Table/
│   │   │   │   │   │   ├── Table.js
│   │   │   │   │   │   ├── TableBody.js
│   │   │   │   │   │   ├── TableCell.js
│   │   │   │   │   │   ├── TableHeader.js
│   │   │   │   │   │   ├── TablePagination.js
│   │   │   │   │   │   ├── TableRow.js
│   │   │   │   │   │   ├── TableSearch.js
│   │   │   │   │   │   └── Table.module.css
│   │   │   │   │   ├── Tabs/
│   │   │   │   │   │   ├── Tab.js
│   │   │   │   │   │   ├── TabList.js
│   │   │   │   │   │   ├── TabPanel.js
│   │   │   │   │   │   ├── Tabs.js
│   │   │   │   │   │   └── Tabs.module.css
│   │   │   │   │   ├── Toast/
│   │   │   │   │   │   ├── ToastContainer.js
│   │   │   │   │   │   ├── Toast.js
│   │   │   │   │   │   └── Toast.module.css
│   │   │   │   │   └── Tooltip/
│   │   │   │   │       ├── Tooltip.js
│   │   │   │   │       └── Tooltip.module.css
│   │   │   │   ├── home/
│   │   │   │   │   ├── Hero/
│   │   │   │   │   │   ├── Hero.js
│   │   │   │   │   │   ├── HeroSlider.js
│   │   │   │   │   │   └── Hero.module.css
│   │   │   │   │   ├── Features/
│   │   │   │   │   │   ├── FeatureCard.js
│   │   │   │   │   │   ├── Features.js
│   │   │   │   │   │   └── Features.module.css
│   │   │   │   │   ├── Categories/
│   │   │   │   │   │   ├── Categories.js
│   │   │   │   │   │   ├── CategoryCard.js
│   │   │   │   │   │   └── Categories.module.css
│   │   │   │   │   ├── Timeline/
│   │   │   │   │   │   ├── Timeline.js
│   │   │   │   │   │   ├── TimelineItem.js
│   │   │   │   │   │   └── Timeline.module.css
│   │   │   │   │   ├── Statistics/
│   │   │   │   │   │   ├── Statistics.js
│   │   │   │   │   │   ├── StatCard.js
│   │   │   │   │   │   └── Statistics.module.css
│   │   │   │   │   ├── Testimonials/
│   │   │   │   │   │   ├── TestimonialCard.js
│   │   │   │   │   │   ├── Testimonials.js
│   │   │   │   │   │   └── Testimonials.module.css
│   │   │   │   │   ├── CallToAction/
│   │   │   │   │   │   ├── CallToAction.js
│   │   │   │   │   │   └── CallToAction.module.css
│   │   │   │   │   └── NewsSection/
│   │   │   │   │       ├── NewsCard.js
│   │   │   │   │       ├── NewsSection.js
│   │   │   │   │       └── NewsSection.module.css
│   │   │   │   ├── application/
│   │   │   │   │   ├── AutoSave/
│   │   │   │   │   │   ├── AutoSave.js
│   │   │   │   │   │   └── AutoSave.module.css
│   │   │   │   │   ├── CategorySelection/
│   │   │   │   │   │   ├── CategorySelection.js
│   │   │   │   │   │   └── CategorySelection.module.css
│   │   │   │   │   ├── ContactForm/
│   │   │   │   │   │   ├── ContactForm.js
│   │   │   │   │   │   └── ContactForm.module.css
│   │   │   │   │   ├── Declaration/
│   │   │   │   │   │   ├── Declaration.js
│   │   │   │   │   │   └── Declaration.module.css
│   │   │   │   │   ├── DocumentUpload/
│   │   │   │   │   │   ├── CertificateUpload.js
│   │   │   │   │   │   ├── DocumentUpload.js
│   │   │   │   │   │   ├── IDUpload.js
│   │   │   │   │   │   ├── PhotoUpload.js
│   │   │   │   │   │   └── DocumentUpload.module.css
│   │   │   │   │   ├── EducationForm/
│   │   │   │   │   │   ├── BECEForm.js
│   │   │   │   │   │   ├── EducationForm.js
│   │   │   │   │   │   ├── TertiaryForm.js
│   │   │   │   │   │   ├── WASSCEForm.js
│   │   │   │   │   │   └── EducationForm.module.css
│   │   │   │   │   ├── EmploymentForm/
│   │   │   │   │   │   ├── EmploymentForm.js
│   │   │   │   │   │   └── EmploymentForm.module.css
│   │   │   │   │   ├── FormProgress/
│   │   │   │   │   │   ├── FormProgress.js
│   │   │   │   │   │   └── FormProgress.module.css
│   │   │   │   │   ├── PersonalInfoForm/
│   │   │   │   │   │   ├── PersonalInfoForm.js
│   │   │   │   │   │   └── PersonalInfoForm.module.css
│   │   │   │   │   ├── PhysicalAttributesForm/
│   │   │   │   │   │   ├── PhysicalAttributesForm.js
│   │   │   │   │   │   └── PhysicalAttributesForm.module.css
│   │   │   │   │   ├── ReviewSubmit/
│   │   │   │   │   │   ├── ReviewSubmit.js
│   │   │   │   │   │   ├── SubmitButton.js
│   │   │   │   │   │   ├── SummarySection.js
│   │   │   │   │   │   └── ReviewSubmit.module.css
│   │   │   │   │   └── ValidationErrors/
│   │   │   │   │       ├── ValidationErrors.js
│   │   │   │   │       └── ValidationErrors.module.css
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── ApplicationStatus/
│   │   │   │   │   │   ├── ApplicationStatus.js
│   │   │   │   │   │   ├── StatusTimeline.js
│   │   │   │   │   │   └── ApplicationStatus.module.css
│   │   │   │   │   ├── DashboardStats/
│   │   │   │   │   │   ├── DashboardStats.js
│   │   │   │   │   │   ├── StatWidget.js
│   │   │   │   │   │   └── DashboardStats.module.css
│   │   │   │   │   ├── NotificationPanel/
│   │   │   │   │   │   ├── NotificationItem.js
│   │   │   │   │   │   ├── NotificationPanel.js
│   │   │   │   │   │   └── NotificationPanel.module.css
│   │   │   │   │   ├── ProfileCompletion/
│   │   │   │   │   │   ├── ProfileCompletion.js
│   │   │   │   │   │   └── ProfileCompletion.module.css
│   │   │   │   │   ├── QuickActions/
│   │   │   │   │   │   ├── ActionButton.js
│   │   │   │   │   │   ├── QuickActions.js
│   │   │   │   │   │   └── QuickActions.module.css
│   │   │   │   │   └── UpcomingEvents/
│   │   │   │   │       ├── EventCard.js
│   │   │   │   │       ├── UpcomingEvents.js
│   │   │   │   │       └── UpcomingEvents.module.css
│   │   │   │   └── animations/
│   │   │   │       ├── FadeIn.js
│   │   │   │       ├── LoadingAnimation.js
│   │   │   │       ├── PageTransition.js
│   │   │   │       ├── ScaleIn.js
│   │   │   │       └── SlideIn.js
│   │   │   ├── contexts/
│   │   │   │   ├── ApplicationContext.js
│   │   │   │   ├── AuthContext.js
│   │   │   │   ├── NotificationContext.js
│   │   │   │   ├── ThemeContext.js
│   │   │   │   └── WebSocketContext.js
│   │   │   ├── hooks/
│   │   │   │   ├── useApplication.js
│   │   │   │   ├── useAuth.js
│   │   │   │   ├── useAutoSave.js
│   │   │   │   ├── useDebounce.js
│   │   │   │   ├── useFileUpload.js
│   │   │   │   ├── useForm.js
│   │   │   │   ├── useIntersectionObserver.js
│   │   │   │   ├── useLocalStorage.js
│   │   │   │   ├── useNotification.js
│   │   │   │   ├── useValidation.js
│   │   │   │   └── useWebSocket.js
│   │   │   ├── lib/
│   │   │   │   ├── api.js
│   │   │   │   ├── axios.js
│   │   │   │   ├── constants.js
│   │   │   │   ├── formatters.js
│   │   │   │   ├── storage.js
│   │   │   │   ├── utils.js
│   │   │   │   ├── validators.js
│   │   │   │   └── websocket.js
│   │   │   ├── services/
│   │   │   │   ├── applicationService.js
│   │   │   │   ├── authService.js
│   │   │   │   ├── notificationService.js
│   │   │   │   ├── pdfService.js
│   │   │   │   ├── regionalService.js
│   │   │   │   ├── uploadService.js
│   │   │   │   └── voucherService.js
│   │   │   ├── styles/
│   │   │   │   ├── animations.css
│   │   │   │   ├── gradients.css
│   │   │   │   ├── typography.css
│   │   │   │   ├── utilities.css
│   │   │   │   └── variables.css
│   │   │   └── data/
│   │   │       ├── categories.js
│   │   │       ├── grades.js
│   │   │       ├── regions.js
│   │   │       ├── schools.js
│   │   │       └── subjects.js
├── shared/
│   └── package.json
├── scripts/
│   ├── backup.sh
│   ├── deploy.sh
│   ├── migrate.js
│   ├── seed.js
│   ├── setup.sh
│   └── test-db.js
├── tests/
│   ├── e2e/
│   │   ├── application-flow.test.js
│   │   ├── admin-workflow.test.js
│   │   └── registration.test.js
│   ├── integration/
│   │   ├── admin.test.js
│   │   ├── application.test.js
│   │   ├── auth.test.js
│   │   └── voucher.test.js
│   ├── unit/
│   │   ├── controllers/
│   │   │   ├── application.controller.test.js
│   │   │   ├── auth.controller.test.js
│   │   │   └── voucher.controller.test.js
│   │   ├── services/
│   │   │   ├── auth.service.test.js
│   │   │   ├── email.service.test.js
│   │   │   └── validation.service.test.js
│   │   └── utils/
│   │       ├── generators.test.js
│   │       └── validators.test.js
│   └── fixtures/
│       ├── applications.json
│       ├── users.json
│       └── vouchers.json

(Note: This tree has been manually expanded to reflect all components and sub-components as per the 970+ line requirement, covering all architectural layers and features.)
