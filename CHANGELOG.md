# Changelog

All notable changes to the HRMS implementation are logged here, most recent first. Reference plan: `docs/HRMS_EMPLOYEE_LIFECYCLE.md`.

## [Unreleased]

### Added — Google Analytics (GA4) + sitemap.xml
- Added the GA4 `gtag.js` global site tag (`G-WYGSG5SQE0`) to `client/index.html` `<head>` — fires the initial pageview on first load, same pattern as the existing PostHog setup.
- Since this is a client-side-routed SPA, a bare `gtag.js` snippet only tracks the very first page load — it does **not** see subsequent in-app navigations. Wired a `gtag('event', 'page_view', ...)` call into the existing `useAnalytics` hook (`client/src/hooks/useAnalytics.js`), firing on every route change after the first (guarded by `prevPath.current` so the initial load isn't double-counted), scoped to public routes only — same convention already used there for PostHog/server-side tracking.
- Moved `nutrisolutions-co-in-sitemap.xml` (previously sitting at the repo root, not served anywhere) to `client/public/sitemap.xml`, renamed to the standard filename — Vite serves everything in `public/` at the site root, so this is now reachable at `https://nutrisolutions.co.in/sitemap.xml`, the location search engines and Google Search Console expect. Verified both changes live against the dev server (`/sitemap.xml` returns 200 with correct XML; gtag script confirmed present in served HTML) and confirmed the production build embeds the gtag script in `dist/index.html`.

### Added — Admin Dashboard page + accordion sidebar nav
- `client/src/pages/admin/AdminDashboardPage.jsx` (new): the new `/admin` landing page (index route moved from `/admin/analytics`). Fetches counts in parallel from the 9 existing list endpoints (projects, blogs, tech stack, career positions, contact inquiries, departments, employees, tasks, leave requests) and shows them as clickable stat cards (reusing the `admin-analytics-stat-card` styling from the Analytics page) — each links to its full page. No new backend endpoints; pure aggregation of existing `GET` list routes.
- `client/src/components/admin/AdminLayout.jsx` — sidebar restructured: "Dashboard" stays a top-level link, everything else is grouped into four collapsible accordion sections: **Content** (Projects/Blogs/Tech Stack), **Recruitment & People** (Careers/Employees/Departments), **Workforce** (Tasks/Leave), **Insights** (Analytics/Contact). The group containing the current route auto-expands on load; others start collapsed. New CSS: `.admin-nav-group`, `.admin-nav-group-toggle`, `.admin-nav-group-items` (chevron rotates open/closed).
- `AdminLoginPage.jsx`'s default post-login redirect changed from `/admin/projects` to `/admin/dashboard`.
- Verified live: all 9 endpoints the dashboard aggregates return 200 for an authenticated admin; both new/changed files transform cleanly through Vite's dev server; production build passes clean.

### Changed — Header auth button becomes "Go to Portal" once signed in
- `client/src/components/Navbar.jsx` checks both `useAuth()` (admin) and `useEmployeeAuth()` (employee). Signed out: button reads "Login" → `/login`. Signed in: button reads "Go to Portal" → `/admin` for an authenticated admin, `/portal/dashboard` for an authenticated employee (desktop + mobile nav both updated). Superseded the previous behavior of hiding the button entirely when logged in.

### Added — Employee portal redesign: stage-based nav + company documents (appraisal/payslips)
- **Stage-based nav**: `client/src/components/portal/PortalLayout.jsx` now filters nav links by `employee.employmentType`. Temporary employees see Dashboard/Interviews/Documents/Offer (no Tasks/Leave — not employed yet). Permanent employees see Dashboard/Documents/Tasks/Leave (no Interviews/Offer — hiring pipeline is over). New `client/src/components/portal/PortalRoleGate.jsx` enforces the same rule at the route level (not just hiding nav links) so a temp employee can't reach `/portal/tasks` etc. by typing the URL directly; wired into `client/src/App.jsx`.
- **New: Company Documents** — permanent employees now have a home for ongoing company paperwork (offer letter is already stored on `Employee`; this adds a place for recurring documents that arrive *after* onboarding):
  - `server/src/models/CompanyDocument.js` (new): `employee`, `type` (`appraisal_letter`|`payslip`), `label`, `fileUrl`, `periodMonth`/`periodYear` (payslip only), `uploadedBy`.
  - `server/src/controllers/employeeAdminController.js` — `uploadCompanyDocument` (HR uploads a file + type/label/period for a **permanent** employee only — 400 otherwise; uploads via the same Cloudinary buffer helper as everything else). `getEmployee` now also returns `companyDocuments`. `deleteEmployee` cascades to `CompanyDocument` too.
  - `server/src/controllers/employeePortalController.js` — `listMyCompanyDocuments` (read-only, employee's own docs).
  - Routes: `POST /api/admin/employees/:id/company-documents` (role-gated `superadmin`/`hr`, reuses the existing `uploadEmployeeDoc` multer middleware), `GET /api/employees/me/company-documents`.
  - Frontend: `AdminEmployeesPage.jsx` gets a new "Company documents" section (visible only when `selected.employmentType === "permanent"`) with an upload form (type/label/month/year/file) and a card grid of existing docs.
- **Redesigned** `client/src/pages/portal/PortalDocumentsPage.jsx`: replaced the flat list-of-rows layout with the same card-grid + status-pill system used on the admin employee detail page (`employee-doc-grid`/`employee-doc-card`/`status-pill` — all pre-existing generic CSS classes, no new styles needed). For permanent employees it now shows three sections — Offer & joining letters, Appraisal letters, Payslips (grouped, payslips show their month/year) — plus their original verification documents underneath as a read-only "on file" record. Temporary employees still see the upload/re-upload flow as before, just visually consistent with the admin design now.
- `client/src/lib/validation.js` — added `companyDocumentSchema`.
- Verified live end-to-end: ran a fresh employee through the full pipeline (create → select → verify docs → offer → onboard → convert to permanent), then uploaded a payslip and an appraisal letter as HR and confirmed the employee's `/me/company-documents` endpoint returned both with working Cloudinary URLs; separately confirmed `uploadCompanyDocument` correctly 400s when attempted against a still-temporary employee.

### Changed — All file uploads now go to Cloudinary instead of local disk
- Added `cloudinary` SDK. `server/src/config/cloudinary.js` auto-configures from the `CLOUDINARY_URL` env var; `server/src/utils/cloudinaryUpload.js` exports `uploadBufferToCloudinary(buffer, { folder, filename, resourceType })`, a promise wrapper around `cloudinary.uploader.upload_stream`.
- `server/.env` / `server/.env.example` — added `CLOUDINARY_URL` (real credentials in `.env`, which is gitignored; placeholder in `.env.example`).
- `server/src/middleware/upload.js` and `server/src/middleware/uploadDocuments.js` — switched from `multer.diskStorage` to `multer.memoryStorage()` (no more local `uploads/` writes, no more `fileUrl`/`docFileUrl` local-path builders).
- `server/src/controllers/uploadController.js` (generic site image uploads — projects/blogs/tech-stack/home mockups), `employeeAdminController.js`'s `sendOffer`, and `employeePortalController.js`'s `uploadMyDocument` now upload the in-memory buffer straight to Cloudinary and store the returned `secure_url` in Mongo, instead of building a local `/uploads/...` URL. Upload folders are namespaced: `nutri-solutions/uploads` (site images), `nutri-solutions/employees/{employeeId}/documents`, `nutri-solutions/employees/{employeeId}/offer`.
- **Bug found and fixed during verification:** `dotenv.config()` was called *after* the static route imports at the top of `server/src/index.js`, but ES module imports execute before any code in the importing file runs — so `config/cloudinary.js` (imported transitively via the routes) was calling `cloudinary.config()` before `CLOUDINARY_URL` had been loaded into `process.env`, causing every upload to fail with "Must supply api_key". Fixed by moving `import "dotenv/config"` to the very first line of `index.js`, as a side-effect import, ahead of every other import.
- Verified live against the real Cloudinary account: single-image upload, multi-image upload, and an employee PDF document upload all succeeded and returned real `res.cloudinary.com` URLs.
- **Action needed in the Cloudinary dashboard:** the uploaded image was publicly viewable (200), but the uploaded PDF returned **401** when fetched — this is Cloudinary's account-level default that blocks public delivery of PDF/ZIP files for security. To let employees/HR actually open uploaded documents and offer/joining letters, go to the Cloudinary console → **Settings → Security** and enable **"Allow delivery of PDF and ZIP files"** (wording may vary slightly by dashboard version). This is a one-time account setting, not something fixable from the codebase.
- The old local `server/uploads/` directory and its static Express mount (`app.use("/uploads", ...)`) were left in place (not deleted) so any pre-existing local file URLs from before this migration don't 404 — but nothing new writes there anymore.

### Added — Request logging
- Added `morgan` and wired `app.use(morgan("dev"))` into `server/src/index.js` (skipped when `NODE_ENV === "production"`), so every incoming API request is logged as `METHOD path status responseTime - contentLength`. Verified live: hit `/api/health`, `/api/careers`, and a failed login, all three showed up correctly in the server log with color-coded status codes.

### Added — Interview scheduling stage (Teams, via Microsoft Graph)
- Employee lifecycle now has two new statuses between `draft` and `documents_requested`: `interviewing` and `selected`. Full state machine: `draft → interviewing → selected → documents_requested → documents_under_review → documents_rejected/documents_verified → offer_sent → offer_accepted → onboarding → onboarding_completed → permanent`.
- `server/src/models/Interview.js` (new) — `employee`, `round`, `scheduledAt`, `durationMinutes`, `teamsMeetingId`, `teamsJoinUrl`, `status` (scheduled/completed/cancelled), `notes`, `scheduledBy`.
- `server/src/services/teamsService.js` (new) — real Microsoft Graph integration (not a manual-link stub): uses `@azure/msal-node`'s client-credentials flow to get an app-only Graph token, then `POST /users/{organizerId}/onlineMeetings` to create an actual Teams meeting and return its `joinWebUrl`. Requires an Azure AD app registration with `OnlineMeetings.ReadWrite.All` **application** permission (admin consent) and four new env vars: `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET`, `MS_ORGANIZER_USER_ID` (the mailbox that owns/organizes the meetings). See the Azure setup steps added to `docs/HRMS_EMPLOYEE_LIFECYCLE.md`. **Not configured in this environment — I have no Azure credentials to test against, so this code is implemented correctly per the Graph API docs but is unverified against real Microsoft infrastructure.** It fails gracefully (502 with a clear setup message) rather than crashing when the env vars are missing, which I did verify live.
- `server/src/controllers/interviewAdminController.js` (new) — `scheduleInterview` (HR picks round/date/time/duration, calls Graph, creates the `Interview`, flips `draft → interviewing` on the first round, and creates an in-app `EmployeeNotification` with the date/time/duration/join link — real email delivery is still out of scope, same "in-app only" decision as the rest of the app); `markSelected` (HR action, `draft`/`interviewing` → `selected`); `listInterviews`.
- `requestDocuments` (`employeeAdminController.js`) now hard-gates on `status === "selected"` (was: any status, defaulting from `draft`) — 400 "Mark the candidate as selected before requesting documents" otherwise. `scheduleInterview` conversely refuses once status has moved past `interviewing` (i.e. already selected or later).
- Routes: `GET/POST /api/admin/employees/:id/interviews`, `PUT /api/admin/employees/:id/select` (admin, role-gated `superadmin`/`hr`); `GET /api/employees/me/interviews` (employee portal, read-only). `getEmployee` now also returns `interviews` alongside `documents`/`notifications`. Employee deletion cascades to `Interview` documents too.
- Frontend: `AdminEmployeesPage.jsx` — new "Interviews" section (schedule form + round list with join links, visible while `draft`/`interviewing`) ahead of the Documents section; "Mark as selected" button in the header actions; Documents section's request-form now only renders once `status === "selected"`, with an explanatory empty state before that. Lifecycle stepper and status-pill maps extended with "Interviews" and "Selected" steps.
- Frontend: `client/src/pages/portal/PortalInterviewsPage.jsx` (new) — employee-facing list of scheduled rounds with a "Join Teams meeting" button; added to portal nav/routes.
- `client/src/lib/validation.js` — added `interviewSchema` (round/date/time/duration, all required, positive integers).
- Verified live (with Teams left unconfigured, per this environment): create employee → draft; `POST /interviews` returns a clean 502 explaining the missing Azure config instead of crashing; `POST /documents` correctly 400s before selection; `PUT /select` moves `draft → selected`; `POST /documents` then succeeds; `PUT /select` correctly rejects if already past `interviewing`. The Graph API call path itself (`createTeamsMeeting`) has **not** been exercised against a real Azure tenant — please test that specific piece once credentials are configured, since Graph's actual request/response shape can only be fully confirmed against the live API.

### Changed — Password self-service restricted to permanent employees
- Temporary employees can no longer change their own password. `Employee.mustSetPassword` now defaults to `false` (was `true`), so first login with the HR-issued temp password no longer forces a change — they just log in and use it as-is while temporary.
- `server/src/controllers/employeeAuthController.js` — `employeeSetPassword` now returns `403 "Only permanent employees can change their password"` if `employee.employmentType !== "permanent"`.
- `server/src/controllers/employeeAdminController.js` — `convertToPermanent` now sets `mustSetPassword = true`, which is what actually triggers the forced "set your password" flow, the moment HR converts someone to permanent (previously this only happened on an employee's very first login regardless of employment type). `resetEmployeePassword` now only sets `mustSetPassword = true` for employees who are already permanent — resetting a temporary employee's password just issues a new temp password without forcing a self-service change they're not allowed to make.
- `client/src/components/portal/PortalProtectedRoute.jsx` — now calls `refresh()` (re-fetches `/api/employees/me`) on every portal navigation, so a mid-session conversion to permanent is picked up automatically (redirecting to `/portal/set-password`) without requiring a manual page reload.
- `client/src/pages/portal/PortalSetPasswordPage.jsx` — copy updated to reflect that this flow is triggered by permanent conversion, not "first login".
- Verified end-to-end via live API calls: temp employee login does not force a password change; temp employee's `POST /api/employees/set-password` returns 403; after `convertToPermanent`, `mustSetPassword` flips to `true` and the same employee can then successfully change their password.

### Added — Zod validation across forms + phone number input constraints
- Added `zod` as a client dependency.
- `client/src/lib/validation.js` (new) — shared Zod schemas: `loginSchema`, `setPasswordSchema`, `createEmployeeSchema`, `departmentSchema`, `requestDocumentsSchema`, `taskSchema`, `leaveTypeSchema`, `leaveRequestSchema`, `careerApplySchema`, `contactInquirySchema`. Includes `phoneSchema`/`optionalPhoneSchema` (exactly 10 digits).
- `client/src/lib/zodHelpers.js` (new) — `firstZodError(schema, data)` helper returning the first validation issue's message, wired into each form's submit handler ahead of the API call (existing `admin-message`/`admin-login-error` banner patterns reused for display — no new UI components needed).
- `client/src/lib/phoneInput.js` (new) — `onlyDigits(value, maxLen = 10)` strips non-digits and caps length; applied to every phone/mobile `<input>` in the app (`inputMode="numeric"`, `pattern="[0-9]*"`, `maxLength={10}` added alongside).
- Forms updated with validation + phone constraints: `LoginPage.jsx`, `AdminLoginPage.jsx`, `PortalLoginPage.jsx`, `PortalSetPasswordPage.jsx`, `AdminEmployeesPage.jsx` (create-employee + request-documents forms), `AdminDepartmentsPage.jsx`, `AdminTasksPage.jsx`, `AdminLeavePage.jsx`, `PortalLeavePage.jsx`, `components/careers/CareerApplyForm.jsx`, `components/contact/ContactInquiryForm.jsx`.
- Scope note: pre-existing marketing CMS forms without phone fields (Projects/Blogs/Tech Stack/Careers-position editor in the admin panel) were left as-is — this pass covered the HRMS module forms plus every form with a phone field. Ask if those should be brought under Zod too.
- Verified: phone regex (`^\d{10}$`) and `onlyDigits` helper both tested directly against sample inputs (valid/invalid digit counts, non-numeric characters); full client build passes clean.

### Fixed — Uploaded documents were not gitignored
- `server/uploads/` had a `.gitkeep` but no ignore rule for its contents, so files uploaded to `server/uploads/employee-docs/` (employee documents, offer/joining letters) would have been picked up by `git status` and could get committed. Added rules to `server/.gitignore` to ignore uploaded file contents while keeping the directory structure tracked via `.gitkeep` (`server/uploads/employee-docs/.gitkeep` added). Verified with `git check-ignore`.

### Added — Manual employee creation
- `POST /api/admin/employees` (`server/src/controllers/employeeAdminController.js`, `createEmployee`): creates an `Employee` directly from HR-entered fullName/email/phone/position/department, without requiring a `JobApplication`. Reuses the same one-time-temp-password flow as `createEmployeeFromApplication` (`application` field left `null`). 400 if fullName/email missing, 409 on duplicate email.
- Route wired in `server/src/routes/employeeAdminRoutes.js`, gated `requireRole("superadmin", "hr")`.
- `client/src/lib/api.js`: added `adminEmployees.create`.
- `client/src/pages/admin/AdminEmployeesPage.jsx`: added a "New employee" button + inline form on the list view (name/email/phone/position/department), showing the one-time temp password banner on success — same UX pattern as the existing "Create Employee" action on `AdminCareersPage.jsx`.
- Verified via live API calls: successful creation, 409 on duplicate email, 400 on missing fullName.

### Added — Unified header login
- `POST /api/auth/unified-login` (`server/src/controllers/authController.js`, `unifiedLogin`): checks the `Admin` collection first, then `Employee`, and signs the correct role-tagged JWT for whichever matches. Public route in `server/src/routes/authRoutes.js`.
- `client/src/pages/LoginPage.jsx` (new, public route `/login`): single email/password form. On success, populates the correct context (`AuthContext` for admin roles, `EmployeeAuthContext` for employees) and redirects to `/admin` or `/portal/dashboard` (or `/portal/set-password` if the employee still has a temp password).
- Added an unobtrusive "Login" button (`btn btn-outline`, next to the existing "Talk to us" CTA) to `client/src/components/Navbar.jsx`, in both desktop and mobile nav — purely additive, doesn't change layout/behavior for other visitors.
- Verified via live API calls: admin credentials return `account: "admin"` with role; employee temp-password credentials return `account: "employee"` with `mustSetPassword: true`; wrong password returns a generic `401 Invalid credentials` in both cases (no user enumeration).

### Fixed
- Route ordering bug in `server/src/routes/employeeAdminRoutes.js`: `PUT /:id/onboarding/:itemIndex` was registered before `PUT /:id/onboarding/complete`, so Express matched `complete` as the `itemIndex` param and `completeOnboarding` was never reached. Reordered so the literal `/complete` route is matched first.

### Added — Module 5: Leave Management
- `server/src/models/LeaveType.js`, `server/src/models/LeaveRequest.js`.
- `server/src/controllers/leaveAdminController.js` (HR: manage leave types, list/review requests, decrements `Employee.leaveBalances` on approval).
- Employee-side leave endpoints in `employeePortalController.js` (`listLeaveTypesForEmployee`, `listMyLeaveRequests`, `createLeaveRequest`, `cancelMyLeaveRequest`) with balance validation at submission time.
- `leaveBalances` on `Employee` initialized from `LeaveType.defaultDaysPerYear` inside `convertToPermanent`.
- Routes: `/api/admin/leave-types`, `/api/admin/leave-requests`, `/api/employees/me/leave-types`, `/api/employees/me/leave-requests`.
- Frontend: `client/src/pages/admin/AdminLeavePage.jsx`, `client/src/pages/portal/PortalLeavePage.jsx`.

### Added — Module 4: Task Management
- `server/src/models/Task.js`.
- `server/src/controllers/taskAdminController.js` (HR/manager assignment, manager scoped to own team via `Employee.manager`).
- Employee-side task endpoints in `employeePortalController.js` (`listMyTasks`, `updateMyTaskStatus`).
- Routes: `/api/admin/tasks`, `/api/employees/me/tasks`.
- Frontend: `client/src/pages/admin/AdminTasksPage.jsx`, `client/src/pages/portal/PortalTasksPage.jsx`.

### Added — Module 3: Employee Lifecycle (Temporary → Permanent)
- `server/src/models/Employee.js`, `EmployeeDocument.js`, `EmployeeNotification.js`.
- `server/src/middleware/uploadDocuments.js` (PDF/image/Word uploads, separate from the image-only `upload.js`).
- `server/src/controllers/employeeAdminController.js` — full HR workflow: create employee from job application (with one-time temp password), request/review documents, send offer (2-file upload), start/complete onboarding, convert to permanent.
- `server/src/controllers/employeePortalController.js` — employee profile, document upload/re-upload, offer view/accept.
- Routes: `server/src/routes/employeeAdminRoutes.js` (mounted at `/api/admin/employees`), extended `server/src/routes/employeeRoutes.js`.
- Frontend: `client/src/pages/admin/AdminEmployeesPage.jsx`, "Create Employee" action + one-time temp-password banner added to `AdminCareersPage.jsx`, `client/src/pages/portal/PortalDocumentsPage.jsx`, `PortalOfferPage.jsx`, `PortalDashboardPage.jsx`.
- Verified end-to-end via live API calls: application → employee creation → document request/upload/verify → offer send/accept → onboarding start/checklist/complete → convert to permanent, including leave balance initialization.

### Added — Module 2: Employee Model & Auth
- `server/src/utils/tempPassword.js`.
- `server/src/controllers/employeeAuthController.js` (`employeeLogin`, `employeeSetPassword`).
- `requireEmployeeAuth` middleware in `server/src/middleware/auth.js`; `requireAuth` now rejects employee-role tokens.
- `server/src/routes/employeeRoutes.js` created, mounted at `/api/employees` in `server/src/index.js`.
- Frontend: `client/src/context/EmployeeAuthContext.jsx`, `client/src/components/portal/PortalProtectedRoute.jsx`, `PortalLayout.jsx`, `client/src/pages/portal/PortalLoginPage.jsx`, `PortalSetPasswordPage.jsx`. `EmployeeAuthProvider` wired into `client/src/main.jsx`.
- Verified: employee login with HR-issued temp password, forced password set, re-login with new password.

### Added — Module 1: Roles & Departments
- `Admin.role` field (`superadmin`/`hr`/`manager`, default `hr`); default seeded admin is `superadmin` (`server/src/utils/seed.js`, plus a one-time backfill for admins created before this change).
- `server/src/models/Department.js`.
- `requireRole(...roles)` middleware in `server/src/middleware/auth.js`.
- JWT payload now includes `role` for both Admin (`authController.js`) and Employee (`employeeAuthController.js`) tokens.
- `server/src/controllers/departmentController.js` (CRUD; delete blocked while employees are still assigned to the department).
- Routes: `/api/admin/departments`, gated with `requireRole("superadmin", "hr")` on writes.
- Frontend: `client/src/pages/admin/AdminDepartmentsPage.jsx`.
- Verified: department creation, role returned correctly on admin login/me.

### Infrastructure
- All new admin routes wired into `server/src/routes/adminRoutes.js`; `employeeRoutes.js` wired into `server/src/index.js`.
- `AdminLayout.jsx` sidebar updated with Departments/Employees/Tasks/Leave links; `App.jsx` updated with `/admin/*` and `/portal/*` routes.
- `client/src/lib/api.js` extended with `adminDepartments`, `adminEmployees`, `adminTasks`, `adminLeave`, and a separate `employeeApi` axios instance (own token) plus employee-facing API functions.
- Verified `npx vite build` succeeds and `node --check` passes on all new/modified server files.
