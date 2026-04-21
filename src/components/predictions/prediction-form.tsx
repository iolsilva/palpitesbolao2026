'use client'

import { useMemo, useState } from 'react'
import { createClient } from '../../lib/supabase/client'

type RoundMatch = {
  id: string
  match_order: number
  match_date: string
  home_team: string
  away_team: string
}

type Props = {
  roundId: string
  lockAt: string
  userId: string
  matches: RoundMatch[]
  initialPredictions: Record<string, string>
}

type PickValue = 'HOME' | 'DRAW' | 'AWAY'

function formatMatchDate(dateString: string) {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return 'Data inválida'
  }

  return date.toLocaleString('pt-BR')
}

export default function PredictionForm({
  lockAt,
  matches,
  initialPredictions,
  userId,
}: Props) {
  const supabase = createClient()

  const [predictions, setPredictions] = useState<Record<string, string>>(initialPredictions)
  const [loading, setLoading] = useState(false)

  const isLocked = useMemo(() => {
    return new Date() >= new Date(lockAt)
  }, [lockAt])

  function handlePick(matchId: string, pick: PickValue) {
    if (isLocked) return

    setPredictions((prev) => ({
      ...prev,
      [matchId]: pick,
    }))
  }

  async function handleSave() {
    if (isLocked) {
      alert('A rodada está bloqueada.')
      return
    }

    const missingPick = matches.some((match) => !predictions[match.id])

    if (missingPick) {
      alert('Preencha todos os palpites antes de salvar.')
      return
    }

    setLoading(true)

    const payload = matches.map((match) => ({
      match_id: match.id,
      user_id: userId,
      pick: predictions[match.id],
    }))

    const { error } = await supabase
      .from('predictions')
      .upsert(payload, { onConflict: 'match_id,user_id' })

    setLoading(false)

    if (error) {
      alert('Erro ao salvar palpites: ' + error.message)
      return
    }

    alert('Palpites salvos com sucesso!')
  }

  return (
    <div>
      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        {isLocked
          ? 'A rodada está fechada. Não é mais possível editar os palpites.'
          : `Rodada aberta até: ${formatMatchDate(lockAt)}`}
      </div>

      <div className="space-y-4">
        {matches.map((match) => {
          const selected = predictions[match.id]

          return (
            <div
              key={match.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Jogo {match.match_order}</p>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {match.home_team} x {match.away_team}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {formatMatchDate(match.match_date)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => handlePick(match.id, 'HOME')}
                  disabled={isLocked}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                    selected === 'HOME'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 bg-white text-slate-700'
                  } ${isLocked ? 'opacity-60' : 'hover:bg-slate-50'}`}
                >
                  {match.home_team}
                </button>

                <button
                  type="button"
                  onClick={() => handlePick(match.id, 'DRAW')}
                  disabled={isLocked}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                    selected === 'DRAW'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 bg-white text-slate-700'
                  } ${isLocked ? 'opacity-60' : 'hover:bg-slate-50'}`}
                >
                  Empate
                </button>

                <button
                  type="button"
                  onClick={() => handlePick(match.id, 'AWAY')}
                  disabled={isLocked}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                    selected === 'AWAY'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 bg-white text-slate-700'
                  } ${isLocked ? 'opacity-60' : 'hover:bg-slate-50'}`}
                >
                  {match.away_team}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading || isLocked}
        className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3 text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Salvando...' : 'Salvar palpites'}
      </button>
    </div>
  )
}