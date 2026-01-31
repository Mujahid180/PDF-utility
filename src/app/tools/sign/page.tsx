"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Edit3 as SignatureIcon, Download, File as FileIcon } from 'lucide-react'
import { SignaturePad } from "@/components/signature-pad"
import { PDFDocument } from 'pdf-lib'

export default function SignPdfPage() {
    const [file, setFile] = useState<File | null>(null)
    const [signature, setSignature] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) setFile(files[0])
    }

    const handleSign = async () => {
        if (!file || !signature) return

        setIsProcessing(true)
        try {
            const arrayBuffer = await file.arrayBuffer()
            const pdfDoc = await PDFDocument.load(arrayBuffer)

            // Embed signature image
            const signatureImage = await pdfDoc.embedPng(signature)
            const pages = pdfDoc.getPages()
            const firstPage = pages[0] // Default to first page for now

            // Placement logic (simplistic for now: bottom-right)
            const { width, height } = firstPage.getSize()
            const sigWidth = 150
            const sigHeight = (signatureImage.height / signatureImage.width) * sigWidth

            firstPage.drawImage(signatureImage, {
                x: width - sigWidth - 50,
                y: 50,
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
        } catch (error) {
            console.error(error)
            alert("Failed to sign PDF.")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
                    <SignatureIcon className="h-8 w-8 text-primary" />
                    Sign PDF
                </h1>
                <p className="text-muted-foreground">
                    Add your signature to PDF documents easily and securely.
                </p>
            </div>

            {!file ? (
                <div className="max-w-xl mx-auto">
                    <Dropzone onFileSelect={handleFileSelect} maxFiles={1} />
                </div>
            ) : (
                <div className="flex flex-col items-center space-y-8">
                    <Card className="p-8 w-full max-w-md flex flex-col items-center space-y-4">
                        <div className="h-20 w-20 bg-blue-100 rounded-2xl flex items-center justify-center dark:bg-blue-900/20">
                            <FileIcon className="h-10 w-10 text-blue-500" />
                        </div>
                        <p className="font-semibold truncate w-full text-center">{file.name}</p>
                        <Button variant="ghost" size="sm" onClick={() => { setFile(null); setSignature(null) }} className="text-destructive hover:text-destructive">
                            Remove
                        </Button>
                    </Card>

                    <Card className="p-6 w-full max-w-md">
                        <h3 className="font-medium mb-4 text-center">Your Signature</h3>
                        {signature ? (
                            <div className="flex flex-col items-center space-y-4">
                                <div className="border rounded bg-white p-2">
                                    <img src={signature} alt="Signature" className="max-h-32" />
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setSignature(null)}>
                                    Change Signature
                                </Button>
                            </div>
                        ) : (
                            <SignaturePad onSave={setSignature} />
                        )}
                    </Card>

                    <Button
                        size="lg"
                        onClick={handleSign}
                        disabled={isProcessing || !signature}
                        className="w-full max-w-sm"
                    >
                        {isProcessing ? "Signing..." : "Sign and Download"} <Download className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}
