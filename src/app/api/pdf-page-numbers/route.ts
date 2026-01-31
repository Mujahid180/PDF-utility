import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const position = formData.get('position') as string || "bottom-center"
        const startFrom = parseInt(formData.get('startFrom') as string || "1")

        if (!file) {
            return NextResponse.json({ error: "Missing file" }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

        const pages = pdfDoc.getPages()
        const totalPages = pages.length

        pages.forEach((page, index) => {
            const { width, height } = page.getSize()
            const pageNum = startFrom + index
            const text = `Page ${pageNum} of ${totalPages + startFrom - 1}`
            const fontSize = 12
            const textWidth = font.widthOfTextAtSize(text, fontSize)

            let x = 0
            let y = 30 // Default bottom margin

            switch (position) {
                case 'bottom-center':
                    x = width / 2 - textWidth / 2
                    break
                case 'bottom-right':
                    x = width - textWidth - 40
                    break
                case 'bottom-left':
                    x = 40
                    break
                case 'top-center':
                    x = width / 2 - textWidth / 2
                    y = height - 40
                    break
                case 'top-right':
                    x = width - textWidth - 40
                    y = height - 40
                    break
                case 'top-left':
                    x = 40
                    y = height - 40
                    break
                default:
                    x = width / 2 - textWidth / 2 // Default center
            }

            page.drawText(text, {
                x,
                y,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
            })
        })

        const pdfBytes = await pdfDoc.save()

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="numbered_${file.name}"`,
            },
        })

    } catch (error) {
        console.error("Page Number error:", error)
        return NextResponse.json({ error: "Failed to add page numbers" }, { status: 500 })
    }
}
