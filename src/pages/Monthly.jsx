import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import styles from './Monthly.module.css'

const EXPENSE_CATS = {
  '🍽️ Food': [], '🛒 Grocery': [], '🎬 Entertainment': [],
  '🚗 Vehicle': [], '🎁 Gifting': [], '🛍️ Shopping': [],
  '🏠 House': [], '💊 Medical': [], '📱 Subscriptions': [],
  '🧾 Bills & Loans': [], '💑 Boyfriend': [], '✈️ Travel': [],
  '🧴 Essentials': [], '💸 Other': []
}

const BAR_COLORS = ['#7c3aed','#3b82f6','#22c55e','#f59e0b','#ef4444','#ec4899','#14b8a6','#f97316','#8b5cf6','#06b6d4','#84cc16','#f43f5e','#a855f7','#10b981']

export default function Monthly() {
  const { transactions, investments } = useTransactions()
  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'))
  const [year, setYear] = useState(String(now.getFullYear()))

  const filtered = transactions.filter(t => {
    if (!t.date) return false
    const [y, m] = t.date.split('-')
    return m === month && y === year
  })

  const filteredInvestments = investments.filter(t => {
    if (!t.date) return false
    const [y, m] = t.date.split('-')
    return m === month && y === year
  })

  const filteredExpense = filtered.filter(t => t.kind === 'expense')
  const filteredIncome = filtered.filter(t => t.kind === 'income')

  const totalExp = filteredExpense.reduce((s, t) => s + Number(t.amount), 0)
  const totalInc = filteredIncome.reduce((s, t) => s + Number(t.amount), 0)
  const totalInv = filteredInvestments.reduce((s, t) => s + Number(t.amount), 0)

  const barData = Object.keys(EXPENSE_CATS).map(cat => ({
    name: cat.split(' ').slice(1).join(' '),
    amount: filteredExpense.filter(t => t.category === cat).reduce((s, t) => s + Number(t.amount), 0),
    fullName: cat
  })).filter(d => d.amount > 0)

  const months = ['01','02','03','04','05','06','07','08','09','10','11','12']
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8, padding: '10px 14px' }}>
          <p style={{ color: '#f1f1f1', fontWeight: 600, marginBottom: 4 }}>{payload[0]?.payload?.fullName}</p>
          <p style={{ color: '#f1f1f1' }}>₹{Number(payload[0]?.value).toLocaleString('en-IN')}</p>
        </div>
      )
    }
    return null
  }

  function getExpenseLabel(t) {
    const catName = t.category ? t.category.split(' ').slice(1).join(' ') : ''
    if (t.subCategory && t.subCategory !== 'Other') return `${catName} — ${t.subCategory}`
    return catName || t.category || 'Expense'
  }

  return (
    <div>
      <h2 className={styles.title}>Monthly Report</h2>
      <div className={styles.filters}>
        <select value={month} onChange={e => setMonth(e.target.value)}>
          {months.map((m, i) => <option key={m} value={m}>{monthNames[i]}</option>)}
        </select>
        <select value={year} onChange={e => setYear(e.target.value)}>
          {['2023','2024','2025','2026'].map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      <div className={styles.summary}>
        <div className={styles.scard}>
          <span>Income</span>
          <strong style={{ color: 'var(--green)' }}>₹{totalInc.toLocaleString('en-IN')}</strong>
        </div>
        <div className={styles.scard}>
          <span>Expenses</span>
          <strong style={{ color: 'var(--red)' }}>₹{totalExp.toLocaleString('en-IN')}</strong>
        </div>
        <div className={styles.scard}>
          <span>Net Savings</span>
          <strong style={{ color: totalInc - totalExp - totalInv >= 0 ? 'var(--green)' : 'var(--red)' }}>
            ₹{(totalInc - totalExp - totalInv).toLocaleString('en-IN')}
          </strong>
        </div>
        <div className={styles.scard}>
          <span>Investments</span>
          <strong style={{ color: '#f59e0b' }}>₹{totalInv.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      {/* Bar Chart */}
      {barData.length > 0 && (
        <div className={styles.chart}>
          <h3>Spending by category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={11}
                angle={-35}
                textAnchor="end"
                interval={0}
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tick={{ fill: '#9ca3af' }}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="amount" radius={[4,4,0,0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Income & Expenses this month */}
      {(filteredIncome.length > 0 || filteredExpense.length > 0) && (
        <>
          <h3 className={styles.listTitle}>Income & Expenses</h3>
          {[...filteredIncome, ...filteredExpense]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(t => (
              <div key={t.id} className={styles.row}>
                <span className={t.kind === 'income' ? styles.inc : styles.exp}>
                  {t.kind === 'income' ? '↑' : '↓'}
                </span>
                <span className={styles.cat}>
                  {t.kind === 'income' ? t.type : getExpenseLabel(t)}
                </span>
                <span className={styles.date}>{t.date}</span>
                <span className={styles.desc}>{t.description || ''}</span>
                <span className={t.kind === 'income' ? styles.incAmt : styles.expAmt}>
                  {t.kind === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
        </>
      )}

      {/* Investments this month */}
      {filteredInvestments.length > 0 && (
        <>
          <h3 className={styles.listTitle} style={{ marginTop: 24 }}>Investments</h3>
          {filteredInvestments.map(t => (
            <div key={t.id} className={styles.row}>
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>↗</span>
              <span className={styles.cat}>{t.type}</span>
              <span className={styles.date}>{t.date}</span>
              <span className={styles.desc}>{t.note || ''}</span>
              <span style={{ color: '#f59e0b', fontWeight: 600, marginLeft: 'auto' }}>
                ₹{Number(t.amount).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </>
      )}

      {filtered.length === 0 && filteredInvestments.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: 10 }}>
          <div style={{ fontSize: 48, opacity: 0.4 }}>📅</div>
          <p style={{ color: '#f1f1f1', fontWeight: 600 }}>No transactions this month</p>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Try selecting a different month or add transactions from Dashboard</p>
        </div>
      )}
    </div>
  )
}