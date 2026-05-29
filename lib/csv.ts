/**
 * Escapes a single CSV cell value:
 * - Wraps in double quotes if it contains a comma, newline, or double-quote
 * - Escapes internal double-quotes by doubling them
 */
export function escapeCell(value: unknown): string {
  const str = value == null ? '' : String(value).replace(/\r?\n/g, ' ')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Converts an array of row-objects to a CSV string and triggers a browser download.
 * @param rows     Array of flat objects (one per row). All objects should share the same keys.
 * @param filename Suggested filename (should end in .csv)
 */
export function downloadCSV(rows: Record<string, unknown>[], filename: string): void {
  if (rows.length === 0) return

  const headers = Object.keys(rows[0])
  const headerRow = headers.map(escapeCell).join(',')
  const dataRows = rows.map((row) => headers.map((h) => escapeCell(row[h])).join(','))
  const csv = [headerRow, ...dataRows].join('\r\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
