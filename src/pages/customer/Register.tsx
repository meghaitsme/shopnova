import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.log("📝 [Register] Attempting to register:", email);
      await register(email, password, name);
      console.log("✅ [Register] Success!");
      nav('/');
    } catch (err: any) {
      console.error("❌ [Register] Error:", err);
      setError(err.message || 'Could not register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: '#f1f3f6' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#2874f0' }}>Create an Account</h2>
        
        {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '14px', marginBottom: '15px' }}>{error}</p>}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" placeholder="Full Name" required
            value={name} onChange={(e) => setName(e.target.value)}
            style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input 
            type="email" placeholder="Email Address" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input 
            type="password" placeholder="Password (min 6 chars)" required minLength={6}
            value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          
          <button 
            type="submit" disabled={loading}
            style={{ backgroundColor: '#fb641b', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: '#2874f0', fontWeight: 'bold' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}