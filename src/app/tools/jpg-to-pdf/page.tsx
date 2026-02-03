"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Image as ImageIcon, Download, Trash, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react'

export default function JpgToPdfPage() {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files]
    const nextIndex = direction === 'up' ? index - 1 : index + 1
    if (nextIndex < 0 || nextIndex >= files.length) return
    [newFiles[index], newFiles[nextIndex]] = [newFiles[nextIndex], newFiles[index]]
    setFiles(newFiles)
  }

  const handleConvert = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    try {
      const { PDFDocument } = await import('pdf-lib')
      const pdfDoc = await PDFDocument.create()

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer()
        let image
        if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(arrayBuffer)
        } else {
          image = await pdfDoc.embedJpg(arrayBuffer)
        }

        const page = pdfDoc.addPage([image.width, image.height])
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        })
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `images_combined.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error(error)
      alert("Failed to convert images to PDF. Ensure all files are standard JPG or PNG images.")
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {files.map((file, index) => (
          <Card key={index} className="relative group overflow-hidden bg-background border-2 transition-all hover:border-primary">
            <div className="aspect-square relative flex items-center justify-center bg-muted/20">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <div className="flex gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); moveItem(index, 'up'); }}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); moveItem(index, 'down'); }}
                    disabled={index === files.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleRemove(index); }} className="mt-1">
                  <Trash className="h-4 w-4 mr-1" /> Remove
                </Button>
              </div>
            </div>
            <div className="p-2 text-xs truncate font-medium bg-background border-t">
              <span className="text-primary mr-1">{index + 1}.</span>
              {file.name}
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
