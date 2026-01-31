"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Edit as EditIcon, Download, File as FileIcon, Type } from 'lucide-react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export default function EditPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [textToAdd, setTextToAdd] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) setFile(files[0])
  }

  const handleEdit = async () => {
    if (!file || !textToAdd) return

    setIsProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const pages = pdfDoc.getPages()
      const firstPage = pages[0]

      const { width, height } = firstPage.getSize()

      // Add text at top-center for demo
      firstPage.drawText(textToAdd, {
        x: 50,
        y: height - 50,
        size: 20,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `edited_${file.name}`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      console.error(error)
      alert("Failed to edit PDF.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
          <EditIcon className="h-8 w-8 text-primary" />
          Edit PDF
        </h1>
        <p className="text-muted-foreground">
          Add text annotations to your PDF documents.
        </p>
      </div>

      {!file ? (
        <div className="max-w-xl mx-auto">
          <Dropzone onFileSelect={handleFileSelect} maxFiles={1} />
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8">
          <Card className="p-8 w-full max-w-md flex flex-col items-center space-y-4">
            <div className="h-20 w-20 bg-purple-100 rounded-2xl flex items-center justify-center dark:bg-purple-900/20">
              <FileIcon className="h-10 w-10 text-purple-600" />
            </div>
            <p className="font-semibold truncate w-full text-center">{file.name}</p>
            <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-destructive hover:text-destructive">
              Remove
            </Button>
          </Card>

          <Card className="p-6 w-full max-w-md space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Text to Add (Top of Page)</label>
            </div>
            <Input
              placeholder="Type your text here..."
              value={textToAdd}
              onChange={(e) => setTextToAdd(e.target.value)}
            />
          </Card>

          <Button
            size="lg"
            onClick={handleEdit}
            disabled={isProcessing || !textToAdd}
            className="w-full max-w-sm"
          >
            {isProcessing ? "Processing..." : "Apply and Download"} <Download className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
