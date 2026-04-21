'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../../../lib/supabase/client'
import { scoreRound } from '../../../../../services/score-round'



type Round = {
  id: string
  name: string
}

type RoundMatch = {
  id: string
  match_order: number
  home_team: string
  away_team: string
  result: 'HOME' | 'DRAW' | 'AWAY' | null
}

type ResultValue = 'HOME' | 'DRAW' | 'AWAY'

export default function AdminResultsPage() {
  const supabase = createClient()

  const [rounds, setRounds] = useState<Round[]>([])
  const [roundId, setRoundId] = useState('')
  const [matches, setMatches] = useState<RoundMatch[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadRounds() {
      const { data, error } = await supabase
        .from('rounds')
        .select('id, name')
        .order('created_at', { ascending: false })

      if (error) {
        alert('Erro ao carregar rodadas: ' + error.message)
        return
      }

      setRounds(data || [])
    }

    loadRounds()
  }, [supabase])

  useEffect(() => {
    async function loadMatches() {
      if (!roundId) {
        setMatches([])
        return
      }

      const { data, error } = await supabase
        .from('matches')
        .select('id, match_order, home_team, away_team, result')
        .eq('round_id', roundId)
        .order('match_order', { ascending: true })

      if (error) {
        alert('Erro ao carregar jogos: ' + error.message)
        return
      }

      setMatches((data || []) as RoundMatch[])
    }

    loadMatches()
  }, [roundId, supabase])

  function handleSelectResult(matchId: string, result: ResultValue) {
    setMatches((prev) =>
      prev.map((match) =>
        match.id === matchId ? { ...match, result } : match
      )
    )
  }

  async function handleSaveResults() {
    setLoading(true)

    for (const match of matches) {
      const { error } = await supabase
        .from('matches')
        .update({ result: match.result })
        .eq('id', match.id)

      if (error) {
        setLoading(false)
        alert('Erro ao salvar resultados: ' + error.message)
        return
      }
    }

    setLoading(false)
    alert('Resultados salvos com sucesso!')
  }

  async function handleScoreRound() {
  if (!roundId) {
    alert('Selecione uma rodada.')
    return
  }

  try {
    setLoading(true)
    await scoreRound(roundId)
    alert('Pontuação da rodada calculada com sucesso!')
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro ao calcular pontuação.'
    alert(message)
  } finally {
    setLoading(false)
  }
}

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Lançar resultados da rodada
        </h1>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Rodada
          </label>
          <select
            value={roundId}
            onChange={(e) => setRoundId(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          >
            <option value="">Selecione uma rodada</option>
            {rounds.map((round) => (
              <option key={round.id} value={round.id}>
                {round.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="rounded-2xl border border-gray-200 p-4"
            >
              <p className="text-sm text-gray-500">Jogo {match.match_order}</p>
              <h2 className="text-lg font-semibold text-gray-900">
                {match.home_team} x {match.away_team}
              </h2>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => handleSelectResult(match.id, 'HOME')}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                    match.result === 'HOME'
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  {match.home_team}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectResult(match.id, 'DRAW')}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                    match.result === 'DRAW'
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  Empate
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectResult(match.id, 'AWAY')}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                    match.result === 'AWAY'
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  {match.away_team}
                </button>
              </div>
            </div>
          ))}
        </div>

        {matches.length > 0 ? (
          <button
            type="button"
            onClick={handleSaveResults}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-3 text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Salvando...' : 'Salvar resultados'}
          </button>
        ) : null}
        <button
  type="button"
  onClick={handleScoreRound}
  disabled={loading || !roundId}
  className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 hover:bg-gray-50 disabled:opacity-60"
>
  {loading ? 'Processando...' : 'Calcular pontuação da rodada'}
</button>
      </div>
    </main>
  )
}