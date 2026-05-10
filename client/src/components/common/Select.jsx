import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { clsx } from 'clsx'

export function Select({ value, onValueChange, placeholder, children, className = '' }) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        className={clsx(
          'flex items-center justify-between w-full px-4 py-2.5',
          'bg-surface border border-border rounded-lg',
          'text-white placeholder-muted',
          'focus:outline-none focus:ring-2 focus:ring-primary',
          'transition-all duration-200',
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown size={18} className="text-muted" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-50"
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.Viewport className="p-1">
            {children}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

export function SelectItem({ value, children }) {
  return (
    <SelectPrimitive.Item
      value={value}
      className={clsx(
        'flex items-center justify-between px-3 py-2 rounded-md cursor-pointer',
        'text-white hover:bg-dark focus:bg-dark focus:outline-none',
        'transition-colors duration-150'
      )}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>
        <Check size={16} className="text-primary" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}
