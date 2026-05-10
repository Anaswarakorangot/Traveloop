import { clsx } from 'clsx'

export function Skeleton({ className = '' }) {
  return (
    <div className={clsx('animate-pulse bg-surface rounded', className)} />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

export function TripCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}
