'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'

export default function PrimeiroAcessoForm() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (password.length < 6) {
      setMessage('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('As senhas não coincidem.')
      return
    }

    setLoading(true)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setLoading(false)
      setMessage('Não foi possível identificar o usuário logado.')
      return
    }

    const { error: updateAuthError } = await supabase.auth.updateUser({
      password,
    })

    if (updateAuthError) {
      setLoading(false)
      setMessage('Erro ao atualizar a senha: ' + updateAuthError.message)
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ must_change_password: false })
      .eq('id', user.id)

    setLoading(false)

    if (profileError) {
      setMessage('A senha foi alterada, mas houve erro ao atualizar o perfil.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-6">
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            Primeiro acesso
          </span>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
            Defina sua nova senha
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Para continuar usando o sistema, você precisa trocar a senha provisória
            criada no seu cadastro.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Nova senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500"
              placeholder="Digite sua nova senha"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Confirmar nova senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500"
              placeholder="Confirme sua nova senha"
            />
          </div>

          {message ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:opacity-95 disabled:opacity-60"
          >
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </main>
  )
}