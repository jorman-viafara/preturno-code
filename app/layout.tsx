import type { Metadata } from 'next'
import './globals.css'
import * as React from 'react'

export const metadata: Metadata = {
  title: 'Preturno',
  description: '',
  generator: '@MerzDev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
