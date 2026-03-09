import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import AdminDashboard from './pages/AdminDashboard';
import StoreDashboard from './pages/StoreDashboard';
import EngineerDashboard from './pages/EngineerDashboard';
import CreateProject from './pages/projects/CreateProject';
import CreateTask from './pages/tasks/CreateTask';
import ProjectTasks from './pages/projects/ProjectTasks';
import ProjectSchedule from './pages/projects/ProjectSchedule';
import AdminProjects from './pages/AdminProjects';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import Layout from './components/Layout';
import { isLoggedIn, getRole, dashboardFor } from './utils/auth';

/** Redirect / to the correct dashboard (or /login) */
function RootRedirect() {
  if (isLoggedIn()) {
    return <Navigate to={dashboardFor(getRole())} replace />;
  }
  return <Navigate to="/login" replace />;
}

/** Guard: only accessible when logged in with the required role */
function ProtectedRoute({ role, children }: { role: string; children: React.ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (getRole() !== role) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="projects/create" element={<CreateProject />} />
        <Route path="projects/:projectId/tasks" element={<ProjectTasks />} />
        <Route path="projects/:projectId/tasks/create" element={<CreateTask />} />
        <Route path="projects/:projectId/schedule" element={<ProjectSchedule />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Store Manager routes */}
      <Route
        path="/store"
        element={
          <ProtectedRoute role="STORE_MANAGER">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StoreDashboard />} />
        <Route path="inventory" element={<StoreDashboard />} />
        <Route path="requests" element={<StoreDashboard />} />
      </Route>

      {/* Site Engineer routes */}
      <Route
        path="/engineer"
        element={
          <ProtectedRoute role="SITE_ENGINEER">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EngineerDashboard />} />
        <Route path="requests" element={<EngineerDashboard />} />
        <Route path="site" element={<EngineerDashboard />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
