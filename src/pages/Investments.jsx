import { useState, useEffect } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import styles from './Investments.module.css'

const INVESTMENT_TYPES = ['Savings', 'Mutual Fund', 'Stocks', 'SIP', 'Fixed Deposit', 'Other']
const PIE_COLORS = ['#f59e0b','#7c3aed','#3b82f6','#22c55e','#ef4444','#ec4899']
const DRAFT_KEY = 'investment_draft'
const emptyForm = { date: new Date().toISOString().split('T')[0], type: 'Savings', amount: '', note: '' }

export default function Investments() {
  const { investments, addInvestment, deleteInvestment } = useTransactions()
  const [form, setForm] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY)) || emptyForm } catch { return emptyForm }
  })

  useEffect(() => { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)) }, [form])

  const total = investments.reduce((s, t) => s + Number(t.amount), 0)

  const pieData = INVESTMENT_TYPES.reduce((acc, type) => {
    const sum = investments.filter(i => i.type === type).reduce((s, i) => s + Number(i.amount), 0)
    if (sum > 0) acc.push({ name: type, value: sum })
    return acc
  }, [])

  async function handleSubmit() {
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) return toast.error('Enter a valid amount')
    await addInvestment({ type: form.type, date: form.date, amount: Number(form.amount), note: form.note || '' })
    setForm(emptyForm)
    localStorage.removeItem(DRAFT_KEY)
    toast.success('Investment added!')
  }

  return (
    <div>
      <h2 className={styles.title}>Investments</h2>

      {/* Total card */}
      <div className={styles.totalCard}>
        <span className={styles.totalLabel}>Total Invested</span>
        <span className={styles.totalAmount}>₹{total.toLocaleString('en-IN')}</span>
      </div>

      <div className={styles.grid}>
        {/* Add form */}
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>Add Investment</h3>
          <div className={styles.form}>
            <label>Date</label>
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            <label>Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              {INVESTMENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <label>Amount (₹)</label>
            <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            <label>Note <span style={{ color: 'var(--muted)', fontSize: 12 }}>(optional)</span></label>
            <input placeholder="e.g. Zerodha SIP" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
            <button className={styles.submitBtn} onClick={handleSubmit}>Add Investment</button>
            {form.amount && <p className={styles.draftNote}>✓ Draft auto-saved</p>}
          </div>
        </div>

        {/* Pie chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Portfolio Breakdown</h3>
          {pieData.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', marginTop: 60 }}>No investments yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Investment history */}
      <h3 className={styles.historyTitle}>Investment History</h3>
      {investments.length === 0 && <p style={{ color: 'var(--muted)' }}>No investments added yet.</p>}
      <div className={styles.list}>
        {investments.map(t => (
          <div key={t.id} className={styles.item}>
            <div className={styles.itemLeft}>
              <div className={styles.badge}>{t.type?.charAt(0)}</div>
              <div>
                <p className={styles.itemName}>{t.type}</p>
                <p className={styles.itemMeta}>{t.date}{t.note ? ` · ${t.note}` : ''}</p>
              </div>
            </div>
            <div className={styles.itemRight}>
              <span className={styles.itemAmount}>₹{Number(t.amount).toLocaleString('en-IN')}</span>
              <button className={styles.del} onClick={async () => { await deleteInvestment(t.id); toast.success('Deleted') }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}