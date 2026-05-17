/**
 * Carbon Design System-style button.
 * variants: 'primary' | 'secondary' | 'tertiary' | 'ghost'
 */
export default function SearchButton({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
}) {
  const base =
    'inline-flex items-center justify-center px-[15px] py-[11px] text-sm font-medium leading-none transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f62fe] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

  const variants = {
    primary:
      'bg-[#0f62fe] text-white hover:bg-[#0353e9] active:bg-[#002d9c]',
    secondary:
      'bg-[#393939] text-white hover:bg-[#474747] active:bg-[#161616]',
    tertiary:
      'bg-transparent text-[#FFCC00] border border-[#FFCC00] hover:bg-[#FFCC00] hover:text-black active:bg-[#ccaa00] active:border-[#ccaa00]',
    ghost:
      'bg-transparent text-[#0f62fe] hover:bg-[#e8e8e8] active:bg-[#c6c6c6]',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]}`}
    >
      {children}
    </button>
  )
}
