# FastReader

A standalone speed-reading web app built on RSVP (Rapid Serial Visual Presentation) — words flash at a fixed point on screen so you can read without moving your eyes. Inspired by the [Readest](https://github.com/readest/readest) RSVP engine. No accounts, no backend: everything runs client-side.

## Features

- **Paste text** or import `.txt` / `.md` files (drag-and-drop or file picker)
- **RSVP playback engine** — play/pause/resume, single-word stepping, ±15-word skips
- **Configurable speed** — 100–1000 WPM (step 50), adjustable mid-playback
- **Optimal Recognition Point (ORP)** — the fixation character is highlighted in red and held at a fixed screen position
- **Smart timing** — long words get extra display time; punctuation adds a configurable pause
- **Three display modes** (cycle with the toolbar button or `M`):
  - **Split** — context paragraph on top, focal word below
  - **Focus** — single word only, maximum immersion
  - **Highlight** — full scrollable text with the current word highlighted; click any word to jump to it
- **Progress bar** with drag-to-seek and estimated time remaining
- **Countdown** (0–3 s) before first playback
- **Dark / light theme**, persisted
- **Position memory** — your place is saved per document and restored on return
- Responsive down to mobile widths

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / pause |
| `←` / `↓` | Decrease WPM by 50 |
| `→` / `↑` | Increase WPM by 50 |
| `Shift+←` | Skip back 15 words |
| `Shift+→` | Skip forward 15 words |
| `,` | Previous word (pauses) |
| `.` | Next word (pauses) |
| `M` | Cycle display mode |
| `Escape` | Save position and close |

## Getting started

Requires Node 20+ and [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm dev        # start dev server
```

Other scripts:

```sh
pnpm build      # production build to dist/
pnpm preview    # preview the production build
pnpm typecheck  # tsc --noEmit
pnpm test       # vitest in watch mode
pnpm exec vitest run   # single test run (CI mode)
```

## Tech stack

- [Vite](https://vite.dev) + React 19 + TypeScript (strict)
- Vanilla CSS with custom properties (no UI framework)
- Framework-agnostic engine (`EventTarget` + `setTimeout` chain)
- Vitest with jsdom for tests
- localStorage for settings and reading positions
- pnpm

## Project structure

```
src/
├── engine/        # Core RSVP logic (no UI): splitter, ORP, playback state machine, persistence
├── parsers/       # File readers (.txt / .md)
├── components/    # React UI: landing screen, reader, display modes, controls
├── hooks/         # useRSVP (engine binding), keyboard shortcuts, theme
└── utils/         # Content hashing, time formatting
```

## CI

GitHub Actions runs typecheck, tests, and production build on every push to `master`/`main` and on all pull requests (`.github/workflows/ci.yml`). A pre-commit hook runs the same checks locally before each commit.

## Roadmap

- PDF support
- EPUB support with chapter navigation
- CJK segmentation (`Intl.Segmenter`) and RTL text support
- Font size and ORP color customization
- Document library with bookmarks
- Reading statistics
- PWA (installable, offline)

## License

MIT
