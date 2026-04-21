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
      <main className="p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Meus palpites</h1>
          <p className="mt-2 text-gray-600">
            Ainda não existe nenhuma rodada disponível para consulta.
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
      <main className="p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="mt-2 text-gray-600">
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
      <main className="p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="mt-2 text-gray-600">
            Não foi possível carregar seus palpites.
          </p>
        </div>
      </main>
    )
  }

  const predictionMap = new Map(
    ((predictions || []) as PredictionRow[]).map((item) => [item.match_id, item.pick])
  )

  const isLocked = new Date() >= new Date(selectedRound.lock_at)

  return (
    <main className="p-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Meus palpites</h1>
        <p className="mt-2 text-gray-600">
          Rodada selecionada: <strong>{selectedRound.name}</strong>
        </p>

        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          {isLocked
            ? 'A rodada está fechada. Seus palpites estão em modo de consulta.'
            : 'A rodada ainda está aberta. Você pode conferir aqui e editar pela tela da rodada.'}
        </div>

        <div className="mt-6 space-y-4">
          {(matches || []).map((match: RoundMatch) => {
            const pick = predictionMap.get(match.id)

            return (
              <div key={match.id} className="rounded-2xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Jogo {match.match_order}</p>
                <h2 className="text-lg font-semibold text-gray-900">
                  {match.home_team} x {match.away_team}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date(match.match_date).toLocaleString('pt-BR')}
                </p>

                <div className="mt-3 rounded-xl bg-gray-100 p-3 text-sm text-gray-800">
                  <strong>Seu palpite:</strong>{' '}
                  {pick ? formatPick(pick, match.home_team, match.away_team) : 'Não enviado'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}