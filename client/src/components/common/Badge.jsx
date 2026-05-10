import { clsx } from 'clsx'

const variants = {
  default: 'bg-surface text-muted',
  primary: 'bg-primary/20 text-primary-light',
  secondary: 'bg-secondary/20 text-secondary',
  success: 'bg-green-500/20 text-green-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  danger: 'bg-danger/20 text-danger',
  ongoing: 'bg-green-500/20 text-green-400 animate-pulse',
  upcoming: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-gray-500/20 text-gray-400',
  draft: 'bg-yellow-500/20 text-yellow-400',
}

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
