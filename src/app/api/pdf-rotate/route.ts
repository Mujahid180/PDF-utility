import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, degrees } from 'pdf-lib'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const angleStr = formData.get('angle') as string

        if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

        let angle = parseInt(angleStr) || 0
        // Normalize angle to be positive 0-360
        angle = ((angle % 360) + 360) % 360

        if (angle === 0) {
            // Just return logic or error? Returning original is fine.
        }

        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
        const pages = pdfDoc.getPages()

        pages.forEach((page) => {
            const currentRotation = page.getRotation().angle
            page.setRotation(degrees(currentRotation + angle))
        })

        const pdfBytes = await pdfDoc.save()

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="rotated.pdf"`,
            },
        })
    } catch (error) {
        console.error("Rotate error:", error)
        return NextResponse.json({ error: "Failed to rotate PDF." }, { status: 500 })
    }
}
