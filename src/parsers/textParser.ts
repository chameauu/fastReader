const ACCEPTED_EXTENSIONS = new Set(['.txt', '.md'])

/**
 * Read a plain-text file (.txt or .md) via FileReader.
 * Rejects with a clear Error for any other extension.
 */
export function readPlainTextFile(file: File): Promise<string> {
  const name = file.name.toLowerCase()
  const ext = name.slice(name.lastIndexOf('.'))
  if (!ACCEPTED_EXTENSIONS.has(ext)) {
    return Promise.reject(
      new Error(`Unsupported file type "${ext}". Only .txt and .md files are accepted.`),
    )
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
