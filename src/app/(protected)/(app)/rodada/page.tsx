import { redirect } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/server'
import PredictionForm from '../../../../components/predictions/prediction-form'

type RoundMatch = {
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
      <main className="p-4 md:p-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="mt-2 text-slate-700">Não foi possível carregar a rodada.</p>
        </div>
      </main>
    )
  }

  if (!round) {
    return (
      <main className="p-4 md:p-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Nenhuma rodada aberta
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            No momento não há disputa aberta para palpites. Assim que a próxima rodada estiver liberada,
            ela aparece aqui para a resenha.
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
      <main className="p-4 md:p-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="mt-2 text-slate-700">Não foi possível carregar os jogos da rodada.</p>
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
    <main className="p-4 md:p-6">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.22),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_30%)] p-8 sm:p-10">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Rodada da vez
              </p>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                {round.name}
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-300">
                Manda seus palpites até o início do primeiro jogo da rodada e entre na disputa.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-5 md:p-8 shadow-sm">
          <PredictionForm
            roundId={round.id}
            lockAt={round.lock_at}
            userId={user.id}
            matches={(matches || []) as RoundMatch[]}
            initialPredictions={Object.fromEntries(predictionMap)}
          />
        </section>
      </div>
    </main>
  )
}