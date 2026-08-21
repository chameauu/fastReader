import { useRef, useState, useCallback } from 'react';
import type { RecentFile } from '../hooks/useRecentFiles';
import './HomeScreen.css';

interface HomeScreenProps {
  onFileOpen: (file: File) => void;
  recentFiles: RecentFile[];
}

function fileIcon(type: RecentFile['type']) {
  switch (type) {
    case 'pdf':
      return '📄';
    case 'epub':
      return '📚';
    case 'md':
      return '📝';
    case 'txt':
      return '📃';
    default:
      return '📁';
  }
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function HomeScreen({ onFileOpen, recentFiles }: HomeScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragCountRef = useRef(0);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      onFileOpen(files[0]);
    },
    [onFileOpen],
  );

  const handleOpenClick = () => {
    fileInputRef.current?.click();
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current += 1;
    setDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current -= 1;
    if (dragCountRef.current <= 0) {
      dragCountRef.current = 0;
      setDragging(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current = 0;
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="home-screen">
      <h1 className="home-screen__title">FastReader</h1>
      <p className="home-screen__subtitle">Speed-read any document</p>

      <div
        className={`home-screen__dropzone ${dragging ? 'home-screen__dropzone--active' : ''}`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <span className="home-screen__dropzone-icon">⬆</span>
        <p className="home-screen__dropzone-text">
          Drag &amp; drop a file here
        </p>
        <p className="home-screen__dropzone-hint">PDF, EPUB, TXT, or Markdown</p>
      </div>

      <button
        type="button"
        className="home-screen__open-btn"
        onClick={handleOpenClick}
      >
        Open File
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.epub,.txt,.md"
        className="visually-hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {recentFiles.length > 0 && (
        <section className="home-screen__recent">
          <h2 className="home-screen__recent-title">Recent Files</h2>
          <ul className="home-screen__recent-list">
            {recentFiles.map((f) => (
              <li key={f.path} className="home-screen__recent-item">
                <span className="home-screen__recent-icon">{fileIcon(f.type)}</span>
                <div className="home-screen__recent-info">
                  <span className="home-screen__recent-name">{f.name}</span>
                  <span className="home-screen__recent-time">{timeAgo(f.lastOpened)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
