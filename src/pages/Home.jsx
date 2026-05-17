import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from './components/Logo'
import SearchBar from './components/SearchBar'
import SearchButton from './components/SearchButton'
import { parseQuery, getSuggestions } from '../utils/parseQuery'
import { resolveUrl } from '../utils/resolveUrl'
import { loadMappings, saveMappings } from '../utils/mappingsStore'

export default function Home() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [mappings, setMappings] = useState(null)

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

  const suggestions = mappings ? getSuggestions(query, mappings) : []

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
    <div className="min-h-screen bg-white flex flex-col text-[#161616]">

      {/* Top nav */}
      <header className="flex justify-end items-center px-6 py-3 gap-3">
        <SearchButton variant="primary" onClick={() => navigate('/mappings')}>Edit mappings</SearchButton>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 gap-10 pt-20">
        <Logo />

        <div className="w-full max-w-[660px] flex flex-col gap-5">
          {/* Search bar */}
          <SearchBar
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onSearch={handleSearch}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
            suggestions={suggestions}
            onSuggestionSelect={handleSuggestionSelect}
          />

          {/* Action buttons */}
          <div className="flex justify-center gap-2">
            <SearchButton variant="secondary" onClick={handleSearch}>
              goto Search
            </SearchButton>
          </div>
        </div>
      </main>
    </div>
  )
}