import { redirect } from 'next/navigation'
import { getUserProfile } from '../../../../lib/auth/get-user-profile'

export default async function AdminPage() {
  const { profile } = await getUserProfile()

  if (!profile) {
    redirect('/dashboard')
  }

  if (profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Painel administrativo</h1>
        <p className="mt-2 text-gray-600">
          Gerencie rodadas, jogos e resultados do campeonato.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <a
            href="/admin/rounds"
            className="rounded-2xl border border-gray-200 p-4 hover:bg-gray-50"
          >
            <h2 className="font-semibold text-gray-900">Rodadas</h2>
            <p className="mt-1 text-sm text-gray-600">
              Criar novas rodadas.
            </p>
          </a>

          <a
            href="/admin/matches"
            className="rounded-2xl border border-gray-200 p-4 hover:bg-gray-50"
          >
            <h2 className="font-semibold text-gray-900">Jogos</h2>
            <p className="mt-1 text-sm text-gray-600">
              Adicionar confrontos às rodadas.
            </p>
          </a>

          <a
            href="/admin/results"
            className="rounded-2xl border border-gray-200 p-4 hover:bg-gray-50"
          >
            <h2 className="font-semibold text-gray-900">Resultados</h2>
            <p className="mt-1 text-sm text-gray-600">
              Lançar resultados e calcular pontuação.
            </p>
          </a>
        </div>
      </div>
    </main>
  )
}