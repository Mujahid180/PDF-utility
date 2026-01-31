"use client"

import React, { useRef, useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Trash2, Check } from 'lucide-react'

interface SignaturePadProps {
    onSave: (dataUrl: string) => void
}

export function SignaturePad({ onSave }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
    }, [])

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true)
        draw(e)
    }

    const stopDrawing = () => {
        setIsDrawing(false)
        const canvas = canvasRef.current
        if (canvas) {
            const ctx = canvas.getContext('2d')
            ctx?.beginPath()
        }
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        const rect = canvas.getBoundingClientRect()
        let x, y
        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left
            y = e.touches[0].clientY - rect.top
        } else {
            x = e.clientX - rect.left
            y = e.clientY - rect.top
        }

        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const clear = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    const handleSave = () => {
        const canvas = canvasRef.current
        if (canvas) {
            onSave(canvas.toDataURL('image/png'))
        }
    }

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg bg-white overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={200}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair"
                />
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clear}>
                    <Trash2 className="h-4 w-4 mr-2" /> Clear
                </Button>
                <Button size="sm" onClick={handleSave}>
                    <Check className="h-4 w-4 mr-2" /> Use Signature
                </Button>
            </div>
        </div>
    )
}
