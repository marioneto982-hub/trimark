import { useEffect, useRef, useState } from 'react'

interface Options {
  durationMs?: number
  startWhenVisible?: boolean
}

/**
 * Conta de 0 até `target` em `durationMs`, opcionalmente disparado quando
 * o elemento entra na viewport. Aceita target numérico ou "60%", "< 30min" etc.
 * — só anima a parte numérica e mantém o resto.
 */
export function useCountUp(target: string | number, opts: Options = {}) {
  const { durationMs = 1400, startWhenVisible = true } = opts
  const ref = useRef<HTMLElement | null>(null)
  const [text, setText] = useState<string>(typeof target === 'number' ? '0' : String(target).replace(/\d+/, '0'))
  const startedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const start = () => {
      if (startedRef.current) return
      startedRef.current = true

      const raw = String(target)
      const m = raw.match(/(\d+(?:[.,]\d+)?)/)
      if (!m) {
        setText(raw)
        return
      }
      const finalNum = Number(m[1].replace(',', '.'))
      const prefix = raw.slice(0, m.index ?? 0)
      const suffix = raw.slice((m.index ?? 0) + m[1].length)
      const t0 = performance.now()
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / durationMs)
        // ease-out cubic
        const eased = 1 - Math.pow(1 - k, 3)
        const cur = finalNum * eased
        const formatted = Number.isInteger(finalNum)
          ? String(Math.round(cur))
          : cur.toFixed(1).replace('.', ',')
        setText(`${prefix}${formatted}${suffix}`)
        if (k < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    if (!startWhenVisible || typeof IntersectionObserver === 'undefined') {
      start()
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && start(),
      { threshold: 0.4 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, durationMs, startWhenVisible])

  return { ref, text }
}

/** Componente atalho. */
export function CountUp({ to, className }: { to: string | number; className?: string }) {
  const { ref, text } = useCountUp(to)
  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={className}>
      {text}
    </span>
  )
}
