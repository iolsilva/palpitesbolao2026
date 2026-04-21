import { redirect } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/server'
import PredictionForm from '../../../../components/predictions/prediction-form'

type Match = {
  id: string
  match_order: number
  match_date: string
  home_team: string
  away_team: string
}

export default async function RodadaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const nowIso = new Date().toISOString()

  const { data: round, error: roundError } = await supabase
    .from('rounds')
    .select('id, name, lock_at')
    .gte('lock_at', nowIso)
    .order('lock_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (roundError) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="mt-2 text-gray-700">
            Não foi possível carregar a rodada.
          </p>
        </div>
      </main>
    )
  }

  if (!round) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Nenhuma rodada aberta</h1>
          <p className="mt-2 text-gray-600">
            No momento não existe rodada vigente disponível para palpites.
          </p>
        </div>
      </main>
    )
  }

  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('id, match_order, match_date, home_team, away_team')
    .eq('round_id', round.id)
    .order('match_order', { ascending: true })

  if (matchesError) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="mt-2 text-gray-700">
            Não foi possível carregar os jogos da rodada.
          </p>
        </div>
      </main>
    )
  }

  const { data: predictions } = await supabase
    .from('predictions')
    .select('match_id, pick')
    .eq('user_id', user.id)

  const predictionMap = new Map(
    (predictions || []).map((item) => [item.match_id, item.pick])
  )

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">{round.name}</h1>
        <p className="mt-2 text-gray-600">
          Envie seus palpites até o fechamento da rodada.
        </p>

        <div className="mt-6">
          <PredictionForm
            roundId={round.id}
            lockAt={round.lock_at}
            userId={user.id}
            matches={matches || []}
            initialPredictions={Object.fromEntries(predictionMap)}
          />
        </div>
      </div>
    </main>
  )
}