import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import styles from './Transactions.module.css'
import toast from 'react-hot-toast'

const months = ['01','02','03','04','05','06','07','08','09','10','11','12']
const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Transactions() {
  const { transactions, investments, loading, deleteTransaction, deleteInvestment } = useTransactions()
  const now = new Date()
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'))
  const [year, setYear] = useState(String(now.getFullYear()))

  if (loading) return <p style={{ color: 'var(--muted)' }}>Loading...</p>

  const allItems = [
    ...transactions.map(t => ({ ...t, _source: 'transaction' })),
    ...investments.map(t => ({ ...t, _source: 'investment', kind: 'investment' }))
  ]

  const filtered = allItems.filter(t => {
    const monthMatch = filter === 'all' ? true : t.date && t.date.split('-')[1] === month && t.date.split('-')[0] === year
    const typeMatch = typeFilter === 'all' ? true : t.kind === typeFilter
    return monthMatch && typeMatch
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
    if (t.kind === 'income') return t.type
    if (t.kind === 'expense') return t.category
    return t.type
  }

  function getMeta(t) {
    const parts = []
    if (t.date) parts.push(t.date)
    if (t.kind === 'expense') parts.push('Expense')
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

  return (
    <div>
      <h2 className={styles.title}>All Transactions</h2>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        {/* Time filter */}
        <div className={styles.filterTabs}>
          <button className={filter === 'all' ? styles.activeFilter : styles.filterBtn} onClick={() => setFilter('all')}>All Time</button>
          <button className={filter === 'month' ? styles.activeFilter : styles.filterBtn} onClick={() => setFilter('month')}>By Month</button>
        </div>

        {/* Month/year selects */}
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

        {/* Type filter */}
        <div className={styles.filterTabs}>
          <button className={typeFilter === 'all' ? styles.activeFilter : styles.filterBtn} onClick={() => setTypeFilter('all')}>All</button>
          <button className={typeFilter === 'income' ? styles.activeFilter : styles.filterBtn} onClick={() => setTypeFilter('income')}>Income</button>
          <button className={typeFilter === 'expense' ? styles.activeFilter : styles.filterBtn} onClick={() => setTypeFilter('expense')}>Expense</button>
          <button className={typeFilter === 'investment' ? styles.activeFilter : styles.filterBtn} onClick={() => setTypeFilter('investment')}>Investment</button>
        </div>
      </div>

      {/* Count */}
      <p className={styles.count}>{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</p>

      {/* List */}
      {filtered.length === 0 && (
        <p style={{ color: 'var(--muted)', marginTop: 16 }}>No transactions found.</p>
      )}
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
                <button className={styles.del} onClick={() => handleDelete(t)}>✕</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}