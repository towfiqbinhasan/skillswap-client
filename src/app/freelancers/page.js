'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';

export default function BrowseFreelancersPage() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axiosInstance.get('/users/freelancers')
      .then(res => setFreelancers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = freelancers.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.skills?.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
    f.bio?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '80vh', background: '#f8fafc' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        color: '#fff', padding: '3rem 2rem', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
          Browse Freelancers
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
          {freelancers.length} skilled freelancers ready to work
        </p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>

        {/* Search Bar */}
        <div style={{
          background: '#fff', borderRadius: '14px', padding: '1.2rem 1.5rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: '2rem',
          position: 'relative'
        }}>
          <span style={{
            position: 'absolute', left: '2rem', top: '50%',
            transform: 'translateY(-50%)', color: '#94a3b8'
          }}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, skill, or bio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: '8px', border: '1px solid #e2e8f0',
              fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box'
            }}
            onFocus={e => e.target.style.borderColor = '#38bdf8'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>Loading freelancers...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem', background: '#fff',
            borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No freelancers found.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {filtered.map(f => (
              <div key={f._id} style={{
                background: '#fff', borderRadius: '16px', padding: '1.8rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', transition: 'transform 0.25s, box-shadow 0.25s'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
              >
                {/* Avatar */}
                <img
                  src={f.image || `https://i.pravatar.cc/100?u=${f._id}`}
                  alt={f.name}
                  style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    objectFit: 'cover', marginBottom: '1rem',
                    border: '3px solid #e0f2fe'
                  }}
                />

                {/* Name */}
                <h3 style={{ margin: '0 0 0.3rem', color: '#0f172a', fontWeight: '700', fontSize: '1.05rem' }}>
                  {f.name}
                </h3>

                {/* Bio */}
                <p style={{
                  color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem',
                  lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                  {f.bio || 'Skilled freelancer available for hire.'}
                </p>

                {/* Skills */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
                  justifyContent: 'center', marginBottom: '1rem'
                }}>
                  {f.skills?.slice(0, 4).map(skill => (
                    <span key={skill} style={{
                      background: '#f0fdf4', color: '#16a34a',
                      padding: '0.2rem 0.6rem', borderRadius: '20px',
                      fontSize: '0.75rem', fontWeight: '600'
                    }}>{skill}</span>
                  ))}
                </div>

                {/* Stats row */}
                <div style={{
                  display: 'flex', gap: '1rem', marginBottom: '1.2rem',
                  justifyContent: 'center'
                }}>
                  {f.hourlyRate && (
                    <span style={{ color: '#38bdf8', fontWeight: '700', fontSize: '0.9rem' }}>
                      💰 ${f.hourlyRate}/hr
                    </span>
                  )}
                  {f.avgRating > 0 && (
                    <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '0.9rem' }}>
                      ⭐ {f.avgRating?.toFixed(1)}
                    </span>
                  )}
                  {f.completedJobs > 0 && (
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      ✅ {f.completedJobs} jobs
                    </span>
                  )}
                </div>

                {/* View Profile button */}
                <Link href={`/freelancers/${f._id}`} style={{
                  background: '#0f172a', color: '#fff',
                  padding: '0.6rem 1.5rem', borderRadius: '8px',
                  textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem',
                  width: '100%', display: 'block', textAlign: 'center',
                  transition: 'background 0.2s'
                }}
                  onMouseEnter={e => e.target.style.background = '#1e3a5f'}
                  onMouseLeave={e => e.target.style.background = '#0f172a'}
                >
                  View Profile →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}