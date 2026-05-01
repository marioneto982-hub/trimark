import { useEffect, useRef, useState } from 'react'

interface IntroAnimationProps {
  onComplete: () => void
}

type Phase = 'fade-in' | 'idle' | 'zoom' | 'click' | 'reveal' | 'done'

/**
 * Intro cinematografica do site Trimark.
 * Sequencia de ~3.3s:
 *   1. Logo "trimark" aparece em fade-in (centralizado, fundo branco)
 *   2. Camera aproxima (scale up suave) com foco no botao "play" sobre o "i"
 *   3. Anel pulsante em volta do play chama atencao
 *   4. Click sintetico (som de obturador de camera) + ripple azul-marinho
 *   5. Ripple expande, fade out, hero do site aparece atras
 *
 * - Respeita prefers-reduced-motion (pula direto se ativo)
 * - Botao "Pular intro" no canto inferior direito
 * - Som via Web Audio API (sem arquivo externo)
 */
export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState<Phase>('fade-in')
  const audioPlayedRef = useRef(false)

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setPhase('done')
      onComplete()
      return
    }

    const timers = [
      setTimeout(() => setPhase('idle'), 100),
      setTimeout(() => setPhase('zoom'), 800),
      setTimeout(() => setPhase('click'), 2200),
      setTimeout(() => playCameraSound(), 2250),
      setTimeout(() => setPhase('reveal'), 2500),
      setTimeout(() => {
        setPhase('done')
        onComplete()
      }, 3300),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  function playCameraSound() {
    if (audioPlayedRef.current) return
    audioPlayedRef.current = true
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      const ctx = new AudioCtx()
      const now = ctx.currentTime
      // Click 1 - shutter open (mais agudo)
      makeClick(ctx, now, 2400, 0.04, 0.35)
      // Click 2 - shutter close (mais grave, levemente atrasado)
      makeClick(ctx, now + 0.09, 1600, 0.05, 0.4)
    } catch {
      /* ignore audio errors */
    }
  }

  function makeClick(
    ctx: AudioContext,
    when: number,
    freq: number,
    dur: number,
    vol: number,
  ) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = freq
    filter.Q.value = 5
    osc.type = 'square'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(vol, when)
    gain.gain.exponentialRampToValueAtTime(0.001, when + dur)
    osc.connect(filter).connect(gain).connect(ctx.destination)
    osc.start(when)
    osc.stop(when + dur)
  }

  function handleSkip() {
    setPhase('done')
    onComplete()
  }

  if (phase === 'done') return null

  const logoStyle = (() => {
    switch (phase) {
      case 'fade-in':
        return { transform: 'scale(0.85)', opacity: 0 }
      case 'idle':
        return { transform: 'scale(1)', opacity: 1 }
      case 'zoom':
        return { transform: 'scale(2.2) translateX(-15%)', opacity: 1 }
      case 'click':
        return { transform: 'scale(2.1) translateX(-15%)', opacity: 1 }
      case 'reveal':
        return { transform: 'scale(2.3) translateX(-15%)', opacity: 0 }
      default:
        return { transform: 'scale(1)', opacity: 1 }
    }
  })()

  const showRing = phase === 'zoom' || phase === 'click'
  const showRipple = phase === 'reveal'

  return (
    <div
      className="fixed inset-0 z-[9999] bg-white flex items-center justify-center overflow-hidden"
      style={{
        opacity: phase === 'reveal' ? 0 : 1,
        transition: 'opacity 0.7s ease-out 0.2s',
        pointerEvents: phase === 'reveal' ? 'none' : 'auto',
      }}
    >
      <button
        onClick={handleSkip}
        className="absolute bottom-6 right-6 text-xs text-gray-400 hover:text-gray-700 transition-colors z-10 select-none"
        aria-label="Pular animacao de abertura"
      >
        Pular intro {'→'}
      </button>

      <div
        className="relative"
        style={{
          ...logoStyle,
          transition:
            'transform 1.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease-out',
        }}
      >
        <img
          src="/logo-trimark.png"
          alt="Trimark"
          className="h-28 sm:h-36 md:h-44 w-auto select-none"
          draggable={false}
        />

        {showRing && (
          <span
            className="absolute pointer-events-none"
            style={{
              top: '8%',
              left: '21%',
              width: 48,
              height: 48,
              border: '2px solid #1F4E79',
              borderRadius: '9999px',
              transform: 'translate(-50%, -50%)',
              animation: 'intro-ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
        )}

        {showRipple && (
          <span
            className="absolute pointer-events-none"
            style={{
              top: '8%',
              left: '21%',
              width: 24,
              height: 24,
              backgroundColor: '#1F4E79',
              borderRadius: '9999px',
              transform: 'translate(-50%, -50%)',
              animation:
                'intro-ripple 0.9s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes intro-ping {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.85; }
          100% { transform: translate(-50%, -50%) scale(2.4); opacity: 0; }
        }
        @keyframes intro-ripple {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(70); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
