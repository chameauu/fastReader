import { describe, it, expect } from 'vitest'
import { calculateORP, getPauseMultiplier } from './orp'

describe('calculateORP', () => {
  it('returns 0 for length 1', () => {
    expect(calculateORP('a')).toBe(0)
  })

  it('returns 0 for length 2', () => {
    expect(calculateORP('ab')).toBe(0)
  })

  it('returns 0 for length 3 (boundary)', () => {
    expect(calculateORP('abc')).toBe(0)
  })

  it('returns 1 for length 4 (boundary)', () => {
    expect(calculateORP('abcd')).toBe(1)
  })

  it('returns 1 for length 5', () => {
    expect(calculateORP('abcde')).toBe(1)
  })

  it('returns 2 for length 6 (boundary)', () => {
    expect(calculateORP('abcdef')).toBe(2)
  })

  it('returns 2 for length 8 (boundary)', () => {
    expect(calculateORP('abcdefgh')).toBe(2)
  })

  it('returns 3 for length 9 (boundary)', () => {
    expect(calculateORP('abcdefghi')).toBe(3)
  })

  it('returns 3 for length 12', () => {
    expect(calculateORP('abcdefghijkl')).toBe(3)
  })

  it('returns 3 for long words', () => {
    expect(calculateORP('abcdefghijklmnop')).toBe(3)
  })
})

describe('getPauseMultiplier', () => {
  it('returns 1.0 for short words (≤8)', () => {
    expect(getPauseMultiplier('hello')).toBe(1.0)
    expect(getPauseMultiplier('abcdefgh')).toBe(1.0)
  })

  it('returns 1.1 for words 9–12 chars', () => {
    expect(getPauseMultiplier('abcdefghi')).toBe(1.1)
    expect(getPauseMultiplier('abcdefghijkl')).toBe(1.1)
  })

  it('returns 1.3 for words >12 chars', () => {
    expect(getPauseMultiplier('abcdefghijklm')).toBe(1.3)
    expect(getPauseMultiplier('abcdefghijklmnop')).toBe(1.3)
  })
})
