import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin/books', label: 'Books' },
  { to: '/admin/genres', label: 'Genres' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/memberships', label: 'Memberships' },
  { to: '/admin/requests', label: 'Requests' },
  { to: '/admin/lent', label: 'Lent books' },
];

export default function AdminLayout({ title, description, children }) {
  const { user, token, logout } = useAuth();
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        const payload = await request('/book-requests?status=pending', { token });
        setPendingRequests(payload.requests.length);
      } catch {
        setPendingRequests(0);
      }
    };

    if (token) {
      loadPendingRequests();
    }
  }, [token]);

  return (
    <main className="workspace-shell admin-shell">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="Bhaskar Books Corner" className="brand-logo sidebar-logo" />
          <div>
            <p className="eyebrow">Bhaskar Books Corner</p>
            <strong>{user?.fullName || user?.username}</strong>
          </div>
        </div>

        <nav className="admin-nav">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}
            >
              <span>{link.label}</span>
              {link.to === '/admin/requests' && pendingRequests > 0 ? <span className="nav-badge">{pendingRequests}</span> : null}
            </NavLink>
          ))}
        </nav>

        <button className="ghost-button admin-logout" type="button" onClick={logout}>
          Logout
        </button>
      </aside>

      <section className="workspace-content">
        <header className="workspace-header panel">
          <div>
            <p className="eyebrow">Admin workspace</p>
            <h1>{title}</h1>
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}
