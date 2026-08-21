import { describe, it, expect } from 'vitest'
import { hashContent } from './hash'

describe('hashContent', () => {
  it('returns a hex string', () => {
    const h = hashContent('hello world')
    expect(h).toMatch(/^[0-9a-f]{8}$/)
  })

  it('is deterministic', () => {
    expect(hashContent('test')).toBe(hashContent('test'))
  })

  it('different inputs produce different hashes', () => {
    expect(hashContent('hello')).not.toBe(hashContent('world'))
  })

  it('handles empty string', () => {
    const h = hashContent('')
    expect(h).toMatch(/^[0-9a-f]{8}$/)
  })
})
