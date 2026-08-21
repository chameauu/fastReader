import React, { useEffect, useRef, useState } from 'react';
import './TextViewer.css';

export interface TextViewerProps {
  file: File;
  onTextSelected?: (text: string) => void;
}

function renderMarkdown(text: string): string {
  let html = text;

  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  html = html.replace(/\n{2,}/g, '</p><p>');
  html = `<p>${html}</p>`;
  html = html.replace(/<p>\s*<(h[1-3]|pre|ul)/g, '<$1');
  html = html.replace(/<\/(h[1-3]|pre|ul)>\s*<\/p>/g, '</$1>');
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

export default function TextViewer({ file, onTextSelected }: TextViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState('');
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    setIsMarkdown(ext === 'md');

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setContent(text);
        setError(null);
      } else {
        setError('Failed to read file');
      }
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsText(file);

    return () => {
      reader.abort();
    };
  }, [file]);

  useEffect(() => {
    if (!containerRef.current || !onTextSelected) return;

    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        onTextSelected(selection.toString());
      }
    };

    containerRef.current.addEventListener('mouseup', handleMouseUp);
    return () => {
      containerRef.current?.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onTextSelected]);

  if (error) {
    return (
      <div className="text-viewer text-viewer--error" role="alert" aria-label={error}>
        <p>{error}</p>
      </div>
    );
  }

  const renderedContent = isMarkdown ? renderMarkdown(content) : content;

  return (
    <div
      ref={containerRef}
      className="text-viewer"
      role="document"
      aria-label={isMarkdown ? 'Markdown document viewer' : 'Text document viewer'}
    >
      {isMarkdown ? (
        <div
          className="text-viewer__markdown"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
      ) : (
        <pre className="text-viewer__plain">{content}</pre>
      )}
    </div>
  );
}
