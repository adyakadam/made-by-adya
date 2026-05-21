'use client'

import { useEffect, useState } from 'react'

export default function Toast() {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handler(e: CustomEvent<string>) {
      setMsg(e.detail)
      setVisible(true)
      setTimeout(() => setVisible(false), 2800)
    }
    window.addEventListener('show-toast', handler as EventListener)
    return () => window.removeEventListener('show-toast', handler as EventListener)
  }, [])

  return (
    <div className={`toast${visible ? ' show' : ''}`}>{msg}</div>
  )
}

export function showToast(msg: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: msg }))
  }
}
