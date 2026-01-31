"use client"

import React, { useCallback, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { UploadCloud, File, X } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
// import { toast } from "@/components/ui/use-toast" // Use the hook from Shadcn if available, or just standard alert for now
// Shadcn toast usually requires setting up the Toaster in layout. I'll rely on props for error handling/toasting for now.

interface DropzoneProps {
    onFileSelect: (files: File[]) => void
    accept?: Record<string, string[]>
    maxFiles?: number
    maxSize?: number // in bytes
    className?: string
    label?: string
}

export function Dropzone({
    onFileSelect,
    accept = { 'application/pdf': ['.pdf'] },
    maxFiles = 5,
    maxSize = 60 * 1024 * 1024, // 60MB default
    className,
    label
}: DropzoneProps) {
    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        if (fileRejections.length > 0) {
            fileRejections.forEach(({ file, errors }) => {
                console.error(`File rejected: ${file.name}`, errors)
                // trigger error toast here ideally
            })
        }

        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles)
        }
    }, [onFileSelect])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles,
        maxSize,
    })

    return (
        <Card className={cn(
            "border-2 border-dashed bg-muted/50 transition-colors hover:bg-muted/80",
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            className
        )}>
            <CardContent className="flex flex-col items-center justify-center space-y-4 py-8 text-center sm:py-16">
                <div {...getRootProps()} className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-4">
                    <input {...getInputProps()} />
                    <div className="rounded-full bg-background p-4 shadow-sm ring-1 ring-muted">
                        <UploadCloud className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="mt-4 flex max-w-[420px] flex-col gap-1.5">
                        <h3 className="text-lg font-semibold leading-none tracking-tight">
                            {isDragActive ? "Drop the files here" : (label || "Upload your files")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Drag & drop files here, or click to select files
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            PDFs up to {Math.round(maxSize / 1024 / 1024)}MB
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
