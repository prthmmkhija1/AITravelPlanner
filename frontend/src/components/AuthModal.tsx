import { useState, useEffect, useRef } from 'react';
import { login, register } from '../api';

// Google OAuth Client ID - Replace with your own from Google Cloud Console
// To get one: https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface AuthModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export default function AuthModal({ isVisible, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const googleButtonRef = useRef<HTMLDivElement>(null);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Initialize Google Sign-In
  useEffect(() => {
    if (isVisible && window.google && googleButtonRef.current && GOOGLE_CLIENT_ID) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });
        
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
        });
      } catch (err) {
        console.log('Google Sign-In not configured');
      }
    }
  }, [isVisible]);

  const handleGoogleCallback = (response: any) => {
    if (response.credential) {
      // Decode the JWT token from Google
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const googleUser = {
        id: payload.sub,
        username: payload.name,
        email: payload.email,
        picture: payload.picture,
        provider: 'google'
      };
      
      localStorage.setItem('auth_token', 'google_' + response.credential.slice(0, 50));
      localStorage.setItem('user', JSON.stringify(googleUser));
      onAuthSuccess(googleUser);
      onClose();
    }
  };

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

  // Demo login - works without backend
  const handleDemoLogin = () => {
    const demoUser = {
      id: 1,
      username: 'Demo User',
      email: 'demo@travelplanner.com',
      phone: '+91 98765 43210'
    };
    localStorage.setItem('auth_token', 'demo_token_' + Date.now());
    localStorage.setItem('user', JSON.stringify(demoUser));
    onAuthSuccess(demoUser);
    onClose();
  };

  // Fallback Google Sign-In (popup method)
  const handleGoogleSignInFallback = () => {
    if (window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.prompt();
    } else {
      // If Google SDK not loaded or no client ID, use demo
      setLoading(true);
      setTimeout(() => {
        const googleUser = {
          id: Date.now(),
          username: 'Google User',
          email: 'user@gmail.com',
          phone: '',
          provider: 'google'
        };
        localStorage.setItem('auth_token', 'google_token_' + Date.now());
        localStorage.setItem('user', JSON.stringify(googleUser));
        onAuthSuccess(googleUser);
        onClose();
        setLoading(false);
      }, 1000);
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

        {/* Social Sign In Options */}
        <div style={{ padding: '0 24px' }}>
          {/* Real Google Sign-In Button */}
          {GOOGLE_CLIENT_ID ? (
            <div ref={googleButtonRef} className="google-btn-container"></div>
          ) : (
            <button className="google-signin-btn" onClick={handleGoogleSignInFallback} disabled={loading}>
              <svg viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>
          )}

          <button className="demo-login-btn" onClick={handleDemoLogin}>
            🚀 Try Demo Account (No signup required)
          </button>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>
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
            {loading ? (
              <>
                <span className="auth-spinner"></span>
                Please wait...
              </>
            ) : mode === 'login' ? (
              <>
                <svg className="auth-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Login
              </>
            ) : (
              <>
                <svg className="auth-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                Create Account
              </>
            )}
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
