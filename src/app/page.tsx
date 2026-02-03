"use client"

import Link from "next/link";
import {
  Merge, Split, Minimize2, FileType,
  FileText, Presentation, Table, Image as ImageIcon,
  PenTool, Shield, Stamp, RotateCw,
  Unlock, Wrench, Hash, ScanText,
  Diff, Eraser, Crop, Layout
} from "lucide-react";
import { Dropzone } from "@/components/file-upload/dropzone";

const TOOLS = [
  { href: "/tools/merge", icon: Merge, label: "Merge PDF", desc: "Combine PDFs in the order you want." },
  { href: "/tools/split", icon: Split, label: "Split PDF", desc: "Separate one page or a whole set for easy conversion." },
  { href: "/tools/compress", icon: Minimize2, label: "Compress PDF", desc: "Reduce file size while optimizing for maximal PDF quality." },
  { href: "/tools/pdf-to-word", icon: FileText, label: "PDF to Word", desc: "Convert your PDF to WORD documents with incredible accuracy." },
  { href: "/tools/pdf-to-powerpoint", icon: Presentation, label: "PDF to PowerPoint", desc: "Turn your PDF into an editable PPTX slideshow." },
  { href: "/tools/pdf-to-excel", icon: Table, label: "PDF to Excel", desc: "Pull data straight from PDFs into Excel spreadsheets." },
  { href: "/tools/word-to-pdf", icon: FileType, label: "Word to PDF", desc: "Make DOC and DOCX files easy to read by converting them to PDF." },
  { href: "/tools/powerpoint-to-pdf", icon: Presentation, label: "PowerPoint to PDF", desc: "Make PPT and PPTX slideshows easy to view by converting them to PDF." },
  { href: "/tools/excel-to-pdf", icon: Table, label: "Excel to PDF", desc: "Make EXCEL spreadsheets easy to read by converting them to PDF." },
  { href: "/tools/edit", icon: PenTool, label: "Edit PDF", desc: "Add text, images, shapes or freehand annotations to a PDF document." },
  { href: "/tools/pdf-to-jpg", icon: ImageIcon, label: "PDF to JPG", desc: "Convert each PDF page into a JPG or extract all images." },
  { href: "/tools/jpg-to-pdf", icon: ImageIcon, label: "JPG to PDF", desc: "Convert JPG images to PDF in seconds. Easily adjust orientation and margins." },
  { href: "/tools/sign", icon: PenTool, label: "Sign PDF", desc: "Sign a document and request signatures." },
  { href: "/tools/watermark", icon: Stamp, label: "Watermark", desc: "Stamp an image or text over your PDF in seconds." },
  { href: "/tools/rotate", icon: RotateCw, label: "Rotate PDF", desc: "Rotate your PDFs the way you need them." },
  { href: "/tools/html-to-pdf", icon: FileType, label: "HTML to PDF", desc: "Convert web pages to PDF documents." },
  { href: "/tools/unlock", icon: Unlock, label: "Unlock PDF", desc: "Remove PDF password security, so you can use your PDF freely." },
  { href: "/tools/organize", icon: Layout, label: "Organize PDF", desc: "Sort pages of your PDF file however you like." },
  { href: "/tools/pdf-to-pdfa", icon: FileType, label: "PDF to PDF/A", desc: "Convert to ISO-standardized PDF/A for long-term archiving." },
  { href: "/tools/repair", icon: Wrench, label: "Repair PDF", desc: "Recover data from a corrupted or damaged PDF document." },
  { href: "/tools/page-numbers", icon: Hash, label: "Page Numbers", desc: "Add page numbers into PDFs with ease." },
  { href: "/tools/ocr", icon: ScanText, label: "OCR PDF", desc: "Recognize text from scanned PDF files." },
  { href: "/tools/compare", icon: Diff, label: "Compare PDF", desc: "Show differences between two files side-by-side." },
  { href: "/tools/redact", icon: Eraser, label: "Redact PDF", desc: "Permanently remove sensitive text/images." },
  { href: "/tools/crop", icon: Crop, label: "Crop PDF", desc: "Crop selected area for all pages." },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center justify-center pt-20 pb-12 px-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-gray-900 dark:text-gray-100">
          Every tool you need to work with PDFs
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          We are your one-stop shop for all standard PDF operations. Merge, split, compress, convert, and more.
          100% free and easy to use.
        </p>

      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOOLS.map((tool) => (
            <Link
              key={tool.label}
              href={tool.href}
              className="group relative flex flex-col p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 transition-all hover:shadow-md hover:border-red-400/50 hover:-translate-y-1"
            >
              <div className="mb-4 text-red-500 group-hover:text-red-600">
                <tool.icon className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-red-600">
                {tool.label}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {tool.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
