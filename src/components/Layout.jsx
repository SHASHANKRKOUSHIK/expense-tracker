import { Link, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  const loc = useLocation()

  return (
    <div className={styles.shell}>
      <nav className={styles.nav}>
        <span className={styles.brand}>💰 Expense Tracker</span>
        <div className={styles.links}>
          <Link className={loc.pathname === '/' ? styles.active : ''} to="/">Dashboard</Link>
          <Link className={loc.pathname === '/transactions' ? styles.active : ''} to="/transactions">Transactions</Link>
          <Link className={loc.pathname === '/monthly' ? styles.active : ''} to="/monthly">Monthly</Link>
        </div>
        <button className={styles.logout} onClick={() => signOut(auth)}>Logout</button>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  )
}