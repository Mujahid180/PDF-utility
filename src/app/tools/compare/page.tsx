"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileSearch, Download, File as FileIcon, Loader2, Files, ArrowLeft } from 'lucide-react'
import { renderPdfToImages } from "@/lib/pdf-renderer"

export default function ComparePdfPage() {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])
  const [showView, setShowView] = useState(false)

  const handleFileSelect = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles].slice(0, 2))
  }

  const handleCompare = async () => {
    if (files.length < 2) return

    setIsProcessing(true)
    try {
      const p1 = await renderPdfToImages(files[0], { scale: 1.0, limit: 1 }, () => { })
      const p2 = await renderPdfToImages(files[1], { scale: 1.0, limit: 1 }, () => { })

      setPreviews([URL.createObjectURL(p1[0]), URL.createObjectURL(p2[0])])
      setShowView(true)
    } catch (error) {
      console.error(error)
      alert("Failed to compare PDFs.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (showView) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => setShowView(false)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Upload
          </Button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Files className="h-5 w-5 text-primary" /> Visual Comparison
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="font-semibold text-center text-muted-foreground uppercase text-xs tracking-wider">Document 1: {files[0].name}</p>
            <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl border-2 border-primary/10 shadow-inner">
              <img src={previews[0]} alt="Doc 1" className="w-full h-auto shadow-2xl bg-white" />
            </div>
          </div>
          <div className="space-y-4">
            <p className="font-semibold text-center text-muted-foreground uppercase text-xs tracking-wider">Document 2: {files[1].name}</p>
            <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl border-2 border-primary/10 shadow-inner">
              <img src={previews[1]} alt="Doc 2" className="w-full h-auto shadow-2xl bg-white" />
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-center border border-blue-100 dark:border-blue-900/30">
          <p className="text-blue-900 dark:text-blue-200">
            Visual highlighting of differences is coming soon. Currently providing side-by-side inspection.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
          <Files className="h-8 w-8 text-primary" />
          Compare PDF
        </h1>
        <p className="text-muted-foreground">
          Compare two PDF documents and see the differences side by side.
        </p>
      </div>

      {files.length < 2 ? (
        <div className="max-w-xl mx-auto">
          <Dropzone
            onFileSelect={handleFileSelect}
            maxFiles={2 - files.length}
            label={files.length === 1 ? "Drop the second PDF here" : "Drop two PDFs to compare"}
          />
        </div>
      ) : null}

      {files.length > 0 && (
        <div className="mt-8 flex flex-col items-center space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            {files.map((f, i) => (
              <Card key={i} className="p-4 flex flex-col items-center space-y-2 border-primary/20">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FileIcon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium truncate w-full text-center">{f.name}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-xs text-destructive h-7"
                >
                  Remove
                </Button>
              </Card>
            ))}
          </div>

          <Button
            size="lg"
            onClick={handleCompare}
            disabled={isProcessing || files.length < 2}
            className="w-full max-w-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Compare Documents <FileSearch className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
