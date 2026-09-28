/**
 * Builds a CSV string from row objects and triggers a browser download.
 * Client-only — call from an onClick handler, never during render.
 */
export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const escape = (cell: string | number) => {
    const text = String(cell)
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }

  const lines = [headers.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))]
  const csv = lines.join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
