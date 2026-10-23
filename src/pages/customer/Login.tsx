import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../data/firebase'; // 👈 Make sure this points to your firebase config
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false); // Toggles between Login and Reset modes

  // --- Handle Login ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("Logged in successfully!", "success");
      navigate('/'); // Redirect to home after login
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to login", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Password Reset ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast("Please enter your email address first.", "error");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      showToast("Password reset email sent! Check your inbox.", "success");
      setResetMode(false); // Switch back to login screen
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to send reset email", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', fontFamily: 'sans-serif' }}>
        
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 24px 0' }}>
          {resetMode ? 'Reset Password' : 'Login'}
        </h2>

        {resetMode ? (
          // RESET PASSWORD FORM
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '8px' }}>
              Enter your email and we'll send you a link to reset your password.
            </p>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Email Address</label>
              <input 
                required 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              style={{ padding: '12px', backgroundColor: loading ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button 
              type="button" 
              onClick={() => setResetMode(false)} 
              style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '14px', marginTop: '8px' }}
            >
              Back to Login
            </button>
          </form>
        ) : (
          // LOGIN FORM
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Email Address</label>
              <input 
                required 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Password</label>
              <input 
                required 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} 
              />
            </div>
            
            <div style={{ textAlign: 'right', marginTop: '-8px' }}>
              <button 
                type="button" 
                onClick={() => setResetMode(true)} 
                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
              >
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={{ padding: '12px', backgroundColor: loading ? '#9ca3af' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '16px' }}>
              Don't have an account? <Link to="/register" style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}>Register</Link>
            </p>
          </form>
        )}

      </div>
    </div>
  );
}