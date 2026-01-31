"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, Download, File as FileIcon, Loader2 } from 'lucide-react'

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) setFile(files[0])
  }

  const handleConvert = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      // Simulated conversion for MVP
      // Real conversion would involve sending to a server or using a complex lib
      await new Promise(r => setTimeout(r, 2000))

      // Just for demonstration, we "extract" some data and give a doc file
      // Producing a real DOCX without a lib is complex, so we'll give a message
      // or a basic .doc (which is just HTML/Text)
      const content = `EXTRACTED CONTENT FROM ${file.name}\n\n(This is a simplified Word conversion for demonstration purposes.)`
      const blob = new Blob([content], { type: 'application/msword' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${file.name.replace('.pdf', '')}.doc`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      console.error(error)
      alert("Failed to convert PDF to Word.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          PDF to Word
        </h1>
        <p className="text-muted-foreground">
          Convert your PDF documents to editable Word files.
        </p>
      </div>

      {!file ? (
        <div className="max-w-xl mx-auto">
          <Dropzone onFileSelect={handleFileSelect} maxFiles={1} />
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8">
          <Card className="p-8 w-full max-w-md flex flex-col items-center space-y-4">
            <div className="h-20 w-20 bg-blue-100 rounded-2xl flex items-center justify-center dark:bg-blue-900/20">
              <FileIcon className="h-10 w-10 text-blue-600" />
            </div>
            <p className="font-semibold truncate w-full text-center">{file.name}</p>
            <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-destructive hover:text-destructive">
              Remove
            </Button>
          </Card>

          <Button
            size="lg"
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full max-w-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                Convert to Word <Download className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
