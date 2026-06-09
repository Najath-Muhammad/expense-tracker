import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, AlertTriangle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWalletStore } from '../../store';
import api from '../../api/axios';

const formatCurrency = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v || 0);

const STATUS_CONFIG = {
  safe: { color: '#22c55e', label: 'On Track', icon: '✅' },
  warning: { color: '#f59e0b', label: 'Warning', icon: '⚠️' },
  critical: { color: '#f97316', label: 'Critical', icon: '🔴' },
  danger: { color: '#ef4444', label: 'Danger', icon: '🚨' },
  exceeded: { color: '#dc2626', label: 'Exceeded', icon: '💥' },
};

export default function BudgetPage() {
  const { activeWallet } = useWalletStore();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: budget, isLoading } = useQuery({
    queryKey: ['budget', activeWallet?._id, month, year],
    queryFn: () => api.get(`/wallets/${activeWallet._id}/budgets/current`)
      .then(r => r.data.data).catch(() => null),
    enabled: !!activeWallet?._id,
  });

  const handleSetBudget = async (e) => {
    e.preventDefault();
    if (!amount || !activeWallet) return;
    setLoading(true);
    try {
      await api.post(`/wallets/${activeWallet._id}/budgets`, { amount: Number(amount), month, year });
      toast.success('Budget set!');
      queryClient.invalidateQueries(['budget', activeWallet._id]);
      setAmount('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set budget');
    } finally {
      setLoading(false);
    }
  };

  const pct = budget ? Math.min(100, ((budget.spent / budget.amount) * 100)) : 0;
  const status = budget?.status || 'safe';
  const statusConfig = STATUS_CONFIG[status];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Budget 🎯</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Set and track your monthly spending limit
        </p>
      </div>

      {/* Set Budget */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '1.75rem' }}>
        <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.05rem' }}>
          Set Monthly Budget — {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
        <form onSubmit={handleSetBudget} style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>₹</span>
            <input
              type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="20000" className="input-base" style={{ paddingLeft: '2rem' }}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading || !amount}>
            {loading ? 'Setting...' : 'Set Budget'}
          </button>
        </form>
      </motion.div>

      {/* Current Budget Status */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
      ) : budget ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {statusConfig.icon} Budget Status
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <span className={`badge badge-${status === 'safe' ? 'success' : status === 'exceeded' ? 'danger' : 'warning'}`}>
              {statusConfig.label}
            </span>
          </div>

          {/* Numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Budget', value: budget.amount, color: 'var(--brand-primary)' },
              { label: 'Spent', value: budget.spent, color: pct >= 90 ? '#ef4444' : '#f59e0b' },
              { label: 'Remaining', value: Math.max(0, budget.amount - budget.spent), color: '#22c55e' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{label}</p>
                <p style={{ fontSize: '1.3rem', fontWeight: 800, color }}>{formatCurrency(value)}</p>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Progress</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: statusConfig.color }}>{pct.toFixed(1)}%</span>
            </div>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ background: `linear-gradient(90deg, ${statusConfig.color}, ${statusConfig.color}cc)` }}
              />
            </div>
          </div>

          {/* Threshold markers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            {[50, 75, 90, 100].map((threshold) => (
              <div key={threshold} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 2, height: 8, background: pct >= threshold ? statusConfig.color : 'var(--border)',
                  margin: '0 auto 0.25rem',
                }} />
                <span style={{ fontSize: '0.7rem', color: pct >= threshold ? statusConfig.color : 'var(--text-muted)' }}>{threshold}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2.5rem' }}>🎯</p>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '1rem' }}>No budget set</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Set a monthly budget above to start tracking</p>
        </div>
      )}
    </div>
  );
}
