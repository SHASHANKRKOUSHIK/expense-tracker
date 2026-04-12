import { useState, useEffect } from 'react'
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../firebase'

export function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const uid = auth.currentUser?.uid
    if (!uid) return
    const q = query(collection(db, 'users', uid, 'transactions'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    const uid = auth.currentUser?.uid
    if (!uid) return
    const q = query(collection(db, 'users', uid, 'investments'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setInvestments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  async function addTransaction(data) {
    const uid = auth.currentUser?.uid
    await addDoc(collection(db, 'users', uid, 'transactions'), {
      ...data,
      createdAt: serverTimestamp()
    })
  }

  async function deleteTransaction(id) {
    const uid = auth.currentUser?.uid
    await deleteDoc(doc(db, 'users', uid, 'transactions', id))
  }

  async function addInvestment(data) {
    const uid = auth.currentUser?.uid
    await addDoc(collection(db, 'users', uid, 'investments'), {
      ...data,
      createdAt: serverTimestamp()
    })
  }

  async function deleteInvestment(id) {
    const uid = auth.currentUser?.uid
    await deleteDoc(doc(db, 'users', uid, 'investments', id))
  }

  return { transactions, investments, loading, addTransaction, deleteTransaction, addInvestment, deleteInvestment }
}