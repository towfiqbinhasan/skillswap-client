'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { useSession } from '@/lib/auth-client';

export default function ClientDashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [form, setForm] = useState({
    title: '', category: 'Design', description: '', budget: '', deadline: ''
  });
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) { router.push('/login'); return; }
    const u = session.user;
    if (u.role !== 'client') { router.push('/'); return; }
    setUser(u);
    fetchTasks(u.email);
    fetchPayments(u.email);
  }, [isPending, session]);

  const fetchTasks = async (email) => {
    try {
      const res = await axiosInstance.get(`/tasks/client/${email}`);
      setTasks(res.data);
    } catch (err) {}
  };

  const fetchPayments = async (email) => {
    try {
      const res = await axiosInstance.get(`/payments/client/${email}`);
      setPayments(res.data);
    } catch (err) {}
  };

  const fetchProposals = async () => {
    const allProposals = [];
    for (const task of tasks) {
      try {
        const res = await axiosInstance.get(`/proposals/task/${task._id}`);
        res.data.forEach(p => allProposals.push({ ...p, taskTitle: task.title }));
      } catch (err) {}
    }
    setProposals(allProposals);
  };

  useEffect(() => {
    if (activeTab === 'proposals' && tasks.length > 0) fetchProposals();
  }, [activeTab, tasks]);

  const handlePostTask = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await axiosInstance.post('/tasks', { ...form, client_email: user.email });
      setSuccess('Task posted successfully!');
      setForm({ title: '', category: 'Design', description: '', budget: '', deadline: '' });
      fetchTasks(user.email);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      fetchTasks(user.email);
    } catch (err) {}
  };

  const handleEditClick = (task) => {
    setEditingTask(task._id);
    setEditForm({
      title: task.title,
      category: task.category,
      description: task.description,
      budget: task.budget,
      deadline: task.deadline?.split('T')[0]
    });
  };

  const handleEditSave = async (id) => {
    try {
      await axiosInstance.put(`/tasks/${id}`, editForm);
      setEditingTask(null);
      fetchTasks(user.email);
      setSuccess('Task updated!');
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleAccept = async (proposalId, taskId, freelancerEmail, amount, taskTitle) => {
    try {
      await axiosInstance.put(`/proposals/${proposalId}/accept`);
      const res = await axiosInstance.post('/payments/create-checkout-session', {
        task_id: taskId, freelancer_email: freelancerEmail,
        amount, task_title: taskTitle
      });
      window.location.href = res.data.url;
    } catch (err) {
      setError('Payment failed. Try again.');
    }
  };

  const handleReject = async (proposalId) => {
    try {
      await axiosInstance.put(`/proposals/${proposalId}/reject`);
      fetchProposals();
    } catch (err) {}
  };

  const totalSpent = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const stats = {
    total: tasks.length,
    open: tasks.filter(t => t.status === 'open').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    spent: totalSpent
  };

  const inputStyle = {
    width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
    border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none',
    boxSizing: 'border-box'
  };

  if (isPending) return (
    <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>
      Loading...
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '80vh' }}>

      {/* Sidebar */}
      <aside style={{
        width: '220px', background: '#0f172a', color: '#fff',
        padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
        flexShrink: 0
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: '#38bdf8', fontWeight: '700', fontSize: '1rem' }}>{user?.name}</p>
          <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Client Account</p>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>CLIENT MENU</p>
        {[
          { key: 'stats', label: '📊 Overview' },
          { key: 'post-task', label: '➕ Post Task' },
          { key: 'my-tasks', label: '📋 My Tasks' },
          { key: 'proposals', label: '📨 Proposals' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            background: activeTab === tab.key ? '#38bdf8' : 'transparent',
            color: activeTab === tab.key ? '#0f172a' : '#cbd5e1',
            border: 'none', padding: '0.7rem 1rem', borderRadius: '8px',
            textAlign: 'left', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem'
          }}>{tab.label}</button>
        ))}
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', background: '#f8fafc', overflowX: 'hidden' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#0f172a', marginBottom: '2rem' }}>
          Welcome, {user?.name}!
        </h1>

        {/* ── Stats ── */}
        {activeTab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
            {[
              { label: 'Total Tasks', value: stats.total, color: '#3b82f6', icon: '📋' },
              { label: 'Open Tasks', value: stats.open, color: '#22c55e', icon: '🟢' },
              { label: 'In Progress', value: stats.inProgress, color: '#f59e0b', icon: '🔧' },
              { label: 'Total Spent (USD)', value: `$${stats.spent}`, color: '#8b5cf6', icon: '💰' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: '#fff', padding: '1.5rem', borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${stat.color}`
              }}>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  {stat.icon} {stat.label}
                </p>
                <p style={{ fontSize: '1.8rem', fontWeight: '700', color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Post Task ── */}
        {activeTab === 'post-task' && (
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Post a New Task</h2>
            {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
            {success && <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}
            <form onSubmit={handlePostTask}>
              {[
                { label: 'Task Title', key: 'title', type: 'text', placeholder: 'Design a logo' },
                { label: 'Budget (USD)', key: 'budget', type: 'number', placeholder: '500' },
                { label: 'Deadline', key: 'deadline', type: 'date', placeholder: '' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#374151' }}>{field.label}</label>
                  <input type={field.type} required value={form[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder} style={inputStyle} />
                </div>
              ))}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#374151' }}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  style={{ ...inputStyle }}>
                  {['Design', 'Writing', 'Development', 'Marketing', 'Other'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#374151' }}>Description</label>
                <textarea required value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4} placeholder="Describe your task..."
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <button type="submit" style={{
                width: '100%', padding: '0.8rem', background: '#0f172a',
                color: '#fff', border: 'none', borderRadius: '8px',
                fontSize: '1rem', fontWeight: '600', cursor: 'pointer'
              }}>Post Task</button>
            </form>
          </div>
        )}

        {/* ── My Tasks ── */}
        {activeTab === 'my-tasks' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>My Tasks</h2>
            {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
            {success && <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}
            {tasks.length === 0 ? <p style={{ color: '#94a3b8' }}>No tasks yet.</p> : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {tasks.map(task => (
                  <div key={task._id} style={{
                    background: '#fff', padding: '1.5rem', borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    {editingTask === task._id ? (
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>Title</label>
                            <input value={editForm.title}
                              onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                              style={{ ...inputStyle, marginTop: '0.3rem' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>Budget (USD)</label>
                            <input type="number" value={editForm.budget}
                              onChange={e => setEditForm({ ...editForm, budget: e.target.value })}
                              style={{ ...inputStyle, marginTop: '0.3rem' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>Deadline</label>
                            <input type="date" value={editForm.deadline}
                              onChange={e => setEditForm({ ...editForm, deadline: e.target.value })}
                              style={{ ...inputStyle, marginTop: '0.3rem' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>Category</label>
                            <select value={editForm.category}
                              onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                              style={{ ...inputStyle, marginTop: '0.3rem' }}>
                              {['Design', 'Writing', 'Development', 'Marketing', 'Other'].map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>Description</label>
                          <textarea value={editForm.description}
                            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                            rows={3} style={{ ...inputStyle, marginTop: '0.3rem', resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEditSave(task._id)} style={{
                            background: '#22c55e', color: '#fff', border: 'none',
                            padding: '0.5rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                          }}>Save</button>
                          <button onClick={() => setEditingTask(null)} style={{
                            background: '#e2e8f0', color: '#374151', border: 'none',
                            padding: '0.5rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                          }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <h3 style={{ margin: 0, color: '#0f172a' }}>{task.title}</h3>
                          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.3rem 0' }}>
                            {task.category} • ${task.budget} • Due: {new Date(task.deadline).toLocaleDateString()}
                          </p>
                          <span style={{
                            padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600',
                            background: task.status === 'open' ? '#dcfce7' : task.status === 'in-progress' ? '#fef9c3' : '#dbeafe',
                            color: task.status === 'open' ? '#16a34a' : task.status === 'in-progress' ? '#ca8a04' : '#1d4ed8'
                          }}>{task.status}</span>
                        </div>
                        {task.status === 'open' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleEditClick(task)} style={{
                              background: '#3b82f6', color: '#fff', border: 'none',
                              padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                            }}>✏️ Edit</button>
                            <button onClick={() => handleDeleteTask(task._id)} style={{
                              background: '#ef4444', color: '#fff', border: 'none',
                              padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                            }}>Delete</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Proposals ── */}
        {activeTab === 'proposals' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Manage Proposals</h2>
            {proposals.length === 0 ? <p style={{ color: '#94a3b8' }}>No proposals yet.</p> : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {proposals.map(p => (
                  <div key={p._id} style={{
                    background: '#fff', padding: '1.5rem', borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    <p style={{ fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                      📋 Task: {p.taskTitle}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>👤 Freelancer: {p.freelancer_email}</p>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>💰 Budget: ${p.proposed_budget} • ⏱ Days: {p.estimated_days}</p>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>📝 Note: {p.cover_note}</p>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600',
                      background: p.status === 'pending' ? '#fef9c3' : p.status === 'accepted' ? '#dcfce7' : '#fee2e2',
                      color: p.status === 'pending' ? '#ca8a04' : p.status === 'accepted' ? '#16a34a' : '#dc2626'
                    }}>{p.status}</span>
                    {p.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button onClick={() => handleAccept(p._id, p.task_id, p.freelancer_email, p.proposed_budget, p.taskTitle)}
                          style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                          ✅ Accept & Pay
                        </button>
                        <button onClick={() => handleReject(p._id)}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                          ❌ Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}