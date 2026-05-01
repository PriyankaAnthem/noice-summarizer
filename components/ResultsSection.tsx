import { Card } from '@/components/ui/card'
import { CheckCircle2, FileText } from 'lucide-react'

interface ResultsSectionProps {
  results: {
    transcript: string
    summary: string[]
  }
}

export default function ResultsSection({ results }: ResultsSectionProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Transcript Card */}
      <Card className="border border-border bg-card">
        <div className="space-y-4 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Transcript</h3>
          </div>

          <div className="border-t border-border pt-4">
            <p className="leading-relaxed text-foreground/90">
              {results.transcript}
            </p>
          </div>
        </div>
      </Card>

      {/* Summary Card */}
      <Card className="border border-border bg-card">
        <div className="space-y-4 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/10 p-2">
              <CheckCircle2 className="h-5 w-5 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Summary</h3>
          </div>

          <div className="border-t border-border pt-4">
            <ul className="space-y-3">
              {results.summary.map((point, index) => (
                <li key={index} className="flex gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">
                    {index + 1}
                  </span>
                  <span className="text-foreground/90">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
