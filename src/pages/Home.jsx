import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from './components/Logo'
import SearchBar from './components/SearchBar'
import SearchButton from './components/SearchButton'
import { parseQuery, getSuggestions } from '../utils/parseQuery'
import { resolveUrl } from '../utils/resolveUrl'
import { loadMappings, saveMappings } from '../utils/mappingsStore'

const EXAMPLES = [
  '/gh react hooks',
  '/mdn Array.prototype.map',
  '/npm tailwindcss',
  '/yt lofi beats',
  '/wiki quantum computing',
]

export default function Home() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [mappings, setMappings] = useState(null)
  const [typedPlaceholder, setTypedPlaceholder] = useState('')
  const exampleIdxRef = useRef(0)
  const typeStateRef = useRef({ phase: 'typing', charIndex: 0 })
  const typeTimerRef = useRef(null)

  useEffect(() => {
    const stored = loadMappings()
    if (stored) {
      setMappings(stored)
    } else {
      fetch('/mappings.json')
        .then(r => r.json())
        .then((data) => {
          saveMappings(data)
          setMappings(data)
        })
        .catch(console.error)
    }
  }, [])

  // Typewriter effect for search placeholder
  useEffect(() => {
    const tick = () => {
      const current = EXAMPLES[exampleIdxRef.current]
      const s = typeStateRef.current
      if (s.phase === 'typing') {
        if (s.charIndex < current.length) {
          s.charIndex++
          setTypedPlaceholder(current.slice(0, s.charIndex))
          typeTimerRef.current = setTimeout(tick, 60)
        } else {
          s.phase = 'pausing'
          typeTimerRef.current = setTimeout(tick, 1800)
        }
      } else if (s.phase === 'pausing') {
        s.phase = 'deleting'
        typeTimerRef.current = setTimeout(tick, 50)
      } else if (s.phase === 'deleting') {
        if (s.charIndex > 0) {
          s.charIndex--
          setTypedPlaceholder(current.slice(0, s.charIndex))
          typeTimerRef.current = setTimeout(tick, 35)
        } else {
          s.phase = 'typing'
          exampleIdxRef.current = (exampleIdxRef.current + 1) % EXAMPLES.length
          typeTimerRef.current = setTimeout(tick, 500)
        }
      }
    }
    typeTimerRef.current = setTimeout(tick, 1000)
    return () => clearTimeout(typeTimerRef.current)
  }, [])

  const suggestions = mappings ? getSuggestions(query, mappings) : []
  const sampleMappings = mappings
    ? Object.entries(mappings)
        .sort(([, a], [, b]) => (b._pinned ? 1 : 0) - (a._pinned ? 1 : 0))
        .slice(0, 6)
    : []

  const handleSearch = useCallback(() => {
    const trimmed = query.trim()
    if (!trimmed) return

    const parsed = parseQuery(trimmed)

    if (parsed.commands.length === 0) {
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(parsed.query)}`,
        '_blank',
        'noopener,noreferrer',
      )
      return
    }

    if (mappings) {
      const url = resolveUrl(parsed, mappings)
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
        return
      }
    }

    // Unknown command — fall back to Google with the full input
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }, [query, mappings])

  const handleSuggestionSelect = (command) => {
    const endsWithSpace = query.endsWith(' ')
    const tokens = query.trim().split(/\s+/).filter(Boolean)
    const lastToken = tokens[tokens.length - 1] ?? ''

    let newQuery
    if (!endsWithSpace && lastToken.startsWith('/')) {
      // Replace the partial last command token with the selected one
      tokens[tokens.length - 1] = command
      newQuery = tokens.join(' ') + ' '
    } else {
      // Append the command after existing content
      newQuery = (query.trimEnd() ? query.trimEnd() + ' ' : '') + command + ' '
    }

    setQuery(newQuery)
  }

  return (
    <div
      className="min-h-screen bg-[#080601] flex flex-col text-[#fef3c7]"
      style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(255,204,0,0.08) 0%, transparent 55%)' }}
    >
      {/* Scanlines overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)' }}
      />

      {/* Top nav */}
      <header className="flex justify-between items-center px-6 py-3 border-b border-[#2e2500]">
        <div className="flex items-center gap-2   font-mono text-[11px] text-[#806600]">
          <span className="w-2 h-2 rounded-full bg-[#FFCC00] shadow-[0_0_6px_#FFCC00] animate-pulse" />
          <span>SYS:ONLINE</span>
          <span className="mx-1 opacity-30">│</span>
          <span>CMD_NAVIGATOR</span>
        </div>
        <SearchButton variant="tertiary" onClick={() => navigate('/mappings')}>
          Edit mappings
        </SearchButton>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 gap-8 pt-14 sm:pt-20">
        <Logo />

        <div className="w-full max-w-[660px] flex flex-col gap-4">
          {/* Terminal prompt label */}
          <div className="flex items-center gap-2 font-mono text-xs text-[#806600]">
            <span className="text-[#FFCC00] text-base leading-none">›</span>
            <span className="tracking-widest uppercase text-[10px]">Enter command or search query</span>
            <span className="inline-block w-[7px] h-[13px] bg-[#FFCC00] opacity-80 animate-pulse" />
          </div>

          {/* Search bar */}
          <SearchBar
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onSearch={handleSearch}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
            suggestions={suggestions}
            onSuggestionSelect={handleSuggestionSelect}
            placeholder={typedPlaceholder || 'Type /command or search the web…'}
          />

          {/* Action button */}
          <div className="flex justify-center mt-1">
            <button
              onClick={handleSearch}
              className="px-6 py-3 text-sm font-medium border border-[#FFCC00] text-[#FFCC00] hover:bg-[#FFCC00] hover:text-black active:bg-[#ccaa00] transition-colors flex items-center gap-2.5"
            >
              goto Search
              <span className="text-lg leading-none">↵</span>
            </button>
          </div>

          {/* Sample mappings grid */}
          {sampleMappings.length > 0 && !query && (
            <div className="grid grid-cols-2 sm:grid-cols-3 border border-[#2e2500] overflow-hidden">
              {sampleMappings.map(([key, site]) => (
                <button
                  key={key}
                  onClick={() => setQuery(`/${key} `)}
                  className="group bg-[#0a0900] hover:bg-[#141000] px-4 py-3 text-left border-r border-b border-[#2e2500] transition-colors"
                >
                  <span className="block font-mono text-sm font-semibold text-[#FFCC00] group-hover:text-[#FFE033] transition-colors">
                    /{key}
                  </span>
                  <span className="block text-[11px] text-[#806600] group-hover:text-[#997700] truncate mt-0.5 transition-colors">
                    {site.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Terminal footer */}
      <footer className="px-6 py-2 border-t border-[#2e2500] flex justify-between items-center">
        <span className="font-mono text-[10px] text-[#665200] tracking-wider">
          TAB: autocomplete &nbsp;·&nbsp; ENTER: execute &nbsp;·&nbsp; /cmd: route
        </span>
        <span className="font-mono text-[10px] text-[#3d3300]">GOTO v2.0</span>
      </footer>
    </div>
  )
}