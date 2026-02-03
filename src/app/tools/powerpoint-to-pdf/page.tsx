"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Presentation, Download, File as FileIcon, Loader2 } from 'lucide-react'

export default function PowerPointToPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) setFile(files[0])
  }

  const handleConvert = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      await new Promise(r => setTimeout(r, 2000))
      alert("PowerPoint to PDF conversion is a server-side feature. This UI is ready to be connected to a production API.")
    } catch (error) {
      console.error(error)
      alert("Failed to convert PowerPoint to PDF.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
          <Presentation className="h-8 w-8 text-primary" />
          PowerPoint to PDF
        </h1>
        <p className="text-muted-foreground">
          Convert PowerPoint presentations (PPTX, PPT) to PDF documents.
        </p>
      </div>

      {!file ? (
        <div className="max-w-xl mx-auto">
          <Dropzone
            onFileSelect={handleFileSelect}
            accept={{
              'application/vnd.ms-powerpoint': ['.ppt'],
              'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8">
          <Card className="p-8 w-full max-w-md flex flex-col items-center space-y-4">
            <div className="h-20 w-20 bg-orange-100 rounded-2xl flex items-center justify-center dark:bg-orange-900/20">
              <FileIcon className="h-10 w-10 text-orange-600" />
            </div>
            <p className="font-semibold truncate w-full text-center">{file.name}</p>
            <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-destructive hover:text-destructive">
              Remove
            </Button>
          </Card>

          <Button
            size="lg"
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full max-w-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                Convert to PDF <Download className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
