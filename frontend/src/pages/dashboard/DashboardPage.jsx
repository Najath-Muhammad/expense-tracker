import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, TrendingDown, Wallet, Calendar,
  ArrowUpRight, ArrowDownRight, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { reportApi } from '../../api';
import { useWalletStore } from '../../store';
import { format } from 'date-fns';

const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(amount || 0);

const CATEGORY_COLORS = {
  food: '#f59e0b', fuel: '#ef4444', rent: '#8b5cf6', shopping: '#3b82f6',
  bills: '#06b6d4', entertainment: '#ec4899', travel: '#14b8a6',
  health: '#10B981', education: '#6366f1', investment: '#f97316', others: '#94a3b8',
};

const CATEGORY_EMOJIS = {
  food: '🍔', fuel: '⛽', rent: '🏠', shopping: '🛍️', bills: '💡',
  entertainment: '🎮', travel: '✈️', health: '💊', education: '📚',
  investment: '📈', others: '💰',
};

/* ─── Stat Card ──────────────────────────────────────────────────────── */
function StatCard({ title, value, subtitle, icon: Icon, color, trend, trendValue, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="stat-card"
      style={{ padding: '1.5rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} style={{ color }} />
        </div>
        {trend && (
          <div className={`badge ${trend === 'up' ? 'badge-success' : 'badge-danger'}`}>
            {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trendValue}
          </div>
        )}
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</p>
      <p style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{value}</p>
      {subtitle && <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{subtitle}</p>}
    </motion.div>
  );
}

/* ─── Chart Tooltip ──────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '0.75rem 1rem', fontSize: '0.8rem',
        boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: 700 }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ─── Weekly Bar Tooltip ─────────────────────────────────────────────── */
const WeeklyTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '0.6rem 1rem', fontSize: '0.8rem',
        boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>{label}</p>
        <p style={{ color: '#10B981', fontWeight: 700 }}>{formatCurrency(payload[0]?.value)}</p>
      </div>
    );
  }
  return null;
};

/* ─── Dashboard Page ─────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { activeWallet } = useWalletStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard', activeWallet?._id],
    queryFn: () => reportApi.getDashboard(activeWallet?._id).then((r) => r.data.data),
    enabled: !!activeWallet?._id,
    staleTime: 30000,
  });

  if (!activeWallet) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>👛</p>
        <h2 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No Wallet Selected</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Create or select a wallet to see your dashboard</p>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Balance',
      value: formatCurrency(data?.balance),
      icon: Wallet,
      color: '#10B981',
      subtitle: 'All time · Income − Expenses',
      delay: 0,
    },
    {
      title: 'Total Income',
      value: formatCurrency(data?.totalIncome),
      icon: TrendingUp,
      color: '#10B981',
      trend: 'up',
      trendValue: '+All time',
      delay: 0.05,
    },
    {
      title: 'Total Expense',
      value: formatCurrency(data?.totalExpense),
      icon: TrendingDown,
      color: '#F43F5E',
      trend: 'down',
      trendValue: 'All time',
      delay: 0.1,
    },
    {
      title: "Today's Expense",
      value: formatCurrency(data?.todayExpense ?? 0),
      icon: Calendar,
      color: '#F59E0B',
      subtitle: format(new Date(), 'EEEE, MMM d'),
      delay: 0.15,
    },
  ];

  // Merge monthly trends for area chart
  const monthlyChartData = (data?.expenseMonthlyTrend || []).map((exp) => {
    const inc = (data?.incomeMonthlyTrend || []).find(
      (i) => i._id.month === exp._id.month && i._id.year === exp._id.year
    );
    return {
      name: new Date(exp._id.year, exp._id.month - 1).toLocaleString('default', { month: 'short' }),
      Expense: exp.total,
      Income: inc?.total || 0,
    };
  });

  // Weekly data (Mon-Sun)
  const weeklyChartData = data?.weeklyExpense || [];
  const weeklyTotal = weeklyChartData.reduce((s, d) => s + d.amount, 0);

  // Pie chart
  const pieData = (data?.categoryBreakdown || []).slice(0, 6).map((c) => ({
    name: c._id,
    value: c.total,
    color: CATEGORY_COLORS[c._id] || '#94a3b8',
  }));

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card skeleton" style={{ padding: '1.5rem', height: 140 }} />
          ))}
        </div>
        <div className="glass-card skeleton" style={{ height: 280 }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Dashboard <span style={{ fontSize: '1rem' }}>✨</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {activeWallet?.icon} {activeWallet?.name} · {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>
        <button className="btn-ghost" onClick={() => refetch()} style={{ fontSize: '0.8rem' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Row 1: Monthly Area Chart + Pie */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        {/* Monthly Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
          style={{ padding: '1.5rem' }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Overview</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Income vs Expenses — last 6 months</p>
          </div>
          {monthlyChartData.length === 0 ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ fontSize: '2rem' }}>📊</p>
              <p style={{ fontSize: '0.85rem' }}>No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyChartData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F43F5E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '1rem', fontSize: '0.8rem' }} />
                <Area type="monotone" dataKey="Income"  stroke="#10B981" fill="url(#incomeGrad)"  strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="Expense" stroke="#F43F5E" fill="url(#expenseGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card"
          style={{ padding: '1.5rem' }}
        >
          <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>By Category</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Expense breakdown</p>
          {pieData.length === 0 ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ fontSize: '2rem' }}>🥧</p>
              <p style={{ fontSize: '0.85rem' }}>No expenses yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
            {pieData.map((d) => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{d.name}</span>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 2: Weekly Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
        style={{ padding: '1.5rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>This Week's Spending</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily expense — Mon to Sun</p>
          </div>
          <div style={{
            background: 'var(--brand-primary-dim)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 10,
            padding: '0.4rem 0.9rem',
          }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>Week Total</p>
            <p style={{ fontWeight: 800, color: 'var(--brand-primary)', fontSize: '1rem' }}>{formatCurrency(weeklyTotal)}</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyChartData} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => v === 0 ? '' : `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<WeeklyTooltip />} cursor={{ fill: 'rgba(16,185,129,0.06)', radius: 8 }} />
            <Bar dataKey="amount" name="Expense" radius={[8, 8, 0, 0]}>
              {weeklyChartData.map((entry, index) => {
                const today = new Date().getDay();
                // Convert getDay (0=Sun) to Mon-based index
                const todayMonIndex = today === 0 ? 6 : today - 1;
                const isToday = index === todayMonIndex;
                return (
                  <Cell
                    key={index}
                    fill={isToday ? '#10B981' : entry.amount > 0 ? 'rgba(16,185,129,0.4)' : 'var(--bg-hover)'}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
          Bright green bar = today
        </p>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card"
        style={{ padding: '1.5rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Recent Transactions</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latest activity</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(data?.recentExpenses || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '2rem' }}>💸</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>No recent transactions</p>
            </div>
          ) : (
            (data?.recentExpenses || []).map((expense, i) => (
              <motion.div
                key={expense._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.875rem 1rem',
                  background: 'var(--bg-elevated)',
                  borderRadius: 12, border: '1px solid var(--border)',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: `${CATEGORY_COLORS[expense.category] || '#6366f1'}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', flexShrink: 0,
                }}>
                  {CATEGORY_EMOJIS[expense.category] || '💰'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {expense.title}
                  </p>
                  <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {expense.category} · {format(new Date(expense.date), 'MMM d, yyyy')}
                  </p>
                </div>
                <p style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.95rem', flexShrink: 0 }}>
                  -{formatCurrency(expense.amount)}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
