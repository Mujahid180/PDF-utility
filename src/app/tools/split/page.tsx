"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Split, Scissors, ArrowRight, File as FileIcon } from 'lucide-react'

export default function SplitPdfPage() {
    const [file, setFile] = useState<File | null>(null)
    const [range, setRange] = useState<string>("")
    const [isProcessing, setIsProcessing] = useState(false)

    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) setFile(files[0])
    }

    const handleSplit = async () => {
        if (!file) return

        setIsProcessing(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('range', range) // e.g., "1-3,5,7-9"

            const response = await fetch('/api/pdf-split', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) throw new Error("Split failed")

            const contentType = response.headers.get('Content-Type')
            const isZip = contentType === 'application/zip'
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `split_${file.name.replace('.pdf', '')}.${isZip ? 'zip' : 'pdf'}`
            document.body.appendChild(a)
            a.click()
            a.remove()
        } catch (error) {
            console.error(error)
            alert("Failed to split PDF. Check page ranges.")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
                    <Split className="h-8 w-8 text-primary" />
                    Split PDF File
                </h1>
                <p className="text-muted-foreground">
                    Separate one page or a whole set for easy conversion into independent PDF files.
                </p>
            </div>

            {!file ? (
                <div className="max-w-xl mx-auto">
                    <Dropzone onFileSelect={handleFileSelect} maxFiles={1} />
                </div>
            ) : (
                <div className="flex flex-col items-center space-y-8">
                    <Card className="p-8 w-full max-w-md flex flex-col items-center space-y-4">
                        <div className="h-20 w-20 bg-red-100 rounded-2xl flex items-center justify-center dark:bg-red-900/20">
                            <FileIcon className="h-10 w-10 text-red-500" />
                        </div>
                        <p className="font-semibold truncate w-full text-center">{file.name}</p>
                        <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-destructive hover:text-destructive">
                            Remove
                        </Button>
                    </Card>

                    <div className="w-full max-w-md space-y-4">
                        <label className="text-sm font-medium">Page Ranges to Extract (e.g., "1-5, 8, 11-13")</label>
                        <Input
                            placeholder="1-5, 8, 11-13"
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Leave empty to split every page into a separate file.</p>
                    </div>

                    <Button
                        size="lg"
                        onClick={handleSplit}
                        disabled={isProcessing}
                        className="w-full max-w-sm"
                    >
                        {isProcessing ? "Splitting..." : "Split PDF"} <Scissors className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}
