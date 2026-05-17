const TABS = ['All', 'Images', 'News', 'Videos', 'Maps', 'More']

export default function SearchTabs({ active, onChange }) {
  return (
    <div className="flex border-b border-[#e0e0e0]">
      {TABS.map((tab) => {
        const isActive = active === tab
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`
              px-4 py-2.5 text-sm border-b-2 -mb-[2px] transition-colors duration-100
              focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0f62fe]
              ${
                isActive
                  ? 'border-[#0f62fe] text-[#0f62fe] font-medium'
                  : 'border-transparent text-[#525252] hover:text-[#161616] hover:border-[#c6c6c6]'
              }
            `}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}
