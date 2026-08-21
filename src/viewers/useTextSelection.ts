import { RefObject, useCallback, useEffect, useState } from 'react';

export interface TextSelection {
  selectedText: string;
  selectionRect: DOMRect | null;
  clearSelection: () => void;
}

export function useTextSelection(
  containerRef: RefObject<HTMLDivElement | null>,
): TextSelection {
  const [selectedText, setSelectedText] = useState('');
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelectedText('');
    setSelectionRect(null);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectedText('');
        setSelectionRect(null);
        return;
      }
      const text = selection.toString();
      if (text.length === 0) {
        setSelectedText('');
        setSelectionRect(null);
        return;
      }
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setSelectionRect(rect);
    };

    container.addEventListener('mouseup', handleMouseUp);
    return () => {
      container.removeEventListener('mouseup', handleMouseUp);
    };
  }, [containerRef]);

  return { selectedText, selectionRect, clearSelection };
}
