import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Filter, Trash2, Edit2, X, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { expenseApi } from '../../api';
import { useWalletStore } from '../../store';

const CATEGORIES = ['food', 'fuel', 'rent', 'shopping', 'bills', 'entertainment', 'travel', 'health', 'education', 'investment', 'others'];
const CATEGORY_ICONS = { food: '🍔', fuel: '⛽', rent: '🏠', shopping: '🛍️', bills: '💡', entertainment: '🎮', travel: '✈️', health: '💊', education: '📚', investment: '📈', others: '💰' };
const CATEGORY_COLORS = { food: '#f59e0b', fuel: '#ef4444', rent: '#8b5cf6', shopping: '#3b82f6', bills: '#06b6d4', entertainment: '#ec4899', travel: '#14b8a6', health: '#22c55e', education: '#6366f1', investment: '#f97316', others: '#94a3b8' };

const expenseSchema = z.object({
  title: z.string().min(1, 'Title required').max(100),
  amount: z.coerce.number().min(0.01, 'Amount must be > 0'),
  category: z.enum(CATEGORIES, { required_error: 'Select a category' }),
  date: z.string().min(1, 'Date required'),
  description: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

const formatCurrency = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v || 0);

function ExpenseModal({ onClose, expense = null, walletId }) {
  const queryClient = useQueryClient();
  const isEdit = !!expense;

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense ? {
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: format(new Date(expense.date), 'yyyy-MM-dd'),
      description: expense.description || '',
      notes: expense.notes || '',
    } : {
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const selectedCategory = watch('category');

  const onSubmit = async (data) => {
    try {
      if (!walletId) { toast.error('Please select a wallet first'); return; }
      if (isEdit) {
        await expenseApi.update(expense._id, data);
        toast.success('Expense updated!');
      } else {
        await expenseApi.add(walletId, data);
        toast.success('Expense added! 💸');
      }
      queryClient.invalidateQueries(['expenses', walletId]);
      queryClient.invalidateQueries(['dashboard', walletId]);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense');
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
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.2rem' }}>{isEdit ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.4rem', width: 34, height: 34, justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Category Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat} type="button"
                  onClick={() => setValue('category', cat, { shouldValidate: true })}
                  style={{
                    padding: '0.6rem 0.4rem',
                    borderRadius: 10,
                    border: `2px solid ${selectedCategory === cat ? CATEGORY_COLORS[cat] : 'var(--border)'}`,
                    background: selectedCategory === cat ? `${CATEGORY_COLORS[cat]}15` : 'transparent',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{CATEGORY_ICONS[cat]}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: selectedCategory === cat ? CATEGORY_COLORS[cat] : 'var(--text-muted)', textTransform: 'capitalize' }}>{cat}</span>
                </button>
              ))}
            </div>
            {errors.category && <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '0.25rem' }}>{errors.category.message}</p>}
          </div>

          {/* Title & Amount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Title</label>
              <input {...register('title')} className="input-base" placeholder="Coffee, Groceries..." />
              {errors.title && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errors.title.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Amount (₹)</label>
              <input {...register('amount')} type="number" step="0.01" className="input-base" placeholder="0.00" />
              {errors.amount && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errors.amount.message}</p>}
            </div>
          </div>

          {/* Date */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Date</label>
            <input {...register('date')} type="date" className="input-base" />
            {errors.date && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{errors.date.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Description (optional)</label>
            <textarea {...register('description')} className="input-base" rows={2} placeholder="Add a note..." style={{ resize: 'vertical' }} />
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem' }}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Expense' : 'Add Expense'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function ExpensesPage() {
  const { activeWallet } = useWalletStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', activeWallet?._id, page, search, filterCategory],
    queryFn: () => expenseApi.getAll(activeWallet._id, { page, limit: 10, search, category: filterCategory })
      .then((r) => r.data),
    enabled: !!activeWallet?._id,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => expenseApi.delete(id),
    onSuccess: () => {
      toast.success('Expense deleted');
      queryClient.invalidateQueries(['expenses', activeWallet?._id]);
      queryClient.invalidateQueries(['dashboard', activeWallet?._id]);
    },
    onError: () => toast.error('Failed to delete'),
  });

  const expenses = data?.data?.expenses || [];
  const meta = data?.meta;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Expenses 💸</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Track where your money goes</p>
        </div>
        <button 
          className="btn-primary" 
          disabled={!activeWallet?._id}
          style={{ cursor: activeWallet?._id ? 'pointer' : 'not-allowed', opacity: activeWallet?._id ? 1 : 0.6 }}
          onClick={() => { setEditExpense(null); setModalOpen(true); }}
        >
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses..." className="input-base"
            style={{ paddingLeft: '2.25rem', height: 38, fontSize: '0.85rem' }}
          />
        </div>
        <select
          value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="input-base"
          style={{ width: 160, height: 38, fontSize: '0.85rem' }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
        </select>
      </div>

      {/* Expense List */}
      <div className="glass-card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>
        ) : expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '2.5rem' }}>💸</p>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '1rem' }}>No expenses yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Add your first expense to get started</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {expenses.map((expense, i) => (
              <motion.div
                key={expense._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.875rem 1rem',
                  borderRadius: 12, border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                  background: `${CATEGORY_COLORS[expense.category]}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem',
                }}>
                  {CATEGORY_ICONS[expense.category]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {expense.title}
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.15rem' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>{expense.category}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <p style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '1rem', flexShrink: 0 }}>
                  -{formatCurrency(expense.amount)}
                </p>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button
                    className="btn-ghost"
                    onClick={() => { setEditExpense(expense); setModalOpen(true); }}
                    style={{ padding: '0.4rem', width: 32, height: 32, justifyContent: 'center' }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => deleteMutation.mutate(expense._id)}
                    style={{ padding: '0.4rem', width: 32, height: 32, justifyContent: 'center' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Pagination */}
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

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <ExpenseModal
            onClose={() => { setModalOpen(false); setEditExpense(null); }}
            expense={editExpense}
            walletId={activeWallet?._id}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
