export default function Logo() {
  return (
    <div className="select-none flex flex-col items-center gap-2">
      <div className="flex items-baseline">
        <span
          className="font-bold text-[72px] leading-none tracking-tight text-[#fef3c7]"
          style={{ textShadow: '0 0 40px rgba(255,204,0,0.35), 0 0 80px rgba(255,204,0,0.15)' }}
        >got</span>
        <span
          className="font-bold text-[72px] leading-none tracking-tight text-[#FFCC00]"
          style={{ textShadow: '0 0 20px rgba(255,204,0,1), 0 0 50px rgba(255,204,0,0.6), 0 0 100px rgba(255,204,0,0.3)' }}
        >o</span>
      </div>
      <span className="font-mono text-[11px] tracking-[0.3em] text-[#806600] uppercase">
        command navigator
      </span>
    </div>
  )
}
