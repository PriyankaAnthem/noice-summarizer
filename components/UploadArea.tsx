'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface UploadAreaProps {
  onFileUpload: (file: File) => void
}

export default function UploadArea({ onFileUpload }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('audio/')) {
        onFileUpload(file)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFileUpload(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card
      className={`border-2 border-dashed transition-all ${
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-primary/50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-6 px-6 py-12 sm:px-12 sm:py-16">
        <div className="rounded-lg bg-secondary p-4">
          <Upload className="h-8 w-8 text-primary" />
        </div>

        <div className="space-y-2 text-center">
          <h3 className="text-xl font-semibold text-foreground">
            Drag & drop your audio file here
          </h3>
          <p className="text-muted-foreground">
            or click the button below to select a file
          </p>
        </div>

        <Button
          onClick={handleClick}
          size="lg"
          className="px-8"
        >
          Choose File (MP3, WAV)
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mp3,audio/wav,audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <p className="text-xs text-muted-foreground">
          Supported formats: MP3, WAV, and other audio formats (Max 100MB)
        </p>
      </div>
    </Card>
  )
}
