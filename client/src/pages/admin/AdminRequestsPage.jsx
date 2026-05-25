import { useEffect, useState } from 'react';
import request from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/date';
import AdminLayout from '../../components/AdminLayout';

export default function AdminRequestsPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [busyRequestId, setBusyRequestId] = useState('');

  const loadRequests = async () => {
    try {
      const payload = await request('/book-requests?status=pending', { token });
      setRequests(payload.requests);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [token]);

  const reviewRequest = async (requestId, status) => {
    setBusyRequestId(requestId);
    setError('');

    try {
      await request(`/book-requests/${requestId}/review`, {
        method: 'PATCH',
        body: { status },
        token,
      });
      await loadRequests();
    } catch (reviewError) {
      setError(reviewError.message);
    } finally {
      setBusyRequestId('');
    }
  };

  return (
    <AdminLayout title="Request management" description="Review user requests and accept or deny them before manual pickup assignment.">
      {error ? <div className="alert-box">{error}</div> : null}

      <section className="panel admin-single-column">
        <div className="panel-card wide-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Pending requests</p>
              <h2>Requests waiting for review</h2>
            </div>
          </div>

          <div className="table-wrap compact-table">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Requested by</th>
                  <th>Requested at</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No pending requests.</td>
                  </tr>
                ) : (
                  requests.map((entry) => (
                    <tr key={entry._id}>
                      <td>{entry.book?.title}</td>
                      <td>{entry.user?.fullName || entry.user?.username}</td>
                      <td>{formatDate(entry.requestedAt)}</td>
                      <td>
                        <div className="row-actions compact-actions">
                          <button type="button" className="primary-button" onClick={() => reviewRequest(entry._id, 'accepted')} disabled={busyRequestId === entry._id}>
                            Accept
                          </button>
                          <button type="button" className="secondary-button" onClick={() => reviewRequest(entry._id, 'denied')} disabled={busyRequestId === entry._id}>
                            Deny
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}