'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation on load
    setTimeout(() => setVisible(true), 100);
    axiosInstance.get('/tasks/latest').then(res => setTasks(res.data)).catch(() => {});
    axiosInstance.get('/users/top-freelancers').then(res => setFreelancers(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      {/* ======================== HERO SECTION ======================== */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        color: '#fff',
        padding: '6rem 2rem',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease'
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: '800',
            marginBottom: '1rem',
            lineHeight: 1.2
          }}>
            Get your tasks done by{' '}
            <span style={{ color: '#38bdf8' }}>skilled freelancers</span>
          </h1>
          <p style={{
            fontSize: '1.15rem', color: '#94a3b8',
            maxWidth: '580px', margin: '0 auto 2.5rem',
            lineHeight: 1.7
          }}>
            Post a small task, receive proposals from talented freelancers, and get
            it done — fast, simple, and secure with Stripe payments.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard/client" style={{
              background: '#38bdf8', color: '#0f172a',
              padding: '0.85rem 2.2rem', borderRadius: '8px',
              textDecoration: 'none', fontWeight: '700', fontSize: '1rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 15px rgba(56,189,248,0.4)'
            }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(56,189,248,0.5)'; }}
              onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 15px rgba(56,189,248,0.4)'; }}
            >
              Post a Task
            </Link>
            <Link href="/tasks" style={{
              background: 'transparent', color: '#fff',
              padding: '0.85rem 2.2rem', borderRadius: '8px',
              textDecoration: 'none', fontWeight: '700',
              border: '2px solid #38bdf8', fontSize: '1rem',
              transition: 'background 0.2s'
            }}
              onMouseEnter={e => { e.target.style.background = 'rgba(56,189,248,0.1)'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; }}
            >
              Browse Tasks
            </Link>
          </div>
        </div>
      </section>

      {/* ======================== HOW IT WORKS ======================== */}
      <section style={{ padding: '5rem 2rem', background: '#f8fafc', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a' }}>
          How It Works
        </h2>
        <p style={{ color: '#64748b', marginBottom: '3rem' }}>
          3 simple steps to get your task done
        </p>
        <div style={{
          display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap',
          maxWidth: '900px', margin: '0 auto'
        }}>
          {[
            { step: '01', title: 'Post a Task', icon: '📝', desc: 'Describe your task, set your budget and deadline. It only takes 2 minutes.' },
            { step: '02', title: 'Get Proposals', icon: '📨', desc: 'Skilled freelancers will send you their best proposals and pricing.' },
            { step: '03', title: 'Hire & Pay', icon: '💳', desc: 'Choose the best freelancer and pay securely via Stripe Checkout.' },
          ].map((item, i) => (
            <div key={item.step} style={{
              background: '#fff', padding: '2rem 1.5rem', borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)', width: '260px',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.6s ease ${0.2 + i * 0.15}s, transform 0.6s ease ${0.2 + i * 0.15}s`
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>{item.icon}</div>
              <div style={{
                fontSize: '0.8rem', fontWeight: '700', color: '#38bdf8',
                background: '#eff6ff', padding: '0.2rem 0.6rem',
                borderRadius: '4px', display: 'inline-block', marginBottom: '0.8rem'
              }}>STEP {item.step}</div>
              <h3 style={{ fontWeight: '700', marginBottom: '0.6rem', color: '#0f172a' }}>{item.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================== LATEST TASKS ======================== */}
      <section style={{ padding: '5rem 2rem', background: '#fff' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a', textAlign: 'center' }}>
          Latest Tasks
        </h2>
        <p style={{ color: '#64748b', marginBottom: '2.5rem', textAlign: 'center' }}>
          Fresh tasks posted by clients — apply now!
        </p>

        {tasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>No tasks yet. Be the first to post!</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem', maxWidth: '1100px', margin: '0 auto'
          }}>
            {tasks.map((task, i) => (
              <div key={task._id} style={{
                background: '#f8fafc', borderRadius: '14px', padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
                transition: 'transform 0.25s, box-shadow 0.25s',
                opacity: visible ? 1 : 0,
                animation: visible ? `fadeUp 0.5s ease ${i * 0.08}s both` : 'none'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
              >
                <span style={{
                  background: '#dbeafe', color: '#1d4ed8',
                  padding: '0.2rem 0.6rem', borderRadius: '4px',
                  fontSize: '0.78rem', fontWeight: '600'
                }}>{task.category}</span>

                <h3 style={{ margin: '0.8rem 0 0.4rem', color: '#0f172a', fontSize: '1.05rem' }}>
                  {task.title}
                </h3>

                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  👤 {task.client_email?.split('@')[0] || 'Client'}
                </p>

                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  💰 Budget: <strong style={{ color: '#0f172a' }}>${task.budget}</strong>
                </p>

                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  📅 Due: {new Date(task.deadline).toLocaleDateString()}
                </p>

                <Link href={`/tasks/${task._id}`} style={{
                  background: '#0f172a', color: '#fff',
                  padding: '0.5rem 1.1rem', borderRadius: '6px',
                  textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600',
                  display: 'inline-block', transition: 'background 0.2s'
                }}
                  onMouseEnter={e => e.target.style.background = '#1e293b'}
                  onMouseLeave={e => e.target.style.background = '#0f172a'}
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link href="/tasks" style={{
            background: 'transparent', color: '#0f172a',
            padding: '0.7rem 2rem', borderRadius: '8px',
            textDecoration: 'none', fontWeight: '600',
            border: '2px solid #0f172a', fontSize: '0.95rem'
          }}>
            View All Tasks →
          </Link>
        </div>
      </section>

      {/* ======================== TOP FREELANCERS ======================== */}
      <section style={{ padding: '5rem 2rem', background: '#f8fafc' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a', textAlign: 'center' }}>
          Top Freelancers
        </h2>
        <p style={{ color: '#64748b', marginBottom: '2.5rem', textAlign: 'center' }}>
          Trusted professionals ready to get your work done
        </p>

        {freelancers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>No freelancers yet.</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.5rem', maxWidth: '1100px', margin: '0 auto'
          }}>
            {freelancers.map((f, i) => (
              <div key={f._id} style={{
                background: '#fff', borderRadius: '14px', padding: '1.8rem',
                textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #e2e8f0', transition: 'transform 0.25s, box-shadow 0.25s',
                opacity: visible ? 1 : 0,
                animation: visible ? `fadeUp 0.5s ease ${i * 0.08}s both` : 'none'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
              >
                <img
                  src={f.image || `https://i.pravatar.cc/80?u=${f._id}`}
                  alt={f.name}
                  style={{
                    width: '70px', height: '70px', borderRadius: '50%',
                    objectFit: 'cover', marginBottom: '0.8rem',
                    border: '3px solid #e0f2fe'
                  }}
                />
                <h3 style={{ margin: '0 0 0.3rem', color: '#0f172a', fontSize: '1rem', fontWeight: '700' }}>
                  {f.name}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.8rem' }}>
                  {f.bio || 'Skilled Freelancer'}
                </p>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '0.3rem',
                  justifyContent: 'center', marginBottom: '0.8rem'
                }}>
                  {f.skills?.slice(0, 3).map(skill => (
                    <span key={skill} style={{
                      background: '#f0fdf4', color: '#16a34a',
                      padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.73rem', fontWeight: '600'
                    }}>{skill}</span>
                  ))}
                </div>
                {f.hourlyRate && (
                  <p style={{ color: '#38bdf8', fontWeight: '700', fontSize: '0.9rem' }}>
                    ${f.hourlyRate}/hr
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link href="/freelancers" style={{
            background: '#38bdf8', color: '#0f172a',
            padding: '0.7rem 2rem', borderRadius: '8px',
            textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem'
          }}>
            Browse All Freelancers →
          </Link>
        </div>
      </section>

      {/* ======================== POPULAR CATEGORIES ======================== */}
      <section style={{ padding: '5rem 2rem', background: '#fff', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a' }}>
          Popular Categories
        </h2>
        <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>
          Browse tasks by category
        </p>
        <div style={{
          display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap',
          maxWidth: '800px', margin: '0 auto'
        }}>
          {[
            { label: 'Design', icon: '🎨', color: '#fef3c7', border: '#f59e0b', text: '#92400e' },
            { label: 'Writing', icon: '✍️', color: '#ede9fe', border: '#8b5cf6', text: '#4c1d95' },
            { label: 'Development', icon: '💻', color: '#dbeafe', border: '#3b82f6', text: '#1e3a8a' },
            { label: 'Marketing', icon: '📣', color: '#fce7f3', border: '#ec4899', text: '#831843' },
            { label: 'Other', icon: '⚙️', color: '#dcfce7', border: '#22c55e', text: '#14532d' },
          ].map(cat => (
            <Link
              key={cat.label}
              href={`/tasks?category=${cat.label}`}
              style={{
                background: cat.color,
                border: `2px solid ${cat.border}`,
                color: cat.text,
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {cat.icon} {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}