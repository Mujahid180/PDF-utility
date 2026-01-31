import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const text = formData.get('text') as string
        const opacity = parseFloat(formData.get('opacity') as string || "0.5")
        const rotation = parseInt(formData.get('rotation') as string || "45")
        const fontSize = parseInt(formData.get('fontSize') as string || "48")
        const colorHex = formData.get('color') as string || "#000000"

        if (!file || !text) {
            return NextResponse.json({ error: "Missing file or text" }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

        // Parse Hex Color
        const r = parseInt(colorHex.slice(1, 3), 16) / 255
        const g = parseInt(colorHex.slice(3, 5), 16) / 255
        const b = parseInt(colorHex.slice(5, 7), 16) / 255

        const pages = pdfDoc.getPages()
        pages.forEach(page => {
            const { width, height } = page.getSize()

            // Simple Center Positioning Logic
            // For advanced watermark, we might calculate text width
            const textWidth = font.widthOfTextAtSize(text, fontSize)
            const textHeight = font.heightAtSize(fontSize)

            page.drawText(text, {
                x: width / 2 - textWidth / 2,
                y: height / 2 - textHeight / 2,
                size: fontSize,
                font: font,
                color: rgb(r, g, b),
                opacity: opacity,
                rotate: degrees(rotation),
            })
        })

        const pdfBytes = await pdfDoc.save()

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="watermarked_${file.name}"`,
            },
        })

    } catch (error) {
        console.error("Watermark error:", error)
        return NextResponse.json({ error: "Failed to watermark PDF" }, { status: 500 })
    }
}
