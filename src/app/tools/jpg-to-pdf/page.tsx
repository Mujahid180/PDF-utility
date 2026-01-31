"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Image as ImageIcon, Download, Trash, ArrowLeft } from 'lucide-react'

export default function JpgToPdfPage() {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleConvert = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch('/api/jpg-to-pdf', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error("Failed to convert")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `images_combined.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()

    } catch (error) {
      console.error(error)
      alert("Failed to convert images to PDF.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClear = () => setFiles([])

  if (files.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
            <ImageIcon className="h-8 w-8 text-primary" />
            JPG to PDF
          </h1>
          <p className="text-muted-foreground">
            Convert your images to a single PDF document.
          </p>
        </div>
        <div className="max-w-xl mx-auto">
          <Dropzone
            onFileSelect={handleFileSelect}
            accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }}
            maxFiles={20}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={handleClear}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Clear & Start Over
        </Button>
        <Button onClick={handleConvert} disabled={isProcessing} size="lg">
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Convert {files.length} Images to PDF
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {files.map((file, index) => (
          <Card key={index} className="relative group overflow-hidden aspect-square border-2">
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button variant="destructive" size="icon" onClick={() => handleRemove(index)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate text-center">
              {index + 1}. {file.name}
            </div>
          </Card>
        ))}
        <Dropzone
          onFileSelect={handleFileSelect}
          accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }}
          className="aspect-square flex items-center justify-center border-dashed"
          maxFiles={10}
        />
      </div>
    </div>
  )
}
