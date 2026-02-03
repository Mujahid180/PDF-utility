"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Signature as SignatureIcon,
    Download,
    File as FileIcon,
    Type,
    MousePointer2,
    Upload,
    Check,
    Trash,
    ArrowLeft,
    Loader2
} from 'lucide-react'
import { SignaturePad } from "@/components/signature-pad"
import { PDFDocument } from 'pdf-lib'
import { renderPdfToImages } from "@/lib/pdf-renderer"
import { cn } from "@/lib/utils"

const SIGNATURE_FONTS = [
    { name: 'Style 1', family: '"Caveat", cursive' },
    { name: 'Style 2', family: '"Dancing Script", cursive' },
    { name: 'Style 3', family: '"Pacifico", cursive' },
    { name: 'Style 4', family: '"Satisfy", cursive' },
]

const COLORS = [
    { name: 'Black', value: '#000000' },
    { name: 'Blue', value: '#0544d3' },
    { name: 'Red', value: '#e11d48' },
    { name: 'Green', value: '#16a34a' },
]

interface Placement {
    x: number
    y: number
    pageIndex: number
}

export default function SignPdfPage() {
    const [file, setFile] = useState<File | null>(null)
    const [signature, setSignature] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [fullName, setFullName] = useState("")
    const [activeColor, setActiveColor] = useState(COLORS[0].value)
    const [pdfImages, setPdfImages] = useState<string[]>([])
    const [placement, setPlacement] = useState<Placement | null>(null)
    const [currentStep, setCurrentStep] = useState<'upload' | 'create' | 'place'>('upload')

    const handleFileSelect = async (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0])
            setCurrentStep('create')

            // Start rendering PDF preview in background
            try {
                const blobs = await renderPdfToImages(files[0], { scale: 1.0, limit: 1 }, () => { })
                if (blobs.length > 0) {
                    setPdfImages([URL.createObjectURL(blobs[0])])
                }
            } catch (err) {
                console.error("Preview failed", err)
            }
        }
    }

    const generateTypedSignature = (text: string, font: string) => {
        const canvas = document.createElement('canvas')
        canvas.width = 600
        canvas.height = 200
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = activeColor
        ctx.font = `italic 72px ${font}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, 300, 100)
        setSignature(canvas.toDataURL('image/png'))
    }

    const handleSign = async () => {
        if (!file || !signature || !placement) return

        setIsProcessing(true)
        try {
            const arrayBuffer = await file.arrayBuffer()
            const pdfDoc = await PDFDocument.load(arrayBuffer)

            // Embed signature image
            const sigBase64 = signature.split(',')[1]
            const signatureImage = await pdfDoc.embedPng(Buffer.from(sigBase64, 'base64'))

            const pages = pdfDoc.getPages()
            const page = pages[placement.pageIndex]
            const { width, height } = page.getSize()

            // In placement, we use 0,0 at bottom-left in pdf-lib, but 0,0 at top-left in web
            // We need to scale the placement to match PDF internal units (points)
            const sigWidth = 150
            const sigHeight = (signatureImage.height / signatureImage.width) * sigWidth

            page.drawImage(signatureImage, {
                x: (placement.x * width) / 100 - sigWidth / 2,
                y: height - (placement.y * height) / 100 - sigHeight / 2,
                width: sigWidth,
                height: sigHeight,
            })

            const pdfBytes = await pdfDoc.save()
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `signed_${file.name}`
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error(error)
            alert("Failed to sign PDF.")
        } finally {
            setIsProcessing(false)
        }
    }

    const startPlacement = () => {
        if (signature) setCurrentStep('place')
    }

    if (currentStep === 'upload') {
        return (
            <div className="container mx-auto py-12 px-4 max-w-4xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
                        <SignatureIcon className="h-8 w-8 text-primary" />
                        Sign PDF
                    </h1>
                    <p className="text-muted-foreground">Add your signature to PDF documents easily and securely.</p>
                </div>
                <div className="max-w-xl mx-auto">
                    <Dropzone onFileSelect={handleFileSelect} maxFiles={1} />
                </div>
            </div>
        )
    }

    if (currentStep === 'create') {
        return (
            <div className="container mx-auto py-12 px-4 max-w-4xl">
                <Button variant="ghost" onClick={() => setCurrentStep('upload')} className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Upload
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <Card className="p-6">
                            <Tabs defaultValue="draw" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-6">
                                    <TabsTrigger value="draw" className="gap-2"><MousePointer2 className="h-4 w-4" /> Draw</TabsTrigger>
                                    <TabsTrigger value="type" className="gap-2"><Type className="h-4 w-4" /> Type</TabsTrigger>
                                    <TabsTrigger value="upload" className="gap-2"><Upload className="h-4 w-4" /> Upload</TabsTrigger>
                                </TabsList>

                                <TabsContent value="draw" className="space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium">Draw your signature</label>
                                        <div className="flex gap-2">
                                            {COLORS.map(c => (
                                                <button
                                                    key={c.value}
                                                    className={cn(
                                                        "h-6 w-6 rounded-full border-2",
                                                        activeColor === c.value ? "border-primary scale-110" : "border-transparent"
                                                    )}
                                                    style={{ backgroundColor: c.value }}
                                                    onClick={() => setActiveColor(c.value)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <SignaturePad onSave={setSignature} />
                                </TabsContent>

                                <TabsContent value="type" className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium">Type your name</label>
                                            <div className="flex gap-2">
                                                {COLORS.map(c => (
                                                    <button
                                                        key={c.value}
                                                        className={cn(
                                                            "h-6 w-6 rounded-full border-2",
                                                            activeColor === c.value ? "border-primary scale-110" : "border-transparent"
                                                        )}
                                                        style={{ backgroundColor: c.value }}
                                                        onClick={() => setActiveColor(c.value)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <Input
                                            placeholder="Your Full Name"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="text-lg"
                                        />
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            {SIGNATURE_FONTS.map((font, idx) => (
                                                <button
                                                    key={idx}
                                                    className={cn(
                                                        "p-4 border-2 rounded-lg text-2xl text-center hover:border-primary transition-all",
                                                        "flex items-center justify-center min-h-[80px]",
                                                        signature && signature.includes(font.family) ? "border-primary bg-primary/5" : "border-muted"
                                                    )}
                                                    style={{ fontFamily: font.family, color: activeColor }}
                                                    onClick={() => generateTypedSignature(fullName || "Signature", font.family)}
                                                >
                                                    {fullName || "Signature"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="upload" className="flex flex-col items-center justify-center py-8">
                                    <label className="cursor-pointer flex flex-col items-center gap-4 p-8 border-2 border-dashed rounded-xl hover:bg-muted/50 transition-all w-full">
                                        <Upload className="h-10 w-10 text-muted-foreground" />
                                        <span className="text-center text-muted-foreground">Upload an image of your signature (PNG, JPG)</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    const reader = new FileReader()
                                                    reader.onload = (ev) => setSignature(ev.target?.result as string)
                                                    reader.readAsDataURL(file)
                                                }
                                            }}
                                        />
                                    </label>
                                </TabsContent>
                            </Tabs>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="p-6 flex flex-col items-center text-center">
                            <h3 className="font-semibold mb-4 text-lg">Signature Preview</h3>
                            {signature ? (
                                <div className="border bg-white p-4 rounded-lg w-full flex items-center justify-center mb-6 min-h-[150px]">
                                    <img src={signature} alt="Preview" className="max-h-32 object-contain" />
                                </div>
                            ) : (
                                <div className="border-2 border-dashed rounded-lg w-full flex items-center justify-center mb-6 min-h-[150px] bg-muted/20">
                                    <p className="text-sm text-muted-foreground">No signature created yet</p>
                                </div>
                            )}
                            <Button
                                size="lg"
                                className="w-full"
                                disabled={!signature}
                                onClick={startPlacement}
                            >
                                Place Signature <Check className="ml-2 h-4 w-4" />
                            </Button>
                        </Card>

                        <Card className="p-4 bg-blue-50 dark:bg-zinc-900 border-blue-100 dark:border-zinc-800">
                            <div className="flex gap-3 text-sm text-blue-700 dark:text-zinc-400">
                                <FileIcon className="h-5 w-5 shrink-0" />
                                <div className="text-left">
                                    <p className="font-medium text-blue-900 dark:text-zinc-100">{file?.name}</p>
                                    <p>{(file?.size || 0) / 1024 > 1024 ? ((file?.size || 0) / 1024 / 1024).toFixed(2) + 'MB' : ((file?.size || 0) / 1024).toFixed(0) + 'KB'}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    if (currentStep === 'place') {
        return (
            <div className="container mx-auto py-12 px-4 max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <Button variant="ghost" onClick={() => setCurrentStep('create')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Change Signature
                    </Button>
                    <Button
                        size="lg"
                        onClick={handleSign}
                        disabled={!placement || isProcessing}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Apply & Download
                    </Button>
                </div>

                <div className="flex flex-col items-center space-y-8">
                    <div className="bg-zinc-200 dark:bg-zinc-800 p-4 rounded-xl shadow-inner max-w-full overflow-auto inline-block min-w-[300px]">
                        {pdfImages.length > 0 ? (
                            <div
                                className="relative cursor-crosshair border shadow-2xl bg-white"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    const x = ((e.clientX - rect.left) / rect.width) * 100
                                    const y = ((e.clientY - rect.top) / rect.height) * 100
                                    setPlacement({ x, y, pageIndex: 0 })
                                }}
                            >
                                <img src={pdfImages[0]} alt="PDF Page 1" className="max-w-full h-auto pointer-events-none" />
                                {placement && signature && (
                                    <div
                                        className="absolute pointer-events-none border-2 border-primary bg-primary/10 transition-all duration-300"
                                        style={{
                                            left: `${placement.x}%`,
                                            top: `${placement.y}%`,
                                            width: '150px',
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                    >
                                        <img src={signature} alt="Sign" className="w-full h-auto" />
                                        <div className="absolute -top-6 left-0 bg-primary text-white text-[10px] px-1 rounded">Your Signature</div>
                                    </div>
                                )}
                                {!placement && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none">
                                        <div className="bg-white/90 p-4 rounded-lg shadow-lg text-center backdrop-blur-sm">
                                            <p className="font-medium text-primary">Click on the document to place signature</p>
                                            <p className="text-xs text-muted-foreground mt-1">You can move it by clicking elsewhere</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-[600px] w-[450px] flex items-center justify-center bg-muted">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground italic">Currently supports signing on the first page. Full multi-page support coming soon.</p>
                </div>
            </div>
        )
    }

    return null
}
