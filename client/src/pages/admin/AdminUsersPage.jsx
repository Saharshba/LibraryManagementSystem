import { useEffect, useMemo, useState } from 'react';
import request from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/date';
import { collectDueAlerts } from '../../utils/dueAlerts';
import DueSoonNotice from '../../components/DueSoonNotice';
import AdminLayout from '../../components/AdminLayout';

const emptyUserForm = {
  fullName: '',
  email: '',
  address: '',
  contactNumber: '',
  username: '',
  password: '',
};

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      const payload = await request('/users', { token });
      setUsers(payload.users);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [token]);

  const createUser = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (editingUserId) {
        await request(`/users/${editingUserId}`, {
          method: 'PUT',
          body: userForm,
          token,
        });
      } else {
        await request('/users', {
          method: 'POST',
          body: userForm,
          token,
        });
      }
      setUserForm(emptyUserForm);
      setEditingUserId('');
      await loadUsers();
    } catch (createError) {
      setError(createError.message);
    }
  };

  const editUser = (member) => {
    setEditingUserId(member._id);
    setUserForm({
      fullName: member.fullName || '',
      email: member.email || '',
      address: member.address || '',
      contactNumber: member.contactNumber || '',
      username: member.username || '',
      password: '',
    });
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) {
      return;
    }

    try {
      await request(`/users/${userId}`, { method: 'DELETE', token });
      await loadUsers();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const dueAlerts = useMemo(() => collectDueAlerts({ memberships: users }), [users]);

  return (
    <AdminLayout title="User management" description="Create library users with full profile details and manage the user list.">
      <DueSoonNotice alerts={dueAlerts} title="Memberships due soon" />

      {error ? <div className="alert-box">{error}</div> : null}

      <section className="panel admin-single-column">
        <div className="panel-card">
          <p className="eyebrow">Create user</p>
          <h2>{editingUserId ? 'Edit library member' : 'Add a library member'}</h2>
          <form className="stack-form" onSubmit={createUser}>
            <label>
              Full name
              <input value={userForm.fullName} onChange={(event) => setUserForm((current) => ({ ...current, fullName: event.target.value }))} required />
            </label>
            <label>
              Email ID
              <input type="email" value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} required />
            </label>
            <label>
              Address
              <input value={userForm.address} onChange={(event) => setUserForm((current) => ({ ...current, address: event.target.value }))} required />
            </label>
            <label>
              Contact number
              <input value={userForm.contactNumber} onChange={(event) => setUserForm((current) => ({ ...current, contactNumber: event.target.value }))} required />
            </label>
            <label>
              Username
              <input value={userForm.username} onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))} required />
            </label>
            <label>
              Password
              <input type="password" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} required={!editingUserId} />
            </label>
            <div className="row-actions">
              <button className="primary-button" type="submit">
                {editingUserId ? 'Save user' : 'Create user'}
              </button>
              {editingUserId ? (
                <button className="secondary-button" type="button" onClick={() => { setUserForm(emptyUserForm); setEditingUserId(''); }}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="panel-card">
          <p className="eyebrow">Existing users</p>
          <div className="user-grid admin-user-list">
            {users.map((member) => (
              <article key={member._id} className="user-card">
                <strong>{member.fullName}</strong>
                <span>{member.username}</span>
                <span>{member.email}</span>
                <span>{member.contactNumber}</span>
                <span>{member.address}</span>
                <span>Next due: {formatDate(member.membership?.nextDueDate)}</span>
                <div className="row-actions compact-actions">
                  <button type="button" onClick={() => editUser(member)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteUser(member._id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
