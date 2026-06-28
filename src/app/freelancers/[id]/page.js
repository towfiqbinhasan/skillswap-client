'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';

export default function FreelancerProfilePage() {
  const { id } = useParams();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get(`/users/freelancer/${id}`)
      .then(res => setFreelancer(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
      <p>Loading profile...</p>
    </div>
  );

  if (!freelancer) return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
      <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Freelancer not found.</p>
      <Link href="/freelancers" style={{
        display: 'inline-block', marginTop: '1rem',
        background: '#0f172a', color: '#fff',
        padding: '0.6rem 1.5rem', borderRadius: '8px', textDecoration: 'none'
      }}>← Back to Freelancers</Link>
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>

      {/* Back link */}
      <Link href="/freelancers" style={{
        color: '#64748b', textDecoration: 'none', fontSize: '0.9rem',
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.5rem'
      }}>
        ← Back to Freelancers
      </Link>

      {/* Profile Card */}
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '2.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '1.5rem',
        display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start'
      }}>
        <img
          src={freelancer.image || `https://i.pravatar.cc/120?u=${freelancer._id}`}
          alt={freelancer.name}
          style={{
            width: '110px', height: '110px', borderRadius: '50%',
            objectFit: 'cover', border: '4px solid #e0f2fe', flexShrink: 0
          }}
        />
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h1 style={{ margin: '0 0 0.4rem', color: '#0f172a', fontSize: '1.7rem', fontWeight: '800' }}>
            {freelancer.name}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            {freelancer.bio || 'Skilled freelancer available for hire.'}
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {freelancer.hourlyRate && (
              <div>
                <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.2rem' }}>Hourly Rate</p>
                <p style={{ color: '#38bdf8', fontWeight: '700', fontSize: '1rem' }}>${freelancer.hourlyRate}/hr</p>
              </div>
            )}
            {freelancer.avgRating > 0 && (
              <div>
                <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.2rem' }}>Rating</p>
                <p style={{ color: '#f59e0b', fontWeight: '700', fontSize: '1rem' }}>⭐ {freelancer.avgRating?.toFixed(1)}</p>
              </div>
            )}
            {freelancer.completedJobs > 0 && (
              <div>
                <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.2rem' }}>Jobs Done</p>
                <p style={{ color: '#16a34a', fontWeight: '700', fontSize: '1rem' }}>✅ {freelancer.completedJobs}</p>
              </div>
            )}
          </div>

          {/* Skills */}
          {freelancer.skills?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {freelancer.skills.map(skill => (
                <span key={skill} style={{
                  background: '#f0fdf4', color: '#16a34a',
                  padding: '0.25rem 0.7rem', borderRadius: '20px',
                  fontSize: '0.8rem', fontWeight: '600'
                }}>{skill}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
        borderRadius: '16px', padding: '2rem', textAlign: 'center', color: '#fff'
      }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem' }}>
          Want to work with {freelancer.name}?
        </h3>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Post a task and invite them to apply.
        </p>
        <Link href="/dashboard/client" style={{
          background: '#38bdf8', color: '#0f172a',
          padding: '0.7rem 2rem', borderRadius: '8px',
          textDecoration: 'none', fontWeight: '700', fontSize: '0.95rem'
        }}>
          Post a Task →
        </Link>
      </div>
    </div>
  );
}