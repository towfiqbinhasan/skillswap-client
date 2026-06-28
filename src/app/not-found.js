'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);


  
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease'
      }}>
        {/* Big 404 */}
        <h1 style={{
          fontSize: 'clamp(6rem, 20vw, 10rem)',
          fontWeight: '900',
          color: '#e2e8f0',
          lineHeight: 1,
          margin: '0 0 1rem',
          letterSpacing: '-4px'
        }}>
          404
        </h1>

        {/* Icon */}
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>

        {/* Title */}
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          color: '#0f172a',
          marginBottom: '0.8rem'
        }}>
          Page Not Found
        </h2>

        {/* Description */}
        <p style={{
          color: '#64748b',
          fontSize: '1rem',
          maxWidth: '420px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.7
        }}>
          Oops! The page you are looking for does not exist or has been moved.
          Let us help you get back on track.
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link href="/" style={{
            background: '#0f172a',
            color: '#fff',
            padding: '0.8rem 2rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '0.95rem',
            transition: 'background 0.2s'
          }}>
            🏠 Go to Home
          </Link>
          <Link href="/tasks" style={{
            background: 'transparent',
            color: '#0f172a',
            padding: '0.8rem 2rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '0.95rem',
            border: '2px solid #0f172a',
            transition: 'all 0.2s'
          }}>
            Browse Tasks
          </Link>
        </div>
      </div>
    </div>
  );
}