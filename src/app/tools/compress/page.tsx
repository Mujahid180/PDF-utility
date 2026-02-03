"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Loader2, Minimize2, Download, ArrowLeft, Info } from 'lucide-react'
import { renderPdfToImages } from "@/lib/pdf-renderer"
import { PDFDocument } from 'pdf-lib'

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState([0.7]) // 0.1 to 1.0 (JPEG Quality)
  const [scale, setScale] = useState([1.5]) // Resolution scale (1.0 = 72dpi, 2.0 = 144dpi)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) setFile(files[0])
  }

  const handleCompress = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    setStatus("Analyzing PDF pages...")

    try {
      // Step 1: Render pages to images (Rasterize)
      // This removes hidden vector data/layers, often reducing size for complex docs
      // It heavily depends on the target quality/scale.
      const blobs = await renderPdfToImages(file, {
        scale: scale[0],
        quality: quality[0]
      }, (current, total) => {
        setProgress(Math.round((current / total) * 50)) // First 50%
        setStatus(`Rasterizing page ${current} of ${total}...`)
      })

      setStatus("Re-building PDF...")
      const newPdf = await PDFDocument.create()

      for (let i = 0; i < blobs.length; i++) {
        const blob = blobs[i]
        const arrayBuffer = await blob.arrayBuffer()
        const image = await newPdf.embedJpg(arrayBuffer)

        const page = newPdf.addPage([image.width, image.height])
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        })

        const pct = 50 + Math.round(((i + 1) / blobs.length) * 50)
        setProgress(pct)
      }

      const pdfBytes = await newPdf.save()
      const compressedBlob = new Blob([pdfBytes as any], { type: 'application/pdf' })

      // Check size difference
      const originalSize = (file.size / 1024 / 1024).toFixed(2)
      const newSize = (compressedBlob.size / 1024 / 1024).toFixed(2)

      setStatus(`Done! Reduced ${originalSize}MB to ${newSize}MB`)

      // Download
      const url = window.URL.createObjectURL(compressedBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `compressed_${file.name}`
      document.body.appendChild(a)
      a.click()
      a.remove()

    } catch (error) {
      console.error("Compression failed", error)
      setStatus("Failed to compress.")
      alert("Failed to compress PDF. Try a different quality setting.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!file) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
            <Minimize2 className="h-8 w-8 text-primary" />
            Compress PDF
          </h1>
          <p className="text-muted-foreground">
            Reduce file size by optimizing pages (Visual Compression).
          </p>
        </div>
        <div className="max-w-xl mx-auto">
          <Dropzone onFileSelect={handleFileSelect} maxFiles={1} />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="ghost" onClick={() => setFile(null)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-8">
          <h2 className="text-xl font-semibold">Compression Settings</h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Image Quality (JPEG Compression)</Label>
              <span className="text-sm text-muted-foreground">{Math.round(quality[0] * 100)}%</span>
            </div>
            <Slider value={quality} onValueChange={setQuality} min={0.1} max={1.0} step={0.1} />
            <p className="text-xs text-muted-foreground">Lower = Smaller File, Higher = Better Looks</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Resolution Scale (DPI)</Label>
              <span className="text-sm text-muted-foreground">{scale[0]}x</span>
            </div>
            <Slider value={scale} onValueChange={setScale} min={0.5} max={3.0} step={0.5} />
            <p className="text-xs text-muted-foreground">0.5 = Low Res, 1.0 = Standard (72dpi), 2.0 = High (144dpi)</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3 text-sm text-blue-700 dark:text-blue-300">
            <Info className="h-5 w-5 shrink-0" />
            <p>
              This tool uses "Visual Compression". It converts pages to images and re-packs them.
              Text will no longer be selectable, but it effectively shrinks scanned documents and complex vector files.
            </p>
          </div>

          {(quality[0] > 0.8 && scale[0] > 1.5) && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg flex gap-3 text-sm text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Info className="h-5 w-5 shrink-0" />
              <p>
                <strong>Note:</strong> High quality and scale settings might result in a <strong>larger</strong> file size than the original, especially if your PDF contains mostly text (vectors). Try 1.0x or 1.5x scale for better results.
              </p>
            </div>
          )}

          <Button onClick={handleCompress} disabled={isProcessing} className="w-full" size="lg">
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Compress PDF
          </Button>

          {status && (
            <p className="text-center text-sm font-medium animate-pulse">{status}</p>
          )}
        </Card>

        <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg p-8 border-2 border-dashed">
          <div className="h-32 w-24 bg-white border shadow-sm relative mb-4 flex items-center justify-center">
            <Minimize2 className="h-10 w-10 text-gray-300" />
          </div>
          <p className="font-medium text-lg text-center break-all">{file.name}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Original Size: {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>
    </div>
  )
}
