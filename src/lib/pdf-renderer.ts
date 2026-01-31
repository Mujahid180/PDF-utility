interface RenderOptions {
    scale?: number // 1 = 72dpi, 2 = 144dpi, etc.
    limit?: number // Max pages to render
}

export const renderPdfToImages = async (
    file: File,
    options: RenderOptions = { scale: 1.5 },
    onProgress: (current: number, total: number) => void
): Promise<Blob[]> => {
    // Dynamic import to avoid server-side build issues with canvas dependency
    // We import the mjs build explicitly which is often cleaner for creating bundles without node dependencies
    const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');

    // Set worker
    // Note: We might need to handle worker loading carefully.
    // For now, we assume the specific version matches.
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const totalPages = pdf.numPages;
    const blobs: Blob[] = [];

    const limit = options.limit || totalPages;
    const count = Math.min(limit, totalPages);

    for (let i = 1; i <= count; i++) {
        onProgress(i, totalPages);
        try {
            const page = await pdf.getPage(i);

            // Calculate scale
            const viewport = page.getViewport({ scale: options.scale || 1.5 });

            // Create canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d', { alpha: false }); // alpha false can improve performance

            // Check for extreme sizes that might crash some browsers
            const MAX_DIMENSION = 16384;
            let currentScale = options.scale || 1.5;
            let currentViewport = viewport;

            if (viewport.width > MAX_DIMENSION || viewport.height > MAX_DIMENSION) {
                console.warn("Viewport too large, downscaling to fit browser limits");
                const downScale = Math.min(MAX_DIMENSION / viewport.width, MAX_DIMENSION / viewport.height);
                currentScale = currentScale * downScale;
                currentViewport = page.getViewport({ scale: currentScale });
            }

            canvas.height = currentViewport.height;
            canvas.width = currentViewport.width;

            if (!context) throw new Error("Canvas context not available");

            // Fill background with white (JPG doesn't support transparency)
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);

            await page.render({
                canvasContext: context,
                viewport: currentViewport
            } as any).promise;

            // Convert to blob
            const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, 'image/jpeg', 0.92) // Higher quality 0.92
            );

            if (blob) blobs.push(blob);

            // Cleanup to free memory
            canvas.width = 0;
            canvas.height = 0;
        } catch (err) {
            console.error(`Error rendering page ${i}:`, err);
            // Continue with other pages? Or throw?
        }
    }

    return blobs;
};
