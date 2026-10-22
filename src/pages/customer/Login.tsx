import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      
      // 🚨 CRITICAL: Wait 1 second for the AuthContext to fetch the Admin custom claim
      // before navigating to the home page.
      setTimeout(() => {
        nav('/');
      }, 1000);

    } catch (err: any) {
      console.error("Login error:", err.code);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Failed to login.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="container auth-form" style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h1>
      
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        
        {error && <p style={{ color: 'red', fontSize: '14px', margin: 0 }}>{error}</p>}
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            backgroundColor: loading ? '#ccc' : '#2874f0', 
            color: 'white', 
            padding: '12px', 
            border: 'none', 
            borderRadius: '4px', 
            fontWeight: 'bold', 
            cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
        Don't have an account? <Link to="/register" style={{ color: '#2874f0' }}>Register</Link>
      </p>
    </div>
  );
}