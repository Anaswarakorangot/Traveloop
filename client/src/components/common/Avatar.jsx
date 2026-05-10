import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { clsx } from 'clsx'

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-xl',
}

export function Avatar({ src, name, size = 'md', className = '' }) {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <AvatarPrimitive.Root
      className={clsx(
        'inline-flex items-center justify-center rounded-full bg-primary overflow-hidden',
        sizes[size],
        className
      )}
    >
      <AvatarPrimitive.Image
        src={src}
        alt={name}
        className="w-full h-full object-cover"
      />
      <AvatarPrimitive.Fallback
        className="flex items-center justify-center w-full h-full bg-primary text-white font-semibold"
      >
        {initials || '?'}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
