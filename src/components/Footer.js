'use client';




import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      background: '#0f172a',
      color: '#94a3b8',
      padding: '3rem 2rem 1.5rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>

        {/* Logo + Description */}
        <div>
          <p style={{ fontSize: '1.4rem', fontWeight: '800', color: '#38bdf8', marginBottom: '0.5rem' }}>
            Skill<span style={{ color: '#fff' }}>Swap</span>
          </p>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
            A freelance micro-task marketplace. Post tasks, get proposals, hire the best — fast and simple.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <p style={{ color: '#fff', fontWeight: '700', marginBottom: '1rem', fontSize: '0.95rem' }}>Quick Links</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { href: '/', label: 'Home' },
              { href: '/tasks', label: 'Browse Tasks' },
              { href: '/freelancers', label: 'Browse Freelancers' },
              { href: '/login', label: 'Login / Register' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{
                color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem',
                transition: 'color 0.2s'
              }}
                onMouseEnter={e => e.target.style.color = '#38bdf8'}
                onMouseLeave={e => e.target.style.color = '#94a3b8'}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <p style={{ color: '#fff', fontWeight: '700', marginBottom: '1rem', fontSize: '0.95rem' }}>Contact</p>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.4rem' }}>📧 support@skillswap.io</p>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.4rem' }}>🌍 Available Worldwide</p>
          <p style={{ fontSize: '0.9rem' }}>⏰ 24/7 Support</p>
        </div>

        {/* Social Media */}
        <div>
          <p style={{ color: '#fff', fontWeight: '700', marginBottom: '1rem', fontSize: '0.95rem' }}>Follow Us</p>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>

            {/* X (Twitter) - new black X logo */}
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" style={{
              background: '#1a1a1a', color: '#fff', width: '38px', height: '38px',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', fontSize: '1rem', fontWeight: '900', border: '1px solid #333',
              transition: 'background 0.2s'
            }}
              title="X (Twitter)"
            >
              𝕏
            </a>

            {/* LinkedIn */}
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{
              background: '#0a66c2', color: '#fff', width: '38px', height: '38px',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700',
              transition: 'opacity 0.2s'
            }}
              title="LinkedIn"
            >
              in
            </a>

            {/* GitHub */}
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{
              background: '#333', color: '#fff', width: '38px', height: '38px',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', fontSize: '1rem',
              transition: 'opacity 0.2s'
            }}
              title="GitHub"
            >
              ⌥
            </a>

            {/* Facebook */}
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{
              background: '#1877f2', color: '#fff', width: '38px', height: '38px',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700',
              transition: 'opacity 0.2s'
            }}
              title="Facebook"
            >
              f
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        borderTop: '1px solid #1e293b',
        paddingTop: '1.2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        maxWidth: '1100px',
        margin: '0 auto'
      }}>
        <p style={{ fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} SkillSwap. All rights reserved.
        </p>
        <p style={{ fontSize: '0.85rem' }}>
          Built with ❤️ for freelancers worldwide
        </p>
      </div>
    </footer>
  );
}