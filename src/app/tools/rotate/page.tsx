"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RotateCw, RotateCcw, Save, File as FileIcon } from 'lucide-react'

export default function RotatePdfPage() {
    const [file, setFile] = useState<File | null>(null)
    const [rotation, setRotation] = useState<number>(0) // 0, 90, 180, 270
    const [isProcessing, setIsProcessing] = useState(false)

    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0])
            setRotation(0)
        }
    }

    const rotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360)
    const rotateRight = () => setRotation((prev) => (prev + 90) % 360)

    const handleProcess = async () => {
        if (!file) return

        setIsProcessing(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('angle', rotation.toString())

            const response = await fetch('/api/pdf-rotate', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) throw new Error("Rotate failed")

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `rotated_${rotation}_${file.name}`
            document.body.appendChild(a)
            a.click()
            a.remove()
        } catch (error) {
            console.error(error)
            alert("Failed to rotate PDF")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
                    <RotateCw className="h-8 w-8 text-primary" />
                    Rotate PDF
                </h1>
                <p className="text-muted-foreground">
                    Rotate your PDF files as needed.
                </p>
            </div>

            {!file ? (
                <div className="max-w-xl mx-auto">
                    <Dropzone onFileSelect={handleFileSelect} maxFiles={1} />
                </div>
            ) : (
                <div className="flex flex-col items-center space-y-8">
                    <div className="relative group">
                        <Card
                            className="p-8 w-64 h-80 flex flex-col items-center justify-center space-y-4 transition-transform duration-300 ease-in-out border-2 border-dashed"
                            style={{ transform: `rotate(${rotation}deg)` }}
                        >
                            <div className="h-20 w-20 bg-blue-100 rounded-2xl flex items-center justify-center dark:bg-blue-900/20">
                                <FileIcon className="h-10 w-10 text-blue-500" />
                            </div>
                            <p className="font-semibold truncate w-full text-center select-none">{file.name}</p>
                            <div className="text-xs text-muted-foreground select-none">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                        </Card>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline" size="lg" onClick={rotateLeft}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Left
                        </Button>
                        <Button variant="outline" size="lg" onClick={rotateRight}>
                            Right <RotateCw className="ml-2 h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="ghost" onClick={() => setFile(null)} className="text-destructive">
                            Cancel
                        </Button>
                        <Button
                            size="lg"
                            onClick={handleProcess}
                            disabled={isProcessing || rotation === 0}
                            className="min-w-[150px]"
                        >
                            {isProcessing ? "Processing..." : "Save Rotation"} <Save className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
