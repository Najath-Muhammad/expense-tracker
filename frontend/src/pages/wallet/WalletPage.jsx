import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Copy, Users, Trash2, Crown, Shield, User, X, Link2, Wallet, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { walletApi } from '../../api';
import { useWalletStore, useAuthStore } from '../../store';

const WALLET_TYPES = [
  { value: 'personal', label: 'Personal', icon: '👤' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'friends', label: 'Friends', icon: '👥' },
  { value: 'office', label: 'Office', icon: '🏢' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'savings', label: 'Savings', icon: '🏦' },
];

const ROLE_ICONS = { owner: Crown, admin: Shield, member: User };
const ROLE_COLORS = { owner: '#f59e0b', admin: '#6366f1', member: '#94a3b8' };

function CreateWalletModal({ onClose }) {
  const queryClient = useQueryClient();
  const { addWallet, setActiveWallet } = useWalletStore();
  const [name, setName] = useState('');
  const [type, setType] = useState('personal');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await walletApi.create({ name, type });
      addWallet(data.data.wallet);
      setActiveWallet(data.data.wallet);
      toast.success('Wallet created! 🎉');
      queryClient.invalidateQueries(['wallets']);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 440 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.2rem' }}>Create Wallet</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.4rem', width: 34, height: 34, justifyContent: 'center' }}><X size={16} /></button>
        </div>

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Wallet Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="input-base" placeholder="My Personal Wallet" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {WALLET_TYPES.map(({ value, label, icon }) => (
                <button key={value} type="button" onClick={() => setType(value)} style={{
                  padding: '0.75rem', borderRadius: 10,
                  border: `2px solid ${type === value ? 'var(--brand-primary)' : 'var(--border)'}`,
                  background: type === value ? 'rgba(99,102,241,0.1)' : 'transparent',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: type === value ? 'var(--brand-primary)' : 'var(--text-muted)' }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading || !name.trim()} style={{ width: '100%', padding: '0.875rem' }}>
            {loading ? 'Creating...' : 'Create Wallet'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function JoinWalletModal({ onClose }) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await walletApi.join(code.trim().toUpperCase());
      toast.success('Joined wallet!');
      queryClient.invalidateQueries(['wallets']);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid invite code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 380 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.2rem' }}>Join Wallet</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.4rem', width: 34, height: 34, justifyContent: 'center' }}><X size={16} /></button>
        </div>

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Invite Code</label>
            <input
              value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required
              className="input-base" placeholder="ABC123XYZ"
              style={{ letterSpacing: '0.15em', fontWeight: 700, textAlign: 'center', fontSize: '1.1rem' }}
              maxLength={9}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading || code.length < 9} style={{ width: '100%', padding: '0.875rem' }}>
            {loading ? 'Joining...' : 'Join Wallet'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function WalletPage() {
  const { activeWallet, setActiveWallet } = useWalletStore();
  const { user } = useAuthStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [inviteCodes, setInviteCodes] = useState({});
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletApi.getAll().then((r) => r.data.data.wallets || []),
  });

  const wallets = data || [];

  const handleGenerateCode = async (walletId) => {
    try {
      const { data } = await walletApi.generateInvite(walletId);
      setInviteCodes((prev) => ({ ...prev, [walletId]: data.data.inviteCode }));
      toast.success('Invite code generated!');
    } catch {
      toast.error('Failed to generate invite code');
    }
  };

  const handleSetActive = async (wallet) => {
    setActiveWallet(wallet);
    try {
      await walletApi.setActive(wallet._id);
    } catch { /* silently update locally */ }
    toast.success(`Switched to ${wallet.name}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Wallets 👛</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage your wallets and shared groups</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-ghost" onClick={() => setJoinOpen(true)}>
            <Link2 size={15} /> Join Wallet
          </button>
          <button className="btn-primary" onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> Create Wallet
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading wallets...</div>
      ) : wallets.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontSize: '3rem' }}>👛</p>
          <p style={{ fontWeight: 700, marginTop: '1rem', color: 'var(--text-primary)' }}>No wallets yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Create your first wallet to start tracking</p>
          <button className="btn-primary" onClick={() => setCreateOpen(true)} style={{ marginTop: '1.5rem' }}>
            <Plus size={16} /> Create Wallet
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {wallets.map((wallet, i) => {
            const isActive = activeWallet?._id === wallet._id;
            const isOwner = wallet.owner?._id === user?._id || wallet.owner === user?._id;
            const typeInfo = WALLET_TYPES.find((t) => t.value === wallet.type);
            const inviteCode = inviteCodes[wallet._id] || wallet.inviteCode;

            return (
              <motion.div
                key={wallet._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  border: isActive ? '2px solid var(--brand-primary)' : '1px solid var(--border)',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {isActive && (
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      <Check size={10} /> Active
                    </span>
                  </div>
                )}

                {/* Wallet Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: `${wallet.color || '#6366f1'}20`,
                    border: `2px solid ${wallet.color || '#6366f1'}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                  }}>
                    {wallet.icon || typeInfo?.icon || '💰'}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{wallet.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {typeInfo?.label || wallet.type} · {wallet.currency || 'INR'}
                    </p>
                  </div>
                </div>

                {/* Members */}
                {wallet.isShared && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Users size={13} /> Members ({(wallet.members?.length || 0) + 1})
                    </p>
                    <div style={{ display: 'flex', gap: '-0.5rem' }}>
                      {[wallet.owner, ...(wallet.members || []).map((m) => m.user)].slice(0, 5).map((member, mi) => (
                        <div key={mi} title={member?.name} style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          border: '2px solid var(--bg-elevated)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: '0.75rem',
                          marginLeft: mi > 0 ? -8 : 0,
                        }}>
                          {member?.name?.[0] || 'U'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invite Code */}
                {inviteCode && (
                  <div style={{
                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 8, padding: '0.6rem 0.75rem', marginBottom: '1rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand-primary)', letterSpacing: '0.15em' }}>
                      {inviteCode}
                    </span>
                    <button
                      className="btn-ghost"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', height: 28 }}
                      onClick={() => { navigator.clipboard.writeText(inviteCode); toast.success('Copied!'); }}
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {!isActive && (
                    <button className="btn-primary" onClick={() => handleSetActive(wallet)} style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
                      Set Active
                    </button>
                  )}
                  {isOwner && !inviteCode && (
                    <button className="btn-ghost" onClick={() => handleGenerateCode(wallet._id)} style={{ flex: 1, fontSize: '0.8rem' }}>
                      <Link2 size={13} /> Invite
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {createOpen && <CreateWalletModal onClose={() => setCreateOpen(false)} />}
        {joinOpen && <JoinWalletModal onClose={() => setJoinOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
