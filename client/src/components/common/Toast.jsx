import * as ToastPrimitive from '@radix-ui/react-toast'
import { clsx } from 'clsx'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { create } from 'zustand'

// Toast store
export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2)
    set((state) => ({
      toasts: [...state.toasts, { id, ...toast }]
    }))
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }))
    }, toast.duration || 3000)
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  },
}))

// Toast helper functions
export const toast = {
  success: (message) => useToastStore.getState().addToast({ type: 'success', message }),
  error: (message) => useToastStore.getState().addToast({ type: 'error', message }),
  info: (message) => useToastStore.getState().addToast({ type: 'info', message }),
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const styles = {
  success: 'border-primary-light bg-primary/10',
  error: 'border-danger bg-danger/10',
  info: 'border-secondary bg-secondary/10',
}

export function Toaster() {
  const { toasts, removeToast } = useToastStore()

  return (
    <ToastPrimitive.Provider>
      {toasts.map((t) => {
        const Icon = icons[t.type] || Info
        return (
          <ToastPrimitive.Root
            key={t.id}
            className={clsx(
              'fixed top-4 right-4 z-[100]',
              'flex items-center gap-3 p-4',
              'bg-surface border-l-4 rounded-lg shadow-xl',
              'animate-in slide-in-from-top-full fade-in duration-300',
              styles[t.type]
            )}
            onOpenChange={(open) => {
              if (!open) removeToast(t.id)
            }}
          >
            <Icon className={clsx(
              'w-5 h-5',
              t.type === 'success' && 'text-primary-light',
              t.type === 'error' && 'text-danger',
              t.type === 'info' && 'text-secondary'
            )} />
            <ToastPrimitive.Description className="text-white text-sm">
              {t.message}
            </ToastPrimitive.Description>
            <ToastPrimitive.Close className="text-muted hover:text-white ml-auto">
              <X size={16} />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        )
      })}
      <ToastPrimitive.Viewport />
    </ToastPrimitive.Provider>
  )
}
