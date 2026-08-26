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
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminProjectsPage from "./pages/admin/AdminProjectsPage";
import AdminBlogsPage from "./pages/admin/AdminBlogsPage";
import AdminTechStackPage from "./pages/admin/AdminTechStackPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminCareersPage from "./pages/admin/AdminCareersPage";
import AdminContactPage from "./pages/admin/AdminContactPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import LegalPage from "./pages/LegalPage";
import useSmoothScroll from "./hooks/useSmoothScroll";

const App = () => {
  useSmoothScroll();

  return (
    <Routes>
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
        <Route path="settings" element={<AdminSettingsPage />} />
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
        <Route path="/terms" element={<LegalPage pageKey="terms" />} />
        <Route path="/privacy-policy" element={<LegalPage pageKey="privacy" />} />
      </Route>
    </Routes>
  );
};

export default App;
