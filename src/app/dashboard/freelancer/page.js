'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { useSession } from '@/lib/auth-client';

export default function FreelancerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [deliverableModal, setDeliverableModal] = useState(null);
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [profileForm, setProfileForm] = useState({ name: '', image: '', bio: '', skills: '', hourlyRate: '' });
  const [success, setSuccess] = useState('');
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) { router.push('/login'); return; }
    const u = session.user;
    if (u.role !== 'freelancer') { router.push('/'); return; }
    setUser(u);
    setProfileForm({
      name: u.name || '',
      image: u.image || '',
      bio: u.bio || '',
      skills: u.skills?.join(', ') || '',
      hourlyRate: u.hourlyRate || ''
    });
    fetchProposals(u.email);
    fetchEarnings(u.email);
  }, [isPending, session]);

  const fetchProposals = async (email) => {
    const res = await axiosInstance.get(`/proposals/freelancer/${email}`);
    setProposals(res.data);
  };

  const fetchEarnings = async (email) => {
    const res = await axiosInstance.get(`/payments/earnings/${email}`);
    setEarnings(res.data);
  };

  const handleDeliverable = async () => {
    await axiosInstance.put(`/tasks/${deliverableModal}`, {
      status: 'completed', deliverable_url: deliverableUrl
    });
    setDeliverableModal(null);
    setDeliverableUrl('');
    fetchProposals(user.email);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    await axiosInstance.put(`/users/profile/${user.email}`, {
      ...profileForm,
      skills: profileForm.skills.split(',').map(s => s.trim())
    });
    setSuccess('Profile updated!');
  };

  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    earnings: earnings.reduce((sum, e) => sum + e.amount, 0)
  };

  const activeProposals = proposals.filter(p => p.status === 'accepted' && p.task_id?.status === 'in-progress');

  return (
    <div style={{ display: 'flex', minHeight: '80vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px', background: '#0f172a', color: '#fff',
        padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'
      }}>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '1rem' }}>FREELANCER MENU</p>
        {[
          { key: 'stats', label: '📊 Overview' },
          { key: 'proposals', label: '📨 My Proposals' },
          { key: 'active', label: '🔧 Active Projects' },
          { key: 'earnings', label: '💰 Earnings' },
          { key: 'profile', label: '👤 Edit Profile' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            background: activeTab === tab.key ? '#38bdf8' : 'transparent',
            color: activeTab === tab.key ? '#0f172a' : '#cbd5e1',
            border: 'none', padding: '0.7rem 1rem', borderRadius: '8px',
            textAlign: 'left', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem'
          }}>{tab.label}</button>
        ))}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '2rem', background: '#f8fafc' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#0f172a', marginBottom: '2rem' }}>
          Welcome, {user?.name}!
        </h1>

        {/* Stats */}
        {activeTab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[
              { label: 'Total Proposals', value: stats.total, color: '#3b82f6' },
              { label: 'Pending', value: stats.pending, color: '#f59e0b' },
              { label: 'Accepted', value: stats.accepted, color: '#22c55e' },
              { label: 'Total Earnings', value: `$${stats.earnings}`, color: '#8b5cf6' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: '#fff', padding: '1.5rem', borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${stat.color}`
              }}>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{stat.label}</p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* My Proposals */}
        {activeTab === 'proposals' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>My Proposals</h2>
            {proposals.length === 0 ? <p style={{ color: '#94a3b8' }}>No proposals yet.</p> : (
              <table style={{ width: '100%', background: '#fff', borderRadius: '12px', borderCollapse: 'collapse', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#fff' }}>
                    {['Task Title', 'Budget Bid', 'Date Sent', 'Status'].map(h => (
                      <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {proposals.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', color: '#0f172a' }}>{p.task_id?.title || 'N/A'}</td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>${p.proposed_budget}</td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>{new Date(p.submitted_at).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600',
                          background: p.status === 'pending' ? '#fef9c3' : p.status === 'accepted' ? '#dcfce7' : '#fee2e2',
                          color: p.status === 'pending' ? '#ca8a04' : p.status === 'accepted' ? '#16a34a' : '#dc2626'
                        }}>{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Active Projects */}
        {activeTab === 'active' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Active Projects</h2>
            {activeProposals.length === 0 ? <p style={{ color: '#94a3b8' }}>No active projects.</p> : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {activeProposals.map(p => (
                  <div key={p._id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>{p.task_id?.title}</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>Budget: ${p.proposed_budget}</p>
                    <button onClick={() => setDeliverableModal(p.task_id?._id)} style={{
                      background: '#22c55e', color: '#fff', border: 'none',
                      padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer'
                    }}>Submit Deliverable</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Earnings */}
        {activeTab === 'earnings' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>My Earnings</h2>
            {earnings.length === 0 ? <p style={{ color: '#94a3b8' }}>No earnings yet.</p> : (
              <table style={{ width: '100%', background: '#fff', borderRadius: '12px', borderCollapse: 'collapse', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#fff' }}>
                    {['Task Title', 'Client', 'Amount', 'Date'].map(h => (
                      <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {earnings.map(e => (
                    <tr key={e._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', color: '#0f172a' }}>{e.task_id?.title || 'N/A'}</td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>{e.client_email}</td>
                      <td style={{ padding: '1rem', color: '#16a34a', fontWeight: '700' }}>${e.amount}</td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>{new Date(e.paid_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Edit Profile */}
        {activeTab === 'profile' && (
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Edit Profile</h2>
            {success && <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}
            <form onSubmit={handleProfileUpdate}>
              {[
                { label: 'Name', key: 'name', type: 'text' },
                { label: 'Profile Image URL', key: 'image', type: 'url' },
                { label: 'Skills (comma separated)', key: 'skills', type: 'text' },
                { label: 'Hourly Rate (USD)', key: 'hourlyRate', type: 'number' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#374151' }}>{field.label}</label>
                  <input type={field.type} value={profileForm[field.key]}
                    onChange={e => setProfileForm({ ...profileForm, [field.key]: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#374151' }}>Bio</label>
                <textarea value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={3} style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
              <button type="submit" style={{ width: '100%', padding: '0.8rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
                Update Profile
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Deliverable Modal */}
      {deliverableModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '450px' }}>
            <h3 style={{ marginBottom: '1rem', color: '#0f172a' }}>Submit Deliverable</h3>
            <input type="url" value={deliverableUrl} onChange={e => setDeliverableUrl(e.target.value)}
              placeholder="https://github.com/your-repo"
              style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleDeliverable} style={{ flex: 1, padding: '0.8rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Submit</button>
              <button onClick={() => setDeliverableModal(null)} style={{ flex: 1, padding: '0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}