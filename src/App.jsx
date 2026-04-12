import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthState } from './hooks/useAuthState'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Monthly from './pages/Monthly'
import Investments from './pages/Investments'
import Layout from './components/Layout'
import { Toaster } from 'react-hot-toast'

export default function App() {
  const { user, loading } = useAuthState()

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ color: '#7c3aed', fontSize: 18 }}>Loading...</div>
    </div>
  )

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a24', color: '#f1f1f1', border: '1px solid #2a2a3a' } }} />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
        <Route path="/transactions" element={user ? <Layout><Transactions /></Layout> : <Navigate to="/login" />} />
        <Route path="/monthly" element={user ? <Layout><Monthly /></Layout> : <Navigate to="/login" />} />
        <Route path="/investments" element={user ? <Layout><Investments /></Layout> : <Navigate to="/login" />} />
      </Routes>
    </>
  )
}