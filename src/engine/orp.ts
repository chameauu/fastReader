/**
 * Optimal Recognition Point — the character index the eye should fixate on.
 * Table from Readest, applied to the raw token (no stripping).
 *
 * | Word length | ORP index |
 * |-------------|-----------|
 * | 1–3 chars   | 0         |
 * | 4–5 chars   | 1         |
 * | 6–8 chars   | 2         |
 * | 9+ chars    | 3         |
 */
export function calculateORP(word: string): number {
  const len = word.length
  if (len <= 3) return 0
  if (len <= 5) return 1
  if (len <= 8) return 2
  return 3
}

/**
 * Extra time multiplier for longer words (adapted from Readest RSVPController).
 *
 * | Word length | Multiplier |
 * |-------------|------------|
 * | ≤8 chars    | 1.0        |
 * | 9–12 chars  | 1.1        |
 * | 13+ chars   | 1.3        |
 */
export function getPauseMultiplier(word: string): number {
  if (word.length > 12) return 1.3
  if (word.length > 8) return 1.1
  return 1.0
}
