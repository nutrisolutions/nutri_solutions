import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
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
import LegalPage from "./pages/LegalPage";
import NotFoundPage from "./pages/NotFoundPage";
import useSmoothScroll from "./hooks/useSmoothScroll";

// Public pages stay eager: they are prerendered, and lazy-loading them would blank the
// prerendered HTML while the chunk downloads. Admin is split out so visitors never download it.
const ProtectedRoute = lazy(() => import("./components/admin/ProtectedRoute"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminProjectsPage = lazy(() => import("./pages/admin/AdminProjectsPage"));
const AdminBlogsPage = lazy(() => import("./pages/admin/AdminBlogsPage"));
const AdminTechStackPage = lazy(() => import("./pages/admin/AdminTechStackPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));
const AdminCareersPage = lazy(() => import("./pages/admin/AdminCareersPage"));
const AdminContactPage = lazy(() => import("./pages/admin/AdminContactPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));

const AdminFallback = () => (
  <div className="container" role="status" style={{ padding: "4rem 0" }}>
    Loading…
  </div>
);

const App = () => {
  useSmoothScroll();

  return (
    <Suspense fallback={<AdminFallback />}>
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
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
