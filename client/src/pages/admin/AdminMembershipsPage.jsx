import { useEffect, useMemo, useState } from 'react';
import request from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/date';
import { collectDueAlerts } from '../../utils/dueAlerts';
import DueSoonNotice from '../../components/DueSoonNotice';
import AdminLayout from '../../components/AdminLayout';

const emptyMembershipForm = {
  membershipFee: '',
  paymentDate: '',
  paymentAmount: '',
  paymentNote: '',
};

export default function AdminMembershipsPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [form, setForm] = useState(emptyMembershipForm);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      const payload = await request('/users', { token });
      setUsers(payload.users);
      if (!selectedUserId && payload.users.length > 0) {
        setSelectedUserId(payload.users[0]._id);
      }
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [token]);

  const selectedUser = useMemo(
    () => users.find((member) => member._id === selectedUserId) || null,
    [selectedUserId, users]
  );

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    setForm({
      membershipFee: selectedUser.membership?.membershipFee?.toString() || '',
      paymentDate: '',
      paymentAmount: '',
      paymentNote: '',
    });
  }, [selectedUser]);

  const saveMembership = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await request(`/users/${selectedUserId}/membership`, {
        method: 'PATCH',
        body: form,
        token,
      });
      setForm((current) => ({ ...current, paymentDate: '', paymentAmount: '', paymentNote: '' }));
      await loadUsers();
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  const dueAlerts = useMemo(() => collectDueAlerts({ memberships: users }), [users]);

  return (
    <AdminLayout title="Membership management" description="Maintain subscription fees, due dates, open dates, and payment history.">
      <DueSoonNotice alerts={dueAlerts} title="Memberships due soon" />

      {error ? <div className="alert-box">{error}</div> : null}

      <section className="panel admin-grid membership-grid">
        <div className="panel-card">
          <p className="eyebrow">Select member</p>
          <h2>Choose a user</h2>
          <label>
            User
            <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
              {users.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.fullName} ({member.username})
                </option>
              ))}
            </select>
          </label>

          {selectedUser ? (
            <div className="membership-summary vertical">
              <article className="user-card">
                <strong>{selectedUser.fullName}</strong>
                <span>{selectedUser.email}</span>
                <span>Next due date: {formatDate(selectedUser.membership?.nextDueDate)}</span>
                <span>Membership fee: {selectedUser.membership?.membershipFee ?? 0}</span>
              </article>
            </div>
          ) : null}
        </div>

        <div className="panel-card wide-card">
          <p className="eyebrow">Update membership</p>
          <h2>Record dues and payments</h2>
          <form className="stack-form" onSubmit={saveMembership}>
            <div className="form-grid two-col">
              <label>
                Membership fee
                <input type="number" min="0" value={form.membershipFee} onChange={(event) => setForm((current) => ({ ...current, membershipFee: event.target.value }))} />
              </label>
              <label>
                Payment date
                <input type="date" value={form.paymentDate} onChange={(event) => setForm((current) => ({ ...current, paymentDate: event.target.value }))} />
              </label>
              <label>
                Payment fee
                <input type="number" min="0" value={form.paymentAmount} onChange={(event) => setForm((current) => ({ ...current, paymentAmount: event.target.value }))} />
              </label>
              <label>
                Note
                <input value={form.paymentNote} onChange={(event) => setForm((current) => ({ ...current, paymentNote: event.target.value }))} placeholder="Optional note" />
              </label>
            </div>
            <button className="primary-button" type="submit">
              Save membership details
            </button>
          </form>

          <div className="table-wrap compact-table">
            <table>
              <thead>
                <tr>
                  <th>Paid on</th>
                  <th>Amount</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {(selectedUser?.membership?.paymentHistory || []).length === 0 ? (
                  <tr>
                    <td colSpan={3}>No payment history recorded.</td>
                  </tr>
                ) : (
                  selectedUser.membership.paymentHistory.map((payment, index) => (
                    <tr key={`${payment.paidOn}-${index}`}>
                      <td>{formatDate(payment.paidOn)}</td>
                      <td>{payment.amount}</td>
                      <td>{payment.note || 'Payment recorded by admin'}</td>
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