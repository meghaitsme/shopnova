import { useState } from 'react';
import api from '../../api/axios';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const { data } = await api.post('/contact', form);
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });

      // Auto-hide success after 6s
      setTimeout(() => setStatus('idle'), 6000);

      if (data.emailSent === false) {
        console.warn('Message saved, but email delivery failed');
      }
    } catch (err: any) {
      setStatus('error');
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Could not send your message. Please try again.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p className="muted">We&apos;d love to hear from you. Send us a message!</p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          Your Name
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jane Doe"
            disabled={status === 'sending'}
          />
        </label>

        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="jane@example.com"
            disabled={status === 'sending'}
          />
        </label>

        <label>
          Message
          <textarea
            required
            rows={6}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="How can we help?"
            disabled={status === 'sending'}
          />
        </label>

        <button
          type="submit"
          className="btn-primary"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? (
            <>
              <i className="bx bx-loader-alt bx-spin" /> Sending…
            </>
          ) : (
            <>
              <i className="bx bx-send" /> Send Message
            </>
          )}
        </button>

        {status === 'sent' && (
          <p className="form-success">
            ✅ Thanks! We&apos;ll get back to you soon.
          </p>
        )}

        {status === 'error' && (
          <p className="form-error">❌ {errorMsg}</p>
        )}
      </form>
    </div>
  );
}
