import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zero-Knowledge Vault',
  description: 'Secure password manager with zero-knowledge encryption',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
