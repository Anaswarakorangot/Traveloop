import { forwardRef, useState } from 'react'
import { clsx } from 'clsx'
import { Eye, EyeOff } from 'lucide-react'

export const Input = forwardRef(({
  label,
  error,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-muted">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type={isPassword && showPassword ? 'text' : type}
          className={clsx(
            'w-full px-4 py-2.5 bg-surface border border-border rounded-lg',
            'text-white placeholder-muted',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all duration-200',
            error && 'border-danger focus:ring-danger',
            isPassword && 'pr-10',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
