import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const x = parseFloat(formData.get('x') as string)
        const y = parseFloat(formData.get('y') as string)
        const width = parseFloat(formData.get('width') as string)
        const height = parseFloat(formData.get('height') as string)

        if (!file) {
            return NextResponse.json({ error: "Missing file" }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
        const pages = pdfDoc.getPages()

        pages.forEach(page => {
            const { width: pageWidth, height: pageHeight } = page.getSize()

            // Coordinates from frontend are usually percentage or pixel based relative to viewport
            // We need to map them to PDF coordinates.
            // Assuming frontend sends precise PDF coordinates or percentages?
            // Let's assume frontend sends PERCENTAGES (0 to 1) to be safe across resolutions.

            // Wait, typical visual croppers give pixels relative to image.
            // We will assume frontend sends PERCENTAGES: x=0.1 (10%), y=0.1, w=0.8, h=0.8

            const cropX = x * pageWidth
            // PDF Y-axis is bottom-up (0,0 is bottom-left). Croppers are usually top-down.
            // Frontend sending top-left based Y percentage.
            // So PDF Y = pageHeight - (y * pageHeight) - (height * pageHeight)
            const cropY = pageHeight - (y * pageHeight) - (height * pageHeight)

            const cropWidth = width * pageWidth
            const cropHeight = height * pageHeight

            page.setCropBox(cropX, cropY, cropWidth, cropHeight)
            page.setMediaBox(cropX, cropY, cropWidth, cropHeight)
        })

        const pdfBytes = await pdfDoc.save()

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="cropped_${file.name}"`,
            },
        })

    } catch (error) {
        console.error("Crop error:", error)
        return NextResponse.json({ error: "Failed to crop PDF" }, { status: 500 })
    }
}
