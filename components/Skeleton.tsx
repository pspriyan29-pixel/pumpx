'use client'

export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-white/5 ${className}`} />
}

export function SkeletonCircle({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-white/5 ${className}`} />
}


