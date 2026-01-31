import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const files = formData.getAll('files') as File[]

        if (!files || files.length < 2) {
            return NextResponse.json({ error: "At least 2 files are required" }, { status: 400 })
        }

        // Create a new PDF document
        const mergedPdf = await PDFDocument.create()

        for (const file of files) {
            // Validation: Ensure it's a PDF (basic check)
            if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
                // Skip non-PDFs or throw error? For now, skip or try to load.
                continue;
            }

            const arrayBuffer = await file.arrayBuffer()
            const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
            copiedPages.forEach((page) => mergedPdf.addPage(page))
        }

        const pdfBytes = await mergedPdf.save()

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="merged.pdf"',
            },
        })
    } catch (error) {
        console.error("Merge error:", error)
        return NextResponse.json({ error: "Failed to merge PDFs. Ensure files are valid and not corrupted." }, { status: 500 })
    }
}
