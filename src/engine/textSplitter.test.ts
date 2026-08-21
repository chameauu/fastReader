import { describe, it, expect } from 'vitest'
import { splitTextIntoWords } from './textSplitter'

describe('splitTextIntoWords', () => {
  it('returns [] for empty string', () => {
    expect(splitTextIntoWords('')).toEqual([])
  })

  it('returns [] for whitespace-only input', () => {
    expect(splitTextIntoWords('   \n  \n  ')).toEqual([])
  })

  it('splits simple text into words with paragraphIndex 0', () => {
    expect(splitTextIntoWords('Hello world')).toEqual([
      { text: 'Hello', paragraphIndex: 0 },
      { text: 'world', paragraphIndex: 0 },
    ])
  })

  it('single newlines break paragraphs', () => {
    expect(splitTextIntoWords('Hello\nWorld')).toEqual([
      { text: 'Hello', paragraphIndex: 0 },
      { text: 'World', paragraphIndex: 1 },
    ])
  })

  it('blank lines break paragraphs (index counts blank lines)', () => {
    // "Hello\n\nWorld" → paragraphs at index 0,1,2; index 1 is empty/skipped
    expect(splitTextIntoWords('Hello\n\nWorld')).toEqual([
      { text: 'Hello', paragraphIndex: 0 },
      { text: 'World', paragraphIndex: 2 },
    ])
  })

  it('multi-paragraph text has correct paragraphIndex', () => {
    // "First.\n\nSecond.\n\nThird." → indices 0,2,4 (blank lines at 1,3 skipped)
    const result = splitTextIntoWords('First.\n\nSecond.\n\nThird.')
    expect(result).toEqual([
      { text: 'First.', paragraphIndex: 0 },
      { text: 'Second.', paragraphIndex: 2 },
      { text: 'Third.', paragraphIndex: 4 },
    ])
  })

  it('splits on em-dash boundaries (dash stays on preceding segment)', () => {
    expect(splitTextIntoWords('best—of')).toEqual([
      { text: 'best—', paragraphIndex: 0 },
      { text: 'of', paragraphIndex: 0 },
    ])
  })

  it('splits on en-dash boundaries', () => {
    expect(splitTextIntoWords('10–15')).toEqual([
      { text: '10–', paragraphIndex: 0 },
      { text: '15', paragraphIndex: 0 },
    ])
  })

  it('trailing punctuation stays attached when no space', () => {
    expect(splitTextIntoWords('hello. world')).toEqual([
      { text: 'hello.', paragraphIndex: 0 },
      { text: 'world', paragraphIndex: 0 },
    ])
  })

  it('standalone punctuation merges with preceding token', () => {
    expect(splitTextIntoWords('hello . world')).toEqual([
      { text: 'hello.', paragraphIndex: 0 },
      { text: 'world', paragraphIndex: 0 },
    ])
  })

  it('collapses multiple spaces', () => {
    expect(splitTextIntoWords('hello   world')).toEqual([
      { text: 'hello', paragraphIndex: 0 },
      { text: 'world', paragraphIndex: 0 },
    ])
  })

  it('trims paragraph whitespace', () => {
    expect(splitTextIntoWords('  hello  \n  world  ')).toEqual([
      { text: 'hello', paragraphIndex: 0 },
      { text: 'world', paragraphIndex: 1 },
    ])
  })

  it('CJK string does not crash', () => {
    expect(() => splitTextIntoWords('你好世界')).not.toThrow()
  })

  it('handles em-dash at start of paragraph', () => {
    expect(splitTextIntoWords('—continued')).toEqual([
      { text: '—', paragraphIndex: 0 },
      { text: 'continued', paragraphIndex: 0 },
    ])
  })

  it('handles em-dash at end of paragraph', () => {
    expect(splitTextIntoWords('cliffhanger—')).toEqual([
      { text: 'cliffhanger—', paragraphIndex: 0 },
    ])
  })
})
