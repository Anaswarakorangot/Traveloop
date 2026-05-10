import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

export function Modal({ open, onOpenChange, children }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  )
}

export function ModalTrigger({ children, asChild = true }) {
  return (
    <Dialog.Trigger asChild={asChild}>
      {children}
    </Dialog.Trigger>
  )
}

export function ModalContent({ children, title, description, className = '' }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
      <Dialog.Content
        className={clsx(
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-lg max-h-[90vh] overflow-y-auto',
          'bg-surface border border-border rounded-xl p-6',
          'shadow-2xl z-50',
          'focus:outline-none',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <Dialog.Title className="text-xl font-semibold text-white">
                {title}
              </Dialog.Title>
            )}
            {description && (
              <Dialog.Description className="text-sm text-muted mt-1">
                {description}
              </Dialog.Description>
            )}
          </div>
          <Dialog.Close className="text-muted hover:text-white p-1 rounded-lg hover:bg-dark transition-colors">
            <X size={20} />
          </Dialog.Close>
        </div>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  )
}
