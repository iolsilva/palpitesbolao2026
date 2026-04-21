import { redirect } from 'next/navigation'
import { getUserProfile } from '../../../../lib/auth/get-user-profile'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile } = await getUserProfile()

  if (!profile) {
    redirect('/dashboard')
  }

  if (profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return <>{children}</>
}