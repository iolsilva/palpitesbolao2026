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
      <main className="p-6">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="mt-2 text-gray-700">
            Não foi possível carregar as pontuações.
          </p>
          <p className="mt-2 text-sm text-gray-500">{scoresError.message}</p>
        </div>
      </main>
    )
  }

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name')

  if (profilesError) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="mt-2 text-gray-700">
            Não foi possível carregar os perfis.
          </p>
          <p className="mt-2 text-sm text-gray-500">{profilesError.message}</p>
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
      <main className="p-6">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="mt-2 text-gray-700">
            Não foi possível carregar as rodadas.
          </p>
          <p className="mt-2 text-sm text-gray-500">{roundsError.message}</p>
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
    <main className="p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Classificação da Resenha
          </h1>
          <p className="mt-2 text-slate-600">
            Veja como está a corrida da rodada, do mês e da temporada.
          </p>
        </section>

        <RankingCard
          title={`${latestRealRoundName}`}
          items={roundRanking}
        />

        <RankingCard
          title={`Ranking do mês${latestMonthRef ? ` ${latestMonthRef}` : ''}`}
          items={monthlyRanking}
        />

        <RankingCard
          title="Classificação Geral"
          items={generalRanking}
        />
      </div>
    </main>
  )
}

function RankingCard({
  title,
  items,
}: {
  title: string
  items: RankingItem[]
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

  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>

      {rankedItems.length === 0 ? (
        <p className="mt-4 text-slate-600">Nada por aqui ainda.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Colocação
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Integrante
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Pontos
                </th>
              </tr>
            </thead>
            <tbody>
              {rankedItems.map((item, index) => (
                <tr key={`${item.name}-${index}`} className="border-t border-slate-200">
                  <td className="px-4 py-3 text-sm text-slate-700">{item.position}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}