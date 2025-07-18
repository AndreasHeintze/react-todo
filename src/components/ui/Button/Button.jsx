export default function Button({ children, onClick, disabled, color, ariaLabel }) {
  const colors = {
    blue: {
      focusRing: 'focus:ring-blue-500',
      border: 'border-blue-200',
      hoverBorder: 'hover:border-blue-300',
      bg: 'bg-blue-50',
      hoverBg: 'hover:bg-blue-100',
      text: 'text-blue-600',
    },
    amber: {
      focusRing: 'focus:ring-amber-500',
      border: 'border-amber-200',
      hoverBorder: 'hover:border-amber-300',
      bg: 'bg-amber-50',
      hoverBg: 'hover:bg-amber-100',
      text: 'text-amber-600',
    },
    red: {
      focusRing: 'focus:ring-red-500',
      border: 'border-red-200',
      hoverBorder: 'hover:border-red-300',
      bg: 'bg-red-50',
      hoverBg: 'hover:bg-red-100',
      text: 'text-red-600',
    },
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={
        `flex h-11 w-11 items-center justify-center rounded border p-1 font-medium transition-colors duration-200 focus:ring-2 focus:outline-none ` +
        `${colors[color].focusRing} ` +
        `${
          disabled
            ? `cursor-not-allowed border-neutral-300 bg-neutral-200 text-neutral-400`
            : `${colors[color].border} ${colors[color].bg} ${colors[color].text} ${colors[color].hoverBorder} ${colors[color].hoverBg} cursor-pointer`
        }`
      }
    >
      {children}
    </button>
  )
}
