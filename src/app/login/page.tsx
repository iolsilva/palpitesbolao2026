'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setErrorMessage('E-mail ou senha inválidos.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.20),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-2">
          <section className="flex flex-col justify-center">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Aqueles Caras
              </span>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl">
                O campeonato dos alfas agora tem cara de app de verdade.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                Envie seus palpites, acompanhe o ranking, compare resultados com os demais
                e veja quem realmente entende de futebol.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-white">Palpites</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Registro fácil e rápido.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-white">Ranking</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Disputa da rodada, mês e geral.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-white">Resenha</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Compare palpites depois do prazo.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-8 text-slate-900 shadow-2xl backdrop-blur">
              <div className="mb-6">
                <h2 className="text-3xl font-black tracking-tight">
                  Entrar no sistema
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Faça login para acessar seus palpites e a disputa da rodada.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-semibold text-slate-700"
                  >
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500"
                    placeholder="seuemail@exemplo.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-sm font-semibold text-slate-700"
                  >
                    Senha
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500"
                    placeholder="Digite sua senha"
                  />
                </div>

                {errorMessage ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:opacity-95 disabled:opacity-60"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              <div className="mt-6 rounded-2xl bg-slate-100 px-4 py-3 text-xs leading-6 text-slate-600">
                Use seu usuário cadastrado para entrar e participar da disputa com a galera.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}