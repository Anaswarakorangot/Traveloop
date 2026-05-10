import { clsx } from 'clsx'

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={clsx(
        'bg-surface border border-border rounded-xl p-4',
        'shadow-lg',
        hover && 'hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={clsx('mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={clsx('text-lg font-semibold text-white', className)}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={clsx('', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={clsx('mt-4 pt-4 border-t border-border', className)}>
      {children}
    </div>
  )
}
