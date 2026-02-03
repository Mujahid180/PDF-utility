"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Presentation, Download, File as FileIcon, Loader2 } from 'lucide-react'

export default function PdfToPowerPointPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) setFile(files[0])
  }

  const handleConvert = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      }

      const pptxgen = (await import('pptxgenjs')).default;
      const pres = new pptxgen();

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item: any) => item.str).join(' ');

        const slide = pres.addSlide();
        slide.addText(text, {
          x: 0.5,
          y: 0.5,
          w: '90%',
          h: '90%',
          fontSize: 12,
          color: '363636',
          align: pres.AlignH.left,
          valign: pres.AlignV.top
        });
      }

      const blob = await pres.write({ outputType: 'blob' }) as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url
      a.download = `${file.name.replace('.pdf', '')}.pptx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error)
      alert("Failed to convert PDF to PowerPoint slideshow.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
          <Presentation className="h-8 w-8 text-primary" />
          PDF to PowerPoint
        </h1>
        <p className="text-muted-foreground">
          Convert your PDF slides into editable PowerPoint presentations.
        </p>
      </div>

      {!file ? (
        <div className="max-w-xl mx-auto">
          <Dropzone onFileSelect={handleFileSelect} maxFiles={1} />
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
                Convert to PowerPoint <Download className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
