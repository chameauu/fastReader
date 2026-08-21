/**
 * FNV-1a 32-bit hash → hex string.
 * Used for localStorage key derivation (one key per document).
 */
export function hashContent(text: string): string {
  let hash = 0x811c9dc5 // FNV offset basis
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = (hash * 0x01000193) | 0 // FNV prime, keep 32-bit
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}
