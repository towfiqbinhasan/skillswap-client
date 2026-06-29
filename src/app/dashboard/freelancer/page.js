'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { useSession } from '@/lib/auth-client';

const CATEGORIES = ['All', 'Design', 'Writing', 'Development', 'Marketing', 'Other'];

export default function FreelancerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [deliverableModal, setDeliverableModal] = useState(null);
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [deliverableError, setDeliverableError] = useState('');
  const [profileForm, setProfileForm] = useState({ name: '', image: '', bio: '', skills: '', hourlyRate: '' });
  const [success, setSuccess] = useState('');
  const { data: session, isPending } = useSession();

  // ── Browse Tasks state ──
  const [browseTasks, setBrowseTasks] = useState([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseSearch, setBrowseSearch] = useState('');
  const [browseCategory, setBrowseCategory] = useState('All');
  const [browsePage, setBrowsePage] = useState(1);
  const [browseTotalPages, setBrowseTotalPages] = useState(1);
  const [browseTotal, setBrowseTotal] = useState(0);

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
    try {
      const res = await axiosInstance.get(`/proposals/freelancer/${email}`);
      setProposals(res.data);
    } catch (err) {}
  };

  const fetchEarnings = async (email) => {
    try {
      const res = await axiosInstance.get(`/payments/earnings/${email}`);
      setEarnings(res.data);
    } catch (err) {}
  };

  // ── Fetch open tasks for Browse Tasks tab ──
  const fetchBrowseTasks = useCallback(async (search, category, page) => {
    setBrowseLoading(true);
    try {
      const params = { page, limit: 9, status: 'open' };
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      const res = await axiosInstance.get('/tasks', { params });
      setBrowseTasks(res.data.tasks || []);
      setBrowseTotalPages(res.data.totalPages || 1);
      setBrowseTotal(res.data.total || 0);
    } catch (err) {
      setBrowseTasks([]);
    } finally {
      setBrowseLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchBrowseTasks(browseSearch, browseCategory, browsePage);
    }
  }, [activeTab, browseSearch, browseCategory, browsePage, fetchBrowseTasks]);

  const handleSearchChange = (val) => {
    setBrowseSearch(val);
    setBrowsePage(1);
  };

  const handleCategoryChange = (cat) => {
    setBrowseCategory(cat);
    setBrowsePage(1);
  };

  const handleDeliverable = async () => {
    if (!deliverableUrl.trim()) {
      setDeliverableError('Please enter a valid URL');
      return;
    }
    try {
      await axiosInstance.put(`/tasks/${deliverableModal}`, {
        status: 'completed', deliverable_url: deliverableUrl
      });
      setDeliverableModal(null);
      setDeliverableUrl('');
      setDeliverableError('');
      fetchProposals(user.email);
    } catch (err) {
      setDeliverableError('Failed to submit deliverable. Try again.');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/users/profile/${user.email}`, {
        ...profileForm,
        skills: profileForm.skills.split(',').map(s => s.trim())
      });
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setSuccess('');
    }
  };

  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    earnings: earnings.reduce((sum, e) => sum + e.amount, 0)
  };

  const activeProposals = proposals.filter(p => p.status === 'accepted');

  const sidebarTabs = [
    { key: 'stats', label: '📊 Overview' },
    { key: 'browse', label: '🔍 Browse Tasks' },
    { key: 'proposals', label: '📨 My Proposals' },
    { key: 'active', label: '🔧 Active Projects' },
    { key: 'earnings', label: '💰 Earnings' },
    { key: 'profile', label: '👤 Edit Profile' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '80vh' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '220px', background: '#0f172a', color: '#fff',
        padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
        flexShrink: 0
      }}>
        {/* Profile Card in Sidebar */}
        {user && (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #1e293b' }}>
            <img
              src={user.image || `https://i.pravatar.cc/80?u=${user.email}`}
              alt={user.name}
              style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #38bdf8', marginBottom: '0.5rem' }}
            />
            <p style={{ color: '#fff', fontWeight: '700', fontSize: '0.9rem', margin: 0 }}>{user.name}</p>
            <p style={{ color: '#38bdf8', fontSize: '0.75rem', margin: '0.2rem 0 0' }}>Freelancer</p>
          </div>
        )}
        <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>MENU</p>
        {sidebarTabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            background: activeTab === tab.key ? '#38bdf8' : 'transparent',
            color: activeTab === tab.key ? '#0f172a' : '#cbd5e1',
            border: 'none', padding: '0.7rem 1rem', borderRadius: '8px',
            textAlign: 'left', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
            transition: 'background 0.2s'
          }}>{tab.label}</button>
        ))}
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, padding: '2rem', background: '#f8fafc', overflowX: 'auto' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#0f172a', marginBottom: '2rem' }}>
          Welcome back, {user?.name}! 👋
        </h1>

        {/* ══ OVERVIEW STATS ══ */}
        {activeTab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[
              { label: 'Total Proposals', value: stats.total, color: '#3b82f6', icon: '📨' },
              { label: 'Pending', value: stats.pending, color: '#f59e0b', icon: '⏳' },
              { label: 'Accepted', value: stats.accepted, color: '#22c55e', icon: '✅' },
              { label: 'Total Earnings', value: `$${stats.earnings}`, color: '#8b5cf6', icon: '💰' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: '#fff', padding: '1.5rem', borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${stat.color}`
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 0.3rem' }}>{stat.label}</p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: stat.color, margin: 0 }}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ══ BROWSE TASKS ══ */}
        {activeTab === 'browse' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Browse Open Tasks</h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {browseTotal} open tasks available — find one that matches your skills
            </p>

            {/* Search + Filter */}
            <div style={{
              background: '#fff', borderRadius: '12px', padding: '1.2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1.5rem',
              display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center'
            }}>
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search tasks by title..."
                  value={browseSearch}
                  onChange={e => handleSearchChange(e.target.value)}
                  style={{
                    width: '100%', padding: '0.65rem 1rem 0.65rem 2.4rem',
                    borderRadius: '8px', border: '1px solid #e2e8f0',
                    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
              <select
                value={browseCategory}
                onChange={e => handleCategoryChange(e.target.value)}
                style={{
                  padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                  fontSize: '0.9rem', background: '#fff', cursor: 'pointer', outline: 'none'
                }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
              </select>
              {(browseSearch || browseCategory !== 'All') && (
                <button onClick={() => { setBrowseSearch(''); setBrowseCategory('All'); setBrowsePage(1); }} style={{
                  padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                  background: '#f8fafc', cursor: 'pointer', fontSize: '0.9rem', color: '#64748b'
                }}>✕ Clear</button>
              )}
            </div>

            {/* Task Grid */}
            {browseLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                Loading tasks...
              </div>
            ) : browseTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔎</div>
                No tasks found. Try a different search.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.2rem'
              }}>
                {browseTasks.map(task => (
                  <div key={task._id} style={{
                    background: '#fff', borderRadius: '12px', padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                  >
                    <span style={{
                      background: '#dbeafe', color: '#1d4ed8',
                      padding: '0.2rem 0.6rem', borderRadius: '4px',
                      fontSize: '0.75rem', fontWeight: '600'
                    }}>{task.category}</span>

                    <h3 style={{ margin: '0.8rem 0 0.5rem', color: '#0f172a', fontSize: '1rem', fontWeight: '700' }}>
                      {task.title}
                    </h3>

                    <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                      {task.description?.slice(0, 80)}{task.description?.length > 80 ? '...' : ''}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: '#22c55e', fontWeight: '700', fontSize: '0.95rem' }}>${task.budget}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                        📅 {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    </div>

                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '1rem' }}>
                      👤 {task.client_email}
                    </p>

                    <Link href={`/tasks/${task._id}`} style={{
                      display: 'block', textAlign: 'center',
                      background: '#0f172a', color: '#fff',
                      padding: '0.6rem', borderRadius: '8px',
                      textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem',
                      transition: 'background 0.2s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1e3a5f'}
                      onMouseLeave={e => e.currentTarget.style.background = '#0f172a'}
                    >
                      View & Apply →
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {browseTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem', marginTop: '2rem' }}>
                <button
                  onClick={() => setBrowsePage(p => Math.max(1, p - 1))}
                  disabled={browsePage === 1}
                  style={{
                    padding: '0.5rem 1.2rem', borderRadius: '8px',
                    border: '1px solid #e2e8f0', background: browsePage === 1 ? '#f1f5f9' : '#fff',
                    cursor: browsePage === 1 ? 'not-allowed' : 'pointer',
                    color: browsePage === 1 ? '#94a3b8' : '#0f172a', fontWeight: '600'
                  }}
                >← Prev</button>

                {Array.from({ length: browseTotalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setBrowsePage(p)} style={{
                    padding: '0.5rem 0.9rem', borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: browsePage === p ? '#0f172a' : '#fff',
                    color: browsePage === p ? '#fff' : '#0f172a',
                    cursor: 'pointer', fontWeight: '600'
                  }}>{p}</button>
                ))}

                <button
                  onClick={() => setBrowsePage(p => Math.min(browseTotalPages, p + 1))}
                  disabled={browsePage === browseTotalPages}
                  style={{
                    padding: '0.5rem 1.2rem', borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: browsePage === browseTotalPages ? '#f1f5f9' : '#fff',
                    cursor: browsePage === browseTotalPages ? 'not-allowed' : 'pointer',
                    color: browsePage === browseTotalPages ? '#94a3b8' : '#0f172a', fontWeight: '600'
                  }}
                >Next →</button>
              </div>
            )}
          </div>
        )}

        {/* ══ MY PROPOSALS ══ */}
        {activeTab === 'proposals' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>My Proposals</h2>
            {proposals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
                No proposals yet. Browse tasks and apply!
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
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
                        <td style={{ padding: '1rem', color: '#0f172a', fontWeight: '600' }}>{p.task_id?.title || 'N/A'}</td>
                        <td style={{ padding: '1rem', color: '#64748b' }}>${p.proposed_budget}</td>
                        <td style={{ padding: '1rem', color: '#64748b' }}>{new Date(p.submitted_at).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700',
                            background: p.status === 'pending' ? '#fef9c3' : p.status === 'accepted' ? '#dcfce7' : '#fee2e2',
                            color: p.status === 'pending' ? '#ca8a04' : p.status === 'accepted' ? '#16a34a' : '#dc2626'
                          }}>{p.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ ACTIVE PROJECTS ══ */}
        {activeTab === 'active' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Active Projects</h2>
            {activeProposals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔧</div>
                No active projects yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {activeProposals.map(p => (
                  <div key={p._id} style={{
                    background: '#fff', padding: '1.5rem', borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    borderLeft: '4px solid #22c55e'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h3 style={{ color: '#0f172a', margin: '0 0 0.4rem', fontWeight: '700' }}>{p.task_id?.title}</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Budget: <strong style={{ color: '#22c55e' }}>${p.proposed_budget}</strong></p>
                      </div>
                      {p.task_id?.status !== 'completed' ? (
                        <button onClick={() => setDeliverableModal(p.task_id?._id)} style={{
                          background: '#22c55e', color: '#fff', border: 'none',
                          padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer',
                          fontWeight: '600', fontSize: '0.9rem'
                        }}>📤 Submit Deliverable</button>
                      ) : (
                        <span style={{
                          padding: '0.4rem 1rem', borderRadius: '20px',
                          background: '#dcfce7', color: '#16a34a', fontWeight: '700', fontSize: '0.85rem'
                        }}>✅ Completed</span>
                      )}
                    </div>
                    {p.task_id?.deliverable_url && (
                      <a href={p.task_id.deliverable_url} target="_blank" rel="noreferrer" style={{
                        display: 'inline-block', marginTop: '0.8rem',
                        color: '#3b82f6', fontSize: '0.85rem', textDecoration: 'underline'
                      }}>🔗 View Deliverable</a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ EARNINGS ══ */}
        {activeTab === 'earnings' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>My Earnings</h2>
            {earnings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💸</div>
                No earnings yet. Complete tasks to earn!
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', background: '#fff', borderRadius: '12px', borderCollapse: 'collapse', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', color: '#fff' }}>
                      {['Task Title', 'Client', 'Amount Made', 'Completion Date'].map(h => (
                        <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.map(e => (
                      <tr key={e._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem', color: '#0f172a', fontWeight: '600' }}>{e.task_id?.title || 'N/A'}</td>
                        <td style={{ padding: '1rem', color: '#64748b' }}>{e.client_email}</td>
                        <td style={{ padding: '1rem', color: '#16a34a', fontWeight: '700', fontSize: '1.05rem' }}>${e.amount}</td>
                        <td style={{ padding: '1rem', color: '#64748b' }}>{new Date(e.paid_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ EDIT PROFILE ══ */}
        {activeTab === 'profile' && (
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', maxWidth: '520px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Edit Profile</h2>
            {success && (
              <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: '600' }}>
                ✅ {success}
              </div>
            )}
            <form onSubmit={handleProfileUpdate}>
              {[
                { label: 'Name', key: 'name', type: 'text', placeholder: 'Your full name' },
                { label: 'Profile Image URL', key: 'image', type: 'url', placeholder: 'https://...' },
                { label: 'Skills (comma separated)', key: 'skills', type: 'text', placeholder: 'React, Node.js, Design' },
                { label: 'Hourly Rate (USD)', key: 'hourlyRate', type: 'number', placeholder: '25' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#374151', fontSize: '0.95rem' }}>{field.label}</label>
                  <input
                    type={field.type}
                    value={profileForm[field.key]}
                    placeholder={field.placeholder}
                    onChange={e => setProfileForm({ ...profileForm, [field.key]: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#374151', fontSize: '0.95rem' }}>Bio</label>
                <textarea
                  value={profileForm.bio}
                  placeholder="Tell clients about yourself..."
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={4}
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
              <button type="submit" style={{
                width: '100%', padding: '0.85rem', background: '#0f172a', color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
                transition: 'background 0.2s'
              }}
                onMouseEnter={e => e.target.style.background = '#1e3a5f'}
                onMouseLeave={e => e.target.style.background = '#0f172a'}
              >
                Update Profile
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ── Deliverable Modal ── */}
      {deliverableModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#0f172a', fontSize: '1.2rem' }}>📤 Submit Deliverable</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.2rem' }}>Paste your GitHub link, Google Doc, or any deliverable URL below.</p>
            {deliverableError && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.7rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {deliverableError}
              </div>
            )}
            <input
              type="url"
              value={deliverableUrl}
              onChange={e => setDeliverableUrl(e.target.value)}
              placeholder="https://github.com/your-repo"
              style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleDeliverable} style={{ flex: 1, padding: '0.8rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
                ✅ Submit
              </button>
              <button onClick={() => { setDeliverableModal(null); setDeliverableError(''); }} style={{ flex: 1, padding: '0.8rem', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}