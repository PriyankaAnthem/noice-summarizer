



'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

async function getBearerToken(): Promise<string> {
  const res = await fetch('/api/auth/token')
  if (!res.ok) throw new Error('Not authenticated')
  const { token } = await res.json()
  return token
}

type HistorySession = {
  id:        string
  filename:  string
  summary:   string[]
  createdAt: string
}

type Props = {
  onSelect: (sessionId: string) => void
}

export default function HistorySidebar({ onSelect }: Props) {
  const { status } = useSession()
  const [sessions, setSessions] = useState<HistorySession[]>([])
  const [loading,  setLoading]  = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') return
    setLoading(true)
    ;(async () => {
      try {
        const token = await getBearerToken()
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/history`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!res.ok) throw new Error('Failed to load history')
        const data = await res.json()
        setSessions(data.sessions)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [status])

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    try {
      const token = await getBearerToken()
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/history/${id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error('Delete failed')
      setSessions(prev => prev.filter(s => s.id !== id))
      if (activeId === id) setActiveId(null)
    } catch (err) {
      console.error(err)
    }
  }

  function handleSelect(id: string) {
    setActiveId(id)
    onSelect(id)
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border h-full">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <div className="flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-muted-foreground">
            <path d="M1.5 2.5h10M1.5 6.5h10M1.5 10.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            History
          </span>
        </div>
        {sessions.length > 0 && (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {sessions.length}
          </span>
        )}
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-2">

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-1 px-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col gap-1.5 rounded-xl p-3">
                <div className="h-2.5 w-3/4 animate-pulse rounded-full bg-muted" />
                <div className="h-2 w-1/2 animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && sessions.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-muted-foreground">
                <path d="M3 9a6 6 0 1 1 12 0A6 6 0 0 1 3 9ZM9 6v3.5M9 12h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-[12px] font-medium text-muted-foreground">No sessions yet</p>
            <p className="text-[11px] text-muted-foreground/70">
              Upload an audio file to get started
            </p>
          </div>
        )}

        {/* Session items */}
        {!loading && sessions.map(s => {
          const isActive = activeId === s.id
          const date = new Date(s.createdAt)
          const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

          return (
            <div key={s.id} className="px-2 py-0.5">
              <button
                onClick={() => handleSelect(s.id)}
                className={`group relative w-full rounded-xl px-3 py-2.5 text-left transition-all duration-150
                  ${isActive
                    ? 'bg-primary/10 shadow-sm ring-1 ring-primary/20'
                    : 'hover:bg-muted/60'
                  }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
                )}

                <div className="flex items-start justify-between gap-1">
                  {/* File name */}
                  <p className={`line-clamp-1 text-[12px] font-medium leading-tight
                    ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {s.filename.replace(/\.[^/.]+$/, '')}
                  </p>

                  {/* Delete button */}
                  <button
                    onClick={e => handleDelete(e, s.id)}
                    className="mt-0.5 shrink-0 rounded-md p-0.5 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-950/40"
                    aria-label="Delete session"
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                {/* Date + time */}
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {dateStr} · {timeStr}
                </p>

                {/* First summary bullet */}
                {s.summary?.[0] && (
                  <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground/80">
                    {s.summary[0]}
                  </p>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3">
        <p className="text-[10px] text-muted-foreground/60 text-center">
          Sessions saved for 90 days
        </p>
      </div>
    </aside>
  )
}