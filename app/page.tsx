'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Header from '@/components/Header'
import UploadArea from '@/components/UploadArea'
import AudioPlayerPreview from '@/components/AudioPlayerPreview'
import ResultsSection from '@/components/ResultsSection'

export default function Home() {
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

  const handleGenerateSummary = async () => {
  if (!audioFile) return

  setIsLoading(true)

  try {
    const formData = new FormData()
    formData.append('file', audioFile)

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload-audio`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!res.ok) {
      throw new Error('Upload failed')
    }

    const data = await res.json()

    // 👇 for now backend returns only file info
    // later you will replace this with transcript + summary from AI
    const backendResults = {
      transcript: data.transcript || "Transcript will come from backend",
      summary: data.summary || [
        "Summary will come from backend after processing"
      ],
    }

    setResults(backendResults)
  } catch (err) {
    console.error(err)
    alert('Something went wrong while uploading')
  } finally {
    setIsLoading(false)
  }
}

  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Header />

        <div className="mt-12 space-y-8">
          {/* Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Upload Audio</h2>
              {audioFile && (
                <span className="text-sm text-muted-foreground">
                  {audioFile.name}
                </span>
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
                  onClick={() => {
                    setAudioFile(null)
                    setResults(null)
                  }}
                  variant="outline"
                >
                  Upload New File
                </Button>
              </div>
              <ResultsSection results={results} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
