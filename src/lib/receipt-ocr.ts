// Browser-side OCR via Tesseract.js — the screenshot itself is decoded and
// recognized entirely in-page (a Web Worker + WASM), so it's never uploaded
// anywhere. Tesseract.js's dynamically-imported module is only pulled in
// when this actually runs, so it never bloats the Add Expense sheet's own
// bundle for people who never use screenshot upload.
//
// Note on "local": the recognition engine's own static assets (the WASM
// core and the English trained-data file, a few MB total) are fetched from
// Tesseract.js's public CDN the first time this runs in a browser, same as
// any WASM library — that's generic engine code, not the user's image or
// any receipt data, which never leaves the browser.
export async function extractReceiptText(file: File, onProgress?: (percent: number) => void): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", undefined, {
    logger: onProgress
      ? (m) => {
          if (m.status === "recognizing text") onProgress(Math.round(m.progress * 100));
        }
      : undefined,
  });

  try {
    const {
      data: { text },
    } = await worker.recognize(file);
    return text;
  } finally {
    await worker.terminate();
  }
}
