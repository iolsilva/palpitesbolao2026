import { redirect } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/server'

type MatchRow = {
  id: string
  match_order: number
  home_team: string
  away_team: string
  result: 'HOME' | 'DRAW' | 'AWAY' | null
}

type PredictionRow = {
  user_id: string
  match_id: string
  pick: 'HOME' | 'DRAW' | 'AWAY'
}

type ProfileRow = {
  id: string
  name: string | null
  role?: string | null
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

function getPickBadgeClass(value: string) {
  if (value === 'Empate') {
    return 'bg-amber-100 text-amber-800 border border-amber-200'
  }

  return 'bg-gray-100 text-gray-800 border border-gray-200'
}

export default async function PalpitesDaRodadaPage() {
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
      <main className="p-6">
        <div className="mx-auto max-w-7xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Palpites da rodada</h1>
          <p className="mt-2 text-gray-600">
            Ainda não existe rodada disponível para consulta.
          </p>
        </div>
      </main>
    )
  }

  const isLocked = new Date() >= new Date(selectedRound.lock_at)

  if (!isLocked) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-7xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Palpites da rodada</h1>
          <p className="mt-2 text-gray-600">
            Os palpites dos participantes serão liberados após o fechamento da rodada.
          </p>
        </div>
      </main>
    )
  }

  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('id, match_order, home_team, away_team, result')
    .eq('round_id', selectedRound.id)
    .order('match_order', { ascending: true })

  if (matchesError) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-7xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="mt-2 text-gray-600">Não foi possível carregar os jogos.</p>
        </div>
      </main>
    )
  }

  const matchIds = (matches || []).map((match) => match.id)

  const { data: predictions, error: predictionsError } = await supabase
    .from('predictions')
    .select('user_id, match_id, pick')
    .in('match_id', matchIds)

  if (predictionsError) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-7xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="mt-2 text-gray-600">Não foi possível carregar os palpites.</p>
        </div>
      </main>
    )
  }

  const userIds = Array.from(
    new Set(((predictions || []) as PredictionRow[]).map((p) => p.user_id))
  )

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, role')
    .in('id', userIds)

  if (profilesError) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-7xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="mt-2 text-gray-600">Não foi possível carregar os participantes.</p>
        </div>
      </main>
    )
  }

  const participants = ((profiles || []) as ProfileRow[])
    .map((profile) => ({
      id: profile.id,
      name: profile.name || 'Sem nome',
      role: profile.role || 'player',
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const predictionMap = new Map(
    ((predictions || []) as PredictionRow[]).map((item) => [
      `${item.match_id}-${item.user_id}`,
      item.pick,
    ])
  )

  return (
    <main className="p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Palpites da rodada</h1>
              <p className="mt-2 text-gray-600">
                Rodada selecionada: <strong>{selectedRound.name}</strong>
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              Seu palpite aparece destacado em azul.
            </div>
          </div>
        </section>

        {/* Desktop */}
        <section className="hidden rounded-2xl bg-white p-6 shadow-sm lg:block">
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Jogo
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Resultado
                  </th>
                  {participants.map((participant) => (
                    <th
                      key={participant.id}
                      className={`px-4 py-3 text-left text-sm font-semibold ${
                        participant.id === user.id ? 'text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{participant.name}</span>
                        {participant.role === 'admin' ? (
                          <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs text-white">
                            Admin
                          </span>
                        ) : null}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {(matches || []).map((match: MatchRow) => {
                  const resultLabel = match.result
                    ? formatPick(match.result, match.home_team, match.away_team)
                    : 'Ainda não lançado'

                  return (
                    <tr key={match.id} className="border-b border-gray-200 align-top">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        <div className="font-semibold">
                          {match.home_team} x {match.away_team}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          Jogo {match.match_order}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-700">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getPickBadgeClass(resultLabel)}`}>
                          {resultLabel}
                        </span>
                      </td>

                      {participants.map((participant) => {
                        const pick = predictionMap.get(`${match.id}-${participant.id}`)
                        const formattedPick = pick
                          ? formatPick(pick, match.home_team, match.away_team)
                          : 'Não enviado'

                        const isCorrect = match.result && pick === match.result

                        return (
                          <td
                            key={`${match.id}-${participant.id}`}
                            className={`px-4 py-4 text-sm ${
                              participant.id === user.id
                                ? 'bg-blue-50 font-semibold text-blue-900'
                                : 'text-gray-700'
                            }`}
                          >
                            <div className="flex flex-col gap-2">
                              <span
                                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
                                  formattedPick === 'Empate'
                                    ? 'border border-amber-200 bg-amber-100 text-amber-800'
                                    : 'border border-gray-200 bg-gray-100 text-gray-800'
                                }`}
                              >
                                {formattedPick}
                              </span>

                              {match.result ? (
                                <span
                                  className={`text-xs font-medium ${
                                    isCorrect ? 'text-green-700' : 'text-red-700'
                                  }`}
                                >
                                  {isCorrect ? 'Acertou' : 'Errou'}
                                </span>
                              ) : null}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Mobile */}
        <section className="space-y-4 lg:hidden">
          {(matches || []).map((match: MatchRow) => {
            const resultLabel = match.result
              ? formatPick(match.result, match.home_team, match.away_team)
              : 'Ainda não lançado'

            return (
              <div key={match.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {match.home_team} x {match.away_team}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Jogo {match.match_order}</p>
                  </div>

                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getPickBadgeClass(resultLabel)}`}>
                    {resultLabel}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {participants.map((participant) => {
                    const pick = predictionMap.get(`${match.id}-${participant.id}`)
                    const formattedPick = pick
                      ? formatPick(pick, match.home_team, match.away_team)
                      : 'Não enviado'

                    const isCorrect = match.result && pick === match.result

                    return (
                      <div
                        key={`${match.id}-${participant.id}`}
                        className={`rounded-xl border px-3 py-3 ${
                          participant.id === user.id
                            ? 'border-blue-200 bg-blue-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm ${
                                participant.id === user.id
                                  ? 'font-semibold text-blue-900'
                                  : 'font-medium text-gray-900'
                              }`}
                            >
                              {participant.name}
                            </span>

                            {participant.role === 'admin' ? (
                              <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] text-white">
                                Admin
                              </span>
                            ) : null}
                          </div>

                          <span className="text-sm text-gray-700">{formattedPick}</span>
                        </div>

                        {match.result ? (
                          <div
                            className={`mt-2 text-xs font-medium ${
                              isCorrect ? 'text-green-700' : 'text-red-700'
                            }`}
                          >
                            {isCorrect ? 'Acertou' : 'Errou'}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </section>
      </div>
    </main>
  )
}