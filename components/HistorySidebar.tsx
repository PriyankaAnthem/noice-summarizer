'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

// Gets the signed JWT from the Next.js server — NEXTAUTH_SECRET never hits the browser
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

  // Fetch history directly from FastAPI when user logs in
  useEffect(() => {
    if (status !== 'authenticated') return
    setLoading(true)

    ;(async () => {
      try {
        const token = await getBearerToken()
        const res   = await fetch(
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

  // Delete session directly via FastAPI
  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    try {
      const token = await getBearerToken()
      const res   = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/history/${id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error('Delete failed')
      setSessions(prev => prev.filter(s => s.id !== id))
      if (activeId === id) setActiveId(null)
    } catch (err) {
      console.error(err)
      alert('Could not delete session')
    }
  }

  function handleSelect(id: string) {
    setActiveId(id)
    onSelect(id)
  }

  // Guest state — sidebar is still visible but nudges the user to sign in
  if (status !== 'authenticated') {
    return (
      <aside className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sign in to save and view your past sessions.
        </p>
      </aside>
    )
  }

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-700 p-3 flex flex-col gap-2 overflow-y-auto">
      <h2 className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 px-1">
        History
      </h2>

      {loading && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <p className="text-sm text-gray-400 px-1">No sessions yet.</p>
      )}

      {sessions.map(s => (
        <button
          key={s.id}
          onClick={() => handleSelect(s.id)}
          className={`group text-left w-full rounded-lg px-3 py-2.5 transition-colors
            ${activeId === s.id
              ? 'bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
            }`}
        >
          <div className="flex items-start justify-between gap-1">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
              {s.filename}
            </span>
            <span
              role="button"
              onClick={e => handleDelete(e, s.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500
                         transition-opacity text-xs pt-0.5 shrink-0"
              aria-label="Delete session"
            >
              ✕
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {new Date(s.createdAt).toLocaleDateString(undefined, {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
          {s.summary?.[0] && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {s.summary[0]}
            </p>
          )}
        </button>
      ))}
    </aside>
  )
}