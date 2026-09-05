import { useState, useEffect } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { auth } from '../firebase'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import styles from './Dashboard.module.css'

const INCOME_TYPES = ['Salary', 'Content Creation', 'Investment', 'Other (custom)']
const EXPENSE_CATS = {
  '🍽️ Food': ['Food at Office', 'Dine Out', 'Order In'],
  '🛒 Grocery': ['Monthly Grocery', 'Bulk Purchase', 'Other'],
  '🎬 Entertainment': ['Movies', 'OTT / Streaming', 'Events', 'Other'],
  '🚗 Vehicle': ['Fuel', 'Service', 'Other'],
  '🎁 Gifting': ['Gift', 'Other'],
  '🛍️ Shopping': ['Clothes', 'Electronics', 'Other'],
  '🏠 House': ['Rent', 'Electricity Bill', 'Maintenance', 'Gas Cylinder', 'Other'],
  '💊 Medical': ['Tablets', 'Hospital Charges', 'Other'],
  '📱 Subscriptions': ['OTT', 'Instagram', 'InShot', 'Other'],
  '🧾 Bills & Loans': ['EMI', 'Credit Card', 'Loan', 'Other'],
  '💑 Boyfriend': ['Outing', 'Gift', 'Other'],
  '✈️ Travel': ['Flight', 'Hotel', 'Food', 'Local Transport', 'Other'],
  '🧴 Essentials': ['Personal Care', 'Household', 'Other'],
  '💸 Other': ['Other']
}
const BAR_COLORS = ['#7c3aed','#3b82f6','#22c55e','#f59e0b','#ef4444','#ec4899','#14b8a6','#f97316','#8b5cf6','#06b6d4','#84cc16','#f43f5e','#a855f7','#10b981']
const DRAFT_KEY = 'expense_tracker_draft'
const emptyExpense = { date: new Date().toISOString().split('T')[0], category: '', subCategory: '', customCat: '', amount: '', description: '' }
const emptyIncome = { type: 'Salary', customType: '', amount: '', date: new Date().toISOString().split('T')[0] }

function Skeleton({ width = '100%', height = 20, radius = 8 }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'linear-gradient(90deg, #1a1a24 25%, #2a2a3a 50%, #1a1a24 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  )
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: 12 }}>
      <div style={{ fontSize: 48, opacity: 0.5 }}>{icon}</div>
      <p style={{ color: '#f1f1f1', fontWeight: 600, fontSize: 15, textAlign: 'center' }}>{title}</p>
      <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center' }}>{subtitle}</p>
    </div>
  )
}

export default function Dashboard() {
  const { transactions, investments, addTransaction, loading } = useTransactions()
  const user = auth.currentUser
  const userName = user?.displayName?.split(' ')[0] || 'there'

  const [tab, setTab] = useState('expense')
  const [expense, setExpense] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY + '_expense')) || emptyExpense } catch { return emptyExpense }
  })
  const [income, setIncome] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY + '_income')) || emptyIncome } catch { return emptyIncome }
  })

  useEffect(() => { localStorage.setItem(DRAFT_KEY + '_expense', JSON.stringify(expense)) }, [expense])
  useEffect(() => { localStorage.setItem(DRAFT_KEY + '_income', JSON.stringify(income)) }, [income])

  const totalIncome = transactions.filter(t => t.kind === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = transactions.filter(t => t.kind === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const totalInvestment = investments.reduce((s, t) => s + Number(t.amount), 0)
  const balance = totalIncome - totalExpense - totalInvestment

  // Bar chart data grouped by main category
  const barData = Object.keys(EXPENSE_CATS).reduce((acc, cat) => {
    const total = transactions
      .filter(t => t.kind === 'expense' && t.category === cat)
      .reduce((s, t) => s + Number(t.amount), 0)
    if (total > 0) acc.push({
      name: cat.split(' ').slice(1).join(' '),
      amount: total,
      fullName: cat
    })
    return acc
  }, [])

  async function submitExpense() {
    if (!expense.amount || isNaN(expense.amount) || Number(expense.amount) <= 0) return toast.error('Enter a valid amount')
    if (!expense.category) return toast.error('Select a category')
    if (!expense.subCategory) return toast.error('Select a sub category')
    if (expense.subCategory === 'Other' && !expense.customCat.trim()) return toast.error('Enter expense name')
    const subCategory = expense.subCategory === 'Other' ? expense.customCat.trim() : expense.subCategory
    await addTransaction({
      kind: 'expense',
      date: expense.date,
      category: expense.category,
      subCategory,
      amount: Number(expense.amount),
      description: expense.description || ''
    })
    setExpense(emptyExpense)
    localStorage.removeItem(DRAFT_KEY + '_expense')
    toast.success('Expense added!')
  }

  async function submitIncome() {
    if (!income.amount || isNaN(income.amount) || Number(income.amount) <= 0) return toast.error('Enter a valid amount')
    const type = income.type === 'Other (custom)' ? income.customType : income.type
    await addTransaction({ kind: 'income', type, date: income.date, amount: Number(income.amount) })
    setIncome(emptyIncome)
    localStorage.removeItem(DRAFT_KEY + '_income')
    toast.success('Income added!')
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8, padding: '10px 14px' }}>
          <p style={{ color: '#f1f1f1', fontWeight: 600, marginBottom: 4 }}>{payload[0]?.payload?.fullName}</p>
          <p style={{ color: BAR_COLORS[0] }}>₹{Number(payload[0]?.value).toLocaleString('en-IN')}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      {/* Welcome */}
      <div className={styles.welcome}>
        <h2 className={styles.welcomeText}>👋 Welcome back, {userName}!</h2>
        <p className={styles.welcomeSub}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className={styles.cards}>
          {[1,2,3,4].map(i => (
            <div key={i} className={styles.card}>
              <Skeleton width="60%" height={12} />
              <Skeleton width="80%" height={32} radius={6} />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.cards}>
          <div className={`${styles.card} ${styles.balanceCard}`}>
            <span className={styles.label}>Current Balance</span>
            <span className={styles.amount}>₹{balance.toLocaleString('en-IN')}</span>
          </div>
          <div className={styles.card}>
            <span className={styles.label}>Total Income</span>
            <span className={styles.amount} style={{ color: 'var(--green)' }}>₹{totalIncome.toLocaleString('en-IN')}</span>
          </div>
          <div className={styles.card}>
            <span className={styles.label}>Total Expenses</span>
            <span className={styles.amount} style={{ color: 'var(--red)' }}>₹{totalExpense.toLocaleString('en-IN')}</span>
          </div>
          <div className={`${styles.card} ${styles.investCard}`} onClick={() => window.location.href='/investments'} style={{ cursor: 'pointer' }}>
            <span className={styles.label}>Investments →</span>
            <span className={styles.amount} style={{ color: '#f59e0b' }}>₹{totalInvestment.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className={styles.grid}>

        {/* Left: Form Card */}
        <div className={styles.formCard}>
          <div className={styles.tabs}>
            <button className={tab === 'expense' ? styles.activeTab : styles.tab} onClick={() => setTab('expense')}>Add Expense</button>
            <button className={tab === 'income' ? styles.activeTab : styles.tab} onClick={() => setTab('income')}>Add Income</button>
          </div>

          {tab === 'expense' && (
            <div className={styles.form}>
              <label>Date</label>
              <input type="date" value={expense.date} onChange={e => setExpense(p => ({ ...p, date: e.target.value }))} />

              <label>Category</label>
              <select value={expense.category} onChange={e => setExpense(p => ({ ...p, category: e.target.value, subCategory: '', customCat: '' }))}>
                <option value="">Select category</option>
                {Object.keys(EXPENSE_CATS).map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {expense.category && (
                <>
                  <label>Sub Category</label>
                  <select value={expense.subCategory} onChange={e => setExpense(p => ({ ...p, subCategory: e.target.value, customCat: '' }))}>
                    <option value="">Select sub category</option>
                    {EXPENSE_CATS[expense.category]?.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </>
              )}

              {expense.subCategory === 'Other' && (
                <input
                  placeholder="Enter expense name"
                  value={expense.customCat}
                  onChange={e => setExpense(p => ({ ...p, customCat: e.target.value }))}
                />
              )}

              <label>Amount (₹)</label>
              <input type="number" placeholder="0.00" value={expense.amount} onChange={e => setExpense(p => ({ ...p, amount: e.target.value }))} />

              <label>Description <span style={{ color: 'var(--muted)', fontSize: 12 }}>(optional)</span></label>
              <input placeholder="e.g. lunch at office" value={expense.description} onChange={e => setExpense(p => ({ ...p, description: e.target.value }))} />

              <button className={styles.submitBtn} onClick={submitExpense}>Add Expense</button>
              {(expense.amount || expense.description) && <p className={styles.draftNote}>✓ Draft auto-saved</p>}
            </div>
          )}

          {tab === 'income' && (
            <div className={styles.form}>
              <label>Date</label>
              <input type="date" value={income.date} onChange={e => setIncome(p => ({ ...p, date: e.target.value }))} />

              <label>Income Type</label>
              <select value={income.type} onChange={e => setIncome(p => ({ ...p, type: e.target.value }))}>
                {INCOME_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>

              {income.type === 'Other (custom)' && (
                <input placeholder="Income source name" value={income.customType} onChange={e => setIncome(p => ({ ...p, customType: e.target.value }))} />
              )}

              <label>Amount (₹)</label>
              <input type="number" placeholder="0.00" value={income.amount} onChange={e => setIncome(p => ({ ...p, amount: e.target.value }))} />

              <button className={styles.submitBtn} style={{ background: 'var(--green)' }} onClick={submitIncome}>Add Income</button>
              {income.amount && <p className={styles.draftNote}>✓ Draft auto-saved</p>}
            </div>
          )}
        </div>

        {/* Right: Bar Chart Card */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Expenses by Category</h3>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
              <Skeleton width="100%" height={200} radius={12} />
              <Skeleton width="60%" height={12} />
            </div>
          ) : barData.length === 0 ? (
            <EmptyState
              icon="📊"
              title="No expenses yet"
              subtitle="Add your first expense to see the breakdown"
            />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
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
                <Bar dataKey="amount" radius={[6,6,0,0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}