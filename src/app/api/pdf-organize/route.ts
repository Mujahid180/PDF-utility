import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const pageOrderJson = formData.get('pageOrder') as string

        if (!file || !pageOrderJson) {
            return NextResponse.json({ error: "Missing file or page order" }, { status: 400 })
        }

        const pageOrder = JSON.parse(pageOrderJson) as number[] // array of ORIGINAL page indices (0-based)
        // Example: [2, 0, 1] means the new PDF's page 1 is original page 3, etc.

        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

        // Create new PDF
        const newPdf = await PDFDocument.create()

        // Copy pages in the specified order
        // Note: copyPages accepts an array of indices. 
        // If we pass [2, 0, 1], it returns pages in that order.
        const copiedPages = await newPdf.copyPages(pdfDoc, pageOrder)

        copiedPages.forEach(page => {
            newPdf.addPage(page)
        })

        const pdfBytes = await newPdf.save()

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="organized_${file.name}"`,
            },
        })

    } catch (error) {
        console.error("Organize error:", error)
        return NextResponse.json({ error: "Failed to organize PDF" }, { status: 500 })
    }
}
