import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { reportApi } from '../../api';
import { useWalletStore } from '../../store';

const formatCurrency = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v || 0);

const CATEGORY_COLORS = { food: '#f59e0b', fuel: '#ef4444', rent: '#8b5cf6', shopping: '#3b82f6', bills: '#06b6d4', entertainment: '#ec4899', travel: '#14b8a6', health: '#22c55e', education: '#6366f1', investment: '#f97316', others: '#94a3b8' };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {formatCurrency(p.value)}</p>)}
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const { activeWallet } = useWalletStore();
  const [period, setPeriod] = useState('monthly');
  const now = new Date();

  const { data, isLoading } = useQuery({
    queryKey: ['reports', activeWallet?._id, period],
    queryFn: () => period === 'monthly'
      ? reportApi.getMonthly(activeWallet._id, { month: now.getMonth() + 1, year: now.getFullYear() }).then(r => r.data.data)
      : reportApi.getYearly(activeWallet._id, { year: now.getFullYear() }).then(r => r.data.data),
    enabled: !!activeWallet?._id,
  });

  const { data: dashData } = useQuery({
    queryKey: ['dashboard', activeWallet?._id],
    queryFn: () => reportApi.getDashboard(activeWallet._id).then(r => r.data.data),
    enabled: !!activeWallet?._id,
  });

  const monthlyData = (dashData?.expenseMonthlyTrend || []).map((exp) => {
    const inc = (dashData?.incomeMonthlyTrend || []).find(i => i._id.month === exp._id.month && i._id.year === exp._id.year);
    return {
      name: new Date(exp._id.year, exp._id.month - 1).toLocaleString('default', { month: 'short' }),
      Expense: exp.total, Income: inc?.total || 0,
      Net: (inc?.total || 0) - exp.total,
    };
  });

  const pieData = (dashData?.categoryBreakdown || []).map((c) => ({ name: c._id, value: c.total, color: CATEGORY_COLORS[c._id] || '#94a3b8' }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Reports 📊</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Analytics and financial insights</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['monthly', 'yearly'].map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={period === p ? 'btn-primary' : 'btn-ghost'}
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', textTransform: 'capitalize' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { label: 'Total Income', value: data.totalIncome, color: '#22c55e' },
            { label: 'Total Expense', value: data.totalExpense, color: '#ef4444' },
            { label: 'Net Balance', value: data.balance, color: data.balance >= 0 ? '#22c55e' : '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{formatCurrency(value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Income vs Expense Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '1.5rem' }}>
        <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Monthly Income vs Expense</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>6-month comparison</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
            <Bar dataKey="Income" fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={40} />
            <Bar dataKey="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Category Breakdown + Net Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '1.5rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Expense by Category</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Breakdown of spending</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(val) => formatCurrency(val)} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
            {pieData.slice(0, 5).map((d) => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{d.name}</span>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Net Savings Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card" style={{ padding: '1.5rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Net Savings Trend</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Monthly net (Income - Expense)</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Net" stroke="#6366f1" fill="url(#netGrad)" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
