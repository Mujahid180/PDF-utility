import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const range = formData.get('range') as string // "1-5, 8"

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const existingPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
        const totalPages = existingPdf.getPageCount()
        const zip = new JSZip()

        // Parse ranges
        let pageIndices: number[] = []

        if (range && range.trim().length > 0) {
            // Parse specific ranges
            const parts = range.split(',')
            parts.forEach(part => {
                const [start, end] = part.split('-').map(s => parseInt(s.trim()))
                if (!isNaN(start)) {
                    if (!isNaN(end)) {
                        // Range: start to end
                        for (let i = start; i <= end; i++) {
                            if (i >= 1 && i <= totalPages) pageIndices.push(i - 1)
                        }
                    } else {
                        // Single page
                        if (start >= 1 && start <= totalPages) pageIndices.push(start - 1)
                    }
                }
            })
            // Deduplicate and Sort
            pageIndices = [...new Set(pageIndices)].sort((a, b) => a - b)

            if (pageIndices.length >= 0) {
                // Mode: Extract to single PDF
                const newPdf = await PDFDocument.create()
                const pages = await newPdf.copyPages(existingPdf, pageIndices)
                pages.forEach(p => newPdf.addPage(p))

                const pdfBytes = await newPdf.save()

                // Return single PDF
                return new NextResponse(Buffer.from(pdfBytes), {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `attachment; filename="split_extracted.pdf"`,
                    },
                })
            }
        } else {
            // Mode: Split every page into individual file
            for (let i = 0; i < totalPages; i++) {
                const newPdf = await PDFDocument.create()
                const [page] = await newPdf.copyPages(existingPdf, [i])
                newPdf.addPage(page)
                const pdfBytes = await newPdf.save()
                zip.file(`page_${i + 1}.pdf`, pdfBytes)
            }

            // Generate Zip
            const zipContent = await zip.generateAsync({ type: 'uint8array' })

            // Return Zip
            return new NextResponse(new Blob([zipContent as any]), {
                headers: {
                    'Content-Type': 'application/zip',
                    'Content-Disposition': `attachment; filename="split_pages.zip"`,
                },
            })
        }

        return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })

    } catch (error) {
        console.error("Split error:", error)
        return NextResponse.json({ error: "Failed to split PDF." }, { status: 500 })
    }
}
