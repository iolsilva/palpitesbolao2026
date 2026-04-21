import { redirect } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/server'

type RoundMatch = {
  id: string
  match_order: number
  match_date: string
  home_team: string
  away_team: string
}

type PredictionRow = {
  match_id: string
  pick: 'HOME' | 'DRAW' | 'AWAY'
}

function formatPick(
  pick: 'HOME' | 'DRAW' | 'AWAY',
  homeTeam: string,
  awayTeam: string
) {
  if (pick === 'HOME') return homeTeam
  if (pick === 'AWAY') return awayTeam
  return 'Empate'
}

function formatMatchDate(dateString: string) {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return 'Data inválida'
  }

  return date.toLocaleString('pt-BR')
}

function getPickStyle(pickLabel: string) {
  if (pickLabel === 'Empate') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-800'
}

export default async function MeusPalpitesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const nowIso = new Date().toISOString()

  const { data: nextRound } = await supabase
    .from('rounds')
    .select('id, name, lock_at')
    .order('lock_at', { ascending: true })
    .gte('lock_at', nowIso)
    .limit(1)
    .maybeSingle()

  const { data: lastClosedRound } = await supabase
    .from('rounds')
    .select('id, name, lock_at')
    .order('lock_at', { ascending: false })
    .lt('lock_at', nowIso)
    .limit(1)
    .maybeSingle()

  const selectedRound = nextRound || lastClosedRound

  if (!selectedRound) {
    return (
      <main className="p-4 md:p-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Meus picks
          </h1>
          <p className="mt-3 text-slate-600">
            Ainda não existe rodada disponível para consulta.
          </p>
        </div>
      </main>
    )
  }

  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('id, match_order, match_date, home_team, away_team')
    .eq('round_id', selectedRound.id)
    .order('match_order', { ascending: true })

  if (matchesError) {
    return (
      <main className="p-4 md:p-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="mt-2 text-slate-600">
            Não foi possível carregar os jogos da rodada.
          </p>
        </div>
      </main>
    )
  }

  const { data: predictions, error: predictionsError } = await supabase
    .from('predictions')
    .select('match_id, pick')
    .eq('user_id', user.id)
    .in('match_id', (matches || []).map((match) => match.id))

  if (predictionsError) {
    return (
      <main className="p-4 md:p-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="mt-2 text-slate-600">
            Não foi possível carregar seus picks.
          </p>
        </div>
      </main>
    )
  }

  const predictionMap = new Map(
    ((predictions || []) as PredictionRow[]).map((item) => [item.match_id, item.pick])
  )

  const isLocked = new Date() >= new Date(selectedRound.lock_at)
  const totalGames = (matches || []).length
  const totalSent = (matches || []).filter((match) => predictionMap.has(match.id)).length

  return (
    <main className="p-4 md:p-6">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.18),transparent_30%)] p-8 sm:p-10">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                Conferência dos picks
              </p>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Seus palpites estão aqui.
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-300">
                Confira o que você mandou na <strong className="text-white">{selectedRound.name}</strong> e
                evite qualquer dúvida na hora da resenha.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Rodada
            </p>
            <p className="mt-2 text-xl font-black text-slate-900">{selectedRound.name}</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Status
            </p>
            <div className="mt-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${
                  isLocked
                    ? 'bg-red-100 text-red-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {isLocked ? 'Fechada' : 'Aberta'}
              </span>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Preenchimento
            </p>
            <p className="mt-2 text-xl font-black text-slate-900">
              {totalSent}/{totalGames}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          {(matches || []).map((match: RoundMatch) => {
            const pick = predictionMap.get(match.id)
            const pickLabel = pick
              ? formatPick(pick, match.home_team, match.away_team)
              : 'Não enviado'

            return (
              <div
                key={match.id}
                className="overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                        Jogo {match.match_order}
                      </p>
                      <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                        {match.home_team} <span className="text-slate-400">x</span> {match.away_team}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatMatchDate(match.match_date)}
                      </p>
                    </div>

                    <span className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
                      Confirmado
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="rounded-[1.5rem] border p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      Seu Palpite
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex rounded-full border px-4 py-2 text-sm font-bold ${getPickStyle(
                          pickLabel
                        )}`}
                      >
                        {pickLabel}
                      </span>

                      {!pick ? (
                        <span className="text-sm font-medium text-red-600">
                          Você ainda não enviou esse palpite.
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-slate-600">
                          Palpite registrado com sucesso.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-slate-500">
                    {isLocked
                      ? 'A rodada já fechou. Agora seus picks ficam disponíveis apenas para consulta.'
                      : 'A rodada ainda está aberta. Se quiser ajustar, volte na tela de palpitar.'}
                  </div>
                </div>
              </div>
            )
          })}
        </section>
      </div>
    </main>
  )
}