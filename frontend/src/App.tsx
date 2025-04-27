import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import ProjectsPage from './pages/ProjectsPage';
import ForbiddenPage from './pages/ForbiddenPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          
          {/* Protected routes - any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectsPage />} />
          </Route>
          
          {/* Editor-only routes */}
          <Route 
            element={
              <ProtectedRoute allowedRoles={['editor', 'admin']} />
            }
          >
            <Route path="/projects/edit/*" element={<ProjectsPage />} />
          </Route>
          
          {/* Admin-only routes */}
          <Route 
            element={
              <ProtectedRoute allowedRoles={['admin']} />
            }
          >
            <Route path="/admin/*" element={<AdminPanel />} />
          </Route>
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App; 