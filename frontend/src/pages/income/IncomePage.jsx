import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { incomeApi } from '../../api';
import { useWalletStore, useNotificationStore } from '../../store';

const SOURCES = ['salary', 'freelance', 'business', 'investment', 'rental', 'gift', 'bonus', 'others'];
const SOURCE_ICONS = { salary: '💼', freelance: '💻', business: '🏢', investment: '📈', rental: '🏠', gift: '🎁', bonus: '⭐', others: '💰' };
const SOURCE_COLORS = { salary: '#22c55e', freelance: '#6366f1', business: '#f59e0b', investment: '#06b6d4', rental: '#8b5cf6', gift: '#ec4899', bonus: '#f97316', others: '#94a3b8' };

const incomeSchema = z.object({
  title: z.string().min(1, 'Title required').max(100),
  amount: z.coerce.number().min(0.01, 'Amount must be > 0'),
  source: z.enum(SOURCES, { required_error: 'Select source' }),
  date: z.string().min(1, 'Date required'),
  note: z.string().max(500).optional(),
});

const formatCurrency = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v || 0);

function IncomeModal({ onClose, income = null, walletId }) {
  const queryClient = useQueryClient();
  const isEdit = !!income;

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(incomeSchema),
    defaultValues: income ? {
      title: income.title, amount: income.amount, source: income.source,
      date: format(new Date(income.date), 'yyyy-MM-dd'), note: income.note || '',
    } : { date: format(new Date(), 'yyyy-MM-dd') },
  });

  const selectedSource = watch('source');

  const onSubmit = async (data) => {
    try {
      if (!walletId) { toast.error('Please select a wallet first'); return; }
      const addNotification = useNotificationStore.getState().addNotification;
      if (isEdit) {
        await incomeApi.update(activeWallet._id, income._id, data);
        toast.success('Income updated!');
        addNotification({ title: '✏️ Income Updated', body: `${data.title} — ${formatCurrency(data.amount)}`, icon: '✏️' });
      } else {
        await incomeApi.add(walletId, data);
        toast.success('Income added! 🎉');
        addNotification({ title: '💰 Income Added', body: `${data.title} — ${formatCurrency(data.amount)}`, icon: '💰' });
      }
      queryClient.invalidateQueries(['income', walletId]);
      queryClient.invalidateQueries(['dashboard', walletId]);
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.2rem' }}>{isEdit ? 'Edit Income' : 'Add Income'}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.4rem', width: 34, height: 34, justifyContent: 'center' }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Source Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Income Source</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {SOURCES.map((src) => (
                <button key={src} type="button" onClick={() => setValue('source', src, { shouldValidate: true })} style={{
                  padding: '0.6rem 0.4rem', borderRadius: 10,
                  border: `2px solid ${selectedSource === src ? SOURCE_COLORS[src] : 'var(--border)'}`,
                  background: selectedSource === src ? `${SOURCE_COLORS[src]}15` : 'transparent',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: '1.2rem' }}>{SOURCE_ICONS[src]}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: selectedSource === src ? SOURCE_COLORS[src] : 'var(--text-muted)', textTransform: 'capitalize' }}>{src}</span>
                </button>
              ))}
            </div>
            {errors.source && <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '0.25rem' }}>{errors.source.message}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Title</label>
              <input {...register('title')} className="input-base" placeholder="Salary, Bonus..." />
              {errors.title && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errors.title.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Amount (₹)</label>
              <input {...register('amount')} type="number" step="0.01" className="input-base" placeholder="0.00" />
              {errors.amount && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errors.amount.message}</p>}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Date</label>
            <input {...register('date')} type="date" className="input-base" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Note (optional)</label>
            <textarea {...register('note')} className="input-base" rows={2} placeholder="Additional details..." style={{ resize: 'vertical' }} />
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Income' : 'Add Income'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function IncomePage() {
  const { activeWallet } = useWalletStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editIncome, setEditIncome] = useState(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: balanceData } = useQuery({
    queryKey: ['balance', activeWallet?._id],
    queryFn: () => incomeApi.getBalance(activeWallet._id).then((r) => r.data.data),
    enabled: !!activeWallet?._id,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['income', activeWallet?._id, page],
    queryFn: () => incomeApi.getAll(activeWallet._id, { page, limit: 10 }).then((r) => r.data),
    enabled: !!activeWallet?._id,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => incomeApi.delete(activeWallet._id, id),
    onSuccess: () => {
      toast.success('Income deleted');
      queryClient.invalidateQueries(['income', activeWallet?._id]);
      queryClient.invalidateQueries(['balance', activeWallet?._id]);
    },
  });

  const incomes = data?.data?.income || [];
  const meta = data?.meta;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Income 💰</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Track your earnings</p>
        </div>
        <button className="btn-primary" 
          disabled={!activeWallet?._id}
          onClick={() => { setEditIncome(null); setModalOpen(true); }}
          style={{ background: activeWallet?._id ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#ccc', cursor: activeWallet?._id ? 'pointer' : 'not-allowed' }}>
          <Plus size={16} /> Add Income
        </button>
      </div>

      {/* Balance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total Income', value: balanceData?.totalIncome, color: '#22c55e' },
          { label: 'Total Expense', value: balanceData?.totalExpense, color: '#ef4444' },
          { label: 'Balance', value: balanceData?.balance, color: '#6366f1' },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{formatCurrency(value)}</p>
          </div>
        ))}
      </div>

      {/* Income List */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>
        ) : incomes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '2.5rem' }}>💼</p>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '1rem' }}>No income records</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Add your first income entry</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {incomes.map((income, i) => (
              <motion.div key={income._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)' }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 10, background: `${SOURCE_COLORS[income.source]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                  {SOURCE_ICONS[income.source]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{income.title}</p>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.15rem' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>{income.source}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{format(new Date(income.date), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <p style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1rem', flexShrink: 0 }}>+{formatCurrency(income.amount)}</p>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button className="btn-ghost" onClick={() => { setEditIncome(income); setModalOpen(true); }} style={{ padding: '0.4rem', width: 32, height: 32, justifyContent: 'center' }}><Edit2 size={13} /></button>
                  <button className="btn-danger" onClick={() => deleteMutation.mutate(income._id)} style={{ padding: '0.4rem', width: 32, height: 32, justifyContent: 'center' }}><Trash2 size={13} /></button>
                </div>
              </motion.div>
            ))}
            {meta && meta.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="btn-ghost" disabled={!meta.hasPrevPage} onClick={() => setPage(p => p - 1)} style={{ fontSize: '0.8rem' }}>← Prev</button>
                <span style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{meta.page}/{meta.totalPages}</span>
                <button className="btn-ghost" disabled={!meta.hasNextPage} onClick={() => setPage(p => p + 1)} style={{ fontSize: '0.8rem' }}>Next →</button>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && <IncomeModal onClose={() => { setModalOpen(false); setEditIncome(null); }} income={editIncome} walletId={activeWallet?._id} />}
      </AnimatePresence>
    </div>
  );
}
