import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  LayoutDashboard, TrendingDown, TrendingUp, Wallet,
  BarChart3, Target, Settings, LogOut, Menu, X,
  Moon, Sun, Bell, ChevronDown, Plus
} from 'lucide-react';
import { useAuthStore, useThemeStore, useWalletStore } from '../../store';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/expenses', icon: TrendingDown, label: 'Expenses' },
  { path: '/income', icon: TrendingUp, label: 'Income' },
  { path: '/wallet', icon: Wallet, label: 'Wallets' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/budget', icon: Target, label: 'Budget' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { activeWallet, wallets } = useWalletStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <AnimatePresence>
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          style={{
            width: sidebarOpen ? 260 : 72,
            minHeight: '100vh',
            background: 'var(--bg-surface)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'hidden',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          {/* Logo */}
          <div style={{
            padding: '1.5rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontSize: '1.2rem',
            }}>💰</div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ overflow: 'hidden' }}
              >
                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  ExpenseTracker
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Personal Finance</p>
              </motion.div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                marginLeft: 'auto', background: 'transparent', border: 'none',
                color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem',
              }}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* Active Wallet */}
          {sidebarOpen && activeWallet && (
            <div style={{
              margin: '1rem', padding: '0.75rem 1rem',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: 12,
            }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Active Wallet</p>
              <p style={{ fontWeight: 600, color: 'var(--brand-primary)', fontSize: '0.85rem' }}>
                {activeWallet.icon} {activeWallet.name}
              </p>
            </div>
          )}

          {/* Nav Items */}
          <nav style={{ flex: 1, padding: '0.5rem', overflowY: 'auto' }}>
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
              <NavLink key={path} to={path} className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
                <Icon size={19} style={{ flexShrink: 0 }} />
                {sidebarOpen && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* User */}
          <div style={{ borderTop: '1px solid var(--border)', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '0.9rem',
                overflow: 'hidden',
              }}>
                {user?.avatar
                  ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (user?.name?.[0] || 'U')}
              </div>
              {sidebarOpen && (
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="btn-ghost"
              style={{ width: '100%', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
            >
              <LogOut size={16} />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Top Bar */}
        <header style={{
          height: 64,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.5rem',
          gap: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 5,
        }}>
          <div style={{ flex: 1 }} />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-ghost"
            style={{ padding: '0.5rem', width: 38, height: 38, justifyContent: 'center' }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notifications */}
          <button className="btn-ghost" style={{ padding: '0.5rem', width: 38, height: 38, justifyContent: 'center', position: 'relative' }}>
            <Bell size={16} />
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--danger)',
            }} />
          </button>

          {/* Add Transaction */}
          <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
            <Plus size={15} /> Add
          </button>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '1.5rem' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
