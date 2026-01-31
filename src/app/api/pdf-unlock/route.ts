import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const password = formData.get('password') as string

        if (!file || !password) {
            return NextResponse.json({ error: "Missing file or password" }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()

        // Load with password
        // If password is wrong, load will throw error
        const pdfDoc = await PDFDocument.load(arrayBuffer, { password } as any)

        // Save without encryption
        const pdfBytes = await pdfDoc.save()

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="unlocked_${file.name}"`,
            },
        })

    } catch (error) {
        console.error("Unlock error:", error)
        return NextResponse.json({ error: "Failed to unlock. Wrong password?" }, { status: 500 })
    }
}
