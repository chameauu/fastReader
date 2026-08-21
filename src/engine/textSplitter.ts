import type { RsvpWord } from './types'

/**
 * Split text into RsvpWord tokens.
 *
 * Paragraphs are broken on every newline (single or blank-line).
 * Words are whitespace-split, with em-dash/en-dash boundaries also
 * producing separate tokens (dash stays attached to preceding segment).
 * Standalone punctuation-only tokens are merged back onto the preceding word.
 */
export function splitTextIntoWords(text: string): RsvpWord[] {
  if (!text || !text.trim()) return []

  const paragraphs = text.split(/\n/)
  const result: RsvpWord[] = []

  for (let pi = 0; pi < paragraphs.length; pi++) {
    const trimmed = paragraphs[pi]!.trim()
    if (!trimmed) continue

    const rawTokens = trimmed.split(/\s+/).filter(t => t.length > 0)
    const expanded: string[] = []

    for (const token of rawTokens) {
      expanded.push(...splitOnLongDashes(token))
    }

    const merged = attachTrailingPunctuation(expanded)

    for (const word of merged) {
      result.push({ text: word, paragraphIndex: pi })
    }
  }

  return result
}

/**
 * Split a token on em-dash (—) and en-dash (–), keeping the dash attached
 * to the preceding non-empty segment so downstream pause logic still sees it
 * as trailing punctuation. A leading dash with no preceding word is emitted
 * as its own token.
 */
function splitOnLongDashes(token: string): string[] {
  if (!/[–—]/.test(token)) return [token]
  const parts = token.split(/([–—])/)
  const result: string[] = []
  for (const part of parts) {
    if (!part) continue
    if (/^[–—]$/.test(part) && result.length > 0) {
      result[result.length - 1] = result[result.length - 1] + part
    } else {
      result.push(part)
    }
  }
  return result
}

/**
 * Merge standalone punctuation-only tokens onto the preceding word token.
 * E.g. ["hello", "."] → ["hello."] but ["."] stays as is (no preceding word).
 */
function attachTrailingPunctuation(tokens: string[]): string[] {
  const result: string[] = []
  for (const token of tokens) {
    if (/^[^\p{L}\p{N}]+$/u.test(token) && result.length > 0) {
      result[result.length - 1] = result[result.length - 1] + token
    } else {
      result.push(token)
    }
  }
  return result
}
