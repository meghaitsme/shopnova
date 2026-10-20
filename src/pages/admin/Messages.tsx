import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  emailed: boolean;
  emailError: string | null;
  createdAt: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/contact');
        if (!cancelled) {
          setMessages(data.messages || []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.error ||
            err?.message ||
            'Failed to load messages'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return messages;
    const q = search.toLowerCase();
    return messages.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
    );
  }, [messages, search]);

  const unread = messages.filter((m) => !m.read).length;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="admin-messages">
      <header className="admin-header">
        <div>
          <h1>Contact Messages</h1>
          <p className="muted">
            {messages.length} total
            {unread > 0 && <> · <strong>{unread} unread</strong></>}
          </p>
        </div>

        <input
          type="search"
          className="admin-search"
          placeholder="Search by name, email, or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="form-error">❌ {error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="muted">
          {search ? 'No messages match your search.' : 'No messages yet.'}
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="messages-list">
          {filtered.map((m) => {
            const isOpen = expanded === m._id;
            return (
              <div
                key={m._id}
                className={`message-row ${isOpen ? 'open' : ''}`}
                onClick={() => setExpanded(isOpen ? null : m._id)}
              >
                <div className="message-summary">
                  <div className="message-avatar">
                    {m.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="message-info">
                    <div className="message-top">
                      <strong>{m.name}</strong>
                      <span className="message-email">{m.email}</span>
                    </div>
                    <p className="message-preview">
                      {m.message.slice(0, 100)}
                      {m.message.length > 100 ? '…' : ''}
                    </p>
                  </div>

                  <div className="message-meta">
                    <span className="message-date">{formatDate(m.createdAt)}</span>
                    <span className={`message-status ${m.emailed ? 'ok' : 'warn'}`}>
                      {m.emailed ? '✉️ Sent' : '⚠️ Save only'}
                    </span>
                  </div>

                  <i
                    className={`bx bx-chevron-down message-arrow ${
                      isOpen ? 'rotate' : ''
                    }`}
                  />
                </div>

                {isOpen && (
                  <div className="message-detail">
                    <div className="message-detail-body">{m.message}</div>

                    <div className="message-actions">
                      <a
                        href={`mailto:${m.email}?subject=Re: Your message to Shopnova`}
                        className="btn-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <i className="bx bx-envelope" /> Reply via Email
                      </a>

                      {!m.emailed && m.emailError && (
                        <span className="message-error" title={m.emailError}>
                          Email failed: {m.emailError.slice(0, 60)}…
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
