import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        // files are append with keys 'files' or 'files[]'
        const files = formData.getAll('files') as File[]

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No images provided" }, { status: 400 })
        }

        const pdfDoc = await PDFDocument.create()

        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer()

            try {
                // Embed the JPG image
                // Note: This throws if image is not JPG. We should handle PNGs too ideally.
                // For this quick pass, we assume JPG or try generic embed.
                let image;
                const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');

                if (isPng) {
                    image = await pdfDoc.embedPng(arrayBuffer)
                } else {
                    image = await pdfDoc.embedJpg(arrayBuffer)
                }

                const page = pdfDoc.addPage([image.width, image.height])
                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height,
                })
            } catch (imgError) {
                console.error(`Failed to embed image ${file.name}:`, imgError)
                // Continue with other images? or fail?
                // Let's add a blank page with error text
                const page = pdfDoc.addPage([500, 500])
                page.drawText(`Failed to load image: ${file.name}`, { x: 50, y: 450 })
            }
        }

        const pdfBytes = await pdfDoc.save()

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="converted_images.pdf"`,
            },
        })

    } catch (error) {
        console.error("JPG to PDF error:", error)
        return NextResponse.json({ error: "Failed to convert images" }, { status: 500 })
    }
}
