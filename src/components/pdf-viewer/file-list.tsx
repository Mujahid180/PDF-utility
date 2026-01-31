"use client"

import React from 'react'
import { File, X, GripVertical } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FileListProps {
    files: File[]
    onRemove: (index: number) => void
    onReorder?: (newFiles: File[]) => void // Placeholder for DnD reordering
}

export function FileList({ files, onRemove }: FileListProps) {
    if (files.length === 0) return null

    return (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6">
            {files.map((file, index) => (
                <Card key={`${file.name}-${index}`} className="relative group overflow-hidden border-muted-foreground/20">
                    <div className="p-4 flex flex-col items-center justify-center space-y-3">
                        <div className="h-16 w-16 bg-red-100 rounded-lg flex items-center justify-center dark:bg-red-900/20">
                            <File className="h-8 w-8 text-red-500" />
                        </div>
                        <div className="text-center w-full">
                            <p className="text-sm font-medium truncate w-full" title={file.name}>
                                {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>

                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground shadow-sm"
                            onClick={() => onRemove(index)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    )
}
