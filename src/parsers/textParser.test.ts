import { describe, it, expect } from 'vitest'
import { readPlainTextFile } from './textParser'

function makeFile(name: string, content: string): File {
  return new File([content], name, { type: 'text/plain' })
}

describe('readPlainTextFile', () => {
  it('reads a .txt file', async () => {
    const file = makeFile('hello.txt', 'Hello world')
    const text = await readPlainTextFile(file)
    expect(text).toBe('Hello world')
  })

  it('reads a .md file', async () => {
    const file = makeFile('readme.md', '# Title')
    const text = await readPlainTextFile(file)
    expect(text).toBe('# Title')
  })

  it('rejects .pdf files', async () => {
    const file = makeFile('doc.pdf', 'binary')
    await expect(readPlainTextFile(file)).rejects.toThrow('Unsupported file type ".pdf"')
  })

  it('rejects .epub files', async () => {
    const file = makeFile('book.epub', 'binary')
    await expect(readPlainTextFile(file)).rejects.toThrow('Unsupported file type ".epub"')
  })

  it('rejects files without extension', async () => {
    const file = makeFile('noext', 'content')
    await expect(readPlainTextFile(file)).rejects.toThrow()
  })
})
