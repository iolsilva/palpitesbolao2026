import { createClient } from '../lib/supabase/client'

export async function scoreRound(roundId: string) {
  const supabase = createClient()

  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('id, result')
    .eq('round_id', roundId)

  if (matchesError) {
    throw new Error(matchesError.message)
  }

  const finishedMatches = (matches || []).filter((match) => match.result)

  if (finishedMatches.length === 0) {
    throw new Error('Nenhum resultado foi lançado para esta rodada.')
  }

  const matchIds = finishedMatches.map((match) => match.id)

  const { data: predictions, error: predictionsError } = await supabase
    .from('predictions')
    .select('user_id, match_id, pick')
    .in('match_id', matchIds)

  if (predictionsError) {
    throw new Error(predictionsError.message)
  }

  const resultMap = new Map(
    finishedMatches.map((match) => [match.id, match.result])
  )

  const scoreMap = new Map<string, number>()

  for (const prediction of predictions || []) {
    const correctResult = resultMap.get(prediction.match_id)

    if (prediction.pick === correctResult) {
      const current = scoreMap.get(prediction.user_id) || 0
      scoreMap.set(prediction.user_id, current + 1)
    } else {
      if (!scoreMap.has(prediction.user_id)) {
        scoreMap.set(prediction.user_id, 0)
      }
    }
  }

  const payload = Array.from(scoreMap.entries()).map(([userId, score]) => ({
    round_id: roundId,
    user_id: userId,
    score,
  }))

  const { error: upsertError } = await supabase
    .from('round_scores')
    .upsert(payload, { onConflict: 'round_id,user_id' })

  if (upsertError) {
    throw new Error(upsertError.message)
  }

  return payload
}