"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { FileList } from "@/components/pdf-viewer/file-list"
import { Button } from "@/components/ui/button"
import { ArrowRight, Merge } from 'lucide-react'
// import { mergePdfs } from "@/lib/pdf-actions" // Will implement next

export default function MergePdfPage() {
    const [files, setFiles] = useState<File[]>([])
    const [isProcessing, setIsProcessing] = useState(false)

    const handleFileSelect = (newFiles: File[]) => {
        // Append new files to existing ones
        setFiles((prev) => [...prev, ...newFiles])
    }

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const handleMerge = async () => {
        if (files.length < 2) {
            alert("Please select at least 2 PDF files to merge.")
            return
        }

        setIsProcessing(true)
        try {
            const formData = new FormData()
            files.forEach((file) => formData.append('files', file))

            const response = await fetch('/api/pdf-merge', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) throw new Error("Merge failed")

            // Trigger download
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'merged.pdf'
            document.body.appendChild(a)
            a.click()
            a.remove()
        } catch (error) {
            console.error(error)
            alert("Failed to merge PDFs")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-6xl">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
                    <Merge className="h-8 w-8 text-primary" />
                    Merge PDF Files
                </h1>
                <p className="text-muted-foreground">
                    Combine PDFs in the order you want with the easiest PDF merger available.
                </p>
            </div>

            {files.length === 0 ? (
                <div className="max-w-xl mx-auto">
                    <Dropzone onFileSelect={handleFileSelect} maxFiles={20} />
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">{files.length} Files Selected</h2>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setFiles([])}>Clear All</Button>
                            <Button onClick={() => document.getElementById('add-more-input')?.click()}>Add More</Button>
                            <input
                                id="add-more-input"
                                type="file"
                                accept="application/pdf"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        handleFileSelect(Array.from(e.target.files))
                                    }
                                    // Reset value so same file can be selected again if needed
                                    e.target.value = ''
                                }}
                            />
                        </div>
                    </div>

                    <FileList files={files} onRemove={handleRemoveFile} />

                    <div className="flex justify-center mt-8">
                        {/* Mini Dropzone to add more? */}
                        {/* For now just the merge button */}
                        <Button
                            size="lg"
                            onClick={handleMerge}
                            disabled={files.length < 2 || isProcessing}
                            className="w-full md:w-auto min-w-[200px]"
                        >
                            {isProcessing ? "Merging..." : "Merge PDFs"} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
