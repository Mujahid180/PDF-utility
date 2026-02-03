"use client"

import React, { useState } from 'react'
import { Dropzone } from "@/components/file-upload/dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, Download, File as FileIcon, Loader2 } from 'lucide-react'

export default function PdfToExcelPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) setFile(files[0])
  }

  const handleConvert = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      }

      const XLSX = await import('xlsx');

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const allRows: string[][] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Group text items by their y-coordinate (transform[5]) to identify rows
        const rows: Record<number, any[]> = {};
        textContent.items.forEach((item: any) => {
          const y = Math.round(item.transform[5]);
          if (!rows[y]) rows[y] = [];
          rows[y].push(item);
        });

        // Sort rows by y (top to bottom) and columns by x (left to right)
        const sortedY = Object.keys(rows).map(Number).sort((a, b) => b - a);
        sortedY.forEach(y => {
          const rowItems = rows[y].sort((a, b) => a.transform[4] - b.transform[4]);
          allRows.push(rowItems.map(item => item.str));
        });

        allRows.push([]); // Empty row between pages
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(allRows);
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url
      a.download = `${file.name.replace('.pdf', '')}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error)
      alert("Failed to convert PDF to Excel spreadsheet.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
          <Table className="h-8 w-8 text-primary" />
          PDF to Excel
        </h1>
        <p className="text-muted-foreground">
          Extract data from PDF tables into Excel spreadsheets.
        </p>
      </div>

      {!file ? (
        <div className="max-w-xl mx-auto">
          <Dropzone onFileSelect={handleFileSelect} maxFiles={1} />
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8">
          <Card className="p-8 w-full max-w-md flex flex-col items-center space-y-4">
            <div className="h-20 w-20 bg-green-100 rounded-2xl flex items-center justify-center dark:bg-green-900/20">
              <FileIcon className="h-10 w-10 text-green-600" />
            </div>
            <p className="font-semibold truncate w-full text-center">{file.name}</p>
            <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-destructive hover:text-destructive">
              Remove
            </Button>
          </Card>

          <Button
            size="lg"
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full max-w-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                Convert to Excel <Download className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
