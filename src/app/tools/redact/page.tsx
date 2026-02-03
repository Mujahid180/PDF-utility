"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EyeOff, Download, File as FileIcon, ShieldAlert, ArrowLeft, Loader2, Trash } from 'lucide-react'
import { PDFDocument, rgb } from 'pdf-lib'
import { renderPdfToImages } from "@/lib/pdf-renderer"

interface Redaction {
  x: number
  y: number
  width: number
  height: number
  pageIndex: number
}

export default function RedactPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pdfImages, setPdfImages] = useState<string[]>([])
  const [redactions, setRedactions] = useState<Redaction[]>([])
  const [currentStep, setCurrentStep] = useState<'upload' | 'redact'>('upload')

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      setCurrentStep('redact')
      try {
        const blobs = await renderPdfToImages(files[0], { scale: 1.0, limit: 1 }, () => { })
        if (blobs.length > 0) {
          setPdfImages([URL.createObjectURL(blobs[0])])
        }
      } catch (err) {
        console.error("Preview failed", err)
      }
    }
  }

  const handleRedact = async () => {
    if (!file || redactions.length === 0) return

    setIsProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()

      redactions.forEach(red => {
        const page = pages[red.pageIndex]
        const { width, height } = page.getSize()

        page.drawRectangle({
          x: (red.x * width) / 100 - (red.width / 2),
          y: height - (red.y * height) / 100 - (red.height / 2),
          width: (red.width * width) / 100,
          height: (red.height * height) / 100,
          color: rgb(0, 0, 0),
        })
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
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      alert("Failed to redact PDF.")
    } finally {
      setIsProcessing(false)
    }
  }

  const addRedaction = (x: number, y: number) => {
    setRedactions(prev => [...prev, { x, y, width: 15, height: 5, pageIndex: 0 }])
  }

  if (currentStep === 'upload') {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
            <EyeOff className="h-8 w-8 text-primary" />
            Redact PDF
          </h1>
          <p className="text-muted-foreground">Permanently remove sensitive content from your PDF documents.</p>
        </div>
        <div className="max-w-xl mx-auto">
          <Dropzone onFileSelect={handleFileSelect} maxFiles={1} />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={() => setCurrentStep('upload')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Upload
        </Button>
        <Button
          size="lg"
          onClick={handleRedact}
          disabled={redactions.length === 0 || isProcessing}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Apply Redactions & Download
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="p-6 lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Redactions</h3>
            <p className="text-sm text-muted-foreground">Click on the document to add blackout areas.</p>
          </div>

          <div className="space-y-3">
            {redactions.map((red, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-lg text-sm">
                <span>Redaction #{idx + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => setRedactions(prev => prev.filter((_, i) => i !== idx))} className="h-8 w-8 p-0 text-red-600">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {redactions.length === 0 && (
              <p className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">No redactions added yet</p>
            )}
          </div>

          <Card className="p-4 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30">
            <div className="flex gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Redactions are permanent and cannot be undone after downloading.
              </p>
            </div>
          </Card>
        </Card>

        <div className="lg:col-span-3 flex justify-center">
          <div className="bg-zinc-200 dark:bg-zinc-800 p-4 rounded-xl shadow-inner max-w-full overflow-auto inline-block">
            {pdfImages.length > 0 ? (
              <div
                className="relative cursor-crosshair border shadow-2xl bg-white"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = ((e.clientX - rect.left) / rect.width) * 100
                  const y = ((e.clientY - rect.top) / rect.height) * 100
                  addRedaction(x, y)
                }}
              >
                <img src={pdfImages[0]} alt="PDF Preview" className="max-w-full h-auto pointer-events-none" />
                {redactions.map((red, idx) => (
                  <div
                    key={idx}
                    className="absolute bg-black shadow-lg"
                    style={{
                      left: `${red.x}%`,
                      top: `${red.y}%`,
                      width: `${red.width}%`,
                      height: `${red.height}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="h-[600px] w-[450px] flex items-center justify-center bg-muted">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
