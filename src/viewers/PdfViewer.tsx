import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFDocumentLoadingTask } from 'pdfjs-dist';
import './PdfViewer.css';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://unpkg.com/pdfjs-dist@6.2.108/build/pdf.worker.min.mjs';

export interface PdfViewerProps {
  file: File;
  onTextSelected?: (text: string) => void;
  onLocationChange?: (location: { current: number; total: number }) => void;
  pageNumber?: number;
  scale?: number;
}

export default function PdfViewer({
  file,
  onTextSelected,
  onLocationChange,
  pageNumber: controlledPage,
  scale: controlledScale = 1.5,
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const renderingRef = useRef<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const scaleRef = useRef(controlledScale);

  useEffect(() => {
    scaleRef.current = controlledScale;
  }, [controlledScale]);

  const renderPage = useCallback(async (pageNum: number) => {
    const pdf = pdfRef.current;
    if (!pdf || renderingRef.current.has(pageNum)) return;
    renderingRef.current.add(pageNum);

    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: scaleRef.current });

      const pageContainer = document.createElement('div');
      pageContainer.className = 'pdf-page';
      pageContainer.dataset.pageNumber = String(pageNum);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const transform = outputScale !== 1
        ? [outputScale, 0, 0, outputScale, 0, 0]
        : null;

      pageContainer.appendChild(canvas);

      const textLayerDiv = document.createElement('div');
      textLayerDiv.className = 'text-layer';
      textLayerDiv.setAttribute('aria-label', `Page ${pageNum} text`);
      textLayerDiv.style.width = `${Math.floor(viewport.width)}px`;
      textLayerDiv.style.height = `${Math.floor(viewport.height)}px`;
      pageContainer.appendChild(textLayerDiv);

      const data = await page.getTextContent();
      const { TextLayer } = await import('pdfjs-dist');
      const textLayer = new TextLayer({
        textContentSource: data,
        container: textLayerDiv,
        viewport,
      });
      await textLayer.render();

      if (containerRef.current) {
        containerRef.current.appendChild(pageContainer);
      }

      await page.render({
        canvas,
        canvasContext: ctx,
        transform: transform as unknown as number[],
        viewport,
      }).promise;

      onLocationChange?.({ current: pageNum, total: pdf.numPages });
    } catch (err) {
      console.error(`Failed to render page ${pageNum}:`, err);
    } finally {
      renderingRef.current.delete(pageNum);
    }
  }, [onLocationChange]);

  const renderAllPages = useCallback(async (pdf: PDFDocumentProxy) => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    renderingRef.current.clear();

    for (let i = 1; i <= pdf.numPages; i++) {
      await renderPage(i);
    }
  }, [renderPage]);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    const loadPdf = async () => {
      try {
        setError(null);
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask: PDFDocumentLoadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        if (cancelled) return;

        pdfRef.current = pdf;
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        await renderAllPages(pdf);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to load PDF';
        if (message.includes('password')) {
          setError('This PDF is password-protected.');
        } else {
          setError(`Failed to load PDF: ${message}`);
        }
        console.error('PDF load error:', err);
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
      pdfRef.current = null;
      renderingRef.current.clear();
    };
  }, [file, renderAllPages]);

  useEffect(() => {
    if (!containerRef.current || !pdfRef.current) return;
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        onTextSelected?.(selection.toString());
      }
    };
    containerRef.current.addEventListener('mouseup', handleMouseUp);
    return () => {
      containerRef.current?.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onTextSelected]);

  useEffect(() => {
    if (controlledPage && pdfRef.current && controlledPage !== currentPage) {
      setCurrentPage(controlledPage);
      renderPage(controlledPage);
    }
  }, [controlledPage, currentPage, renderPage]);

  if (error) {
    return (
      <div className="pdf-viewer pdf-viewer--error" role="alert" aria-label={error}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="pdf-viewer"
      role="document"
      aria-label="PDF document viewer"
    />
  );
}
