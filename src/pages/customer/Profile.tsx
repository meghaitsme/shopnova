import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/auth/profile', { name, email });
      setMessage('✅ Profile updated. Refresh to see changes.');
    } catch {
      setMessage('❌ Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img
          src={`https://i.pravatar.cc/150?u=${user?.email || 'guest'}`}
          alt="avatar"
          className="profile-avatar"
        />
        <div>
          <h2>{user?.name || 'Guest'}</h2>
          <p>{user?.email || 'Not logged in'}</p>
          <span className={`role-badge role-${user?.role || 'guest'}`}>
            {user?.role || 'Visitor'}
          </span>
        </div>
      </div>

      {user ? (
        <form className="profile-form" onSubmit={handleSave}>
          <label>
            Full Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>

          {message && <p className="form-message">{message}</p>}
        </form>
      ) : (
        <p className="muted">Log in to view and edit your profile.</p>
      )}
    </div>
  );
}
