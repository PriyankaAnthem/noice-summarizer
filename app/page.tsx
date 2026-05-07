'use client'

import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Header from '@/components/Header'
import UploadArea from '@/components/UploadArea'
import AudioPlayerPreview from '@/components/AudioPlayerPreview'
import ResultsSection from '@/components/ResultsSection'
import HistorySidebar from '@/components/HistorySidebar'
import AuthButton from '@/components/AuthButton'

export default function Home() {
  const { data: session } = useSession()

  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<{
    transcript: string
    summary: string[]
  } | null>(null)

  const handleFileUpload = (file: File) => {
    setAudioFile(file)
    setResults(null)
  }

  // const handleGenerateSummary = async () => {
  //   if (!audioFile) return
  //   setIsLoading(true)

  //   try {
  //     const formData = new FormData()
  //     formData.append('file', audioFile)

  //     // Build headers — attach JWT token for logged-in users so backend saves history
  //     const headers: HeadersInit = {}
  //     if (session) {
  //       const tokenRes = await fetch('/api/auth/token')
  //       const { token } = await tokenRes.json()
  //       console.log('Token response:', token) 
  //       if (token) headers['Authorization'] = `Bearer ${token}`
  //     }

  //     const res = await fetch(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload-audio`,
  //       { method: 'POST', headers, body: formData }
  //     )

  //     if (!res.ok) throw new Error('Upload failed')

  //     const data = await res.json()
  //     setResults({
  //       transcript: data.transcript || 'Transcript will come from backend',
  //       summary: data.summary || ['Summary will come from backend after processing'],
  //     })
  //   } catch (err) {
  //     console.error(err)
  //     alert('Something went wrong while uploading')
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }
  const handleGenerateSummary = async () => {
  if (!audioFile) return
  setIsLoading(true)

  try {
    const formData = new FormData()
    formData.append('file', audioFile)

    const headers: HeadersInit = {}

    // Remove the "if (session)" check — always fetch token
    // Guest ke liye /api/auth/token null return karta hai, logged-in ke liye real JWT
    const tokenRes = await fetch('/api/auth/token')
    const tokenData = await tokenRes.json()
    
    if (tokenData.token) {
      headers['Authorization'] = `Bearer ${tokenData.token}`
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload-audio`,
      { method: 'POST', headers, body: formData }
    )

    if (!res.ok) throw new Error('Upload failed')

    const data = await res.json()
    console.log('sessionId:', data.sessionId) // should now be a real MongoDB ID
    
    setResults({
      transcript: data.transcript || 'Transcript will come from backend',
      summary: data.summary || ['Summary will come from backend after processing'],
    })
  } catch (err) {
    console.error(err)
    alert('Something went wrong while uploading')
  } finally {
    setIsLoading(false)
  }
}

  // Load a past session from the history sidebar
  const handleHistorySelect = async (sessionId: string) => {
    try {
      const tokenRes = await fetch('/api/auth/token')
      const { token } = await tokenRes.json()

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/history/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error('Failed to load session')

      const data = await res.json()
      setAudioFile(null)           // no file object for past sessions
      setResults({
        transcript: data.transcript,
        summary:    data.summary,
      })
    } catch (err) {
      console.error(err)
      alert('Could not load that session')
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* ── Top bar with auth button ─────────────────────────────── */}
      <div className="flex justify-end px-4 sm:px-6 lg:px-8 py-3 border-b border-border">
        <AuthButton />
      </div>

      {/* ── Body: sidebar + main content ─────────────────────────── */}
      <div className="flex">
        {/* History sidebar — visible only to logged-in users */}
        <HistorySidebar onSelect={handleHistorySelect} />

        {/* Main content — unchanged layout from original */}
        <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <Header />

            <div className="mt-12 space-y-8">
              {/* Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-foreground">Upload Audio</h2>
                  {audioFile && (
                    <span className="text-sm text-muted-foreground">{audioFile.name}</span>
                  )}
                </div>
                <UploadArea onFileUpload={handleFileUpload} />
              </div>

              {/* Audio Player Section */}
              {audioFile && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">Preview</h2>
                  <AudioPlayerPreview audioFile={audioFile} />
                </div>
              )}

              {/* Generate Summary Button */}
              {audioFile && !results && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleGenerateSummary}
                    disabled={isLoading}
                    size="lg"
                    className="px-12"
                  >
                    {isLoading ? 'Generating Summary...' : 'Generate Summary'}
                  </Button>
                </div>
              )}

              {/* Results Section */}
              {results && (
                <div className="space-y-6 pt-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-foreground">Results</h2>
                    <Button
                      onClick={() => { setAudioFile(null); setResults(null) }}
                      variant="outline"
                    >
                      Upload New File
                    </Button>
                  </div>
                  <ResultsSection results={results} />
                </div>
              )}

              {/* Guest nudge — shown below results only when not logged in */}
              {results && !session && (
                <p className="text-sm text-center text-muted-foreground pb-4">
                  <button
                    onClick={() => signIn('google')}
                    className="underline underline-offset-2 hover:text-foreground transition-colors"
                  >
                    Sign in
                  </button>{' '}
                  to save this session and access it later.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}