import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import styles from './Monthly.module.css'

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

  const cats = ['Food','Grocery','Movies','Vehicle','Gifts','Shopping','Rent']
  const barData = cats.map(c => ({
    name: c,
    amount: filteredExpense.filter(t => t.category === c).reduce((s, t) => s + Number(t.amount), 0)
  })).filter(d => d.amount > 0)

  const months = ['01','02','03','04','05','06','07','08','09','10','11','12']
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

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
          <span>Current Balance</span>
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
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8, color: '#f1f1f1' }}
                labelStyle={{ color: '#f1f1f1', fontWeight: 600 }}
                itemStyle={{ color: '#f1f1f1' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="amount" radius={[4,4,0,0]}>
                {barData.map((_, i) => (
                <Cell key={i} fill={['#7c3aed','#3b82f6','#22c55e','#f59e0b','#ef4444','#ec4899','#14b8a6'][i % 7]} />
              ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transactions this month */}
      {(filteredIncome.length > 0 || filteredExpense.length > 0) && (
        <>
          <h3 className={styles.listTitle}>Income & Expenses</h3>
          {[...filteredIncome, ...filteredExpense].map(t => (
            <div key={t.id} className={styles.row}>
              <span className={t.kind === 'income' ? styles.inc : styles.exp}>
                {t.kind === 'income' ? '↑' : '↓'}
              </span>
              <span className={styles.cat}>{t.kind === 'income' ? t.type : t.category}</span>
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
        <p style={{ color: 'var(--muted)', marginTop: 16 }}>No transactions for this month.</p>
      )}
    </div>
  )
}