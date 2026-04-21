import { redirect } from 'next/navigation'
import { getUserProfile } from '../../../lib/auth/get-user-profile'
import PrimeiroAcessoForm from './primeiro-acesso-form'

export default async function PrimeiroAcessoPage() {
  const { user, profile } = await getUserProfile()

  if (!user) {
    redirect('/login')
  }

  if (!profile) {
    redirect('/login')
  }

  if (!profile.must_change_password) {
    redirect('/dashboard')
  }

  return <PrimeiroAcessoForm />
}