"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Edit as EditIcon, Download, File as FileIcon, Type, ArrowLeft, Loader2, Check } from 'lucide-react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { renderPdfToImages } from "@/lib/pdf-renderer"

interface Placement {
  x: number
  y: number
  pageIndex: number
}

export default function EditPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [textToAdd, setTextToAdd] = useState("")
  const [fontSize, setFontSize] = useState(20)
  const [fontColor, setFontColor] = useState("#000000")
  const [isProcessing, setIsProcessing] = useState(false)
  const [pdfImages, setPdfImages] = useState<string[]>([])
  const [placement, setPlacement] = useState<Placement | null>(null)
  const [currentStep, setCurrentStep] = useState<'upload' | 'edit'>('upload')

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      setCurrentStep('edit')
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

  const handleEdit = async () => {
    if (!file || !textToAdd || !placement) return

    setIsProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

      const pages = pdfDoc.getPages()
      const page = pages[placement.pageIndex]
      const { width, height } = page.getSize()

      const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255
        const g = parseInt(hex.slice(3, 5), 16) / 255
        const b = parseInt(hex.slice(5, 7), 16) / 255
        return rgb(r, g, b)
      }

      page.drawText(textToAdd, {
        x: (placement.x * width) / 100,
        y: height - (placement.y * height) / 100,
        size: fontSize,
        font: helveticaFont,
        color: hexToRgb(fontColor),
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `edited_${file.name}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      alert("Failed to edit PDF.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (currentStep === 'upload') {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
            <EditIcon className="h-8 w-8 text-primary" />
            Edit PDF
          </h1>
          <p className="text-muted-foreground">Add text annotations visually to your PDF documents.</p>
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
          onClick={handleEdit}
          disabled={!placement || !textToAdd || isProcessing}
          className="bg-primary hover:bg-primary/90"
        >
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Export Edited PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="p-6 space-y-6 lg:sticky lg:top-24">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Type className="h-5 w-5" /> Text Settings
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Text Content</Label>
              <Input
                placeholder="Type your text here..."
                value={textToAdd}
                onChange={(e) => setTextToAdd(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Size</Label>
                <span className="text-sm font-mono">{fontSize}px</span>
              </div>
              <Slider value={[fontSize]} onValueChange={(v) => setFontSize(v[0])} min={8} max={72} step={1} />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                <Input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="w-12 h-10 p-1" />
                <Input type="text" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="flex-1 font-mono uppercase" />
              </div>
            </div>
          </div>

          {!placement && textToAdd && (
            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-100 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-sm">
              <p className="font-medium mb-1 flex items-center gap-2">
                <EditIcon className="h-4 w-4" /> Action Required
              </p>
              Click on the document to place your text.
            </div>
          )}
        </Card>

        <div className="lg:col-span-2 flex justify-center">
          <div className="bg-zinc-200 dark:bg-zinc-800 p-4 rounded-xl shadow-inner max-w-full overflow-auto inline-block min-w-[300px]">
            {pdfImages.length > 0 ? (
              <div
                className="relative cursor-crosshair border shadow-2xl bg-white"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = ((e.clientX - rect.left) / rect.width) * 100
                  const y = ((e.clientY - rect.top) / rect.height) * 100
                  setPlacement({ x, y, pageIndex: 0 })
                }}
              >
                <img src={pdfImages[0]} alt="PDF Page 1" className="max-w-full h-auto pointer-events-none" />
                {placement && textToAdd && (
                  <div
                    className="absolute pointer-events-none whitespace-nowrap"
                    style={{
                      left: `${placement.x}%`,
                      top: `${placement.y}%`,
                      fontSize: `${fontSize}px`,
                      color: fontColor,
                      fontFamily: 'Helvetica, sans-serif'
                    }}
                  >
                    {textToAdd}
                  </div>
                )}
                {!placement && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none">
                    <div className="bg-white/90 p-4 rounded-lg shadow-lg text-center backdrop-blur-sm">
                      <p className="font-medium text-primary">Click to place text</p>
                    </div>
                  </div>
                )}
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
