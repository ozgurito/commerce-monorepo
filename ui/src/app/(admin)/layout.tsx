import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) redirect('/giris')

  try {
    const res = await fetch(`${process.env.API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) redirect('/giris')
    const user: { role: string } = await res.json()
    if (user.role !== 'ADMIN') redirect('/')
  } catch {
    redirect('/giris')
  }

  return (
    <div className="flex min-h-screen">
      {/* Gün 10'da: <AdminSidebar /> buraya gelecek */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
