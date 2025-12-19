import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bickford Live Filing',
  description: 'Real-time chunk streaming and filing system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
