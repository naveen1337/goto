const STORAGE_KEY = 'goto_mappings'

export function loadMappings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return null
}

export function saveMappings(mappings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings, null, 2))
}

export function downloadMappings(mappings) {
  const now = new Date()
  const exportedAt = now.toISOString()
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const payload = { _exportedAt: exportedAt, ...mappings }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mappings-${timestamp}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
