'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import axiosInstance from '@/lib/axios';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);

    if (sessionId) {
      axiosInstance.get(`/payments/confirm-session?session_id=${sessionId}`)
        .then(res => setPayment(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0fdf4',
      padding: '2rem'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '3rem 2.5rem',
        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
        transition: 'opacity 0.6s ease, transform 0.6s ease'
      }}>

        {/* Success icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#dcfce7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '2.5rem'
        }}>
          ✅
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: '800',
          color: '#0f172a',
          marginBottom: '0.5rem'
        }}>
          Payment Successful!
        </h1>

        <p style={{
          color: '#64748b',
          fontSize: '0.95rem',
          marginBottom: '2rem',
          lineHeight: 1.6
        }}>
          Your payment has been confirmed. The freelancer has been notified and work will begin shortly.
        </p>

        {/* Payment details */}
        {loading ? (
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            color: '#94a3b8'
          }}>
            Loading payment details...
          </div>
        ) : payment ? (
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#0f172a', fontWeight: '700', marginBottom: '1rem', fontSize: '1rem' }}>
              Transaction Details
            </h3>
            {[
              { label: 'Task', value: payment.task_title || payment.task_id?.title || 'N/A' },
              { label: 'Freelancer', value: payment.freelancer_email || 'N/A' },
              { label: 'Amount Paid', value: `$${payment.amount}` },
              { label: 'Status', value: payment.payment_status || 'Paid' },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{item.label}</span>
                <span style={{
                  color: item.label === 'Amount Paid' ? '#16a34a' : '#0f172a',
                  fontWeight: item.label === 'Amount Paid' ? '700' : '600',
                  fontSize: '0.9rem'
                }}>{item.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            color: '#64748b',
            fontSize: '0.9rem'
          }}>
            Payment recorded successfully. Check your dashboard for details.
          </div>
        )}

        {/* Go to Dashboard button */}
        <Link href="/dashboard/client" style={{
          display: 'block',
          background: '#0f172a',
          color: '#fff',
          padding: '0.85rem',
          borderRadius: '10px',
          textDecoration: 'none',
          fontWeight: '700',
          fontSize: '1rem',
          marginBottom: '0.8rem',
          transition: 'background 0.2s'
        }}>
          Go to Dashboard →
        </Link>

        <Link href="/tasks" style={{
          display: 'block',
          color: '#64748b',
          textDecoration: 'none',
          fontSize: '0.9rem'
        }}>
          Browse more tasks
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
        Loading...
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}