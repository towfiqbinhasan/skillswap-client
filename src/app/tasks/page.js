'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

const CATEGORIES = ['All', 'Design', 'Writing', 'Development', 'Marketing', 'Other'];

function BrowseTasksContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const fetchTasks = useCallback(async (s, cat, p) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 9 };
      if (s) params.search = s;
      if (cat && cat !== 'All') params.category = cat;

      const res = await axiosInstance.get('/tasks', { params });
      setTasks(res.data.tasks || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch whenever search, category, or page changes
  useEffect(() => {
    fetchTasks(search, category, page);
  }, [search, category, page, fetchTasks]);

  // Debounce search input — no page reload needed
  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '80vh', background: '#f8fafc' }}>

      {/* ── Header Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        color: '#fff', padding: '3rem 2rem', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
          Browse Tasks
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
          {totalCount} open tasks waiting for skilled freelancers
        </p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>

        {/* ── Search + Filter Bar ── */}
        <div style={{
          background: '#fff', borderRadius: '14px', padding: '1.5rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: '2rem',
          display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center'
        }}>
          {/* Search input */}
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '1rem', top: '50%',
              transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1rem'
            }}>🔍</span>
            <input
              type="text"
              placeholder="Search tasks by title..."
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                borderRadius: '8px', border: '1px solid #e2e8f0',
                fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#38bdf8'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* Category dropdown */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={category}
              onChange={e => handleCategoryChange(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem',
                borderRadius: '8px', border: '1px solid #e2e8f0',
                fontSize: '0.95rem', outline: 'none', background: '#fff',
                cursor: 'pointer', color: '#0f172a'
              }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? '📂 All Categories' : cat}</option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          {(search || category !== 'All') && (
            <button
              onClick={() => { setSearch(''); setCategory('All'); setPage(1); }}
              style={{
                background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                padding: '0.75rem 1.2rem', borderRadius: '8px',
                cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap'
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* ── Category Pills ── */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              style={{
                padding: '0.4rem 1rem', borderRadius: '20px',
                border: '2px solid',
                borderColor: category === cat ? '#0f172a' : '#e2e8f0',
                background: category === cat ? '#0f172a' : '#fff',
                color: category === cat ? '#fff' : '#64748b',
                fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Task Cards ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem', background: '#fff',
            borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔎</div>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No tasks found.</p>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Try a different search or category.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {tasks.map(task => (
              <div key={task._id} style={{
                background: '#fff', borderRadius: '14px', padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
              >
                <div>
                  {/* Category badge */}
                  <span style={{
                    background: '#dbeafe', color: '#1d4ed8',
                    padding: '0.2rem 0.7rem', borderRadius: '20px',
                    fontSize: '0.78rem', fontWeight: '700'
                  }}>{task.category}</span>

                  <h3 style={{
                    margin: '0.8rem 0 0.5rem', color: '#0f172a',
                    fontSize: '1.05rem', fontWeight: '700', lineHeight: 1.4
                  }}>{task.title}</h3>

                  <p style={{
                    color: '#64748b', fontSize: '0.85rem',
                    lineHeight: 1.6, marginBottom: '1rem',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {task.description}
                  </p>

                  {/* Task meta info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.2rem' }}>
                    {[
                      { icon: '👤', label: 'Client', value: task.client_email?.split('@')[0] || 'Client' },
                      { icon: '💰', label: 'Budget', value: `$${task.budget}` },
                      { icon: '📅', label: 'Deadline', value: new Date(task.deadline).toLocaleDateString() },
                      { icon: '📂', label: 'Category', value: task.category },
                    ].map(item => (
                      <div key={item.label} style={{
                        background: '#f8fafc', padding: '0.5rem 0.7rem', borderRadius: '6px'
                      }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.72rem', marginBottom: '0.1rem' }}>
                          {item.icon} {item.label}
                        </p>
                        <p style={{ color: '#0f172a', fontWeight: '600', fontSize: '0.85rem' }}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <Link href={`/tasks/${task._id}`} style={{
                  background: '#0f172a', color: '#fff',
                  padding: '0.65rem 1rem', borderRadius: '8px',
                  textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem',
                  textAlign: 'center', display: 'block', transition: 'background 0.2s'
                }}
                  onMouseEnter={e => e.target.style.background = '#1e3a5f'}
                  onMouseLeave={e => e.target.style.background = '#0f172a'}
                >
                  View & Apply →
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: '0.5rem', marginTop: '3rem', flexWrap: 'wrap'
          }}>
            {/* Previous */}
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              style={{
                padding: '0.6rem 1.2rem', borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: page === 1 ? '#f1f5f9' : '#fff',
                color: page === 1 ? '#94a3b8' : '#0f172a',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontWeight: '600', fontSize: '0.9rem'
              }}
            >
              ← Prev
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                style={{
                  padding: '0.6rem 1rem', borderRadius: '8px',
                  border: '1px solid',
                  borderColor: page === p ? '#0f172a' : '#e2e8f0',
                  background: page === p ? '#0f172a' : '#fff',
                  color: page === p ? '#fff' : '#64748b',
                  cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
                  minWidth: '40px', transition: 'all 0.2s'
                }}
              >
                {p}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              style={{
                padding: '0.6rem 1.2rem', borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: page === totalPages ? '#f1f5f9' : '#fff',
                color: page === totalPages ? '#94a3b8' : '#0f172a',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                fontWeight: '600', fontSize: '0.9rem'
              }}
            >
              Next →
            </button>
          </div>
        )}

        {/* Pagination info */}
        {totalCount > 0 && (
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', marginTop: '1rem' }}>
            Showing page {page} of {totalPages} — {totalCount} total tasks
          </p>
        )}
      </div>
    </div>
  );
}

export default function BrowseTasksPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
        Loading tasks...
      </div>
    }>
      <BrowseTasksContent />
    </Suspense>
  );
}