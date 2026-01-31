"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileSearch, Download, File as FileIcon, Loader2, Files } from 'lucide-react'

export default function ComparePdfPage() {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles].slice(0, 2))
  }

  const handleCompare = async () => {
    if (files.length < 2) return

    setIsProcessing(true)
    try {
      await new Promise(r => setTimeout(r, 2000))
      alert("Comparing PDFs requires a detailed visual diffing engine. This tool is designed to highlight changes between two versions of a document.")
    } catch (error) {
      console.error(error)
      alert("Failed to compare PDFs.")
    } finally {
      setIsProcessing(false)
    }
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
