"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Loader2, Stamp, File as FileIcon, Download, ArrowLeft } from 'lucide-react'

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState("CONFIDENTIAL")
  const [opacity, setOpacity] = useState([0.3])
  const [rotation, setRotation] = useState([45])
  const [fontSize, setFontSize] = useState([50])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) setFile(files[0])
  }

  const handleApply = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('text', text)
      formData.append('opacity', opacity[0].toString())
      formData.append('rotation', rotation[0].toString())
      formData.append('fontSize', fontSize[0].toString())
      // Default color black for now

      const response = await fetch('/api/pdf-watermark', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error("Failed to watermark")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `watermarked_${file.name}`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      console.error(error)
      alert("Failed to watermark PDF.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!file) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
            <Stamp className="h-8 w-8 text-primary" />
            Watermark PDF
          </h1>
          <p className="text-muted-foreground">
            Stamp text over your PDF pages.
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
        {/* Settings Panel */}
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-semibold mb-4">Watermark Settings</h2>

          <div className="space-y-2">
            <Label>Watermark Text</Label>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. DRAFT" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Opacity</Label>
              <span className="text-sm text-muted-foreground">{Math.round(opacity[0] * 100)}%</span>
            </div>
            <Slider value={opacity} onValueChange={setOpacity} max={1} step={0.1} />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Rotation (Degrees)</Label>
              <span className="text-sm text-muted-foreground">{rotation[0]}°</span>
            </div>
            <Slider value={rotation} onValueChange={setRotation} min={0} max={360} step={15} />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Font Size</Label>
              <span className="text-sm text-muted-foreground">{fontSize[0]}px</span>
            </div>
            <Slider value={fontSize} onValueChange={setFontSize} min={10} max={200} step={5} />
          </div>

          <Button onClick={handleApply} disabled={isProcessing} className="w-full">
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Apply & Download
          </Button>
        </Card>

        {/* File Preview (Simple) */}
        <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg p-8 border-2 border-dashed">
          <div className="h-32 w-32 bg-red-100 rounded-2xl flex items-center justify-center dark:bg-red-900/20 mb-4">
            <FileIcon className="h-16 w-16 text-red-600" />
          </div>
          <p className="font-medium text-lg text-center break-all">{file.name}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Expected Result: <br />
            Text "{text}" stamped on center.
          </p>
        </div>
      </div>
    </div>
  )
}
