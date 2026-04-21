'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

type AppHeaderProps = {
  userName: string
  userRole: string
}

export default function AppHeader({ userName, userRole }: AppHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const navItems = [
    { href: '/dashboard', label: 'Home' },
    { href: '/rodada', label: 'Rodada' },
    { href: '/meus-palpites', label: 'Meus palpites' },
    { href: '/palpites-da-rodada', label: 'Palpites da rodada' },
    { href: '/ranking', label: 'Ranking' },
    ...(userRole === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-slate-950/90 text-white backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <Link href="/dashboard" className="text-2xl font-black tracking-tight text-white">
              Palpites Brasileirão
            </Link>

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-emerald-300">
                Aqueles Caras
              </span>
              <span className="hidden sm:inline">•</span>
              <span>
                Olá, <strong className="text-white">{userName}</strong>
              </span>

              {userRole === 'admin' ? (
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-slate-950">
                  Admin
                </span>
              ) : null}
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}

            <button
              onClick={handleLogout}
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Sair
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}