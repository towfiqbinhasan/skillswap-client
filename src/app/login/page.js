'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth-client';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: signInError } = await signIn.email({
        email: form.email,
        password: form.password,
      });

      if (signInError) {
        setError(signInError.message || 'Login failed');
        setLoading(false);
        return;
      }

      const role = data?.user?.role;
      if (role === 'admin') router.push('/dashboard/admin');
      else if (role === 'freelancer') router.push('/dashboard/freelancer');
      else router.push('/');
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await signIn.social({
      provider: 'google',
      callbackURL: '/',
    });
  };

  return (
    <div style={{
      minHeight: '80vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f8fafc'
    }}>
      <div style={{
        background: '#fff', padding: '2.5rem', borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px'
      }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
          Welcome back
        </h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Login to your SkillSwap account</p>

        {error && (
          <div style={{
            background: '#fef2f2', color: '#dc2626', padding: '0.8rem',
            borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#374151' }}>Email</label>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              style={{
                width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
                border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#374151' }}>Password</label>
            <input
              type="password" required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
                border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '0.8rem', background: '#0f172a',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontSize: '1rem', fontWeight: '600', cursor: 'pointer'
          }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        <button onClick={handleGoogleLogin} type="button" style={{
          width: '100%', padding: '0.7rem', background: '#fff',
          color: '#374151', border: '1px solid #e2e8f0', borderRadius: '8px',
          fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem'
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.81 2.73v2.27h2.92c1.71-1.57 2.69-3.88 2.69-6.64z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.34C2.44 16.05 5.48 18 9 18z"/>
            <path fill="#FBBC05" d="M3.97 10.7c-.18-.54-.28-1.11-.28-1.7s.1-1.16.28-1.7V4.96H.96C.35 6.18 0 7.55 0 9s.35 2.82.96 4.04l3.01-2.34z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 1.95.96 4.96l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: '#38bdf8', fontWeight: '600', textDecoration: 'none' }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}