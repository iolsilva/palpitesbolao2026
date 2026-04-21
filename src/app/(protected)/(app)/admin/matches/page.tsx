'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../../../lib/supabase/client'

type Round = {
  id: string
  name: string
}

export default function AdminMatchesPage() {
  const supabase = createClient()

  const [rounds, setRounds] = useState<Round[]>([])
  const [roundId, setRoundId] = useState('')
  const [matchOrder, setMatchOrder] = useState('')
  const [matchDate, setMatchDate] = useState('')
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
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

  async function handleCreateMatch() {
    if (!roundId || !matchOrder || !matchDate || !homeTeam || !awayTeam) {
      alert('Preencha todos os campos.')
      return
    }

    const parsedDate = new Date(matchDate)

    if (Number.isNaN(parsedDate.getTime())) {
      alert('Data e hora inválidas.')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('matches').insert([
      {
        round_id: roundId,
        match_order: Number(matchOrder),
        match_date: parsedDate.toISOString(),
        home_team: homeTeam.trim(),
        away_team: awayTeam.trim(),
      },
    ])

    setLoading(false)

    if (error) {
      alert('Erro ao criar jogo: ' + error.message)
      return
    }

    alert('Jogo cadastrado com sucesso!')

    setMatchOrder('')
    setMatchDate('')
    setHomeTeam('')
    setAwayTeam('')
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Cadastrar jogos da rodada</h1>

        <p className="mt-2 text-slate-600">
          Escolha a rodada e adicione os confrontos na ordem correta.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Rodada
            </label>
            <select
              value={roundId}
              onChange={(e) => setRoundId(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
            >
              <option value="">Selecione uma rodada</option>
              {rounds.map((round) => (
                <option key={round.id} value={round.id}>
                  {round.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Ordem do jogo
            </label>
            <input
              type="number"
              value={matchOrder}
              onChange={(e) => setMatchOrder(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="Ex: 1"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Data e hora
            </label>
            <input
              type="datetime-local"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Mandante
            </label>
            <input
              type="text"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="Ex: Flamengo"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Visitante
            </label>
            <input
              type="text"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              placeholder="Ex: Palmeiras"
            />
          </div>

          <button
            onClick={handleCreateMatch}
            disabled={loading}
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
          >
            {loading ? 'Salvando...' : 'Cadastrar jogo'}
          </button>
        </div>
      </div>
    </main>
  )
}