import type { ReactNode, CSSProperties } from 'react'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  /** delay em ms para escalonar várias revelações (stagger) */
  delay?: number
  /** distância em px do slide-up (default 24) */
  y?: number
  className?: string
  as?: 'div' | 'section' | 'article' | 'li' | 'header' | 'footer'
}

/**
 * Envelope que aplica fade + slide-up quando entra na viewport.
 * Usa IntersectionObserver via useReveal — sem dependência de libs externas.
 */
export function Reveal({ children, delay = 0, y = 24, className, as = 'div' }: Props) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  const Tag = as as 'div'

  const style: CSSProperties = {
    transitionDelay: `${delay}ms`,
    transform: visible ? 'none' : `translateY(${y}px)`,
    opacity: visible ? 1 : 0,
    transitionProperty: 'transform, opacity',
    transitionDuration: '700ms',
    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)', // ease-out cubic
    willChange: 'transform, opacity',
  }

  return (
    <Tag ref={ref} className={cn(className)} style={style}>
      {children}
    </Tag>
  )
}
