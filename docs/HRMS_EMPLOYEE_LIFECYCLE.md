# HRMS Implementation Plan — Nutri Solutions

**Status: all 5 modules implemented and verified end-to-end (2026-07-02).** See `../CHANGELOG.md` for the detailed, dated log of what was built and one bug found/fixed during verification (onboarding route ordering). This document remains the reference for the schema/route/component design — checklist items are kept checked off for history.

**Post-launch change (see CHANGELOG.md "Password self-service restricted to permanent employees"):** the `mustSetPassword` behavior described in Module 2/3 below (forced set-password on an employee's *first login*) has since changed. `mustSetPassword` now defaults to `false` and is only set to `true` by `convertToPermanent` — temporary employees cannot self-service change their password at all (`employeeSetPassword` 403s for non-permanent employees); the forced "set your password" flow now triggers when HR converts someone to permanent, not at initial employee creation. The code snippets below are left as originally written for historical reference; treat the CHANGELOG entry as authoritative for current behavior. Also added since: Zod validation (`client/src/lib/validation.js`) wired into every HRMS form plus the login pages, and a shared `onlyDigits` helper (`client/src/lib/phoneInput.js`) enforcing 10-digit-only phone inputs across the app.

**Post-launch change — Interview stage added (see CHANGELOG.md "Interview scheduling stage"):** two new statuses, `interviewing` and `selected`, were inserted between `draft` and `documents_requested`. HR schedules one or more interview rounds (`server/src/models/Interview.js`, `server/src/controllers/interviewAdminController.js`), then marks the candidate `selected` before `requestDocuments` is allowed (now hard-gated on `status === "selected"`, previously any pre-document status).

**Post-launch change — Replaced Microsoft Teams with Jitsi Meet for interview video calls (see CHANGELOG.md "Replaced Teams with Jitsi Meet"):** the original Teams/Graph integration (`teamsService.js`, `@azure/msal-node`, Azure AD app registration, `MS_TENANT_ID`/`MS_CLIENT_ID`/`MS_CLIENT_SECRET`/`MS_ORGANIZER_USER_ID`) has been removed entirely and replaced with `server/src/services/jitsiService.js`, which needs **no OAuth, API keys, or admin consent** — it just derives a unique room name and returns a `https://meet.jit.si/<room>` join URL. `Interview.teamsMeetingId`/`teamsJoinUrl` were renamed to `meetingId`/`joinUrl` (updated in the controller and both admin/portal frontend pages). Set `JITSI_BASE_URL` in `server/.env` to point at a self-hosted Jitsi instance instead of the public `meet.jit.si`.

**Post-launch change — File storage moved to Cloudinary (see CHANGELOG.md "All file uploads now go to Cloudinary"):** every file upload described anywhere in this doc (site images via `upload.js`/`uploadController.js`, employee documents, offer/joining letters via `uploadDocuments.js`) now goes to Cloudinary instead of local disk — `multer.memoryStorage()` + `uploadBufferToCloudinary()` (`server/src/utils/cloudinaryUpload.js`), configured from `CLOUDINARY_URL` in `server/.env`. **Action required in the Cloudinary dashboard**: PDF/document delivery returns 401 by default (Cloudinary blocks public PDF/ZIP delivery for security) — enable "Allow delivery of PDF and ZIP files" under Settings → Security in the Cloudinary console, or uploaded documents/offer letters won't be viewable. Verified live against the real account (image + multi-image + employee PDF upload all succeeded and returned real `res.cloudinary.com` URLs); the PDF-delivery-401 finding came from that same verification pass.

**Post-launch change — Portal nav is now stage-based, plus Company Documents (see CHANGELOG.md "Employee portal redesign"):** `PortalLayout.jsx`'s nav (and route access, via new `PortalRoleGate.jsx`) now depends on `employee.employmentType`: temporary employees see Interviews/Offer but not Tasks/Leave; permanent employees see Tasks/Leave but not Interviews/Offer. A new `CompanyDocument` model/flow (`server/src/models/CompanyDocument.js`) lets HR upload appraisal letters and monthly payslips for permanent employees only (400 if attempted on a temporary employee), surfaced on the redesigned `PortalDocumentsPage.jsx` (card-grid layout, same visual system as the admin employee detail page) alongside the offer letter and their original verification documents. Verified live end-to-end through a full hire-to-permanent run.

**Post-launch change — Payslips/appraisal letters are also server-generated now, not uploaded (see CHANGELOG.md "Payslips and appraisal letters are now server-generated"):** the "HR uploads a file" part of the above paragraph is superseded — `uploadCompanyDocument` was replaced by `generatePayslip`/`generateAppraisal` in `employeeAdminController.js` (`POST /api/admin/employees/:id/payslips` and `/appraisals`), which generate the PDFs server-side via `letterGenerator.js` exactly like the offer/joining letters. Payslips pull the employee's stored `ctc` and pro-rate it by loss-of-pay days if given; appraisal letters take a new CTC + effective date and **update `Employee.ctc`** so later payslips reflect the raise. `CompanyDocument` records and the portal display are otherwise unchanged.

**Post-launch change — Offer/joining letters are now server-generated PDFs, not HR-uploaded files (see CHANGELOG.md "Server-generated offer & joining letters"):** the `sendOffer` step described below (HR uploads two files via `uploadOfferDocs`) has been replaced by `generateOffer` in `employeeAdminController.js` — HR fills in a details form (position/CTC/work location/joining date/probation/reporting manager) and the server generates both PDFs itself via `server/src/services/letterGenerator.js` (pdfkit, branded letterhead), uploads them to Cloudinary, and stores the URLs on the same `offerLetterUrl`/`joiningLetterUrl` fields as before — everything downstream (portal display, notifications, status transition to `offer_sent`) is unchanged. The `uploadOfferDocs` multer middleware was removed as dead code. If you're building against the API, `POST /api/admin/employees/:id/offer` now expects a JSON body, not `multipart/form-data`.

**Post-launch change — Letter content/layout rewritten to match a real reference template, with the real logo (see CHANGELOG.md "Offer & joining letters rewritten to match reference template"):** `letterGenerator.js` was substantially rewritten — the offer letter is now a 7-page document (summary, joining/office-hours/training/confidentiality, transfer/verification/termination/service, leave/conduct/other-conditions, Annexure I document checklist, Annexure II compensation breakup, amendments/acceptance) and the joining letter mirrors a one-page appointment-letter format, both matching the structure of a real-world reference document supplied by the user. The company logo (`server/assets/logo.svg`) is rasterized via `sharp` (cached in memory after first use) and embedded as an actual image in the top-right corner of every page, replacing the earlier hand-drawn vector-gradient banner. `Employee.employeeCode` (new field) is generated once per employee and reused across regenerations. If you're extending this generator: two real pdfkit gotchas were hit and fixed here — (1) text placed at the exact bottom-margin boundary silently starts a new page even with an explicit y; keep footer/trailing content comfortably clear of `doc.page.margins.bottom`. (2) `doc.x`/`doc.y` persist across absolute-positioned `.text(str, x, y, …)` calls — after a multi-column table, explicitly reset `doc.x` before the next flowing paragraph or it inherits the last column's x-offset and wraps into a narrow strip.

## Jitsi Meet setup (interview scheduling)

Interview scheduling generates a Jitsi Meet room and join link — no account, API key, or admin consent needed. By default it uses the free public `meet.jit.si` service.

To point at a self-hosted Jitsi instance instead, add to `server/.env`:
```
JITSI_BASE_URL=https://your-jitsi-domain.example
```
Restart the server; no other configuration is required. Every scheduled interview round gets its own uniquely named room (`server/src/services/jitsiService.js`), so links never collide across employees or rounds.

Reference: originally scoped in `/Users/manoj/.claude/plans/gleaming-zooming-boole.md`. This document is the full working plan and implementation reference — work through the checklists module by module.

## Scope

1. **Auth & Roles** — Admin login (existing) + Employee login (new), role-based access (SuperAdmin / HR / Manager / Employee)
2. **Departments** — master data, employees assigned to a department
3. **Employee Lifecycle** — temporary employee creation from job applicants → document verification → offer → onboarding → conversion to permanent
4. **Task Management** — assign/track tasks per employee
5. **Leave Management** — leave types, balances, apply/approve/reject

Build order (do modules top to bottom — each depends on the previous):
1. Roles & Departments (foundation)
2. Employee model + Auth (employee login)
3. Employee Lifecycle (temp → permanent)
4. Task Management
5. Leave Management

---

## Module 1 — Roles & Departments

### Why
Today there's a single flat `Admin` model with no role field and no department concept. Every other module (employee auth, tasks, leave approvals) needs a role to know who can approve/assign/view what, and a department to group employees.

### Roles
| Role | Can do |
|---|---|
| `superadmin` | Everything, including creating other HR/Manager accounts |
| `hr` | Manage employees, departments, documents, offers, onboarding, leave approvals, task oversight |
| `manager` | View/manage their department's employees, approve leave for direct reports, assign tasks |
| `employee` | Self-service: own profile, documents, tasks, leave requests |

`superadmin`/`hr`/`manager` are all **Admin** accounts (they log into `/admin`) distinguished by a `role` field. `employee` is a separate **Employee** account (logs into `/portal`) — kept as a separate model/collection since employee auth already has to be a new build (no email delivery, temp-password flow, etc. — see Module 2/3).

### Checklist
- [x] `server/src/models/Admin.js` — add `role` field: `{ type: String, enum: ["superadmin", "hr", "manager"], default: "hr" }`. Existing seeded admin(s) should be treated as `superadmin` (update seed script / manually in DB).
- [x] `server/src/models/Department.js` (new) — `{ name (unique), description, manager (ref Admin, nullable) }`, timestamps.
- [x] `server/src/middleware/auth.js` — add `requireRole(...roles)` factory that runs after `requireAuth` and checks `req.admin.role` is in the allowed list; 403 otherwise.
- [x] `server/src/controllers/authController.js` — include `role` in the JWT payload (already planned in Module 2 below) and in the `/me` response.
- [x] `server/src/controllers/departmentController.js` (new) — `listDepartments`, `createDepartment`, `updateDepartment`, `deleteDepartment` (block delete if employees still reference it — return 409).
- [x] `server/src/routes/adminRoutes.js` — add `/departments` CRUD routes, gated with `requireRole("superadmin", "hr")` on create/update/delete (read open to any admin role).
- [x] Frontend: `client/src/pages/admin/AdminDepartmentsPage.jsx` (same list/form pattern as `AdminTechStackPage.jsx` — simplest existing CRUD page, good template for a flat master-data list).
- [x] Frontend: `AdminLayout.jsx` sidebar — hide nav items the current admin's role can't access (e.g. only `superadmin` sees a future "Manage HR Accounts" page).

### Code — `server/src/models/Department.js`
```js
import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null }
  },
  { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);
```

### Code — `requireRole` addition to `server/src/middleware/auth.js`
```js
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.admin || !roles.includes(req.admin.role)) {
    return res.status(403).json({ message: "You do not have permission to perform this action" });
  }
  return next();
};
```
Usage in routes: `router.post("/departments", requireRole("superadmin", "hr"), createDepartment);`

---

## Module 2 — Employee Model & Auth

### Why
Employees need their own login, separate from Admin, because there's no email delivery in this app (passwords must be relayed by HR in-app) and because employee self-service is a fundamentally different portal (`/portal`) from the admin panel (`/admin`).

### Checklist
- [x] `server/src/models/Employee.js` (new) — core profile + auth fields (full schema in Module 3, since lifecycle fields live on the same document — see below). Includes `department` (ref Department), `role: "employee"` implicit (no field needed, it's a separate collection).
- [x] `server/src/controllers/authController.js` — update `signToken` to include `role: admin.role` (not hardcoded `"admin"`) now that Admin has real roles.
- [x] `server/src/middleware/auth.js` — `requireAuth` continues to reject `role === "employee"` tokens; add `requireEmployeeAuth` (see full code in Module 3).
- [x] `server/src/utils/tempPassword.js` (new) — `generateTempPassword()` helper shared by employee-creation and password-reset flows.
- [x] `server/src/controllers/employeeAuthController.js` (new) — `employeeLogin`, `employeeSetPassword` (forced on first login).
- [x] `server/src/routes/employeeRoutes.js` (new) — mounted at `/api/employees` in `server/src/index.js`.
- [x] Frontend: `client/src/context/EmployeeAuthContext.jsx`, `PortalProtectedRoute.jsx`, `PortalLayout.jsx`, `PortalLoginPage.jsx`, `PortalSetPasswordPage.jsx` — see full code below.

### Code — `server/src/utils/tempPassword.js`
```js
import crypto from "crypto";

export const generateTempPassword = () => crypto.randomBytes(9).toString("base64url");
```

### Code — `server/src/middleware/auth.js` (full file after Module 1 + 2 changes)
```js
import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret-change-me");
    if (payload.role === "employee") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.admin = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireEmployeeAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret-change-me");
    if (payload.role !== "employee") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.employee = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.admin || !roles.includes(req.admin.role)) {
    return res.status(403).json({ message: "You do not have permission to perform this action" });
  }
  return next();
};
```

### Code — `server/src/controllers/authController.js` (modify `signToken` + `me`)
```js
const signToken = (admin) =>
  jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET || "dev-secret-change-me",
    { expiresIn: "7d" }
  );

// in `me`, also return role:
// return res.json({ admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role } });
```

### Code — `server/src/controllers/employeeAuthController.js`
```js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";

const signEmployeeToken = (employee) =>
  jwt.sign(
    { id: employee._id, email: employee.email, role: "employee" },
    process.env.JWT_SECRET || "dev-secret-change-me",
    { expiresIn: "7d" }
  );

export const employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const employee = await Employee.findOne({ email: email.toLowerCase().trim() });
    if (!employee || !employee.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const valid = await bcrypt.compare(password, employee.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = signEmployeeToken(employee);
    return res.json({
      token,
      employee: { id: employee._id, email: employee.email, fullName: employee.fullName },
      mustSetPassword: employee.mustSetPassword
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const employeeSetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }
    const employee = await Employee.findById(req.employee.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const valid = await bcrypt.compare(currentPassword, employee.passwordHash);
    if (!valid) return res.status(401).json({ message: "Current password is incorrect" });

    employee.passwordHash = await bcrypt.hash(newPassword, 10);
    employee.mustSetPassword = false;
    await employee.save();
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

### Code — `server/src/routes/employeeRoutes.js` (base — task/leave routes appended in Modules 4/5)
```js
import { Router } from "express";
import { requireEmployeeAuth } from "../middleware/auth.js";
import { employeeLogin, employeeSetPassword } from "../controllers/employeeAuthController.js";
import { getMe } from "../controllers/employeePortalController.js";

const router = Router();

router.post("/login", employeeLogin);
router.post("/set-password", requireEmployeeAuth, employeeSetPassword);
router.get("/me", requireEmployeeAuth, getMe);

export default router;
```

### Code — `server/src/index.js` (add)
```js
import employeeRoutes from "./routes/employeeRoutes.js";
// ...
app.use("/api/employees", employeeRoutes);
```

### Frontend — `client/src/context/EmployeeAuthContext.jsx`
```jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { employeeMe, setEmployeeAuthToken } from "../lib/api";

const TOKEN_KEY = "nutri_employee_token";
const EmployeeAuthContext = createContext(null);

export const EmployeeAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setEmployee(null);
    setEmployeeAuthToken(null);
  }, []);

  const login = useCallback((newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setEmployeeAuthToken(newToken);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) return setLoading(false);
      setEmployeeAuthToken(token);
      try {
        setEmployee(await employeeMe());
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [token, logout]);

  const value = useMemo(
    () => ({ token, employee, loading, login, logout, isAuthenticated: Boolean(token && employee) }),
    [token, employee, loading, login, logout]
  );

  return <EmployeeAuthContext.Provider value={value}>{children}</EmployeeAuthContext.Provider>;
};

export const useEmployeeAuth = () => {
  const ctx = useContext(EmployeeAuthContext);
  if (!ctx) throw new Error("useEmployeeAuth must be used within EmployeeAuthProvider");
  return ctx;
};
```
Wrap `<App />` with `<EmployeeAuthProvider>` in `client/src/main.jsx`, alongside the existing `<AuthProvider>`.

### Frontend — `client/src/components/portal/PortalProtectedRoute.jsx`
```jsx
import { Navigate, useLocation } from "react-router-dom";
import { useEmployeeAuth } from "../../context/EmployeeAuthContext";

const PortalProtectedRoute = ({ children }) => {
  const { isAuthenticated, employee, loading } = useEmployeeAuth();
  const location = useLocation();

  if (loading) return <div className="admin-loading">Checking session…</div>;
  if (!isAuthenticated) return <Navigate to="/portal/login" replace state={{ from: location.pathname }} />;
  if (employee?.mustSetPassword && location.pathname !== "/portal/set-password") {
    return <Navigate to="/portal/set-password" replace />;
  }
  return children;
};

export default PortalProtectedRoute;
```

### Frontend — routes to add in `client/src/App.jsx`
```jsx
<Route path="/portal/login" element={<PortalLoginPage />} />
<Route path="/portal/set-password" element={<PortalSetPasswordPage />} />
<Route
  path="/portal"
  element={
    <PortalProtectedRoute>
      <PortalLayout />
    </PortalProtectedRoute>
  }
>
  <Route index element={<Navigate to="/portal/dashboard" replace />} />
  <Route path="dashboard" element={<PortalDashboardPage />} />
  <Route path="documents" element={<PortalDocumentsPage />} />
  <Route path="offer" element={<PortalOfferPage />} />
  <Route path="tasks" element={<PortalTasksPage />} />
  <Route path="leave" element={<PortalLeavePage />} />
</Route>
```

### Frontend — `client/src/lib/api.js` (add, separate axios instance so admin/employee tokens don't collide)
```js
const employeeApi = axios.create({ baseURL: API_BASE, headers: { "Content-Type": "application/json" } });
export const setEmployeeAuthToken = (token) => {
  if (token) employeeApi.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete employeeApi.defaults.headers.common.Authorization;
};

export const employeeLogin = (email, password) =>
  employeeApi.post("/api/employees/login", { email, password }).then((r) => r.data);
export const employeeSetPassword = (currentPassword, newPassword) =>
  employeeApi.post("/api/employees/set-password", { currentPassword, newPassword }).then((r) => r.data);
export const employeeMe = () => employeeApi.get("/api/employees/me").then((r) => r.data.employee);
```
(Task/leave/document/offer functions appended in later modules — all reuse `employeeApi`.)

- [x] `PortalLoginPage.jsx` — email/password form → `employeeLogin` → `login(token)` from `useEmployeeAuth()` → navigate to `/portal`.
- [x] `PortalSetPasswordPage.jsx` — current/new password form → `employeeSetPassword` → reload so `mustSetPassword` flips.
- [x] `PortalLayout.jsx` — copy `AdminLayout.jsx` structure with nav links (Dashboard/Documents/Offer/Tasks/Leave) + logout button.

---

## Module 3 — Employee Lifecycle (Temporary → Permanent)

### State machine (`Employee.status`)
| Status | Meaning | Trigger |
|---|---|---|
| `draft` | Created from application, no docs requested | HR: "Create Employee" |
| `documents_requested` | HR defined required doc list | HR: request documents |
| `documents_under_review` | All requested docs uploaded, awaiting review | Auto, on last upload |
| `documents_rejected` | ≥1 doc rejected, needs re-upload | Auto, on any reject |
| `documents_verified` | All docs verified | Auto, on last verify |
| `offer_sent` | Offer + joining letter sent | HR: send offer (only from `documents_verified`) |
| `offer_accepted` | Employee accepted | Employee: accept offer |
| `onboarding` | Employee joined, checklist running | HR: start onboarding (only from `offer_accepted`) |
| `onboarding_completed` | Checklist done | HR: complete onboarding |
| `permanent` | Converted | HR: convert to permanent (`employmentType` flips too) |

`employmentType` (`temporary`|`permanent`) only flips at the final step. `statusHistory[]` is the audit trail / in-app notification substitute (no email in v1). Document status (`pending`|`uploaded`|`verified`|`rejected`) is per-document; the controller recomputes the aggregate `Employee.status` after every document change.

### Checklist
- [x] `server/src/models/Employee.js` — full schema below (includes Module 1/2 fields: `department`, `passwordHash`, `mustSetPassword`, plus lifecycle fields).
- [x] `server/src/models/EmployeeDocument.js` — HR-defined free-text document requests, unique per employee.
- [x] `server/src/models/EmployeeNotification.js` — in-app notification feed (also used by Task/Leave modules).
- [x] `server/src/middleware/uploadDocuments.js` — multer config allowing PDF/image/Word, separate from the existing image-only `upload.js`.
- [x] `server/src/controllers/employeeAdminController.js` — full HR-side workflow controller.
- [x] `server/src/controllers/employeePortalController.js` — employee-side profile/documents/offer controller.
- [x] `server/src/routes/employeeAdminRoutes.js` — mounted at `/api/admin/employees`, wired into `adminRoutes.js`.
- [x] `server/src/routes/employeeRoutes.js` — extend with documents/offer endpoints.
- [x] Frontend: `AdminEmployeesPage.jsx`, "Create Employee" action on `AdminCareersPage.jsx`, `PortalDocumentsPage.jsx`, `PortalOfferPage.jsx`, `PortalDashboardPage.jsx`.

### Code — `server/src/models/Employee.js` (final combined schema)
```js
import mongoose from "mongoose";

const STATUSES = [
  "draft",
  "documents_requested",
  "documents_under_review",
  "documents_rejected",
  "documents_verified",
  "offer_sent",
  "offer_accepted",
  "onboarding",
  "onboarding_completed",
  "permanent"
];

const statusHistoryEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    note: { type: String, default: "" },
    changedBy: { type: String, enum: ["hr", "employee"], required: true },
    changedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const onboardingItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: "JobApplication", default: null },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "", trim: true },
    passwordHash: { type: String, default: null },
    mustSetPassword: { type: Boolean, default: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    employmentType: { type: String, enum: ["temporary", "permanent"], default: "temporary" },
    status: { type: String, enum: STATUSES, default: "draft" },
    position: { type: String, default: "", trim: true },
    joiningDate: { type: Date, default: null },
    offerLetterUrl: { type: String, default: "" },
    joiningLetterUrl: { type: String, default: "" },
    offerAcceptedAt: { type: Date, default: null },
    onboardingChecklist: { type: [onboardingItemSchema], default: [] },
    statusHistory: { type: [statusHistoryEntrySchema], default: [] },
    leaveBalances: {
      type: Map,
      of: Number,
      default: undefined // populated when Leave module (Module 5) initializes an employee's balances
    }
  },
  { timestamps: true }
);

employeeSchema.index({ status: 1, createdAt: -1 });

export const EMPLOYEE_STATUSES = STATUSES;
export default mongoose.model("Employee", employeeSchema);
```

### Code — `server/src/models/EmployeeDocument.js`
```js
import mongoose from "mongoose";

const historyEntrySchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true },
    status: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const employeeDocumentSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    label: { type: String, required: true, trim: true },
    labelKey: { type: String, required: true, lowercase: true, trim: true },
    status: { type: String, enum: ["pending", "uploaded", "verified", "rejected"], default: "pending" },
    fileUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
    history: { type: [historyEntrySchema], default: [] },
    requestedAt: { type: Date, default: Date.now },
    uploadedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: String, default: "" }
  },
  { timestamps: true }
);

employeeDocumentSchema.index({ employee: 1, labelKey: 1 }, { unique: true });

export default mongoose.model("EmployeeDocument", employeeDocumentSchema);
```

### Code — `server/src/models/EmployeeNotification.js` (shared by lifecycle, tasks, leave)
```js
import mongoose from "mongoose";

const employeeNotificationSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null, index: true },
    audience: { type: String, enum: ["hr", "employee"], required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("EmployeeNotification", employeeNotificationSchema);
```

### Code — `server/src/middleware/uploadDocuments.js`
```js
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const employeeDocsDir = path.join(__dirname, "../../uploads/employee-docs");

if (!fs.existsSync(employeeDocsDir)) {
  fs.mkdirSync(employeeDocsDir, { recursive: true });
}

const allowed = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, employeeDocsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".pdf";
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`);
  }
});

const fileFilter = (_req, file, cb) => {
  if (allowed.has(file.mimetype)) cb(null, true);
  else cb(new Error("Only PDF, JPEG, PNG, or Word documents are allowed"));
};

export const uploadEmployeeDoc = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }).single("file");

export const uploadOfferDocs = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }).fields([
  { name: "offerLetter", maxCount: 1 },
  { name: "joiningLetter", maxCount: 1 }
]);

export const docFileUrl = (req, filename) =>
  `${req.protocol}://${req.get("host")}/uploads/employee-docs/${filename}`;
```
No change needed to `server/src/index.js` static mount — `/uploads/employee-docs/...` resolves under the existing `app.use("/uploads", express.static(...))`.

### Code — `server/src/controllers/employeeAdminController.js`
```js
import bcrypt from "bcryptjs";
import Employee from "../models/Employee.js";
import EmployeeDocument from "../models/EmployeeDocument.js";
import EmployeeNotification from "../models/EmployeeNotification.js";
import JobApplication from "../models/JobApplication.js";
import { generateTempPassword } from "../utils/tempPassword.js";
import { docFileUrl } from "../middleware/uploadDocuments.js";

const pushHistory = (employee, status, note, changedBy) => {
  employee.status = status;
  employee.statusHistory.push({ status, note, changedBy, changedAt: new Date() });
};

const notify = (employeeId, audience, type, message) =>
  EmployeeNotification.create({ employee: employeeId, audience, type, message });

export const listEmployees = async (req, res) => {
  try {
    const { status, employmentType, department, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (employmentType) filter.employmentType = employmentType;
    if (department) filter.department = department;
    if (q) {
      const re = new RegExp(q.trim(), "i");
      filter.$or = [{ fullName: re }, { email: re }];
    }
    const employees = await Employee.find(filter).populate("department", "name").sort({ createdAt: -1 });
    return res.json({ employees });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate("department", "name");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    const documents = await EmployeeDocument.find({ employee: employee._id }).sort({ createdAt: 1 });
    const notifications = await EmployeeNotification.find({ employee: employee._id }).sort({ createdAt: -1 });
    return res.json({ employee, documents, notifications });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createEmployeeFromApplication = async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.applicationId);
    if (!application) return res.status(404).json({ message: "Application not found" });

    const existing = await Employee.findOne({ email: application.email });
    if (existing) return res.status(409).json({ message: "An employee with this email already exists" });

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const employee = await Employee.create({
      application: application._id,
      fullName: application.fullName,
      email: application.email,
      phone: application.phone,
      passwordHash,
      mustSetPassword: true,
      department: req.body.department || null,
      statusHistory: [{ status: "draft", note: "Created from application", changedBy: "hr" }]
    });

    return res.status(201).json({ employee, tempPassword });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Employee already exists" });
    return res.status(500).json({ message: error.message });
  }
};

export const resetEmployeePassword = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const tempPassword = generateTempPassword();
    employee.passwordHash = await bcrypt.hash(tempPassword, 10);
    employee.mustSetPassword = true;
    await employee.save();

    return res.json({ ok: true, tempPassword });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const requestDocuments = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const labels = Array.isArray(req.body.labels) ? req.body.labels : [];
    const cleaned = labels.map((l) => String(l).trim()).filter(Boolean);
    if (!cleaned.length) return res.status(400).json({ message: "At least one document label is required" });

    const created = [];
    for (const label of cleaned) {
      const labelKey = label.toLowerCase();
      const exists = await EmployeeDocument.findOne({ employee: employee._id, labelKey });
      if (exists) continue;
      created.push(await EmployeeDocument.create({ employee: employee._id, label, labelKey }));
    }

    if (employee.status === "draft") {
      pushHistory(employee, "documents_requested", `Requested ${created.length} document(s)`, "hr");
      await employee.save();
    }

    await notify(employee._id, "employee", "document_requested", "New documents have been requested. Please upload them.");
    return res.status(201).json({ documents: created });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const recomputeDocumentAggregateStatus = async (employee) => {
  const docs = await EmployeeDocument.find({ employee: employee._id });
  if (!docs.length) return;

  const anyRejected = docs.some((d) => d.status === "rejected");
  const allVerified = docs.every((d) => d.status === "verified");
  const allSubmitted = docs.every((d) => d.status === "uploaded" || d.status === "verified");

  if (anyRejected) {
    if (employee.status !== "documents_rejected") pushHistory(employee, "documents_rejected", "A document was rejected", "hr");
  } else if (allVerified) {
    if (employee.status !== "documents_verified") pushHistory(employee, "documents_verified", "All documents verified", "hr");
  } else if (allSubmitted) {
    if (employee.status !== "documents_under_review") pushHistory(employee, "documents_under_review", "All documents submitted", "employee");
  }
  await employee.save();
};

export const reviewDocument = async (req, res) => {
  try {
    const { employeeId, docId } = req.params;
    const { decision, rejectionReason } = req.body;
    if (!["verified", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "decision must be 'verified' or 'rejected'" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const doc = await EmployeeDocument.findOne({ _id: docId, employee: employeeId });
    if (!doc) return res.status(404).json({ message: "Document not found" });

    doc.status = decision;
    doc.reviewedAt = new Date();
    doc.rejectionReason = decision === "rejected" ? rejectionReason || "" : "";
    await doc.save();

    await recomputeDocumentAggregateStatus(employee);

    await notify(
      employee._id,
      "employee",
      decision === "verified" ? "document_verified" : "document_rejected",
      decision === "verified"
        ? `Your document "${doc.label}" was verified.`
        : `Your document "${doc.label}" was rejected: ${doc.rejectionReason || "no reason given"}. Please re-upload.`
    );

    return res.json({ document: doc, employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendOffer = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.status !== "documents_verified") {
      return res.status(400).json({ message: "All documents must be verified before sending an offer" });
    }

    const files = req.files || {};
    const offerFile = files.offerLetter?.[0];
    const joiningFile = files.joiningLetter?.[0];
    if (!offerFile || !joiningFile) {
      return res.status(400).json({ message: "Both offer letter and joining letter files are required" });
    }

    employee.offerLetterUrl = docFileUrl(req, offerFile.filename);
    employee.joiningLetterUrl = docFileUrl(req, joiningFile.filename);
    pushHistory(employee, "offer_sent", "Offer and joining letter sent", "hr");
    await employee.save();

    await notify(employee._id, "employee", "offer_sent", "Your offer letter and joining letter are ready to review.");
    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const startOnboarding = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.status !== "offer_accepted") {
      return res.status(400).json({ message: "Employee must accept the offer before onboarding starts" });
    }

    const items = Array.isArray(req.body.checklist) ? req.body.checklist : [];
    employee.onboardingChecklist = items.map((label) => ({ label: String(label).trim(), completed: false }));
    pushHistory(employee, "onboarding", "Onboarding started", "hr");
    await employee.save();

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateOnboardingItem = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const index = Number(req.params.itemIndex);
    const item = employee.onboardingChecklist[index];
    if (!item) return res.status(404).json({ message: "Checklist item not found" });

    item.completed = Boolean(req.body.completed);
    item.completedAt = item.completed ? new Date() : null;
    await employee.save();

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const completeOnboarding = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.status !== "onboarding") {
      return res.status(400).json({ message: "Employee is not currently onboarding" });
    }
    if (!employee.onboardingChecklist.every((i) => i.completed)) {
      return res.status(400).json({ message: "All onboarding checklist items must be completed first" });
    }

    pushHistory(employee, "onboarding_completed", "Onboarding completed", "hr");
    await employee.save();

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const convertToPermanent = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.status !== "onboarding_completed") {
      return res.status(400).json({ message: "Onboarding must be completed before converting to permanent" });
    }

    employee.employmentType = "permanent";
    pushHistory(employee, "permanent", "Converted to permanent employee", "hr");
    await employee.save();

    await notify(employee._id, "employee", "converted_permanent", "Congratulations! You are now a permanent employee.");
    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    await EmployeeDocument.deleteMany({ employee: employee._id });
    await EmployeeNotification.deleteMany({ employee: employee._id });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

### Code — `server/src/controllers/employeePortalController.js` (profile/documents/offer — task/leave handlers appended in later modules)
```js
import Employee from "../models/Employee.js";
import EmployeeDocument from "../models/EmployeeDocument.js";
import EmployeeNotification from "../models/EmployeeNotification.js";
import { docFileUrl } from "../middleware/uploadDocuments.js";

export const getMe = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee.id).select("-passwordHash").populate("department", "name");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listMyDocuments = async (req, res) => {
  try {
    const documents = await EmployeeDocument.find({ employee: req.employee.id }).sort({ createdAt: 1 });
    return res.json({ documents });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const uploadMyDocument = async (req, res) => {
  try {
    const doc = await EmployeeDocument.findOne({ _id: req.params.docId, employee: req.employee.id });
    if (!doc) return res.status(404).json({ message: "Document not found" });
    if (!["pending", "rejected"].includes(doc.status)) {
      return res.status(400).json({ message: "This document cannot be re-uploaded right now" });
    }
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const url = docFileUrl(req, req.file.filename);
    doc.history.push({ fileUrl: url, status: "uploaded", uploadedAt: new Date() });
    doc.fileUrl = url;
    doc.fileName = req.file.originalname;
    doc.mimeType = req.file.mimetype;
    doc.status = "uploaded";
    doc.uploadedAt = new Date();
    doc.rejectionReason = "";
    await doc.save();

    const employee = await Employee.findById(req.employee.id);
    const docs = await EmployeeDocument.find({ employee: employee._id });
    const allSubmitted = docs.every((d) => d.status === "uploaded" || d.status === "verified");
    if (allSubmitted && employee.status !== "documents_under_review") {
      employee.status = "documents_under_review";
      employee.statusHistory.push({
        status: "documents_under_review",
        note: "All documents submitted",
        changedBy: "employee",
        changedAt: new Date()
      });
      await employee.save();
    }

    await EmployeeNotification.create({
      employee: employee._id,
      audience: "hr",
      type: "document_uploaded",
      message: `${employee.fullName} uploaded "${doc.label}"`
    });

    return res.json({ document: doc });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getOffer = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee.id).select("offerLetterUrl joiningLetterUrl status offerAcceptedAt");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const acceptOffer = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.status !== "offer_sent") {
      return res.status(400).json({ message: "No pending offer to accept" });
    }

    employee.offerAcceptedAt = new Date();
    employee.status = "offer_accepted";
    employee.statusHistory.push({
      status: "offer_accepted",
      note: "Offer accepted by employee",
      changedBy: "employee",
      changedAt: new Date()
    });
    await employee.save();

    await EmployeeNotification.create({
      employee: employee._id,
      audience: "hr",
      type: "offer_accepted",
      message: `${employee.fullName} accepted the offer.`
    });

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listMyNotifications = async (req, res) => {
  try {
    const notifications = await EmployeeNotification.find({ employee: req.employee.id, audience: "employee" }).sort({
      createdAt: -1
    });
    return res.json({ notifications });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await EmployeeNotification.findOneAndUpdate(
      { _id: req.params.id, employee: req.employee.id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    return res.json({ notification });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

### Code — `server/src/routes/employeeAdminRoutes.js`
```js
import { Router } from "express";
import { handleUpload } from "../controllers/uploadController.js";
import { uploadOfferDocs } from "../middleware/uploadDocuments.js";
import { requireRole } from "../middleware/auth.js";
import {
  completeOnboarding,
  convertToPermanent,
  createEmployeeFromApplication,
  deleteEmployee,
  getEmployee,
  listEmployees,
  requestDocuments,
  resetEmployeePassword,
  reviewDocument,
  sendOffer,
  startOnboarding,
  updateOnboardingItem
} from "../controllers/employeeAdminController.js";

const router = Router();

router.get("/", listEmployees);
router.get("/:id", getEmployee);
router.post("/from-application/:applicationId", requireRole("superadmin", "hr"), createEmployeeFromApplication);
router.post("/:id/reset-password", requireRole("superadmin", "hr"), resetEmployeePassword);
router.post("/:id/documents", requireRole("superadmin", "hr"), requestDocuments);
router.put("/:employeeId/documents/:docId/review", requireRole("superadmin", "hr"), reviewDocument);
router.post("/:id/offer", requireRole("superadmin", "hr"), handleUpload(uploadOfferDocs), sendOffer);
router.put("/:id/onboarding/start", requireRole("superadmin", "hr"), startOnboarding);
router.put("/:id/onboarding/:itemIndex", requireRole("superadmin", "hr"), updateOnboardingItem);
router.put("/:id/onboarding/complete", requireRole("superadmin", "hr"), completeOnboarding);
router.put("/:id/convert-permanent", requireRole("superadmin", "hr"), convertToPermanent);
router.delete("/:id", requireRole("superadmin"), deleteEmployee);

export default router;
```
Wire into `server/src/routes/adminRoutes.js`:
```js
import employeeAdminRoutes from "./employeeAdminRoutes.js";
// after the existing careers/contact routes, before `export default router;`
router.use("/employees", employeeAdminRoutes);
```

### Code — `server/src/routes/employeeRoutes.js` (extend Module 2's base file)
```js
import { Router } from "express";
import { requireEmployeeAuth } from "../middleware/auth.js";
import { handleUpload } from "../controllers/uploadController.js";
import { uploadEmployeeDoc } from "../middleware/uploadDocuments.js";
import { employeeLogin, employeeSetPassword } from "../controllers/employeeAuthController.js";
import {
  acceptOffer,
  getMe,
  getOffer,
  listMyDocuments,
  listMyNotifications,
  markNotificationRead,
  uploadMyDocument
} from "../controllers/employeePortalController.js";

const router = Router();

router.post("/login", employeeLogin);
router.post("/set-password", requireEmployeeAuth, employeeSetPassword);

router.get("/me", requireEmployeeAuth, getMe);
router.get("/me/documents", requireEmployeeAuth, listMyDocuments);
router.post("/me/documents/:docId/upload", requireEmployeeAuth, handleUpload(uploadEmployeeDoc), uploadMyDocument);
router.get("/me/offer", requireEmployeeAuth, getOffer);
router.post("/me/offer/accept", requireEmployeeAuth, acceptOffer);
router.get("/me/notifications", requireEmployeeAuth, listMyNotifications);
router.put("/me/notifications/:id/read", requireEmployeeAuth, markNotificationRead);

export default router;
```
(Task and leave routes appended to this same file in Modules 4/5.)

### Frontend — `client/src/lib/api.js` (add)
```js
export const adminEmployees = {
  list: (params) => api.get("/api/admin/employees", { params }).then((r) => r.data.employees),
  get: (id) => api.get(`/api/admin/employees/${id}`).then((r) => r.data),
  createFromApplication: (applicationId, department) =>
    api.post(`/api/admin/employees/from-application/${applicationId}`, { department }).then((r) => r.data),
  resetPassword: (id) => api.post(`/api/admin/employees/${id}/reset-password`).then((r) => r.data),
  requestDocuments: (id, labels) =>
    api.post(`/api/admin/employees/${id}/documents`, { labels }).then((r) => r.data.documents),
  reviewDocument: (employeeId, docId, decision, rejectionReason) =>
    api.put(`/api/admin/employees/${employeeId}/documents/${docId}/review`, { decision, rejectionReason }).then((r) => r.data),
  sendOffer: (id, offerLetterFile, joiningLetterFile) => {
    const formData = new FormData();
    formData.append("offerLetter", offerLetterFile);
    formData.append("joiningLetter", joiningLetterFile);
    return api
      .post(`/api/admin/employees/${id}/offer`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data.employee);
  },
  startOnboarding: (id, checklist) =>
    api.put(`/api/admin/employees/${id}/onboarding/start`, { checklist }).then((r) => r.data.employee),
  updateOnboardingItem: (id, itemIndex, completed) =>
    api.put(`/api/admin/employees/${id}/onboarding/${itemIndex}`, { completed }).then((r) => r.data.employee),
  completeOnboarding: (id) => api.put(`/api/admin/employees/${id}/onboarding/complete`).then((r) => r.data.employee),
  convertToPermanent: (id) => api.put(`/api/admin/employees/${id}/convert-permanent`).then((r) => r.data.employee),
  remove: (id) => api.delete(`/api/admin/employees/${id}`)
};

export const adminDepartments = {
  list: () => api.get("/api/admin/departments").then((r) => r.data.departments),
  create: (data) => api.post("/api/admin/departments", data).then((r) => r.data.department),
  update: (id, data) => api.put(`/api/admin/departments/${id}`, data).then((r) => r.data.department),
  remove: (id) => api.delete(`/api/admin/departments/${id}`)
};

export const employeeMyDocuments = () => employeeApi.get("/api/employees/me/documents").then((r) => r.data.documents);
export const employeeUploadDocument = (docId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return employeeApi
    .post(`/api/employees/me/documents/${docId}/upload`, formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data.document);
};
export const employeeOffer = () => employeeApi.get("/api/employees/me/offer").then((r) => r.data.employee);
export const employeeAcceptOffer = () => employeeApi.post("/api/employees/me/offer/accept").then((r) => r.data.employee);
export const employeeNotifications = () => employeeApi.get("/api/employees/me/notifications").then((r) => r.data.notifications);
```

### Frontend pages (write following `AdminCareersPage.jsx` / `AdminTechStackPage.jsx` conventions)
- [x] `AdminEmployeesPage.jsx` — list (status badge, department/employmentType filters) + detail (documents w/ verify/reject, request-documents form, offer upload, onboarding checklist, convert-to-permanent button). Also includes a "New employee" button + inline form on the list view for manual creation (fullName/email/phone/position/department), independent of the careers/application pipeline — calls `POST /api/admin/employees` (`createEmployee` in `employeeAdminController.js`), same one-time-temp-password UX as the from-application path.
- [x] `AdminCareersPage.jsx` — add "Create Employee" action per application; show one-time temp-password modal on success.
- [x] `PortalDashboardPage.jsx` — `employee.status` human label, `statusHistory` timeline, notifications list.
- [x] `PortalDocumentsPage.jsx` — per-document status badge + upload/re-upload control (visible only when `pending`/`rejected`).
- [x] `PortalOfferPage.jsx` — offer/joining letter links + Accept button (visible only when `status === 'offer_sent'`).
- [x] `App.jsx` — add `employees` route under `/admin`, sidebar link in `AdminLayout.jsx`.

---

## Module 4 — Task Management

### Why
HR/managers need to assign work items to employees (onboarding tasks, recurring duties, ad-hoc assignments) and track completion — independent of the document/offer workflow.

### Model
- **`server/src/models/Task.js`**: `title`, `description`, `assignedTo` (ref Employee), `assignedBy` (ref Admin), `department` (ref Department, denormalized for filtering), `status` (enum `todo`|`in_progress`|`done`|`cancelled`, default `todo`), `priority` (enum `low`|`medium`|`high`, default `medium`), `dueDate`, `completedAt`, timestamps.

```js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    status: { type: String, enum: ["todo", "in_progress", "done", "cancelled"], default: "todo" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

taskSchema.index({ assignedTo: 1, status: 1 });

export default mongoose.model("Task", taskSchema);
```

### Checklist
- [x] `server/src/models/Task.js` (above).
- [x] `server/src/controllers/taskAdminController.js` — `listTasks` (filter by employee/department/status), `createTask` (HR/manager; if `manager`, restrict `assignedTo` to employees in their department — check `req.admin.role === "manager"` and cross-reference `Employee.department`/`manager`), `updateTask`, `deleteTask`. On `status` transition to `done`, set `completedAt` and fire an `EmployeeNotification` (`audience: "hr"`, only if changed by employee — see portal side).
- [x] `server/src/controllers/employeePortalController.js` — add `listMyTasks` (`GET /api/employees/me/tasks`), `updateMyTaskStatus` (`PUT /api/employees/me/tasks/:id/status`, employee can only move `todo → in_progress → done`, not edit title/assignment).
- [x] `server/src/routes/adminRoutes.js` — add `/tasks` routes gated with `requireRole("superadmin", "hr", "manager")` for create/update, open read.
- [x] `server/src/routes/employeeRoutes.js` — add `GET /me/tasks`, `PUT /me/tasks/:id/status`.
- [x] Frontend: `client/src/pages/admin/AdminTasksPage.jsx` — list/board view (group by status column, simplest: table with status dropdown per row, following `AdminContactPage.jsx`'s simpler list-only pattern rather than the master/detail careers pattern), create-task form (assignee dropdown populated from `adminEmployees.list()`, department auto-filled from selected employee).
- [x] Frontend: `client/src/pages/portal/PortalTasksPage.jsx` — list of assigned tasks with a status dropdown/buttons to move through `todo`/`in_progress`/`done`.
- [x] `client/src/lib/api.js` — add `adminTasks` (`list`, `create`, `update`, `remove`) and `employeeMyTasks`, `employeeUpdateTaskStatus`.

### Route sketch — append to `server/src/routes/adminRoutes.js`
```js
import { createTask, deleteTask, listTasks, updateTask } from "../controllers/taskAdminController.js";
router.get("/tasks", listTasks);
router.post("/tasks", requireRole("superadmin", "hr", "manager"), createTask);
router.put("/tasks/:id", requireRole("superadmin", "hr", "manager"), updateTask);
router.delete("/tasks/:id", requireRole("superadmin", "hr"), deleteTask);
```

### Route sketch — append to `server/src/routes/employeeRoutes.js`
```js
router.get("/me/tasks", requireEmployeeAuth, listMyTasks);
router.put("/me/tasks/:id/status", requireEmployeeAuth, updateMyTaskStatus);
```

---

## Module 5 — Leave Management

### Why
Employees request time off; managers/HR approve or reject; balances need tracking per leave type so requests can be validated against remaining days.

### Models
- **`server/src/models/LeaveType.js`**: `name` (e.g. "Casual", "Sick", "Earned", "Unpaid"), `defaultDaysPerYear` (Number), `paid` (Boolean).
- **`server/src/models/LeaveRequest.js`**: `employee` (ref), `leaveType` (ref LeaveType), `startDate`, `endDate`, `halfDay` (Boolean), `reason`, `status` (enum `pending`|`approved`|`rejected`|`cancelled`, default `pending`), `reviewedBy` (ref Admin), `reviewedAt`, `reviewNote`, timestamps.

```js
// server/src/models/LeaveType.js
import mongoose from "mongoose";

const leaveTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    defaultDaysPerYear: { type: Number, required: true, default: 12 },
    paid: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("LeaveType", leaveTypeSchema);
```

```js
// server/src/models/LeaveRequest.js
import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    leaveType: { type: mongoose.Schema.Types.ObjectId, ref: "LeaveType", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    halfDay: { type: Boolean, default: false },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected", "cancelled"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, default: "" }
  },
  { timestamps: true }
);

leaveRequestSchema.index({ employee: 1, status: 1 });

export default mongoose.model("LeaveRequest", leaveRequestSchema);
```

Employee-side balance tracking: use the `leaveBalances: Map<leaveTypeId, remainingDays>` field already stubbed on `Employee` in Module 3 — initialize it (copy each `LeaveType.defaultDaysPerYear`) when an employee is converted to `permanent` (or on first login if you want temp employees to accrue leave too — confirm policy before building; default recommendation: **initialize at `permanent` conversion only**, since temporary employees typically don't accrue paid leave).

### Checklist
- [x] `server/src/models/LeaveType.js`, `LeaveRequest.js` (above).
- [x] `server/src/controllers/leaveAdminController.js` — `listLeaveTypes`, `createLeaveType`, `updateLeaveType` (HR/superadmin only); `listLeaveRequests` (filter by employee/department/status — managers see only their department), `reviewLeaveRequest` (`{decision: 'approved'|'rejected', reviewNote}` — on approve, decrement the relevant `leaveBalances` entry on the Employee document, validating there's enough balance first; reject → no balance change).
- [x] `server/src/controllers/employeePortalController.js` — add `listLeaveTypes` (read-only for employee to pick from), `listMyLeaveRequests`, `createLeaveRequest` (validates `startDate <= endDate`, computes day count, checks against `leaveBalances` before allowing submission — or allow submission and let HR's approval be the enforcement point; recommend validating at submission time for better UX), `cancelMyLeaveRequest` (only if still `pending`).
- [x] Initialize `leaveBalances` in `employeeAdminController.js`'s `convertToPermanent` — after setting `employmentType = "permanent"`, loop `LeaveType.find()` and set `employee.leaveBalances.set(leaveType._id.toString(), leaveType.defaultDaysPerYear)`.
- [x] `server/src/routes/adminRoutes.js` — add `/leave-types` and `/leave-requests` routes.
- [x] `server/src/routes/employeeRoutes.js` — add `/me/leave-types`, `/me/leave-requests` (GET/POST), `/me/leave-requests/:id/cancel`.
- [x] Frontend: `client/src/pages/admin/AdminLeavePage.jsx` — leave type management (simple list/form) + leave request queue (pending requests list with Approve/Reject buttons + note field), following `AdminContactPage.jsx`'s list pattern.
- [x] Frontend: `client/src/pages/portal/PortalLeavePage.jsx` — remaining balance per leave type, request form (type/date range/half-day/reason), list of past requests with status badges + cancel button for pending ones.
- [x] `client/src/lib/api.js` — add `adminLeave` (`listTypes`, `createType`, `updateType`, `listRequests`, `reviewRequest`) and `employeeLeaveTypes`, `employeeMyLeaveRequests`, `employeeCreateLeaveRequest`, `employeeCancelLeaveRequest`.

### Route sketch — append to `server/src/routes/adminRoutes.js`
```js
import {
  createLeaveType,
  listLeaveRequests,
  listLeaveTypes,
  reviewLeaveRequest,
  updateLeaveType
} from "../controllers/leaveAdminController.js";

router.get("/leave-types", listLeaveTypes);
router.post("/leave-types", requireRole("superadmin", "hr"), createLeaveType);
router.put("/leave-types/:id", requireRole("superadmin", "hr"), updateLeaveType);

router.get("/leave-requests", listLeaveRequests);
router.put("/leave-requests/:id/review", requireRole("superadmin", "hr", "manager"), reviewLeaveRequest);
```

### Route sketch — append to `server/src/routes/employeeRoutes.js`
```js
router.get("/me/leave-types", requireEmployeeAuth, listLeaveTypes);
router.get("/me/leave-requests", requireEmployeeAuth, listMyLeaveRequests);
router.post("/me/leave-requests", requireEmployeeAuth, createLeaveRequest);
router.put("/me/leave-requests/:id/cancel", requireEmployeeAuth, cancelMyLeaveRequest);
```

---

## Full End-to-End Verification (after all 5 modules built)

1. **Roles/Departments**: as `superadmin`, create 2 departments and confirm role-gated actions (e.g. a `manager`-role admin cannot delete a department).
2. **Employee creation & auth**: as HR, create an employee from a job application with a department assigned; confirm one-time temp password shown; employee logs in at `/portal/login`, forced to set password.
3. **Documents**: HR requests 2-3 documents; employee uploads each; HR rejects one with a reason; employee re-uploads; HR verifies all; confirm status reaches `documents_verified`.
4. **Offer**: HR sends offer (2 files); employee views and accepts; confirm status `offer_accepted`.
5. **Onboarding → Permanent**: HR starts onboarding with a checklist, completes it, converts to permanent; confirm `employmentType` flips and `leaveBalances` gets initialized from `LeaveType` defaults.
6. **Tasks**: HR/manager assigns a task to the now-permanent employee; employee moves it through `todo → in_progress → done` from the portal; confirm HR sees the updated status.
7. **Leave**: employee submits a leave request against a balance; HR/manager approves it; confirm the employee's `leaveBalances` entry decrements and the request shows `approved` on both sides.

---

## Conventions to follow (from existing code)

- **Controllers**: async try/catch, `res.status(code).json({...})`, errors as `{ message }`, `findByIdAndUpdate(id, updates, { new: true, runValidators: true })`, unique-key violations → `409` (`error.code === 11000`). See `server/src/controllers/careerController.js`.
- **Auth middleware**: JWT via `Authorization: Bearer <token>`, verified with `process.env.JWT_SECRET || "dev-secret-change-me"`. See `server/src/middleware/auth.js`.
- **Admin routes**: single flat `Router()` with `router.use(requireAuth)` at the top, then per-module REST routes, now with `requireRole(...)` added per-route where write access should be restricted. See `server/src/routes/adminRoutes.js`.
- **Uploads**: multer diskStorage with randomized filenames, `fileUrl`/`docFileUrl` helper builds absolute URL from `req.protocol`/`req.get("host")`. See `server/src/middleware/upload.js`.
- **Admin frontend pages**: local component state (no global store) for list/detail/form views, an API module per resource in `client/src/lib/api.js`, Lucide icons, plain CSS classes. See `client/src/pages/admin/AdminCareersPage.jsx` (master/detail) and `AdminTechStackPage.jsx` (flat list/form — better template for Departments/LeaveTypes).
