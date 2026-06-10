import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, User, Lock, Bell, Palette, BellOff, BellRing, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useThemeStore, useAuthStore } from '../../store';
import { authApi } from '../../api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePushNotifications } from '../../hooks/usePushNotifications';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'Min 8 characters').regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/, 'Must be strong password'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

const profileSchema = z.object({
  name: z.string().min(2, 'Min 2 characters').max(50),
  phone: z.string().optional(),
});

function Section({ title, icon: Icon, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} style={{ color: 'var(--brand-primary)' }} />
        </div>
        <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{title}</p>
      </div>
      {children}
    </motion.div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeStore();
  const { user, refreshUser } = useAuthStore();
  const push = usePushNotifications();

  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: user?.name || '', phone: user?.phone || '' } });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const handleProfileUpdate = async (data) => {
    try {
      // Update profile API would go here
      toast.success('Profile updated!');
      await refreshUser?.();
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async (data) => {
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed! Please login again.');
      passwordForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 700 }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Settings ⚙️</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1.8rem',
            overflow: 'hidden', position: 'relative',
          }}>
            {user?.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.name?.[0] || 'U')}
          </div>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.email}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: '0.25rem' }}>
              Role: {user?.role} · Currency: {user?.currency}
            </p>
          </div>
        </div>

        <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Full Name</label>
              <input {...profileForm.register('name')} className="input-base" />
              {profileForm.formState.errors.name && <p style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{profileForm.formState.errors.name.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Phone</label>
              <input {...profileForm.register('phone')} className="input-base" placeholder="+91 98765 43210" />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.6rem 1.5rem' }}>
            Save Changes
          </button>
        </form>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon={Palette}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Theme</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Currently using {theme} mode
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {theme === 'dark' ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
          </button>
        </div>
      </Section>

      {/* Change Password */}
      <Section title="Security" icon={Lock}>
        <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { name: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
            { name: 'newPassword', label: 'New Password', placeholder: '••••••••' },
            { name: 'confirmPassword', label: 'Confirm New Password', placeholder: '••••••••' },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>{label}</label>
              <input {...passwordForm.register(name)} type="password" className="input-base" placeholder={placeholder} />
              {passwordForm.formState.errors[name] && (
                <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{passwordForm.formState.errors[name].message}</p>
              )}
            </div>
          ))}
          <button type="submit" className="btn-primary" disabled={passwordForm.formState.isSubmitting} style={{ alignSelf: 'flex-start', padding: '0.6rem 1.5rem' }}>
            {passwordForm.formState.isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Push Notification Toggle */}
          <div style={{
            padding: '1rem 1.25rem',
            background: push.isSubscribed ? 'var(--brand-primary-dim)' : 'var(--bg-elevated)',
            border: `1.5px solid ${push.isSubscribed ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
            borderRadius: 14,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: push.isSubscribed ? 'rgba(16,185,129,0.15)' : 'var(--bg-hover)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {push.isSubscribed
                  ? <BellRing size={18} style={{ color: 'var(--brand-primary)' }} />
                  : <BellOff size={18} style={{ color: 'var(--text-muted)' }} />}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Push Notifications
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  {!push.isSupported
                    ? 'Not supported by this browser'
                    : push.permission === 'denied'
                    ? 'Permission denied — reset in browser settings'
                    : push.isSubscribed
                    ? 'You will receive alerts for expenses & income'
                    : 'Enable to get real-time alerts on this device'}
                </p>
              </div>
            </div>
            {push.isSupported && push.permission !== 'denied' && (
              <button
                onClick={push.isSubscribed ? push.unsubscribe : push.subscribe}
                disabled={push.isLoading}
                className={push.isSubscribed ? 'btn-danger' : 'btn-primary'}
                style={{ fontSize: '0.82rem', padding: '0.55rem 1.1rem', flexShrink: 0 }}
              >
                {push.isLoading
                  ? '...'
                  : push.isSubscribed
                  ? 'Disable'
                  : 'Enable'}
              </button>
            )}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Smartphone size={13} /> Notifications are per-device. Enable on each browser/device you use.
          </p>
        </div>
      </Section>
    </div>
  );
}
