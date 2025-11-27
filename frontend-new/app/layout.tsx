import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FHE Number Guessing Game',
  description: 'Guess the encrypted number using FHEVM technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* FHEVM SDK CDN - Must be loaded before page initialization */}
        <Script
          src="https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen game-container">
          {children}
        </div>
      </body>
    </html>
  )
}