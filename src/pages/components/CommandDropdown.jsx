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
      className="absolute top-full left-0 right-0 z-50 mt-px bg-[#0a0900] border border-[#3d3300] shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,204,0,0.08)] max-h-64 overflow-y-auto"
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
          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm select-none border-l-2 transition-colors ${
            i === activeIndex
              ? 'bg-[#141000] border-l-[#FFCC00]'
              : 'border-l-transparent hover:bg-[#110e00] hover:border-l-[#3d3300]'
          }`}
        >
          <span className={`font-mono font-semibold min-w-[6rem] ${i === activeIndex ? 'text-[#FFE033]' : 'text-[#FFCC00]'}`}>
            {s.command}
          </span>
          <span className={i === activeIndex ? 'text-[#fef3c7]' : 'text-[#665200]'}>{s.label}</span>
        </li>
      ))}
    </ul>
  )
}
