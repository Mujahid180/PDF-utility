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
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

        // Save with encryption
        const pdfBytes = await pdfDoc.save({
            userPassword: password,
            ownerPassword: password,
            permissions: {
                printing: 'highResolution',
                modifying: false,
                copying: false,
                annotating: false,
                fillingForms: false,
                contentAccessibility: false,
                documentAssembly: false,
            },
        } as any)

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="protected_${file.name}"`,
            },
        })

    } catch (error) {
        console.error("Protect error:", error)
        return NextResponse.json({ error: "Failed to protect PDF" }, { status: 500 })
    }
}
