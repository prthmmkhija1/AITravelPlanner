import { useState } from 'react';
import { login, register } from '../api';

interface AuthModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export default function AuthModal({ isVisible, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isVisible) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (mode === 'login') {
        result = await login(email, password);
      } else {
        result = await register(email, password, name, phone);
      }

      if (result.status === 'success') {
        onAuthSuccess(result.user);
        onClose();
        // Reset form
        setEmail('');
        setPassword('');
        setName('');
        setPhone('');
      } else {
        setError(result.detail || result.message || 'Authentication failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <h2>{mode === 'login' ? '🔐 Welcome Back' : '✨ Create Account'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div className="auth-footer">
          {mode === 'login' ? (
            <p>Don't have an account? <button onClick={() => setMode('register')}>Sign up</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => setMode('login')}>Login</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
