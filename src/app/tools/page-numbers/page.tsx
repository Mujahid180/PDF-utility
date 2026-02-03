"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Loader2, Hash, File as FileIcon, Download, ArrowLeft } from 'lucide-react'

export default function PageNumbersPage() {
  const [file, setFile] = useState<File | null>(null)
  const [position, setPosition] = useState("bottom-center")
  const [fontSize, setFontSize] = useState(12)
  const [fontColor, setFontColor] = useState("#000000")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) setFile(files[0])
  }

  const handleApply = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      const { PDFDocument, rgb } = await import('pdf-lib')
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()

      const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255
        const g = parseInt(hex.slice(3, 5), 16) / 255
        const b = parseInt(hex.slice(5, 7), 16) / 255
        return rgb(r, g, b)
      }

      pages.forEach((page, index) => {
        const { width, height } = page.getSize()
        const text = `Page ${index + 1} of ${pages.length}`
        const textWidth = fontSize * text.length * 0.45

        let x = 0, y = 0
        if (position.includes('center')) x = (width - textWidth) / 2
        else if (position.includes('right')) x = width - textWidth - 30
        else if (position.includes('left')) x = 30

        if (position.includes('bottom')) y = 30
        else if (position.includes('top')) y = height - 40

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          color: hexToRgb(fontColor),
        })
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `numbered_${file.name}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      alert("Failed to add page numbers.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!file) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
            <Hash className="h-8 w-8 text-primary" />
            Page Numbers
          </h1>
          <p className="text-muted-foreground">Add page numbers to your PDF document easily.</p>
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
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-semibold mb-4">Numbering Settings</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Position</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger><SelectValue placeholder="Select Position" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-center">Bottom Center</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="top-center">Top Center</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Font Size</Label>
                <span className="text-sm text-muted-foreground">{fontSize}px</span>
              </div>
              <Slider value={[fontSize]} onValueChange={(v) => setFontSize(v[0])} min={8} max={36} step={1} />
            </div>

            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2">
                <Input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="w-12 h-10 p-1" />
                <Input type="text" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="flex-1" />
              </div>
            </div>
          </div>

          <Button onClick={handleApply} disabled={isProcessing} className="w-full" size="lg">
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Add Numbers & Download
          </Button>
        </Card>

        <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg p-8 border-2 border-dashed">
          <div className="h-48 w-36 bg-white border shadow-sm relative flex flex-col justify-between p-4 mb-4">
            <div className="space-y-2">
              <div className="h-2 w-full bg-slate-100"></div>
              <div className="h-2 w-3/4 bg-slate-100"></div>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-slate-100"></div>
              <div className="h-2 w-1/2 bg-slate-100"></div>
            </div>

            <div
              className="absolute pointer-events-none transition-all duration-200"
              style={{
                fontSize: `${fontSize / 2}px`,
                color: fontColor,
                fontWeight: 'bold',
                ...(position === 'bottom-center' && { bottom: '10px', left: '50%', transform: 'translateX(-50%)' }),
                ...(position === 'bottom-right' && { bottom: '10px', right: '10px' }),
                ...(position === 'bottom-left' && { bottom: '10px', left: '10px' }),
                ...(position === 'top-center' && { top: '10px', left: '50%', transform: 'translateX(-50%)' }),
                ...(position === 'top-right' && { top: '10px', right: '10px' }),
                ...(position === 'top-left' && { top: '10px', left: '10px' }),
              }}
            >
              1 of 5
            </div>
          </div>
          <p className="font-medium text-center truncate w-full">{file.name}</p>
        </div>
      </div>
    </div>
  )
}
