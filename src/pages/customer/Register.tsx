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

    const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password,name);
      nav('/');
        } catch (err: any) {
      console.error("Firebase Register Error:", err.code, err.message);
      // Show the actual error code from Firebase
      setError(err.message || 'Could not register.');
    }
  };

  return (
    <div className="container auth-form">
      <h1>Register</h1>
      <form onSubmit={submit}>
        <input placeholder="Full name" value={name}
          onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password (min 6 chars)" value={password}
          onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary">Create account</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}