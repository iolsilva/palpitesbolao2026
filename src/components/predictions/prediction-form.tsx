'use client'

import { useMemo, useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import { useToast } from '../ui/toast-provider'

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
  const { showToast } = useToast()

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
      showToast('A rodada está fechada.', 'error')
      return
    }

    const missingPick = matches.some((match) => !predictions[match.id])

    if (missingPick) {
      showToast('Preencha todos os picks antes de salvar.', 'error')
      return
    }

    setLoading(true)

    const payload = matches.map((match) => ({
      match_id: match.id,
      user_id: userId,
      pick: predictions[match.id],
    }))

    const { error } = await supabase.rpc('submit_predictions', {
  p_predictions: payload.map((item) => ({
    match_id: item.match_id,
    pick: item.pick,
  })),
})

    setLoading(false)

    if (error) {
      showToast('Erro ao salvar picks: ' + error.message, 'error')
      return
    }

    showToast('Seus picks foram salvos com sucesso!', 'success')
  }

  return (
    <div className="space-y-5">
      <div
        className={`rounded-[2rem] border p-5 text-sm shadow-sm ${
          isLocked
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-emerald-200 bg-emerald-50 text-emerald-800'
        }`}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">
              Status da rodada
            </p>
            <p className="mt-1 text-base font-semibold">
              {isLocked
                ? 'Rodada encerrada'
                : `Palpites abertos até ${formatMatchDate(lockAt)}`}
            </p>
          </div>

          <div
            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${
              isLocked
                ? 'bg-red-100 text-red-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isLocked ? 'Fechada' : 'Aberta'}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {matches.map((match) => {
          const selected = predictions[match.id]

          return (
            <div
              key={match.id}
              className="overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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

                  <div className="inline-flex w-fit rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
                    Confronto
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="grid gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => handlePick(match.id, 'HOME')}
                    disabled={isLocked}
                    className={`rounded-[1.5rem] border px-4 py-4 text-sm font-bold shadow-sm transition active:scale-[0.98] ${
                      selected === 'HOME'
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    } ${isLocked ? 'opacity-60' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs uppercase tracking-[0.15em] opacity-80">
                        Mandante
                      </span>
                      <span>{match.home_team}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePick(match.id, 'DRAW')}
                    disabled={isLocked}
                    className={`rounded-[1.5rem] border px-4 py-4 text-sm font-bold shadow-sm transition active:scale-[0.98] ${
                      selected === 'DRAW'
                        ? 'border-amber-500 bg-amber-500 text-slate-950'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    } ${isLocked ? 'opacity-60' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs uppercase tracking-[0.15em] opacity-80">
                        Meio
                      </span>
                      <span>Empate</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePick(match.id, 'AWAY')}
                    disabled={isLocked}
                    className={`rounded-[1.5rem] border px-4 py-4 text-sm font-bold shadow-sm transition active:scale-[0.98] ${
                      selected === 'AWAY'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    } ${isLocked ? 'opacity-60' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs uppercase tracking-[0.15em] opacity-80">
                        Visitante
                      </span>
                      <span>{match.away_team}</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading || isLocked}
        className="w-full rounded-[1.5rem] bg-slate-950 px-4 py-4 text-sm font-bold text-white shadow-sm transition hover:opacity-95 active:scale-[0.99] disabled:opacity-60"
      >
        {loading ? 'Salvando picks...' : 'Salvar meus picks'}
      </button>
    </div>
  )
}