import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/date';

function RequestList({ onSelect }) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  const { token } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await request('/book-requests/me', { token });
        setRequests(payload.requests);
      } catch (e) {
        setError(e.message);
      }
    };

    load();
  }, [token]);

  if (error) return <div className="alert-box">{error}</div>;

  return (
    <div className="table-wrap compact-table">
      <table>
        <thead>
          <tr>
            <th>Book</th>
            <th>Status</th>
            <th>Requested</th>
            <th>Admin note</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan={4}>You have not requested any books yet.</td>
            </tr>
          ) : (
            requests.map((r) => (
              <tr key={r._id} onClick={() => onSelect(r._id)} style={{ cursor: 'pointer' }}>
                <td>{r.book?.title}</td>
                <td>{r.status}</td>
                <td>{formatDate(r.requestedAt)}</td>
                <td>{r.adminNote || 'No note yet'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState(null);
  const [error, setError] = useState('');

  const { token: token2 } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await request('/book-requests/me', { token: token2 });
        const found = payload.requests.find((r) => r._id === id);
        if (!found) {
          setError('Request not found');
        } else {
          setRequestData(found);
        }
      } catch (e) {
        setError(e.message);
      }
    };

    if (id) load();
  }, [id, token2]);

  if (error) return <div className="alert-box">{error}</div>;
  if (!requestData) return <div>Loading…</div>;

  return (
    <div>
      <button className="ghost-button" type="button" onClick={() => navigate(-1)}>
        Back
      </button>

      <section className="panel">
        <h2>Request details</h2>
        <div className="request-detail">
          <p>
            <strong>Book:</strong> {requestData.book?.title}
          </p>
          <p>
            <strong>Status:</strong> {requestData.status}
          </p>
          <p>
            <strong>Requested:</strong> {formatDate(requestData.requestedAt)}
          </p>
          <p>
            <strong>Admin note:</strong> {requestData.adminNote || 'No note provided'}
          </p>
          <p>
            <strong>Reviewed at:</strong> {requestData.respondedAt ? formatDate(requestData.respondedAt) : 'Not reviewed yet'}
          </p>
        </div>
      </section>
    </div>
  );
}

export default function RequestsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.fullName || user?.username || 'User';

  const handleSelect = (id) => {
    navigate(`/requests/${id}`);
  };

  return (
    <main className="workspace-shell user-shell">
      <section className="workspace-header panel user-header">
        <div className="user-header-copy">
          <div className="brand-lockup">
            <img src="/logo.png" alt="Bhaskar Books Corner" className="brand-logo" />
            <p className="eyebrow brand-title">Bhaskar Books Corner</p>
          </div>
          <h1>Your requests</h1>
          <p className="subtle-text">View the status of your book requests and any admin notes.</p>
          <p className="user-session-meta">
            Logged in as <strong>{displayName}</strong>
          </p>
        </div>
        <button className="ghost-button" type="button" onClick={() => navigate('/books')}>
          Back to books
        </button>
      </section>

      <section className="panel">
        <RequestList onSelect={handleSelect} />
      </section>

      <RoutesWrapper />
    </main>
  );
}

// Inline little wrapper to render detail route without changing App.jsx layering
import { Routes, Route } from 'react-router-dom';
function RoutesWrapper() {
  return (
    <Routes>
      <Route path="/requests/:id" element={<RequestDetail />} />
    </Routes>
  );
}
