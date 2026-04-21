import { redirect } from 'next/navigation'
import { getUserProfile } from '../../../lib/auth/get-user-profile'

export default async function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile } = await getUserProfile()

  if (!user) {
    redirect('/login')
  }

  if (!profile) {
    redirect('/login')
  }

  if (profile.must_change_password) {
    redirect('/primeiro-acesso')
  }

  return <>{children}</>
}