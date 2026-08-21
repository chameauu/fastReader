/**
 * Format a remaining-time value in human-friendly units.
 *
 * - ≤0  → "0s"
 * - <60 → "45s"
 * - <3600 → "2m 30s"
 * - ≥3600 → "1h 05m"
 */
export function formatTimeRemaining(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0s'

  const s = Math.floor(seconds)
  if (s < 60) return `${s}s`

  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`

  const rem = s % 60
  return `${m}m ${String(rem).padStart(2, '0')}s`
}
