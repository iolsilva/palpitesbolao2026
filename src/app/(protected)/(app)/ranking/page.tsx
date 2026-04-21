import { redirect } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/server'

type RoundScoreRow = {
  round_id: string
  user_id: string
  score: number
}

type ProfileRow = {
  id: string
  name: string | null
}

type RoundRow = {
  id: string
  name: string | null
  month_ref: string | null
  created_at?: string | null
}

type RankingItem = {
  name: string
  score: number
}

type RankedItem = RankingItem & {
  position: number
}

export default async function RankingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: scores, error: scoresError } = await supabase
    .from('round_scores')
    .select('round_id, user_id, score')

  if (scoresError) {
    return (
      <main className="p-4 md:p-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="mt-2 text-slate-700">
            Não foi possível carregar as pontuações.
          </p>
          <p className="mt-2 text-sm text-slate-500">{scoresError.message}</p>
        </div>
      </main>
    )
  }

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name')

  if (profilesError) {
    return (
      <main className="p-4 md:p-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="mt-2 text-slate-700">
            Não foi possível carregar os perfis.
          </p>
          <p className="mt-2 text-sm text-slate-500">{profilesError.message}</p>
        </div>
      </main>
    )
  }

  const { data: rounds, error: roundsError } = await supabase
    .from('rounds')
    .select('id, name, month_ref, created_at')
    .order('created_at', { ascending: true })

  if (roundsError) {
    return (
      <main className="p-4 md:p-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="mt-2 text-slate-700">
            Não foi possível carregar as rodadas.
          </p>
          <p className="mt-2 text-sm text-slate-500">{roundsError.message}</p>
        </div>
      </main>
    )
  }

  const scoreRows = (scores || []) as RoundScoreRow[]
  const profileRows = (profiles || []) as ProfileRow[]
  const roundRows = (rounds || []) as RoundRow[]

  const profileMap = new Map(profileRows.map((profile) => [profile.id, profile.name]))
  const roundMap = new Map(roundRows.map((round) => [round.id, round]))

  const latestRealRound =
    [...roundRows]
      .filter((round) => round.name?.toLowerCase().startsWith('rodada'))
      .at(-1) || null

  const latestRealRoundId = latestRealRound?.id || null
  const latestRealRoundName = latestRealRound?.name || 'Rodada atual'

  const latestMonthRef =
    [...roundRows]
      .filter((round) => round.month_ref)
      .at(-1)?.month_ref || null

  const roundScoreMap = new Map<string, number>()
  const generalScoreMap = new Map<string, number>()
  const monthlyScoreMap = new Map<string, number>()

  for (const row of scoreRows) {
    const participantName = profileMap.get(row.user_id) || 'Sem nome'
    const roundInfo = roundMap.get(row.round_id)

    generalScoreMap.set(
      participantName,
      (generalScoreMap.get(participantName) || 0) + row.score
    )

    if (row.round_id === latestRealRoundId) {
      roundScoreMap.set(
        participantName,
        (roundScoreMap.get(participantName) || 0) + row.score
      )
    }

    if (latestMonthRef && roundInfo?.month_ref === latestMonthRef) {
      monthlyScoreMap.set(
        participantName,
        (monthlyScoreMap.get(participantName) || 0) + row.score
      )
    }
  }

  const roundRanking = Array.from(roundScoreMap.entries())
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score)

  const generalRanking = Array.from(generalScoreMap.entries())
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score)

  const monthlyRanking = Array.from(monthlyScoreMap.entries())
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score)

  return (
    <main className="p-4 md:p-6">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.25),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.18),transparent_30%)] p-8 sm:p-10">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                Classificação
              </p>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Quem está voando na disputa?
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-300">
                Acompanhe quem está mandando bem na rodada, no mês e no acumulado da temporada.
              </p>
            </div>
          </div>
        </section>

        <RankingSection
          title={`Quem levou a melhor na ${latestRealRoundName}`}
          items={roundRanking}
          emptyText="Ainda não tem pontuação registrada para essa rodada."
        />

        <RankingSection
          title={`Melhores do mês${latestMonthRef ? ` — ${latestMonthRef}` : ''}`}
          items={monthlyRanking}
          emptyText="Ainda não tem pontuação mensal registrada."
        />

        <RankingSection
          title="Tabela geral da temporada"
          items={generalRanking}
          emptyText="Ainda não tem pontuação geral registrada."
        />
      </div>
    </main>
  )
}

function RankingSection({
  title,
  items,
  emptyText,
}: {
  title: string
  items: RankingItem[]
  emptyText: string
}) {
  const rankedItems: RankedItem[] = items.map((item) => {
    const firstIndexWithSameScore = items.findIndex(
      (otherItem) => otherItem.score === item.score
    )

    return {
      ...item,
      position: firstIndexWithSameScore + 1,
    }
  })

  const podium = rankedItems.slice(0, 3)

  return (
    <section className="space-y-4">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">
          A resenha fica boa quando a classificação começa a apertar.
        </p>
      </div>

      {rankedItems.length === 0 ? (
        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-slate-600">{emptyText}</p>
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            {podium.map((item, index) => {
            const styles = [
              'bg-amber-50 border-amber-300 shadow-md md:-translate-y-1 scale-[1.02]',
              'bg-slate-100 border-slate-200',
              'bg-orange-50 border-orange-200',
            ]

            const badgeStyles = [
              'bg-amber-400 text-slate-950',
              'bg-slate-400 text-white',
              'bg-orange-400 text-white',
            ]

              return (
                <div
                  key={`${item.name}-${index}`}
                  className={`rounded-[2rem] border p-6 shadow-sm ${styles[index] || 'bg-white border-slate-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${badgeStyles[index] || 'bg-slate-200 text-slate-800'}`}
                    >
                      {item.position}º lugar
                    </span>

                    <span className="text-2xl font-black text-slate-900">
                      {item.score}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-black tracking-tight text-slate-900">
                    {item.name}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600">
                    {index === 0
                      ? 'Tá voando baixo na disputa.'
                      : index === 1
                        ? 'Colado na liderança.'
                        : 'Segue forte na briga.'}
                  </p>
                </div>
              )
            })}
          </section>

          <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-bold text-slate-700">
                      Colocação
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-slate-700">
                      Integrante
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-slate-700">
                      Pontos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rankedItems.map((item, index) => (
                    <tr
                      key={`${item.name}-${index}`}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                        {item.position}º
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                        {item.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {item.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </section>
  )
}