
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AudioScribe',
  description: 'Transcribe and summarise audio files',
  icons: {
    icon: '/favicon.png', // browser tab icon
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
       <head>
        {/*
          Inline script runs before React hydrates — prevents white flash
          on page load when dark mode is saved in localStorage.
          suppressHydrationWarning on <html> is required for this to work.
        */}
        
      
      </head>
      <body className={inter.className}>
        {/* SessionProvider makes useSession() work in every client component */}
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}