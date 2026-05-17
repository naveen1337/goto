/**
 * Dropdown list of command suggestions shown below the search bar.
 *
 * @param {{ command: string, label: string }[]} suggestions
 * @param {number} activeIndex  - currently keyboard-highlighted index (-1 = none)
 * @param {(command: string) => void} onSelect
 */
export default function CommandDropdown({ suggestions, activeIndex, onSelect }) {
  if (!suggestions || suggestions.length === 0) return null

  return (
    <ul
      role="listbox"
      aria-label="Command suggestions"
      className="absolute top-full left-0 right-0 z-50 mt-px bg-white border border-[#e0e0e0] shadow-lg max-h-64 overflow-y-auto"
    >
      {suggestions.map((s, i) => (
        <li
          key={s.command}
          role="option"
          aria-selected={i === activeIndex}
          onMouseDown={(e) => {
            // preventDefault keeps focus on the input
            e.preventDefault()
            onSelect(s.command)
          }}
          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm select-none ${
            i === activeIndex
              ? 'bg-[#e8f0fe] text-[#0f62fe]'
              : 'text-[#161616] hover:bg-[#f4f4f4]'
          }`}
        >
          <span className="font-mono font-semibold text-[#0f62fe] min-w-[6rem]">
            {s.command}
          </span>
          <span className="text-[#525252]">{s.label}</span>
        </li>
      ))}
    </ul>
  )
}
