import React, { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import ePub, { Book, Rendition } from 'epubjs';
import { TocItem } from './TocItem';
import './EpubViewer.css';

export interface EpubViewerProps {
  file: File;
  onTextSelected?: (text: string) => void;
  onTocReady?: (toc: TocItem[]) => void;
  onLocationChange?: (location: { current: number; total: number }) => void;
  currentLocation?: string;
}

export interface EpubViewerHandle {
  display: (target: string) => void;
  prev: () => void;
  next: () => void;
}

const EpubViewer = forwardRef<EpubViewerHandle, EpubViewerProps>(
  ({ file, onTextSelected, onTocReady, onLocationChange, currentLocation }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef<Book | null>(null);
    const renditionRef = useRef<Rendition | null>(null);

    useImperativeHandle(ref, () => ({
      display(target: string) {
        renditionRef.current?.display(target);
      },
      prev() {
        renditionRef.current?.prev();
      },
      next() {
        renditionRef.current?.next();
      },
    }));

    const destroyBook = useCallback(() => {
      if (renditionRef.current) {
        renditionRef.current.destroy();
        renditionRef.current = null;
      }
      if (bookRef.current) {
        bookRef.current.destroy();
        bookRef.current = null;
      }
    }, []);

    useEffect(() => {
      if (!containerRef.current) return;

      destroyBook();

      const url = URL.createObjectURL(file);
      let cancelled = false;

      const loadBook = async () => {
        try {
          const book = ePub(url);
          bookRef.current = book;

          await book.ready;

          const rendition = book.renderTo(containerRef.current!, {
            width: '100%',
            height: '100%',
            manager: 'continuous',
            flow: 'paginated',
          });

          renditionRef.current = rendition;
          await rendition.display();

          book.loaded.navigation.then((nav) => {
            if (cancelled) return;
            const toc: TocItem[] = nav.toc.map((item) => ({
              label: item.label,
              href: item.href,
              children: item.subitems?.map((sub) => ({
                label: sub.label,
                href: sub.href,
              })),
            }));
            onTocReady?.(toc);
          });

          rendition.on('selected', (_cfiRange: string, contents?: import('epubjs/types/contents').default) => {
            if (cancelled) return;
            const c = contents ?? rendition.getContents();
            const doc = c.document;
            if (doc) {
              const selection = doc.getSelection();
              if (selection && selection.toString().length > 0) {
                onTextSelected?.(selection.toString());
              }
            }
          });

          rendition.on('relocated', (location: { start: { displayed: { page: number; total: number } } }) => {
            if (cancelled) return;
            onLocationChange?.({
              current: location.start.displayed.page,
              total: location.start.displayed.total,
            });
          });

          if (currentLocation) {
            rendition.display(currentLocation);
          }
        } catch (err) {
          console.error('Failed to load EPUB:', err);
        }
      };

      loadBook();

      return () => {
        cancelled = true;
        destroyBook();
        URL.revokeObjectURL(url);
      };
    }, [file, destroyBook, onTextSelected, onTocReady, onLocationChange, currentLocation]);

    return (
      <div
        ref={containerRef}
        className="epub-viewer"
        role="document"
        aria-label="EPUB document viewer"
      />
    );
  },
);

EpubViewer.displayName = 'EpubViewer';

export default EpubViewer;
