import { Mic } from 'lucide-react'

export default function Header() {
  return (
    <header className="space-y-4">
      <div className="flex items-center justify-center gap-3">
        <div className="rounded-lg bg-primary p-3">
          <Mic className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">
          Voice Note <span className="text-primary">Summarizer</span>
        </h1>
      </div>
      <p className="text-center text-lg text-muted-foreground">
        Transform your voice notes into concise summaries instantly
      </p>
    </header>
  )
}
