"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Hash, File as FileIcon, Download, ArrowLeft } from 'lucide-react'

export default function PageNumbersPage() {
  const [file, setFile] = useState<File | null>(null)
  const [position, setPosition] = useState("bottom-center")
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
      formData.append('position', position)

      const response = await fetch('/api/pdf-page-numbers', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error("Failed to add numbers")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `numbered_${file.name}`
      document.body.appendChild(a)
      a.click()
      a.remove()
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
          <p className="text-muted-foreground">
            Add page numbers to your PDF document easily.
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

        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-semibold mb-4">Numbering Settings</h2>

          <div className="space-y-2">
            <Label>Position</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Select Position" />
              </SelectTrigger>
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

          <Button onClick={handleApply} disabled={isProcessing} className="w-full">
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Add Numbers & Download
          </Button>
        </Card>

        <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg p-8 border-2 border-dashed">
          <div className="h-32 w-24 bg-white border shadow-sm relative flex flex-col justify-between p-2 mb-4">
            <div className="h-2 w-full bg-slate-200 mt-2"></div>
            <div className="h-2 w-3/4 bg-slate-200"></div>
            <div className="h-2 w-full bg-slate-200"></div>
            <div className="h-2 w-1/2 bg-slate-200"></div>

            <div className={`absolute text-[8px] font-bold text-red-500
                    ${position === 'bottom-center' && 'bottom-2 left-1/2 -translate-x-1/2'}
                    ${position === 'bottom-right' && 'bottom-2 right-2'}
                    ${position === 'bottom-left' && 'bottom-2 left-2'}
                    ${position === 'top-center' && 'top-2 left-1/2 -translate-x-1/2'}
                    ${position === 'top-right' && 'top-2 right-2'}
                    ${position === 'top-left' && 'top-2 left-2'}
                `}>
              1 of 5
            </div>
          </div>
          <p className="font-medium text-center">{file.name}</p>
        </div>
      </div>
    </div>
  )
}
