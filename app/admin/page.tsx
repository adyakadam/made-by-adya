import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminLoginForm from './AdminLoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const jar = await cookies()
  if (jar.get('mba_admin')?.value === '1') {
    redirect('/admin/dashboard')
  }
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '40px 48px', boxShadow: '0 4px 24px rgba(58,46,40,.1)', width: '100%', maxWidth: 400 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 300, marginBottom: 8, textAlign: 'center' }}>
          made by <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>adya</span>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-light)', textAlign: 'center', marginBottom: 28 }}>Admin Dashboard</p>
        <AdminLoginForm />
      </div>
    </div>
  )
}
