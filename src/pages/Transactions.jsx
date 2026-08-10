import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import styles from './Transactions.module.css'
import toast from 'react-hot-toast'

const months = ['01','02','03','04','05','06','07','08','09','10','11','12']
const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const EXPENSE_CATS_OBJ = {
  '🍽️ Food': ['Food at Office', 'Dine Out', 'Order In'],
  '🛒 Grocery': ['Monthly Grocery', 'Bulk Purchase', 'Other'],
  '🎬 Entertainment': ['Movies', 'OTT / Streaming', 'Events', 'Other'],
  '🚗 Vehicle': ['Fuel', 'Service', 'Other'],
  '🎁 Gifting': ['Gift', 'Other'],
  '🛍️ Shopping': ['Clothes', 'Electronics', 'Other'],
  '🏠 House': ['Rent', 'Electricity Bill', 'Maintenance', 'Gas Cylinder', 'Other'],
  '💸 Other': ['Other']
}
const INCOME_TYPES = ['Salary', 'Content Creation', 'Investment', 'Other (custom)']
const INVESTMENT_TYPES = ['Savings', 'Mutual Fund', 'Stocks', 'SIP', 'Fixed Deposit', 'Other']

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          height: 64, borderRadius: 12,
          background: 'linear-gradient(90deg, #1a1a24 25%, #2a2a3a 50%, #1a1a24 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }} />
      ))}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  )
}

export default function Transactions() {
  const { transactions, investments, loading, deleteTransaction, deleteInvestment, updateTransaction, updateInvestment } = useTransactions()
  const now = new Date()
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [search, setSearch] = useState('')
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({})

  const allItems = [
    ...transactions.map(t => ({ ...t, _source: 'transaction' })),
    ...investments.map(t => ({ ...t, _source: 'investment', kind: 'investment' }))
  ]

  const filtered = allItems.filter(t => {
    const monthMatch = filter === 'all' ? true : t.date && t.date.split('-')[1] === month && t.date.split('-')[0] === year
    const typeMatch = typeFilter === 'all' ? true : t.kind === typeFilter
    const searchMatch = search.trim() === '' ? true : (
      getLabel(t).toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.note || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.date || '').includes(search) ||
      (t.subCategory || '').toLowerCase().includes(search.toLowerCase())
    )
    return monthMatch && typeMatch && searchMatch
  })

  filtered.sort((a, b) => {
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(b.date) - new Date(a.date)
  })

  function getIcon(t) {
    if (t.kind === 'income') return { symbol: '↑', color: 'var(--green)' }
    if (t.kind === 'expense') return { symbol: '↓', color: 'var(--red)' }
    return { symbol: '↗', color: '#f59e0b' }
  }

  function getLabel(t) {
    if (t.kind === 'income') return t.type || ''
    if (t.kind === 'expense') {
      const catName = t.category ? t.category.split(' ').slice(1).join(' ') : ''
      if (t.subCategory && t.subCategory !== 'Other') return `${catName} — ${t.subCategory}`
      return catName || t.category || ''
    }
    return t.type || ''
  }

  function getMeta(t) {
    const parts = []
    if (t.date) parts.push(t.date)
    if (t.kind === 'expense') parts.push(t.subCategory || t.category || 'Expense')
    else if (t.kind === 'income') parts.push('Income')
    else parts.push('Investment')
    if (t.description) parts.push(t.description)
    if (t.note) parts.push(t.note)
    return parts.join(' · ')
  }

  async function handleDelete(t) {
    if (t._source === 'investment') {
      await deleteInvestment(t.id)
    } else {
      await deleteTransaction(t.id)
    }
    toast.success('Deleted')
  }

  function openEdit(t) {
    setEditItem(t)
    setEditForm({
      date: t.date || '',
      amount: t.amount || '',
      description: t.description || '',
      note: t.note || '',
      category: t.category || '',
      subCategory: t.subCategory || '',
      type: t.type || '',
    })
  }

  async function handleUpdate() {
    if (!editForm.amount || Number(editForm.amount) <= 0) return toast.error('Enter a valid amount')
    try {
      if (editItem._source === 'investment') {
        await updateInvestment(editItem.id, {
          type: editForm.type,
          date: editForm.date,
          amount: Number(editForm.amount),
          note: editForm.note || ''
        })
      } else {
        await updateTransaction(editItem.id, {
          ...(editItem.kind === 'expense'
            ? { category: editForm.category, subCategory: editForm.subCategory }
            : { type: editForm.type }),
          date: editForm.date,
          amount: Number(editForm.amount),
          description: editForm.description || ''
        })
      }
      toast.success('Updated!')
      setEditItem(null)
    } catch {
      toast.error('Update failed')
    }
  }

  return (
    <div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      <h2 className={styles.title}>All Transactions</h2>

      {/* Search bar */}
      <div className={styles.searchBar}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.searchInput}
          placeholder="Search by name, category, date..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>}
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          <button className={filter === 'all' ? styles.activeFilter : styles.filterBtn} onClick={() => setFilter('all')}>All Time</button>
          <button className={filter === 'month' ? styles.activeFilter : styles.filterBtn} onClick={() => setFilter('month')}>By Month</button>
        </div>
        {filter === 'month' && (
          <div className={styles.selects}>
            <select value={month} onChange={e => setMonth(e.target.value)}>
              {months.map((m, i) => <option key={m} value={m}>{monthNames[i]}</option>)}
            </select>
            <select value={year} onChange={e => setYear(e.target.value)}>
              {['2023','2024','2025','2026'].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        )}
        <div className={styles.filterTabs}>
          <button className={typeFilter === 'all' ? styles.activeFilter : styles.filterBtn} onClick={() => setTypeFilter('all')}>All</button>
          <button className={typeFilter === 'income' ? styles.activeFilter : styles.filterBtn} onClick={() => setTypeFilter('income')}>Income</button>
          <button className={typeFilter === 'expense' ? styles.activeFilter : styles.filterBtn} onClick={() => setTypeFilter('expense')}>Expense</button>
          <button className={typeFilter === 'investment' ? styles.activeFilter : styles.filterBtn} onClick={() => setTypeFilter('investment')}>Investment</button>
        </div>
      </div>

      {/* Count */}
      <p className={styles.count}>{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</p>

      {/* Loading */}
      {loading ? <Skeleton /> : (
        <>
          {/* Empty state */}
          {filtered.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>{search ? '🔍' : '📭'}</div>
              <p className={styles.emptyTitle}>{search ? 'No results found' : 'No transactions yet'}</p>
              <p className={styles.emptySub}>{search ? `Nothing matches "${search}"` : 'Add income or expenses from the Dashboard'}</p>
            </div>
          )}

          {/* List */}
          <div className={styles.list}>
            {filtered.map(t => {
              const { symbol, color } = getIcon(t)
              return (
                <div key={t.id + t._source} className={styles.item}>
                  <div className={styles.left}>
                    <span className={styles.icon} style={{ color, borderColor: color + '44', background: color + '11' }}>
                      {symbol}
                    </span>
                    <div>
                      <p className={styles.name}>{getLabel(t)}</p>
                      <p className={styles.meta}>{getMeta(t)}</p>
                    </div>
                  </div>
                  <div className={styles.right}>
                    <span style={{ color, fontWeight: 600, fontSize: 15 }}>
                      {t.kind === 'income' ? '+' : t.kind === 'expense' ? '-' : ''}₹{Number(t.amount).toLocaleString('en-IN')}
                    </span>
                    <button className={styles.editBtn} onClick={() => openEdit(t)}>✏️</button>
                    <button className={styles.del} onClick={() => handleDelete(t)}>✕</button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className={styles.modalOverlay} onClick={() => setEditItem(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Edit Transaction</h3>
              <button className={styles.modalClose} onClick={() => setEditItem(null)}>✕</button>
            </div>
            <div className={styles.modalForm}>
              <label>Date</label>
              <input type="date" value={editForm.date} onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))} />

              {editItem.kind === 'expense' && (
                <>
                  <label>Category</label>
                  <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value, subCategory: '' }))}>
                    <option value="">Select category</option>
                    {Object.keys(EXPENSE_CATS_OBJ).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {editForm.category && EXPENSE_CATS_OBJ[editForm.category] && (
                    <>
                      <label>Sub Category</label>
                      <select value={editForm.subCategory || ''} onChange={e => setEditForm(p => ({ ...p, subCategory: e.target.value }))}>
                        <option value="">Select sub category</option>
                        {EXPENSE_CATS_OBJ[editForm.category].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </>
                  )}
                </>
              )}

              {editItem.kind === 'income' && (
                <>
                  <label>Income Type</label>
                  <select value={editForm.type} onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))}>
                    {INCOME_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </>
              )}

              {editItem.kind === 'investment' && (
                <>
                  <label>Investment Type</label>
                  <select value={editForm.type} onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))}>
                    {INVESTMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </>
              )}

              <label>Amount (₹)</label>
              <input type="number" value={editForm.amount} onChange={e => setEditForm(p => ({ ...p, amount: e.target.value }))} />

              {editItem.kind === 'expense' && (
                <>
                  <label>Description <span style={{ color: 'var(--muted)', fontSize: 12 }}>(optional)</span></label>
                  <input placeholder="e.g. lunch at office" value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
                </>
              )}

              {editItem.kind === 'investment' && (
                <>
                  <label>Note <span style={{ color: 'var(--muted)', fontSize: 12 }}>(optional)</span></label>
                  <input placeholder="e.g. Zerodha SIP" value={editForm.note} onChange={e => setEditForm(p => ({ ...p, note: e.target.value }))} />
                </>
              )}

              <button className={styles.saveBtn} onClick={handleUpdate}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}