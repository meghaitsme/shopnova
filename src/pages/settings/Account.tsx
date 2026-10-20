import { useState } from 'react';

export default function Account() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next !== form.confirm) {
      setMsg('❌ Passwords do not match');
      return;
    }
    // Backend integration coming later
    setMsg('✅ Password change request submitted (backend integration pending)');
    setForm({ current: '', next: '', confirm: '' });
  };

  return (
    <div className="settings-page">
      <h1>Account Settings</h1>
      <p className="muted">Update your email, password, and account details.</p>

      <form className="settings-form" onSubmit={handleSubmit}>
        <h2>Change Password</h2>

        <label>
          Current Password
          <input
            type="password"
            required
            value={form.current}
            onChange={(e) => setForm({ ...form, current: e.target.value })}
          />
        </label>

        <label>
          New Password
          <input
            type="password"
            required
            minLength={6}
            value={form.next}
            onChange={(e) => setForm({ ...form, next: e.target.value })}
          />
        </label>

        <label>
          Confirm New Password
          <input
            type="password"
            required
            minLength={6}
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
        </label>

        <button type="submit" className="btn-primary">Update Password</button>
        {msg && <p className="form-message">{msg}</p>}
      </form>
    </div>
  );
}
