import { useState } from 'react';
import { db } from '../../data/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Contact() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'messages'), {
        name,
        email,
        subject,
        message,
        userId: user?.uid || 'Guest',
        createdAt: new Date().toISOString(),
        status: 'Unread'
      });

      showToast("Message sent successfully! We'll get back to you soon.", "success");
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
      showToast("Failed to send message. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '80vh' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Contact Us</h1>
        <p style={{ color: '#6b7280', fontSize: '18px', margin: 0 }}>
          Have a question or need help with an order? We're here to help.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Left Side: Contact Info */}
        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', height: 'fit-content' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 24px 0' }}>Get in Touch</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>📧 Email Us</p>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>support@shopnova.com</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>📞 Call Us</p>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>+91 98765 43210</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>📍 Visit Us</p>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '15px', lineHeight: '1.5' }}>
                123 Commerce Street<br/>
                Bangalore, Karnataka 560001<br/>
                India
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>Your Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>Your Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>Subject (Optional)</label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>Message</label>
            <textarea 
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', resize: 'vertical' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            style={{ padding: '14px', backgroundColor: submitting ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: submitting ? 'not-allowed' : 'pointer', marginTop: '8px' }}
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>

      </div>
    </div>
  );
}