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

  const [ocrProgress, setOcrProgress] = useState(0)

  const handleOcr = async () => {
    if (!file) return

    setIsProcessing(true)
    setOcrProgress(0)
    try {
      const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      }

      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker(language, 1, {
        logger: m => {
          if (m.status === 'recognizing text') setOcrProgress(Math.round(m.progress * 100))
        }
      });

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = "";

      // Limit to first 3 pages to avoid hanging browser
      const pagesToProcess = Math.min(pdf.numPages, 3);

      for (let i = 1; i <= pagesToProcess; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await (page as any).render({ canvasContext: context!, viewport } as any).promise;
        const { data: { text } } = await worker.recognize(canvas);
        fullText += `--- Page ${i} ---\n${text}\n\n`;
      }

      await worker.terminate();

      const blob = new Blob([fullText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url
      a.download = `${file.name.replace('.pdf', '')}_ocr.txt`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error)
      alert("Failed to process OCR. Make sure it's a valid PDF.")
    } finally {
      setIsProcessing(false)
      setOcrProgress(0)
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
                {ocrProgress > 0 ? `Recognizing... ${ocrProgress}%` : 'Starting OCR...'}
              </>
            ) : (
              <>
                Start OCR <Download className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          {isProcessing && ocrProgress > 0 && (
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{ocrProgress}%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
