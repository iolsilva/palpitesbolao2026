import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import AppHeader from '../../components/layout/app-header'
import MobileBottomNav from '../../components/layout/mobile-bottom-nav'
import PageTransition from '../../components/layout/page-transition'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role, must_change_password')
    .eq('id', user.id)
    .single()

  const userName = profile?.name || 'Usuário'
  const userRole = profile?.role || 'player'
  const mustChangePassword = profile?.must_change_password ?? false

  return (
    <div className="min-h-screen bg-transparent">
      {mustChangePassword ? (
        children
      ) : (
        <>
          <AppHeader userName={userName} userRole={userRole} />

          <div className="mx-auto max-w-7xl pb-28 md:pb-10">
            <PageTransition>{children}</PageTransition>
          </div>

          <MobileBottomNav userRole={userRole} />
        </>
      )}
    </div>
  )
}