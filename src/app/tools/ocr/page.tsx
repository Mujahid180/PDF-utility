"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScanText, Download, File as FileIcon, Loader2, Languages } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function OcrPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [language, setLanguage] = useState("eng")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) setFile(files[0])
  }

  const handleOcr = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      await new Promise(r => setTimeout(r, 3000))
      alert("OCR processing requires a specialized engine (like Tesseract or Cloud Vision). This UI is ready to be connected to such a service.")
    } catch (error) {
      console.error(error)
      alert("Failed to process OCR.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
          <ScanText className="h-8 w-8 text-primary" />
          OCR PDF
        </h1>
        <p className="text-muted-foreground">
          Convert scanned PDFs and images into searchable and editable documents.
        </p>
      </div>

      {!file ? (
        <div className="max-w-xl mx-auto">
          <Dropzone onFileSelect={handleFileSelect} maxFiles={1} />
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8">
          <Card className="p-8 w-full max-w-md flex flex-col items-center space-y-4">
            <div className="h-20 w-20 bg-indigo-100 rounded-2xl flex items-center justify-center dark:bg-indigo-900/20">
              <FileIcon className="h-10 w-10 text-indigo-600" />
            </div>
            <p className="font-semibold truncate w-full text-center">{file.name}</p>
            <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-destructive hover:text-destructive">
              Remove
            </Button>
          </Card>

          <div className="w-full max-w-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Document Language</label>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eng">English</SelectItem>
                <SelectItem value="spa">Spanish</SelectItem>
                <SelectItem value="fra">French</SelectItem>
                <SelectItem value="deu">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            size="lg"
            onClick={handleOcr}
            disabled={isProcessing}
            className="w-full max-w-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recognizing Text...
              </>
            ) : (
              <>
                Start OCR <Download className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
