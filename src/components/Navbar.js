'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const user = session?.user;
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setMobileOpen(false);
    router.push('/');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/dashboard/admin';
    if (user?.role === 'freelancer') return '/dashboard/freelancer';
    return '/dashboard/client';
  };

  const getProfileLink = () => {
    if (user?.role === 'freelancer') return `/freelancers/${user.id}`;
    return '/dashboard/client';
  };

  const publicLinks = [
    { href: '/', label: 'Home' },
    { href: '/tasks', label: 'Browse Tasks' },
    { href: '/freelancers', label: 'Freelancers' },
  ];

  return (
    <>
      <nav style={{
        background: '#0f172a',
        padding: '0 2rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 200,
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
      }}>
        {/* Logo */}
        <Link href="/" style={{
          color: '#38bdf8',
          fontSize: '1.4rem',
          fontWeight: '800',
          textDecoration: 'none',
          letterSpacing: '-0.5px'
        }}>
          Skill<span style={{ color: '#fff' }}>Swap</span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}
          className="desktop-nav"
        >
          {publicLinks.map(link => (
            <Link key={link.href} href={link.href} style={{
              color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem',
              transition: 'color 0.2s'
            }}
              onMouseEnter={e => e.target.style.color = '#38bdf8'}
              onMouseLeave={e => e.target.style.color = '#cbd5e1'}
            >{link.label}</Link>
          ))}

          {!isPending && user ? (
            <>
              <Link href={getDashboardLink()} style={{
                color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem',
                transition: 'color 0.2s'
              }}
                onMouseEnter={e => e.target.style.color = '#38bdf8'}
                onMouseLeave={e => e.target.style.color = '#cbd5e1'}
              >Dashboard</Link>

              {/* ── NEW: Profile link ── */}
              <Link href={getProfileLink()} style={{
                color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'color 0.2s'
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#38bdf8'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#cbd5e1'; }}
              >
                <img
                  src={user?.image || `https://i.pravatar.cc/32?u=${user?.email}`}
                  alt="profile"
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #38bdf8' }}
                />
                Profile
              </Link>

              <button onClick={handleLogout} style={{
                background: '#ef4444', color: '#fff', border: 'none',
                padding: '0.4rem 1rem', borderRadius: '6px',
                cursor: 'pointer', fontSize: '0.9rem',
                transition: 'background 0.2s'
              }}
                onMouseEnter={e => e.target.style.background = '#dc2626'}
                onMouseLeave={e => e.target.style.background = '#ef4444'}
              >Logout</button>
            </>
          ) : !isPending && !user ? (
            <Link href="/login" style={{
              background: '#38bdf8', color: '#0f172a',
              padding: '0.4rem 1rem', borderRadius: '6px',
              textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem'
            }}>Login</Link>
          ) : null}
        </div>

        {/* Hamburger button — mobile only */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.4rem',
            flexDirection: 'column',
            gap: '5px'
          }}
          className="hamburger-btn"
          aria-label="Toggle menu"
        >
          <span style={{
            display: 'block', width: '24px', height: '2px', background: '#fff',
            transition: 'transform 0.3s',
            transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
          }} />
          <span style={{
            display: 'block', width: '24px', height: '2px', background: '#fff',
            opacity: mobileOpen ? 0 : 1, transition: 'opacity 0.3s'
          }} />
          <span style={{
            display: 'block', width: '24px', height: '2px', background: '#fff',
            transition: 'transform 0.3s',
            transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'
          }} />
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      <div style={{
        position: 'fixed',
        top: '64px',
        left: 0,
        right: 0,
        background: '#0f172a',
        zIndex: 190,
        overflow: 'hidden',
        maxHeight: mobileOpen ? '500px' : '0',
        transition: 'max-height 0.35s ease',
        boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
      }}
        className="mobile-menu"
      >
        <div style={{ padding: '1rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {publicLinks.map(link => (
            <Link key={link.href} href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                color: '#cbd5e1', textDecoration: 'none', fontSize: '1rem',
                padding: '0.8rem 0', borderBottom: '1px solid #1e293b', display: 'block'
              }}>
              {link.label}
            </Link>
          ))}

          {!isPending && user ? (
            <>
              <Link href={getDashboardLink()}
                onClick={() => setMobileOpen(false)}
                style={{
                  color: '#cbd5e1', textDecoration: 'none', fontSize: '1rem',
                  padding: '0.8rem 0', borderBottom: '1px solid #1e293b', display: 'block'
                }}>
                Dashboard
              </Link>
              {/* Mobile Profile link */}
              <Link href={getProfileLink()}
                onClick={() => setMobileOpen(false)}
                style={{
                  color: '#cbd5e1', textDecoration: 'none', fontSize: '1rem',
                  padding: '0.8rem 0', borderBottom: '1px solid #1e293b', display: 'block'
                }}>
                👤 Profile
              </Link>
              <button onClick={handleLogout} style={{
                background: '#ef4444', color: '#fff', border: 'none',
                padding: '0.7rem', borderRadius: '8px',
                cursor: 'pointer', fontSize: '1rem', marginTop: '0.5rem', width: '100%'
              }}>Logout</button>
            </>
          ) : !isPending && !user ? (
            <Link href="/login"
              onClick={() => setMobileOpen(false)}
              style={{
                background: '#38bdf8', color: '#0f172a',
                padding: '0.7rem', borderRadius: '8px',
                textDecoration: 'none', fontWeight: '600', fontSize: '1rem',
                display: 'block', textAlign: 'center', marginTop: '0.5rem'
              }}>Login</Link>
          ) : null}
        </div>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 180,
            background: 'rgba(0,0,0,0.4)', top: '64px'
          }}
        />
      )}

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </>
  );
}