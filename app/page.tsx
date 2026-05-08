


'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import UploadArea from '@/components/UploadArea'
import AudioPlayerPreview from '@/components/AudioPlayerPreview'
import ResultsSection from '@/components/ResultsSection'
import HistorySidebar from '@/components/HistorySidebar'
import AuthButton from '@/components/AuthButton'



export default function Home() {
  const { status } = useSession()
  const isLoggedIn = status === 'authenticated'

  const [audioFile,    setAudioFile]    = useState<File | null>(null)
  const [isLoading,    setIsLoading]    = useState(false)
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [results,      setResults]      = useState<{
    transcript: string
    summary: string[]
  } | null>(null)

  const handleFileUpload = (file: File) => {
    setAudioFile(file)
    setResults(null)
  }

  const handleGenerateSummary = async () => {
    if (!audioFile) return
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', audioFile)

      const headers: HeadersInit = {}
      const tokenRes  = await fetch('/api/auth/token')
      const tokenData = await tokenRes.json()
      if (tokenData.token) headers['Authorization'] = `Bearer ${tokenData.token}`

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload-audio`,
        { method: 'POST', headers, body: formData }
      )
      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      setResults({
        transcript: data.transcript || 'Transcript will come from backend',
        summary:    data.summary    || ['Summary will come from backend after processing'],
      })
    } catch (err) {
      console.error(err)
      alert('Something went wrong while uploading')
    } finally {
      setIsLoading(false)
    }
  }

  const handleHistorySelect = async (sessionId: string) => {
    setSidebarOpen(false)
    try {
      const tokenRes  = await fetch('/api/auth/token')
      const { token } = await tokenRes.json()
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/history/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error('Failed to load session')
      const data = await res.json()
      setAudioFile(null)
      setResults({ transcript: data.transcript, summary: data.summary })
    } catch (err) {
      console.error(err)
      alert('Could not load that session')
    }
  }

  return (
    <main className="min-h-screen bg-background">

      {/* ── Topbar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <button
                onClick={() => setSidebarOpen(o => !o)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground transition-colors hover:bg-muted lg:hidden"
                aria-label="Toggle history"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1.5 3h11M1.5 7h11M1.5 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
           <div className="flex items-center gap-2">
  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-sm">
    <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
      <rect x="0"  y="4" width="2" height="3"  rx="1" fill="white"/>
      <rect x="3"  y="2" width="2" height="7"  rx="1" fill="white"/>
      <rect x="6"  y="0" width="2" height="11" rx="1" fill="white"/>
      <rect x="9"  y="2" width="2" height="7"  rx="1" fill="white"/>
      <rect x="12" y="4" width="2" height="3"  rx="1" fill="white"/>
    </svg>
  </div>

  {/* Name + description stacked vertically */}
  <div className="flex flex-col">
    <span className="text-sm font-semibold leading-tight tracking-tight text-foreground">
      AudioScribe
    </span>
    <p className="hidden text-[11px] leading-tight text-muted-foreground sm:block">
      Upload a speech recording to get a transcript and AI summary.
    </p>
  </div>
</div>
          </div>
        <AuthButton />
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="relative flex min-h-[calc(100vh-3.5rem)]">

        {/* Mobile overlay */}
        {isLoggedIn && sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        {isLoggedIn && (
          <div className={`
            fixed inset-y-0 left-0 z-30 mt-14 w-64 transform transition-transform duration-200 ease-in-out
            lg:static lg:mt-0 lg:translate-x-0 lg:transition-none 
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <HistorySidebar onSelect={handleHistorySelect} />
          </div>
        )}

        {/* Main */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="space-y-6">

              {/* ── Page title ──────────────────────────────────── */}
              {/* <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Audio Transcription
                </h1>
                
              </div> */}

              {/* ── Merged Upload + Preview card ────────────────── */}
              <Card className="overflow-hidden border border-border">

                {/* Speech-only notice — inside card at top */}
               
                <div className="p-5 sm:p-6 space-y-5">

                  {/* Upload area — hidden once file is selected */}
                  {!audioFile && (
                    <div className="space-y-3">
                      <UploadArea onFileUpload={handleFileUpload} />
                      {/* Supported formats */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground">Supported:</span>
                        {['MP3', 'MP4', 'WAV', 'M4A', 'WEBM', 'OGG', 'FLAC'].map(fmt => (
                          <span key={fmt} className="rounded-md border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview — shown once file is selected */}
                  {audioFile && (
                    <div className="space-y-4">
                      {/* File info row */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-primary">
                              <path d="M9 19V6l12-3v13M9 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM21 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{audioFile.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        {/* Change file button */}
                        <button
                          onClick={() => { setAudioFile(null); setResults(null) }}
                          className="shrink-0 rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          Change
                        </button>
                      </div>

                      {/* Audio player */}
                      <AudioPlayerPreview audioFile={audioFile} />
                    </div>
                  )}
 <div className="flex gap-2.5 border-b border-amber-200/60 bg-amber-50/80 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-950/30">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="mt-0.5 shrink-0 text-amber-500">
                    <path fillRule="evenodd" d="M7 0a7 7 0 1 0 0 14A7 7 0 0 0 7 0ZM6.25 4a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0V4Zm.75 7a.875.875 0 1 0 0-1.75A.875.875 0 0 0 7 11Z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-[11.5px] leading-relaxed text-amber-800 dark:text-amber-300">
                    <span className="font-semibold">Speech only</span> — works with meetings, lectures, interviews &amp; podcasts.{' '}
                    <span className="text-amber-700/80 dark:text-amber-400/70">Music &amp; instrumental audio not supported.</span>
                  </p>
                </div>

                </div>

                {/* Generate button — inside card at bottom, full width */}
                {audioFile && !results && (
                  <div className="border-t border-border bg-muted/20 px-5 py-4 sm:px-6">
                    <Button
                      onClick={handleGenerateSummary}
                      disabled={isLoading}
                      className="h-10 w-full rounded-xl text-sm font-semibold shadow-sm shadow-primary/20 transition-all hover:shadow-md hover:shadow-primary/30 disabled:opacity-60"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                          </svg>
                          Generating Summary…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Generate Summary
                        </span>
                      )}
                    </Button>
                    <p className="mt-2 text-center text-[11px] text-muted-foreground">
                      Takes 10–30 seconds depending on audio length
                    </p>
                  </div>
                )}

              </Card>

              {/* ── Results ─────────────────────────────────────── */}
              {results && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-semibold uppercase tracking-widest] text-muted-foreground">
                        Results
                      </label>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-800/50">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Complete
                      </span>
                    </div>
                    <button
                      onClick={() => { setAudioFile(null); setResults(null) }}
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
                    >
                      New File
                    </button>
                  </div>

                  <ResultsSection results={results} />

                  {/* Guest nudge */}
                  {!isLoggedIn && (
                    <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-3.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                          <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2ZM4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-foreground">Session not saved</p>
                        <p className="text-[11px] text-muted-foreground">
                          <button
                            onClick={() => signIn('google')}
                            className="font-semibold text-primary underline-offset-2 hover:underline"
                          >
                            Sign in with Google
                          </button>{' '}
                          to save history and access it anytime.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </main>
  )
}