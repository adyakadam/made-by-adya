import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboard from './AdminDashboard'

export default async function DashboardPage() {
  const jar = await cookies()
  if (jar.get('mba_admin')?.value !== '1') {
    redirect('/admin')
  }
  return <AdminDashboard />
}
