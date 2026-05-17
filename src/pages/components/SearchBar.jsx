import { useState, useRef, useEffect } from 'react'
import CommandDropdown from './CommandDropdown'

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M29 27.586l-7.552-7.552a11.018 11.018 0 10-1.414 1.414L27.586 29zM4 13a9 9 0 119 9 9.01 9.01 0 01-9-9z" />
  </svg>
)

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4l6.6 6.6L8 22.6 9.4 24l6.6-6.6 6.6 6.6 1.4-1.4-6.6-6.6L24 9.4z" />
  </svg>
)

export default function SearchBar({
  value,
  onChange,
  onSearch,
  onKeyDown,
  suggestions = [],
  onSuggestionSelect,
}) {
  const [focused, setFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Focus input when / is pressed anywhere on the page
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleGlobalKey)
    return () => window.removeEventListener('keydown', handleGlobalKey)
  }, [])

  const handleChange = (e) => {
    setActiveIndex(-1)
    onChange(e)
  }

  const handleClear = () => {
    onChange({ target: { value: '' } })
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, -1))
        return
      }
      if (e.key === 'Tab') {
        e.preventDefault()
        const target = activeIndex >= 0 ? suggestions[activeIndex] : suggestions[0]
        if (target) {
          onSuggestionSelect?.(target.command)
          setActiveIndex(-1)
        }
        return
      }
      if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault()
        onSuggestionSelect?.(suggestions[activeIndex].command)
        setActiveIndex(-1)
        return
      }
      if (e.key === 'Escape') {
        setActiveIndex(-1)
        return
      }
    }
    onKeyDown?.(e)
  }

  const showDropdown = focused && suggestions.length > 0

  return (
    <div className="relative w-full">
      <div
        className={`
          flex items-center w-full transition-all duration-100
          border outline-none
          ${
            focused
              ? 'border-[#0f62fe] bg-white shadow-[0_0_0_2px_#0f62fe]'
              : 'border-[#e0e0e0] bg-[#f4f4f4] hover:bg-[#e8e8e8] hover:border-[#c6c6c6]'
          }
        `}
      >
      {/* Search icon */}
      <span className="pl-4 pr-3 text-[#525252] flex-shrink-0">
        <SearchIcon />
      </span>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        className="flex-1 bg-transparent py-4 text-[#161616] text-base placeholder-[#a8a8a8] outline-none"
        placeholder="Type /command or search the web"
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        aria-label="Search"
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        autoComplete="off"
        spellCheck="false"
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="pl-2 pr-2 text-[#525252] hover:text-[#161616] transition-colors flex-shrink-0 focus:outline-none"
          aria-label="Clear search"
        >
          <CloseIcon />
        </button>
      )}

      {/* Divider */}
      <span className="w-px h-5 bg-[#e0e0e0] mx-1 flex-shrink-0" />
    </div>

    {showDropdown && (
      <CommandDropdown
        suggestions={suggestions}
        activeIndex={activeIndex}
        onSelect={(cmd) => {
          onSuggestionSelect?.(cmd)
          setActiveIndex(-1)
        }}  
      />
    )}
  </div>
  )
}
