"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Unlock, Lock, Download, ArrowLeft } from 'lucide-react'

export default function UnlockPage() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) setFile(files[0])
  }

  const handleUnlock = async () => {
    if (!file || !password) {
      alert("Please enter the password.")
      return
    }

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('password', password)

      const response = await fetch('/api/pdf-unlock', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to unlock")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `unlocked_${file.name}`
      document.body.appendChild(a)
      a.click()
      a.remove()

    } catch (error: any) {
      console.error(error)
      alert(error.message || "Failed to unlock PDF. Is the password correct?")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!file) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
            <Unlock className="h-8 w-8 text-primary" />
            Unlock PDF
          </h1>
          <p className="text-muted-foreground">
            Remove password protection from your PDF files.
          </p>
        </div>
        <div className="max-w-xl mx-auto">
          <Dropzone onFileSelect={handleFileSelect} maxFiles={1} />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-md">
      <Button variant="ghost" onClick={() => setFile(null)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Upload
      </Button>

      <Card className="p-8 space-y-6">
        <div className="flex flex-col items-center justify-center">
          <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center dark:bg-amber-900/20 mb-4">
            <Lock className="h-10 w-10 text-amber-600" />
          </div>
          <p className="font-semibold text-center break-all mb-6">{file.name}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Enter Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Required to unlock"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button onClick={handleUnlock} disabled={isProcessing} className="w-full" size="lg">
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlock className="mr-2 h-4 w-4" />}
            Unlock PDF
          </Button>
        </div>
      </Card>
    </div>
  )
}
