import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import ProjectsPage from "./pages/ProjectsPage";
import ContactPage from "./pages/ContactPage";
import CareersPage from "./pages/CareersPage";
import CareerDetailPage from "./pages/CareerDetailPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import BlogListPage from "./pages/BlogListPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import LoginPage from "./pages/LoginPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminProjectsPage from "./pages/admin/AdminProjectsPage";
import AdminBlogsPage from "./pages/admin/AdminBlogsPage";
import AdminTechStackPage from "./pages/admin/AdminTechStackPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminCareersPage from "./pages/admin/AdminCareersPage";
import AdminContactPage from "./pages/admin/AdminContactPage";
import AdminDepartmentsPage from "./pages/admin/AdminDepartmentsPage";
import AdminEmployeesPage from "./pages/admin/AdminEmployeesPage";
import AdminTasksPage from "./pages/admin/AdminTasksPage";
import AdminLeavePage from "./pages/admin/AdminLeavePage";
import PortalProtectedRoute from "./components/portal/PortalProtectedRoute";
import PortalRoleGate from "./components/portal/PortalRoleGate";
import PortalLayout from "./components/portal/PortalLayout";
import PortalLoginPage from "./pages/portal/PortalLoginPage";
import PortalSetPasswordPage from "./pages/portal/PortalSetPasswordPage";
import PortalDashboardPage from "./pages/portal/PortalDashboardPage";
import PortalInterviewsPage from "./pages/portal/PortalInterviewsPage";
import PortalDocumentsPage from "./pages/portal/PortalDocumentsPage";
import PortalOfferPage from "./pages/portal/PortalOfferPage";
import PortalTasksPage from "./pages/portal/PortalTasksPage";
import PortalLeavePage from "./pages/portal/PortalLeavePage";
import useSmoothScroll from "./hooks/useSmoothScroll";

const App = () => {
  useSmoothScroll();

  return (
    <Routes>
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
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="projects" element={<AdminProjectsPage />} />
        <Route path="blogs" element={<AdminBlogsPage />} />
        <Route path="tech-stack" element={<AdminTechStackPage />} />
        <Route path="careers" element={<AdminCareersPage />} />
        <Route path="contact" element={<AdminContactPage />} />
        <Route path="departments" element={<AdminDepartmentsPage />} />
        <Route path="employees" element={<AdminEmployeesPage />} />
        <Route path="tasks" element={<AdminTasksPage />} />
        <Route path="leave" element={<AdminLeavePage />} />
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
      </Route>

      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path="/process" element={<Navigate to="/about#process" replace />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/portfolio" element={<Navigate to="/projects" replace />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/careers/:slug" element={<CareerDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
    </Routes>
  );
};

export default App;
