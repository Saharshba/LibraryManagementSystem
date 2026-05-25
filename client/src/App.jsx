import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import UserBooksPage from './pages/UserBooksPage';
import RequestsPage from './pages/RequestsPage';
import AdminBooksPage from './pages/admin/AdminBooksPage';
import AdminGenresPage from './pages/admin/AdminGenresPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminMembershipsPage from './pages/admin/AdminMembershipsPage';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import AdminLentPage from './pages/admin/AdminLentPage';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    document.title = 'Bhaskar Books Corner';
  }, []);

  if (loading) {
    return (
      <div className="app-loader">
        <div className="loader-card">
            <div className="brand-lockup">
              <img src="/logo.png" alt="Bhaskar Books Corner" className="brand-logo" />
              <span className="brand-kicker">Bhaskar Books Corner</span>
            </div>
            <strong>Preparing your library workspace...</strong>
          </div>
      </div>
    );
  }

  const homeRedirect = user ? (user.role === 'admin' ? '/admin/books' : '/books') : '/login';

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={homeRedirect} replace />} />
        <Route path="/login" element={user ? <Navigate to={homeRedirect} replace /> : <LoginPage />} />
        <Route path="/books" element={user ? <UserBooksPage /> : <Navigate to="/login" replace />} />
        <Route path="/requests/*" element={user ? <RequestsPage /> : <Navigate to="/login" replace />} />
        <Route path="/admin/books" element={user?.role === 'admin' ? <AdminBooksPage /> : <Navigate to="/login" replace />} />
        <Route path="/admin/genres" element={user?.role === 'admin' ? <AdminGenresPage /> : <Navigate to="/login" replace />} />
        <Route path="/admin/users" element={user?.role === 'admin' ? <AdminUsersPage /> : <Navigate to="/login" replace />} />
        <Route path="/admin/memberships" element={user?.role === 'admin' ? <AdminMembershipsPage /> : <Navigate to="/login" replace />} />
        <Route path="/admin/requests" element={user?.role === 'admin' ? <AdminRequestsPage /> : <Navigate to="/login" replace />} />
        <Route path="/admin/lent" element={user?.role === 'admin' ? <AdminLentPage /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={homeRedirect} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
