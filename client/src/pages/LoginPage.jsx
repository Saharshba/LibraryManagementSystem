import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  username: '',
  password: '',
};

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      await login(form);
      setForm(initialForm);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-shell login-shell">
      <section className="auth-hero login-hero">
        <div className="brand-lockup auth-brand">
          <img src="/logo.png" alt="Bhaskar Books Corner" className="brand-logo" />
          <h1>Bhaskar Books Corner</h1>
        </div>
        <p className="auth-copy">Where every shelf leads to a better story.</p>
      </section>

      <section className="auth-card login-card">
        <h2>Sign in</h2>
        <form className="auth-form" onSubmit={submit}>
          <label>
            Username
            <input value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} autoComplete="username" required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} autoComplete="current-password" required />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}
