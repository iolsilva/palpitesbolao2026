'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type MobileBottomNavProps = {
  userRole: string
}

export default function MobileBottomNav({ userRole }: MobileBottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Home' },
    { href: '/rodada', label: 'Palpitar' },
    { href: '/meus-palpites', label: 'Meus picks' },
    { href: '/ranking', label: 'Ranking' },
    ...(userRole === 'admin' ? [{ href: '/admin', label: 'Painel' }] : []),
  ]

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur md:hidden">
      <nav className="mx-auto flex max-w-2xl items-center justify-between gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 items-center justify-center rounded-2xl px-3 py-3 text-center text-xs font-bold ${
                isActive
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}