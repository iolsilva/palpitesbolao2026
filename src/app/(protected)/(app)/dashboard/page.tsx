import { createClient } from '../../../../lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  const userRole = profile?.role || 'player'

  return (
    <main className="p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.25),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.25),transparent_32%)] p-8 sm:p-10">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Painel dos caras
              </p>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Dê seus palpites, faça rankings e tudo o que quiser, sem me encher o saco
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-300">
                Você está autenticado como <strong className="text-white">{user?.email}</strong>.
                Acompanhe a rodada, confira seus palpites e veja como está a disputa geral e mensal.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <a
            href="/rodada"
            className="group rounded-3xl border border-white/60 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-700">
              Rodada
            </div>
            <h2 className="text-xl font-bold text-slate-900">Rodada atual</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Envie, revise e ajuste seus palpites enquanto a rodada estiver aberta.
            </p>
          </a>

          <a
            href="/meus-palpites"
            className="group rounded-3xl border border-white/60 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-4 inline-flex rounded-2xl bg-blue-100 px-3 py-2 text-sm font-bold text-blue-700">
              Conferência
            </div>
            <h2 className="text-xl font-bold text-slate-900">Meus palpites</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Consulte o que você registrou para não ficar na dúvida depois.
            </p>
          </a>

          <a
            href="/palpites-da-rodada"
            className="group rounded-3xl border border-white/60 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-4 inline-flex rounded-2xl bg-amber-100 px-3 py-2 text-sm font-bold text-amber-700">
              Comparação
            </div>
            <h2 className="text-xl font-bold text-slate-900">Palpites da rodada</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Após o início do primeiro jogo da rodada, a comparação dos palpites estará liberada.
            </p>
          </a>

          <a
            href="/ranking"
            className="group rounded-3xl border border-white/60 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-4 inline-flex rounded-2xl bg-violet-100 px-3 py-2 text-sm font-bold text-violet-700">
              Classificação
            </div>
            <h2 className="text-xl font-bold text-slate-900">Ranking</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Resultado da rodada, do mês e a classificação geral.
            </p>
          </a>

          {userRole === 'admin' && (
            <a
              href="/admin"
              className="group rounded-3xl border border-white/60 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-2xl bg-slate-200 px-3 py-2 text-sm font-bold text-slate-700">
                Gestão
              </div>
              <h2 className="text-xl font-bold text-slate-900">Admin</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Gerencie rodadas, jogos, resultados e a estrutura da competição.
              </p>
            </a>
          )}
        </section>
      </div>
    </main>
  )
}