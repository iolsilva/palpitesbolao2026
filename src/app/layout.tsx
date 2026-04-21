import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '../components/ui/toast-provider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Palpites Brasileirão',
  description: 'App de palpites entre amigos',
  applicationName: 'Palpites Brasileirão',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Palpites Brasileirão',
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: '#020617',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}