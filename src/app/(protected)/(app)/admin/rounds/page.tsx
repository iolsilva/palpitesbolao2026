'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CreateRoundPage() {
  const supabase = createClient()

  const [name, setName] = useState('')
  const [lockAt, setLockAt] = useState('')

  async function handleCreate() {
const monthRef = lockAt ? lockAt.slice(0, 7) : null

const { error } = await supabase.from('rounds').insert([
  {
    name,
    season: 2026,
    month_ref: monthRef,
    lock_at: lockAt,
  },
])

    if (error) {
      alert(error.message)
    } else {
      alert('Rodada criada!')
    }
  }

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl">
        <h1 className="text-xl font-bold mb-4">Criar Rodada</h1>

        <input
          placeholder="Nome da rodada"
          className="w-full border p-2 mb-3"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="datetime-local"
          className="w-full border p-2 mb-3"
          onChange={(e) => setLockAt(e.target.value)}
        />

        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Criar
        </button>
      </div>
    </main>
  )
}