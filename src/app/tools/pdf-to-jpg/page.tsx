"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Image as ImageIcon, Download, Settings, File as FileIcon } from 'lucide-react'
import { renderPdfToImages } from "@/lib/pdf-renderer"
import JSZip from 'jszip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState<string>("1.5") // scale: 1.5 = 108dpi approx (Medium)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) setFile(files[0])
  }

  const handleConvert = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const scale = parseFloat(quality)
      const blobs = await renderPdfToImages(file, { scale }, (current, total) => {
        setProgress(Math.round((current / total) * 100))
      })

      // Zip them up
      const zip = new JSZip()
      blobs.forEach((blob, index) => {
        zip.file(`page_${index + 1}.jpg`, blob)
      })

      const content = await zip.generateAsync({ type: 'blob' })

      // Download
      const url = window.URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `images_${file.name.replace('.pdf', '')}.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()

    } catch (error) {
      console.error("Conversion failed", error)
      alert("Failed to convert PDF to Images. Please try a simpler file.")
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
          <ImageIcon className="h-8 w-8 text-primary" />
          PDF to JPG
        </h1>
        <p className="text-muted-foreground">
          Convert each PDF page into a JPG image or extract all images.
        </p>
      </div>

      {!file ? (
        <div className="max-w-xl mx-auto">
          <Dropzone onFileSelect={handleFileSelect} maxFiles={1} />
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8">
          <Card className="p-8 w-full max-w-md flex flex-col items-center space-y-4">
            <div className="h-20 w-20 bg-green-100 rounded-2xl flex items-center justify-center dark:bg-green-900/20">
              <FileIcon className="h-10 w-10 text-green-600" />
            </div>
            <p className="font-semibold truncate w-full text-center">{file.name}</p>
            <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-destructive hover:text-destructive">
              Remove
            </Button>
          </Card>

          <div className="w-full max-w-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Image Quality</label>
            </div>

            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger>
                <SelectValue placeholder="Select Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.0">Low (72dpi)</SelectItem>
                <SelectItem value="1.5">Medium (108dpi)</SelectItem>
                <SelectItem value="2.0">High (144dpi)</SelectItem>
                <SelectItem value="3.0">Very High (216dpi)</SelectItem>
                <SelectItem value="4.16">Ultra High (300dpi)</SelectItem>
                <SelectItem value="5.55">Maximum (400dpi)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground mt-1">
              Higher resolution requires more memory and processing time.
            </p>
          </div>

          <div className="w-full max-w-sm space-y-2">
            <Button
              size="lg"
              onClick={handleConvert}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? `Converting... ${progress}%` : "Convert to JPG"}
              {!isProcessing && <Download className="ml-2 h-4 w-4" />}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Processing happens entirely in your browser.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
