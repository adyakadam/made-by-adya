import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboard from './AdminDashboard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default async function DashboardPage() {
  const jar = await cookies()
  if (jar.get('mba_admin')?.value !== '1') {
    redirect('/admin')
  }
  return <AdminDashboard />
}
