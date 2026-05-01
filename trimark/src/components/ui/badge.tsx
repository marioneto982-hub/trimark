import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

const VARIANTS = {
  prospect:    'bg-slate-100  text-slate-700  border-slate-200',
  onboarding:  'bg-amber-100  text-amber-800  border-amber-200',
  active:      'bg-emerald-100 text-emerald-800 border-emerald-200',
  suspended:   'bg-orange-100 text-orange-800 border-orange-200',
  canceled:    'bg-rose-100   text-rose-800   border-rose-200',
  default:     'bg-slate-100  text-slate-700  border-slate-200',
} as const

interface Props extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof VARIANTS
}

export function Badge({ variant = 'default', className, children, ...rest }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}
