import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import LoginPage from "./pages/LoginPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminDepartmentsPage from "./pages/admin/AdminDepartmentsPage";
import AdminEmployeesPage from "./pages/admin/AdminEmployeesPage";
import AdminTasksPage from "./pages/admin/AdminTasksPage";
import AdminLeavePage from "./pages/admin/AdminLeavePage";
import AdminCalendarPage from "./pages/admin/AdminCalendarPage";
import AdminAttendancePage from "./pages/admin/AdminAttendancePage";
import AdminTimesheetPage from "./pages/admin/AdminTimesheetPage";
import AdminResignationsPage from "./pages/admin/AdminResignationsPage";
import AdminTeamsPage from "./pages/admin/AdminTeamsPage";
import AdminAnnouncementsPage from "./pages/admin/AdminAnnouncementsPage";
import PortalProtectedRoute from "./components/portal/PortalProtectedRoute";
import PortalRoleGate from "./components/portal/PortalRoleGate";
import PortalHrGate from "./components/portal/PortalHrGate";
import ChatPage from "./pages/chat/ChatPage";
import PortalLayout from "./components/portal/PortalLayout";
import PortalLoginPage from "./pages/portal/PortalLoginPage";
import PortalSetPasswordPage from "./pages/portal/PortalSetPasswordPage";
import PortalDashboardPage from "./pages/portal/PortalDashboardPage";
import PortalInterviewsPage from "./pages/portal/PortalInterviewsPage";
import PortalDocumentsPage from "./pages/portal/PortalDocumentsPage";
import PortalOfferPage from "./pages/portal/PortalOfferPage";
import PortalTasksPage from "./pages/portal/PortalTasksPage";
import PortalLeavePage from "./pages/portal/PortalLeavePage";
import PortalAttendancePage from "./pages/portal/PortalAttendancePage";
import PortalTimesheetPage from "./pages/portal/PortalTimesheetPage";
import PortalProfilePage from "./pages/portal/PortalProfilePage";
import PortalMyTeamsPage from "./pages/portal/PortalMyTeamsPage";
import ChatToastHost from "./components/chat/ChatToastHost";

const App = () => {
  return (
    <>
      <ChatToastHost />
      <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="departments" element={<AdminDepartmentsPage />} />
        <Route path="employees" element={<AdminEmployeesPage />} />
        <Route path="tasks" element={<AdminTasksPage />} />
        <Route path="leave" element={<AdminLeavePage />} />
        <Route path="attendance" element={<AdminAttendancePage />} />
        <Route path="timesheet" element={<AdminTimesheetPage />} />
        <Route path="resignations" element={<AdminResignationsPage />} />
        <Route path="teams" element={<AdminTeamsPage />} />
        <Route path="announcements" element={<AdminAnnouncementsPage />} />
        <Route path="calendar" element={<AdminCalendarPage />} />
      </Route>

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
        <Route path="profile" element={<PortalProfilePage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route
          path="interviews"
          element={
            <PortalRoleGate allow="temporary">
              <PortalInterviewsPage />
            </PortalRoleGate>
          }
        />
        <Route path="documents" element={<PortalDocumentsPage />} />
        <Route
          path="offer"
          element={
            <PortalRoleGate allow="temporary">
              <PortalOfferPage />
            </PortalRoleGate>
          }
        />
        <Route
          path="tasks"
          element={
            <PortalRoleGate allow="permanent">
              <PortalTasksPage />
            </PortalRoleGate>
          }
        />
        <Route
          path="leave"
          element={
            <PortalRoleGate allow="permanent">
              <PortalLeavePage />
            </PortalRoleGate>
          }
        />
        <Route
          path="attendance"
          element={
            <PortalRoleGate allow="permanent">
              <PortalAttendancePage />
            </PortalRoleGate>
          }
        />
        <Route
          path="timesheet"
          element={
            <PortalRoleGate allow="permanent">
              <PortalTimesheetPage />
            </PortalRoleGate>
          }
        />
        <Route
          path="my-teams"
          element={
            <PortalRoleGate allow="permanent">
              <PortalMyTeamsPage />
            </PortalRoleGate>
          }
        />

        <Route
          path="hr/employees"
          element={
            <PortalHrGate>
              <AdminEmployeesPage />
            </PortalHrGate>
          }
        />
        <Route
          path="hr/departments"
          element={
            <PortalHrGate>
              <AdminDepartmentsPage />
            </PortalHrGate>
          }
        />
        <Route
          path="hr/tasks"
          element={
            <PortalHrGate>
              <AdminTasksPage />
            </PortalHrGate>
          }
        />
        <Route
          path="hr/leave"
          element={
            <PortalHrGate>
              <AdminLeavePage />
            </PortalHrGate>
          }
        />
        <Route
          path="hr/calendar"
          element={
            <PortalHrGate>
              <AdminCalendarPage />
            </PortalHrGate>
          }
        />
        <Route
          path="hr/attendance"
          element={
            <PortalHrGate>
              <AdminAttendancePage />
            </PortalHrGate>
          }
        />
        <Route
          path="hr/timesheet"
          element={
            <PortalHrGate>
              <AdminTimesheetPage />
            </PortalHrGate>
          }
        />
        <Route
          path="hr/resignations"
          element={
            <PortalHrGate>
              <AdminResignationsPage />
            </PortalHrGate>
          }
        />
        <Route
          path="hr/teams"
          element={
            <PortalHrGate>
              <AdminTeamsPage />
            </PortalHrGate>
          }
        />
        <Route
          path="hr/announcements"
          element={
            <PortalHrGate>
              <AdminAnnouncementsPage />
            </PortalHrGate>
          }
        />
      </Route>
      </Routes>
    </>
  );
};

export default App;
