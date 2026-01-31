"use client"

import React, { useState, useCallback } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Crop, Download, ArrowLeft } from 'lucide-react'
import Cropper from 'react-easy-crop'
import { Point, Area } from 'react-easy-crop'
import { renderPdfToImages } from "@/lib/pdf-renderer"

export default function CropPage() {
  const [file, setFile] = useState<File | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [croppedAreaPercentages, setCroppedAreaPercentages] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      // Render first page to image for the cropper
      try {
        const blobs = await renderPdfToImages(files[0], { scale: 1.0, limit: 1 }, () => { })
        if (blobs.length > 0) {
          setImageSrc(URL.createObjectURL(blobs[0]))
        }
      } catch (e) {
        console.error(e)
        alert("Failed to load PDF preview")
      }
    }
  }

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)

    // Calculate percentages manually if needed, but react-easy-crop provides them in 'croppedArea' (first arg)
    // croppedArea is { x, y, width, height } in percentages (0-100)
    setCroppedAreaPercentages(croppedArea)
  }, [])

  const handleCrop = async () => {
    if (!file || !croppedAreaPercentages) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      // Convert 0-100 to 0-1
      formData.append('x', (croppedAreaPercentages.x / 100).toString())
      formData.append('y', (croppedAreaPercentages.y / 100).toString())
      formData.append('width', (croppedAreaPercentages.width / 100).toString())
      formData.append('height', (croppedAreaPercentages.height / 100).toString())

      const response = await fetch('/api/pdf-crop', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error("Failed to crop")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cropped_${file.name}`
      document.body.appendChild(a)
      a.click()
      a.remove()

    } catch (error) {
      console.error(error)
      alert("Failed to crop PDF.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!file) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
            <Crop className="h-8 w-8 text-primary" />
            Crop PDF
          </h1>
          <p className="text-muted-foreground">
            Trim margins from all pages.
          </p>
        </div>
        <div className="max-w-xl mx-auto">
          <Dropzone onFileSelect={handleFileSelect} maxFiles={1} />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <Button variant="ghost" onClick={() => { setFile(null); setImageSrc(null); }}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleCrop} disabled={isProcessing}>
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Crop & Download
        </Button>
      </div>

      <div className="flex-1 relative bg-slate-900 rounded-lg overflow-hidden border shadow-lg">
        {imageSrc ? (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={undefined} // Free crop
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            objectFit="contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </div>
      <p className="text-center text-sm text-muted-foreground mt-2">
        Adjust the box. This crop will be applied to <strong>ALL pages</strong>.
      </p>
    </div>
  )
}
