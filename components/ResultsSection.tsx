

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { CheckCircle2, FileText } from 'lucide-react'

interface ResultsSectionProps {
  results: {
    transcript: string
    summary: string[]
  }
}

type Tab = 'transcript' | 'summary'

export default function ResultsSection({ results }: ResultsSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>('summary')

  return (
    <Card className="border border-border bg-card overflow-hidden">
      {/* ── Tab bar ─────────────────────────────────────────────── */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('summary')}
          className={`relative flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors
            ${activeTab === 'summary'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <div className={`rounded-md p-1 transition-colors ${activeTab === 'summary' ? 'bg-accent/15' : ''}`}>
            <CheckCircle2 className={`h-4 w-4 ${activeTab === 'summary' ? 'text-accent' : 'text-muted-foreground'}`} />
          </div>
          Summary
          {activeTab === 'summary' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-accent" />
          )}
        </button>

        <div className="w-px bg-border" />

        <button
          onClick={() => setActiveTab('transcript')}
          className={`relative flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors
            ${activeTab === 'transcript'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <div className={`rounded-md p-1 transition-colors ${activeTab === 'transcript' ? 'bg-primary/10' : ''}`}>
            <FileText className={`h-4 w-4 ${activeTab === 'transcript' ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          Transcript
          {activeTab === 'transcript' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
          )}
        </button>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6">

        {/* Summary */}
        {activeTab === 'summary' && (
          <ul className="space-y-3">
            {results.summary.map((point, index) => (
              <li key={index} className="flex gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[11px] font-bold text-accent">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-foreground/90">{point}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Transcript */}
        {activeTab === 'transcript' && (
          <div className="max-h-72 overflow-y-auto pr-1">
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {results.transcript}
            </p>
          </div>
        )}

      </div>
    </Card>
  )
}