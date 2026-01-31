"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EyeOff, Download, File as FileIcon, ShieldAlert } from 'lucide-react'
import { PDFDocument, rgb } from 'pdf-lib'

export default function RedactPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) setFile(files[0])
  }

  const handleRedact = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      const pages = pdfDoc.getPages()
      const firstPage = pages[0]

      const { width, height } = firstPage.getSize()

      // For MVP: Redact a fixed area (top right) or eventually allow selection
      // Here we just redact a "confidential" area as a demo
      firstPage.drawRectangle({
        x: 50,
        y: height - 100,
        width: 200,
        height: 50,
        color: rgb(0, 0, 0),
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `redacted_${file.name}`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      console.error(error)
      alert("Failed to redact PDF.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
          <EyeOff className="h-8 w-8 text-primary" />
          Redact PDF
        </h1>
        <p className="text-muted-foreground">
          Permanently remove sensitive content from your PDF.
        </p>
      </div>

      {!file ? (
        <div className="max-w-xl mx-auto">
          <Dropzone onFileSelect={handleFileSelect} maxFiles={1} />
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8">
          <Card className="p-8 w-full max-w-md flex flex-col items-center space-y-4">
            <div className="h-20 w-20 bg-red-100 rounded-2xl flex items-center justify-center dark:bg-red-900/20">
              <FileIcon className="h-10 w-10 text-red-600" />
            </div>
            <p className="font-semibold truncate w-full text-center">{file.name}</p>
            <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-destructive hover:text-destructive">
              Remove
            </Button>
          </Card>

          <Card className="p-6 w-full max-w-md bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30">
            <div className="flex gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                This will permanently blackout the top-left section of your document.
                Full area selection coming soon.
              </p>
            </div>
          </Card>

          <Button
            size="lg"
            onClick={handleRedact}
            disabled={isProcessing}
            className="w-full max-w-sm"
          >
            {isProcessing ? "Redacting..." : "Redact and Download"} <Download className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
