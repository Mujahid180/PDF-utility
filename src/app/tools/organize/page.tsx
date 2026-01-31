"use client"

import React, { useState, useCallback } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Download, Save } from 'lucide-react'
import { renderPdfToImages } from "@/lib/pdf-renderer"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { SortablePage } from './sortable-page'

interface PageItem {
  id: string
  originalIndex: number // 0-based index from original PDF
  blob: Blob
  url: string
}

export default function OrganizePage() {
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PageItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return
    const selectedFile = files[0]
    setFile(selectedFile)
    setIsProcessing(true)

    try {
      const blobs = await renderPdfToImages(selectedFile, { scale: 0.5 }, (curr, total) => {
        setLoadingProgress(Math.round((curr / total) * 100))
      })

      const newPages = blobs.map((blob, index) => ({
        id: `page-${index}`,
        originalIndex: index,
        blob: blob,
        url: URL.createObjectURL(blob)
      }))

      setPages(newPages)
    } catch (error) {
      console.error("Failed to load PDF", error)
      alert("Error loading PDF pages.")
      setFile(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }

    setActiveId(null)
  }

  const handleRemove = (id: string) => {
    setPages((items) => items.filter((i) => i.id !== id))
  }

  const handleSave = async () => {
    if (!file || pages.length === 0) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      // Map current pages back to their original 0-based indices
      const pageOrder = pages.map(p => p.originalIndex)
      formData.append('pageOrder', JSON.stringify(pageOrder))

      const response = await fetch('/api/pdf-organize', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error("Failed to organize")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `organized_${file.name}`
      document.body.appendChild(a)
      a.click()
      a.remove()

    } catch (error) {
      console.error(error)
      alert("Failed to save PDF.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!file) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">Organize PDF</h1>
        <div className="max-w-xl mx-auto">
          <Dropzone onFileSelect={handleFileSelect} maxFiles={1} />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => { setFile(null); setPages([]); }}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Upload
        </Button>
        <h1 className="text-2xl font-bold">Organize Pages</h1>
        <Button onClick={handleSave} disabled={isProcessing}>
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save PDF
        </Button>
      </div>

      {isProcessing && pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p>Loading pages... {loadingProgress}%</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={pages.map(p => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {pages.map((page, index) => (
                <SortablePage
                  key={page.id}
                  id={page.id}
                  index={index}
                  imageUrl={page.url}
                  pageNumber={page.originalIndex + 1}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <div className="opacity-80">
                {/* Valid simple overlay representation */}
                <div className="bg-slate-200 w-32 h-40 border-2 border-primary rounded-md flex items-center justify-center">
                  Dragging...
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}
