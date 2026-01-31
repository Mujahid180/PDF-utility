"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Globe, Download, Loader2, Code } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HtmlToPdfPage() {
  const [url, setUrl] = useState("")
  const [html, setHtml] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConvert = async () => {
    setIsProcessing(true)
    try {
      await new Promise(r => setTimeout(r, 2000))
      alert("HTML to PDF conversion requires a headless browser (like Puppeteer) running on the server. This UI is ready to be connected to such a service.")
    } catch (error) {
      console.error(error)
      alert("Failed to convert HTML to PDF.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
          <Globe className="h-8 w-8 text-primary" />
          HTML to PDF
        </h1>
        <p className="text-muted-foreground">
          Convert web pages or HTML code to PDF documents.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto p-6">
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="url">URL to PDF</TabsTrigger>
            <TabsTrigger value="html">HTML to PDF</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Website URL</label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="html" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">HTML Code</label>
              <textarea
                className="w-full h-40 p-3 rounded-md border bg-transparent font-mono text-sm"
                placeholder="<h1>Hello World</h1>"
                value={html}
                onChange={(e) => setHtml(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <Button
          size="lg"
          onClick={handleConvert}
          disabled={isProcessing || (!url && !html)}
          className="w-full mt-6"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              Generate PDF <Download className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </Card>
    </div>
  )
}
