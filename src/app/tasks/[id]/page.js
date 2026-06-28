'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { useSession } from '@/lib/auth-client';

export default function TaskDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState(null);
  const [user, setUser] = useState(null);
  const { data: session } = useSession();
  const [proposal, setProposal] = useState({
    proposed_budget: '', estimated_days: '', cover_note: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axiosInstance.get(`/tasks/${id}`).then(res => setTask(res.data)).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (session?.user) setUser(session.user);
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post('/proposals', {
        task_id: id,
        freelancer_email: user.email,
        ...proposal
      });
      setSuccess('Proposal submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setLoading(false);
    }
  };

  if (!task) return <p style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      {/* Task Info */}
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '2rem'
      }}>
        <span style={{
          background: '#dbeafe', color: '#1d4ed8', padding: '0.2rem 0.6rem',
          borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600'
        }}>{task.category}</span>

        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#0f172a', margin: '1rem 0' }}>
          {task.title}
        </h1>
        <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: '1.5rem' }}>{task.description}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { label: 'Budget', value: `$${task.budget}` },
            { label: 'Deadline', value: new Date(task.deadline).toLocaleDateString() },
            { label: 'Client', value: task.client_email },
            { label: 'Status', value: task.status },
          ].map(item => (
            <div key={item.label} style={{
              background: '#f8fafc', padding: '1rem', borderRadius: '8px'
            }}>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>{item.label}</p>
              <p style={{ color: '#0f172a', fontWeight: '600' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Proposal Form - only for freelancers */}
      {user?.role === 'freelancer' && task.status === 'open' && (
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>
            Submit a Proposal
          </h2>

          {error && (
            <div style={{
              background: '#fef2f2', color: '#dc2626', padding: '0.8rem',
              borderRadius: '8px', marginBottom: '1rem'
            }}>{error}</div>
          )}
          {success && (
            <div style={{
              background: '#f0fdf4', color: '#16a34a', padding: '0.8rem',
              borderRadius: '8px', marginBottom: '1rem'
            }}>{success}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#374151' }}>
                Proposed Budget (USD)
              </label>
              <input
                type="number" required
                value={proposal.proposed_budget}
                onChange={e => setProposal({ ...proposal, proposed_budget: e.target.value })}
                placeholder="500"
                style={{
                  width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
                  border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#374151' }}>
                Estimated Days
              </label>
              <input
                type="number" required
                value={proposal.estimated_days}
                onChange={e => setProposal({ ...proposal, estimated_days: e.target.value })}
                placeholder="7"
                style={{
                  width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
                  border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#374151' }}>
                Cover Note
              </label>
              <textarea
                required
                value={proposal.cover_note}
                onChange={e => setProposal({ ...proposal, cover_note: e.target.value })}
                placeholder="Why are you the best for this task?"
                rows={4}
                style={{
                  width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
                  border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none',
                  boxSizing: 'border-box', resize: 'vertical'
                }}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '0.8rem', background: '#0f172a',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '1rem', fontWeight: '600', cursor: 'pointer'
            }}>
              {loading ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </form>
        </div>
      )}

      {/* Not logged in */}
      {!user && (
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '2rem',
          textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
        }}>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>Login as a freelancer to submit a proposal</p>
          <a href="/login" style={{
            background: '#0f172a', color: '#fff', padding: '0.6rem 1.5rem',
            borderRadius: '8px', textDecoration: 'none', fontWeight: '600'
          }}>Login</a>
        </div>
      )}
    </div>
  );
}