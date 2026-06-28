'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { useSession } from '@/lib/auth-client';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');

  const user = session?.user;


  
  useEffect(() => {
    if (isPending) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchUsers();
    fetchTasks();
    fetchPayments();
  }, [isPending, user]);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('fetchUsers failed:', err.message);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axiosInstance.get('/tasks', { params: { limit: 100 } });
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('fetchTasks failed:', err.message);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await axiosInstance.get('/payments/all');
      setPayments(res.data);
    } catch (err) {
      console.error('fetchPayments failed:', err.message);
    }
  };

  const handleBlockToggle = async (id, isBlocked) => {
    await axiosInstance.put(`/users/${id}/block`, { isBlocked: !isBlocked });
    fetchUsers();
  };

  const handleDeleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    await axiosInstance.delete(`/tasks/${id}`);
    fetchTasks();
  };

  const stats = {
    totalUsers: users.length,
    totalTasks: tasks.length,
    totalRevenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    activeTasks: tasks.filter(t => t.status === 'in-progress').length,
  };

  const tabLabels = [
    { key: 'stats', label: '📊 Overview' },
    { key: 'users', label: '👥 Manage Users' },
    { key: 'tasks', label: '📋 Manage Tasks' },
    { key: 'transactions', label: '💳 Transactions' },
  ];

  if (isPending) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '80vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px', background: '#0f172a', color: '#fff',
        padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'
      }}>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '1rem' }}>ADMIN MENU</p>
        {tabLabels.map(tab => (
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
          Admin Panel — {user?.name}
        </h1>

        {/* Stats */}
        {activeTab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[
              { label: 'Total Users', value: stats.totalUsers, color: '#3b82f6' },
              { label: 'Total Tasks', value: stats.totalTasks, color: '#22c55e' },
              { label: 'Total Revenue', value: `$${stats.totalRevenue}`, color: '#8b5cf6' },
              { label: 'Active Tasks', value: stats.activeTasks, color: '#f59e0b' },
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

        {/* Manage Users */}
        {activeTab === 'users' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Manage Users</h2>
            {users.length === 0 ? <p style={{ color: '#94a3b8' }}>No users found.</p> : (
              <table style={{ width: '100%', background: '#fff', borderRadius: '12px', borderCollapse: 'collapse', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#fff' }}>
                    {['Name', 'Email', 'Role', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', color: '#0f172a' }}>{u.name}</td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>{u.email}</td>
                      <td style={{ padding: '1rem', color: '#64748b', textTransform: 'capitalize' }}>{u.role}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600',
                          background: u.isBlocked ? '#fee2e2' : '#dcfce7',
                          color: u.isBlocked ? '#dc2626' : '#16a34a'
                        }}>{u.isBlocked ? 'Blocked' : 'Active'}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {u.role !== 'admin' && (
                          <button onClick={() => handleBlockToggle(u._id, u.isBlocked)} style={{
                            background: u.isBlocked ? '#22c55e' : '#ef4444',
                            color: '#fff', border: 'none', padding: '0.4rem 0.9rem',
                            borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem'
                          }}>{u.isBlocked ? 'Unblock' : 'Block'}</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Manage Tasks */}
        {activeTab === 'tasks' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Manage Tasks</h2>
            {tasks.length === 0 ? <p style={{ color: '#94a3b8' }}>No tasks found.</p> : (
              <table style={{ width: '100%', background: '#fff', borderRadius: '12px', borderCollapse: 'collapse', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#fff' }}>
                    {['Title', 'Category', 'Budget', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', color: '#0f172a' }}>{t.title}</td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>{t.category}</td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>${t.budget}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600',
                          background: t.status === 'open' ? '#dcfce7' : t.status === 'in-progress' ? '#fef9c3' : '#dbeafe',
                          color: t.status === 'open' ? '#16a34a' : t.status === 'in-progress' ? '#ca8a04' : '#1d4ed8'
                        }}>{t.status}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={() => handleDeleteTask(t._id)} style={{
                          background: '#ef4444', color: '#fff', border: 'none',
                          padding: '0.4rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem'
                        }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Transactions */}
        {activeTab === 'transactions' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Transactions History</h2>
            {payments.length === 0 ? <p style={{ color: '#94a3b8' }}>No transactions found.</p> : (
              <table style={{ width: '100%', background: '#fff', borderRadius: '12px', borderCollapse: 'collapse', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#fff' }}>
                    {['Client Email', 'Freelancer Email', 'Amount', 'Date', 'Status'].map(h => (
                      <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', color: '#0f172a' }}>{p.client_email}</td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>{p.freelancer_email}</td>
                      <td style={{ padding: '1rem', color: '#16a34a', fontWeight: '700' }}>${p.amount}</td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>{new Date(p.paid_at).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600',
                          background: '#dcfce7', color: '#16a34a'
                        }}>{p.payment_status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}