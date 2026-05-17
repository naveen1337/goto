import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadMappings, saveMappings, downloadMappings } from '../utils/mappingsStore'

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function MappingsEditor() {
  const navigate = useNavigate()
  const [mappings, setMappings] = useState(null)
  const [selectedKey, setSelectedKey] = useState(null)
  const [isDirty, setIsDirty] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobilePanel, setMobilePanel] = useState('list') // 'list' | 'editor'
  const listRef = useRef(null)
  const searchRef = useRef(null)
  const fileInputRef = useRef(null)

  // Load on mount: localStorage → fallback to bundled JSON
  useEffect(() => {
    const stored = loadMappings()
    if (stored) {
      setMappings(stored)
      setSelectedKey(Object.keys(stored)[0] ?? null)
    } else {
      fetch('/mappings.json')
        .then((r) => r.json())
        .then((data) => {
          setMappings(data)
          setSelectedKey(Object.keys(data)[0] ?? null)
        })
        .catch(console.error)
    }
  }, [])

  const handleSave = () => {
    if (mappings) {
      saveMappings(mappings)
      setIsDirty(false)
    }
  }

  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        // Strip _exportedAt metadata key added by downloadMappings
        const { _exportedAt: _removed, ...data } = parsed
        if (typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length === 0) {
          alert('Invalid mappings file: expected a non-empty JSON object.')
          return
        }
        setMappings(data)
        setSelectedKey(Object.keys(data)[0] ?? null)
        setIsDirty(true)
      } catch {
        alert('Failed to parse JSON. Make sure the file is a valid mappings export.')
      }
    }
    reader.readAsText(file)
    // Reset so the same file can be re-uploaded if needed
    e.target.value = ''
  }

  const keys = mappings ? Object.keys(mappings) : []

  const sortedKeys = [...keys].sort((a, b) =>
    (mappings[b]?._pinned ? 1 : 0) - (mappings[a]?._pinned ? 1 : 0)
  )

  const filteredKeys = searchQuery.trim()
    ? sortedKeys.filter((k) => {
        const s = mappings[k]
        const q = searchQuery.toLowerCase()
        return (
          k.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          (s.description ?? '').toLowerCase().includes(q)
        )
      })
    : sortedKeys

  const selectedIndex = filteredKeys.indexOf(selectedKey)

  // ---- site-level mutations ------------------------------------------------
  const addSite = () => {
    const newKey = `site${Date.now()}`
    setMappings((prev) => ({
      ...prev,
      [newKey]: { name: 'New Site', description: '', base: 'https://', search: '/search?q={query}', resources: {} },
    }))
    setIsDirty(true)
    setSelectedKey(newKey)
    // give focus to the command field in the right panel after render
    setTimeout(() => document.getElementById('field-cmd')?.focus(), 50)
  }

  const deleteSite = (key) => {
    if (!key) return
    const copy = { ...mappings }
    delete copy[key]
    setMappings(copy)
    setIsDirty(true)
    const remaining = Object.keys(copy)
    setSelectedKey(remaining[Math.max(0, selectedIndex - 1)] ?? remaining[0] ?? null)
    listRef.current?.focus()
  }

  const renameSiteKey = (oldKey, newKey) => {
    if (!newKey || newKey === oldKey || mappings[newKey]) return
    const entries = Object.entries(mappings)
    setMappings(
      Object.fromEntries(entries.map(([k, v]) => (k === oldKey ? [newKey, v] : [k, v])))
    )
    setIsDirty(true)
    setSelectedKey(newKey)
  }

  const updateSite = (key, updates) => {
    setMappings((prev) => ({ ...prev, [key]: { ...prev[key], ...updates } }))
    setIsDirty(true)
  }

  // ---- resource-level mutations --------------------------------------------
  const addResource = (siteKey) => {
    const newSubKey = `res${Date.now()}`
    setMappings((prev) => ({
      ...prev,
      [siteKey]: {
        ...prev[siteKey],
        resources: {
          ...(prev[siteKey].resources ?? {}),
          [newSubKey]: { label: 'New Resource', url: '/' },
        },
      },
    }))
    setIsDirty(true)
  }

  const renameResourceKey = (siteKey, oldSub, newSub) => {
    if (!newSub || newSub === oldSub) return
    const resources = mappings[siteKey].resources ?? {}
    setMappings((prev) => ({
      ...prev,
      [siteKey]: {
        ...prev[siteKey],
        resources: Object.fromEntries(
          Object.entries(resources).map(([k, v]) => (k === oldSub ? [newSub, v] : [k, v]))
        ),
      },
    }))
    setIsDirty(true)
  }

  const updateResource = (siteKey, subKey, updates) => {
    setMappings((prev) => ({
      ...prev,
      [siteKey]: {
        ...prev[siteKey],
        resources: {
          ...prev[siteKey].resources,
          [subKey]: { ...prev[siteKey].resources[subKey], ...updates },
        },
      },
    }))
    setIsDirty(true)
  }

  const deleteResource = (siteKey, subKey) => {
    const copy = { ...(mappings[siteKey].resources ?? {}) }
    delete copy[subKey]
    updateSite(siteKey, { resources: copy })
    // isDirty already set by updateSite
  }

  const togglePin = (key) => {
    setMappings((prev) => {
      const site = { ...prev[key] }
      if (site._pinned) delete site._pinned
      else site._pinned = true
      return { ...prev, [key]: site }
    })
    setIsDirty(true)
  }

  // ---- list keyboard navigation --------------------------------------------
  const handleListKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedKey(filteredKeys[Math.min(selectedIndex + 1, filteredKeys.length - 1)])
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedKey(filteredKeys[Math.max(selectedIndex - 1, 0)])
    } else if (e.key === 'n') {
      e.preventDefault()
      addSite()
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedKey) {
      e.preventDefault()
      if (window.confirm(`Delete /${selectedKey}?`)) deleteSite(selectedKey)
    } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
      e.preventDefault()
      document.getElementById('field-cmd')?.focus()
    } else if (e.key === 'f') {
      e.preventDefault()
      searchRef.current?.focus()
    } else if (e.key === 'Escape') {
      navigate('/')
    }
  }

  if (!mappings) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#525252] text-sm">
        Loading…
      </div>
    )
  }

  const site = selectedKey ? mappings[selectedKey] : null

  return (
    <div className="min-h-screen bg-white flex flex-col text-[#161616]" style={{ height: '100vh' }}>
      {/* ── Header ── */}
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 border-b border-[#e0e0e0] shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold tracking-tight">Mappings Editor</h1>
          {isDirty && (
            <span className="text-xs text-[#f1c21b] bg-[#fdf6dd] border border-[#f1c21b] px-2 py-0.5">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="px-4 py-1.5 text-sm bg-[#0f62fe] text-white hover:bg-[#0353e9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save
          </button>
          <button
            onClick={() => downloadMappings(mappings)}
            className="px-4 py-1.5 text-sm border border-[#0f62fe] text-[#0f62fe] hover:bg-[#e8f0fe] transition-colors"
          >
            Download JSON
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-1.5 text-sm border border-[#0f62fe] text-[#0f62fe] hover:bg-[#e8f0fe] transition-colors"
          >
            Upload JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => navigate('/')}
            className="px-4 py-1.5 text-sm bg-[#161616] text-white hover:bg-[#393939] transition-colors"
          >
            ← Back
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: site list */}
        <div className={`flex-col w-full md:w-80 shrink-0 border-r border-[#e0e0e0] overflow-hidden ${mobilePanel === 'editor' ? 'hidden md:flex' : 'flex'}`}>
          {/* Search input */}
          <div className="flex items-center border-b border-[#e0e0e0] shrink-0">
            <span className="pl-3 text-[#a8a8a8]">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                <path d="M29 27.586l-7.552-7.552a11.018 11.018 0 10-1.414 1.414L27.586 29zM4 13a9 9 0 119 9 9.01 9.01 0 01-9-9z" />
              </svg>
            </span>
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') { setSearchQuery(''); listRef.current?.focus() }
                if (e.key === 'ArrowDown') { e.preventDefault(); listRef.current?.focus() }
              }}
              placeholder="Search mappings…"
              className="flex-1 px-2 py-2.5 text-sm bg-transparent outline-none placeholder-[#a8a8a8]"
              autoComplete="off"
              spellCheck="false"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); searchRef.current?.focus() }}
                className="pr-3 text-[#a8a8a8] hover:text-[#161616] transition-colors"
                aria-label="Clear search"
              >×</button>
            )}
          </div>
          <div
            ref={listRef}
            tabIndex={0}
            onKeyDown={handleListKeyDown}
            className="flex-1 overflow-y-auto outline-none focus:outline-none"
          >
            {filteredKeys.length === 0 ? (
              <p className="px-4 py-6 text-sm text-[#a8a8a8] text-center">
                {searchQuery ? 'No matches' : 'No sites yet'}
              </p>
            ) : filteredKeys.map((key) => {
              const s = mappings[key]
              const active = key === selectedKey
              return (
                <div
                  key={key}
                  onClick={() => { setSelectedKey(key); setMobilePanel('editor'); listRef.current?.focus() }}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-3 border-b border-[#f4f4f4] transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#e8f0fe] border-l-2 border-l-[#0f62fe]'
                      : 'hover:bg-[#f4f4f4] border-l-2 border-l-transparent'
                  }`}
                >
                  <span className="font-mono text-sm font-bold text-[#0f62fe] w-16 shrink-0">
                    /{key}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-[#525252] truncate">{s.name}</div>
                    {s.description && (
                      <div className="text-xs text-[#a8a8a8] truncate">{s.description}</div>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePin(key) }}
                    className={`shrink-0 text-base leading-none transition-colors ${
                      s._pinned ? 'text-[#0f62fe]' : 'text-[#d0d0d0] hover:text-[#525252]'
                    }`}
                    title={s._pinned ? 'Unpin' : 'Pin to top'}
                  >
                    {s._pinned ? '★' : '☆'}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="p-3 border-t border-[#e0e0e0] shrink-0">
            <button
              onClick={addSite}
              className="w-full py-2 text-xs border border-dashed border-[#c6c6c6] text-[#525252] hover:border-[#0f62fe] hover:text-[#0f62fe] transition-colors flex items-center justify-center gap-1"
            >
              + Add Site
              <kbd className="ml-1 text-[10px] opacity-40 font-mono bg-[#f4f4f4] px-1">n</kbd>
            </button>
          </div>
        </div>

        {/* Right: editor */}
        <div className={`flex-1 overflow-y-auto ${mobilePanel === 'list' ? 'hidden md:block' : 'block'}`}>
          {site ? (
            <SiteForm
              key={selectedKey}
              siteKey={selectedKey}
              site={site}
              allSiteKeys={keys.filter((k) => k !== selectedKey)}
              onRenameKey={(nk) => renameSiteKey(selectedKey, nk)}
              onUpdate={(u) => updateSite(selectedKey, u)}
              onDelete={() => {
                if (window.confirm(`Delete /${selectedKey}?`)) deleteSite(selectedKey)
              }}
              onEscape={() => listRef.current?.focus()}
              onAddResource={() => addResource(selectedKey)}
              onUpdateResource={(sk, u) => updateResource(selectedKey, sk, u)}
              onRenameResourceKey={(o, n) => renameResourceKey(selectedKey, o, n)}
              onDeleteResource={(sk) => deleteResource(selectedKey, sk)}
              onBackToList={() => setMobilePanel('list')}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-[#a8a8a8]">
              Select a site or press <kbd className="mx-1 font-mono bg-[#f4f4f4] px-1.5 py-0.5 text-xs">n</kbd> to add one
            </div>
          )}
        </div>
      </div>

      {/* ── Footer shortcuts ── */}
      <footer className="hidden sm:flex px-5 py-2 border-t border-[#e0e0e0] gap-5 text-[11px] text-[#a8a8a8] shrink-0">
        {[
          ['↑↓', 'navigate'],
          ['f', 'search'],
          ['n', 'new site'],
          ['Del', 'delete'],
          ['Enter', 'edit fields'],
          ['Esc', 'back'],
        ].map(([key, desc]) => (
          <span key={key}>
            <kbd className="font-mono bg-[#f4f4f4] px-1 py-0.5 text-[10px]">{key}</kbd>{' '}
            {desc}
          </span>
        ))}
      </footer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Site editor form
// ---------------------------------------------------------------------------
function SiteForm({
  siteKey,
  site,
  allSiteKeys,
  onRenameKey,
  onUpdate,
  onDelete,
  onEscape,
  onAddResource,
  onUpdateResource,
  onRenameResourceKey,
  onDeleteResource,
  onBackToList,
}) {
  const [keyDraft, setKeyDraft] = useState(siteKey)
  const [cmdError, setCmdError] = useState('')
  const resources = site.resources ?? {}
  const resourceKeys = Object.keys(resources)

  const handleFormKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onEscape()
    }
  }

  return (
    <div onKeyDown={handleFormKeyDown} className="p-4 sm:p-6">
      {/* Site header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToList}
            className="md:hidden text-xs text-[#0f62fe] hover:underline"
          >
            ← Sites
          </button>
          <h2 className="text-sm font-semibold text-[#161616]">{site.name}</h2>
        </div>
        <button onClick={onDelete} className="text-xs text-[#da1e28] hover:underline">
          Delete site
        </button>
      </div>

      {/* Basic fields */}
      <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-x-4 gap-y-3 items-start mb-7">
        <Label>Command</Label>
        <div>
          <AutoTextarea
            id="field-cmd"
            className={inputCls + ' font-mono' + (cmdError ? ' !border-[#da1e28] !ring-[#da1e28]' : '')}
            value={keyDraft}
            onChange={(e) => {
              const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')
              setKeyDraft(val)
              if (cmdError && !allSiteKeys.includes(val)) setCmdError('')
            }}
            onBlur={() => {
              if (allSiteKeys.includes(keyDraft)) {
                setCmdError(`/${keyDraft} already exists`)
              } else {
                setCmdError('')
                onRenameKey(keyDraft)
              }
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
            placeholder="e.g. gh"
            autoComplete="off"
            spellCheck="false"
          />
          {cmdError && <p className="mt-1 text-xs text-[#da1e28]">{cmdError}</p>}
        </div>

        <Label>Name</Label>
        <AutoTextarea
          className={inputCls}
          value={site.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
          placeholder="Site name"
          autoComplete="off"
        />

        <Label hint="optional">Description</Label>
        <AutoTextarea
          className={inputCls}
          value={site.description ?? ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
          placeholder="Keywords, topics, what this site is for…"
          autoComplete="off"
        />

        <Label>Base URL</Label>
        <AutoTextarea
          className={inputCls + ' font-mono'}
          value={site.base}
          onChange={(e) => onUpdate({ base: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
          placeholder="https://example.com"
          autoComplete="off"
          spellCheck="false"
        />

        <Label hint="optional">Search path</Label>
        <AutoTextarea
          className={inputCls + ' font-mono'}
          value={site.search ?? ''}
          onChange={(e) => onUpdate({ search: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
          placeholder="/search?q={query}"
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      {/* Resources */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-sm font-semibold">Resources</span>
          <button
            onClick={onAddResource}
            className="text-xs text-[#0f62fe] hover:underline flex items-center gap-1"
          >
            + Add
            <kbd className="font-mono bg-[#f4f4f4] px-1 py-0.5 text-[10px] opacity-60">n</kbd>
          </button>
        </div>

        {resourceKeys.length === 0 ? (
          <p className="text-xs text-[#a8a8a8] py-5 text-center border border-dashed border-[#e0e0e0]">
            No resources yet — press <strong>+ Add</strong> to create one
          </p>
        ) : (
          <div className="border border-[#e0e0e0] overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Table head */}
              <div className="grid gap-0 bg-[#f4f4f4] border-b border-[#e0e0e0]" style={{ gridTemplateColumns: '130px 160px 1fr 1fr 36px' }}>
                {['Command', 'Label', 'URL', 'Search (opt.)', ''].map((h) => (
                  <span key={h} className="px-3 py-2 text-xs font-semibold text-[#525252]">
                    {h}
                  </span>
                ))}
              </div>

              {resourceKeys.map((subKey, i) => (
                <ResourceRow
                  key={subKey}
                  subKey={subKey}
                  resource={resources[subKey]}
                  isLast={i === resourceKeys.length - 1}
                  allResourceKeys={resourceKeys.filter((k) => k !== subKey)}
                  onRenameKey={(nk) => onRenameResourceKey(subKey, nk)}
                  onUpdate={(u) => onUpdateResource(subKey, u)}
                  onDelete={() => onDeleteResource(subKey)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Resource row
// ---------------------------------------------------------------------------
function ResourceRow({ subKey, resource, isLast, allResourceKeys, onRenameKey, onUpdate, onDelete }) {
  const [keyDraft, setKeyDraft] = useState(subKey)
  const [keyError, setKeyError] = useState('')

  return (
    <div className={`${!isLast ? 'border-b border-[#e0e0e0]' : ''}`}>
      <div
        className="grid items-start group"
        style={{ gridTemplateColumns: '130px 160px 1fr 1fr 36px' }}
      >
        <Cell>
          <AutoTextarea
            className={cellInputCls + ' font-mono' + (keyError ? ' bg-[#fff1f1]' : '')}
            value={keyDraft}
            onChange={(e) => {
              const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')
              setKeyDraft(val)
              if (keyError && !allResourceKeys.includes(val)) setKeyError('')
            }}
            onBlur={() => {
              if (allResourceKeys.includes(keyDraft)) {
                setKeyError(`/${keyDraft} already exists`)
              } else {
                setKeyError('')
                onRenameKey(keyDraft)
              }
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
            placeholder="key"
            autoComplete="off"
            spellCheck="false"
          />
        </Cell>
      <Cell>
        <AutoTextarea
          className={cellInputCls}
          value={resource.label ?? ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
          placeholder="Label"
          autoComplete="off"
        />
        </Cell>
        <Cell>
          <AutoTextarea
            className={cellInputCls + ' font-mono'}
            value={resource.url ?? ''}
            onChange={(e) => onUpdate({ url: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
            placeholder="/path"
            autoComplete="off"
            spellCheck="false"
          />
        </Cell>
        <Cell>
          <AutoTextarea
            className={cellInputCls + ' font-mono'}
            value={resource.search ?? ''}
            onChange={(e) => onUpdate({ search: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
            placeholder="/search?q={query}"
            autoComplete="off"
            spellCheck="false"
          />
        </Cell>
        <button
          onClick={onDelete}
          className="flex items-center justify-center text-[#c6c6c6] hover:text-[#da1e28] transition-colors border-l border-[#e0e0e0] text-base leading-none"
          aria-label="Delete resource"
        >
          ×
        </button>
      </div>
    {keyError && (
      <div className="px-3 py-1 text-xs text-[#da1e28] bg-[#fff1f1] border-t border-[#ffd7d9]">
        {keyError}
      </div>
    )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Auto-resizing textarea — grows with content, never clips
// ---------------------------------------------------------------------------
function AutoTextarea({ className, value, onChange, onBlur, onKeyDown, id, placeholder, autoComplete, spellCheck }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [value])

  return (
    <textarea
      ref={ref}
      id={id}
      className={className}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      autoComplete={autoComplete}
      spellCheck={spellCheck}
      rows={1}
      style={{ resize: 'none', overflow: 'hidden', wordBreak: 'break-all' }}
    />
  )
}

function Label({ children, hint }) {
  return (
    <label className="text-sm text-[#525252] sm:text-right leading-tight pt-0.5 sm:pt-1.5">
      {children}
      {hint && <span className="block text-xs text-[#a8a8a8]">{hint}</span>}
    </label>
  )
}

function Cell({ children }) {
  return <div className="border-r border-[#e0e0e0] last:border-r-0">{children}</div>
}

const inputCls =
  'border border-[#e0e0e0] px-3 py-2 text-base w-full focus:border-[#0f62fe] focus:outline-none focus:ring-1 focus:ring-[#0f62fe] bg-white leading-snug'

const cellInputCls =
  'px-3 py-2.5 text-sm w-full bg-transparent focus:bg-[#f0f4ff] focus:outline-none leading-snug'
