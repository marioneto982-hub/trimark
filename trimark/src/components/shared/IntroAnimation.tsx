import { useEffect, useRef, useState } from 'react'

interface IntroAnimationProps {
  onComplete: () => void
}

type Phase = 'fade-in' | 'idle' | 'zoom' | 'click' | 'rush' | 'reveal' | 'done'

/**
 * Intro cinematografica do site Trimark.
 *
 * Sequencia:
 *   0.0s - 0.3s   logo aparece em fade-in (centralizado, fundo branco)
 *   0.3s - 1.0s   idle (pausa pra ler "trimark")
 *   1.0s - 2.0s   ZOOM FORTE focando no botao "play" sobre o "i"
 *                 (transform-origin no play: scale 7x, "trimark" voa pra fora)
 *   2.0s - 2.3s   anel pulsante em volta do play (chama atencao)
 *   2.3s - 2.4s   CLIQUE: play e pressionado (scale 0.94, brilho menor)
 *   2.4s         som de obturador de camera (Web Audio API)
 *   2.4s - 3.2s   RUSH: play vem em direcao ao usuario
 *                 (scale 22x, glow azul-marinho, fade pra branco)
 *   3.2s - 3.7s   site aparece com fade-in
 *
 * - Respeita prefers-reduced-motion (pula direto se ativo)
 * - Botao "Pular intro" no canto inferior direito
 * - Som via Web Audio API (sem arquivo externo)
 *
 * IMPORTANTE: a posicao do "play" dentro do logo PNG e calibrada via
 * PLAY_X / PLAY_Y (% do container do logo). Se o anel/ripple aparecer
 * fora do play visualmente, ajustar esses dois valores.
 */

// Posicao aproximada do botao de play dentro do PNG do logo (% do container).
// Calibrado visualmente. Ajustar se necessario.
const PLAY_X = 22 // % horizontal (logo "play" fica acima do "i", segunda letra)
const PLAY_Y = 32 // % vertical (play fica na metade superior do logo)

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
      setTimeout(() => setPhase('zoom'), 1000),
      setTimeout(() => setPhase('click'), 2300),
      setTimeout(() => playCameraSound(), 2360),
      setTimeout(() => setPhase('rush'), 2450),
      setTimeout(() => setPhase('reveal'), 3200),
      setTimeout(() => {
        setPhase('done')
        onComplete()
      }, 3700),
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
      // Click 1 - shutter open (curto, agudo)
      makeClick(ctx, now, 2400, 0.04, 0.4)
      // Click 2 - shutter close (curto, mais grave, levemente atrasado)
      makeClick(ctx, now + 0.09, 1500, 0.06, 0.45)
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

  // Estilo do container do logo conforme a fase.
  // transform-origin sempre no play => o play fica visualmente fixo enquanto
  // o resto do logo escala/voa pra fora dele.
  const logoStyle = (() => {
    const origin = `${PLAY_X}% ${PLAY_Y}%`
    switch (phase) {
      case 'fade-in':
        return {
          transform: 'translate(-50%, -50%) scale(0.85)',
          opacity: 0,
          transformOrigin: 'center center',
          filter: 'none',
        }
      case 'idle':
        return {
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: 1,
          transformOrigin: 'center center',
          filter: 'none',
        }
      case 'zoom':
        return {
          transform: 'translate(-50%, -50%) scale(7)',
          opacity: 1,
          transformOrigin: origin,
          filter: 'none',
        }
      case 'click':
        // Botao "pressionado": diminui levemente e escurece
        return {
          transform: 'translate(-50%, -50%) scale(6.55)',
          opacity: 1,
          transformOrigin: origin,
          filter: 'brightness(0.85)',
        }
      case 'rush':
        // Play vem em direcao ao usuario: scale enorme + glow + fade
        return {
          transform: 'translate(-50%, -50%) scale(22)',
          opacity: 0,
          transformOrigin: origin,
          filter:
            'brightness(1.05) drop-shadow(0 0 60px rgba(31, 78, 121, 0.6))',
        }
      case 'reveal':
        return {
          transform: 'translate(-50%, -50%) scale(22)',
          opacity: 0,
          transformOrigin: origin,
          filter: 'none',
        }
      default:
        return {
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: 1,
          transformOrigin: 'center center',
          filter: 'none',
        }
    }
  })()

  // Anel pulsante e ripple ficam em coordenadas absolutas, sobrepostos ao
  // container do logo, na mesma posicao do play. Como o container do logo
  // escala (scale > 1) com origin no play, o anel "anda junto" porque tambem
  // esta no container.
  const showRing = phase === 'zoom' || phase === 'click'

  return (
    <div
      className="fixed inset-0 z-[9999] bg-white overflow-hidden"
      style={{
        opacity: phase === 'reveal' ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
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

      {/* Container do logo posicionado no centro da tela */}
      <div
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          ...logoStyle,
          transition:
            'transform 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-out, filter 0.4s ease-out',
        }}
      >
        <div className="relative">
          <img
            src="/logo-trimark.png"
            alt="Trimark"
            className="block w-auto select-none"
            style={{ height: '120px' }}
            draggable={false}
          />

          {/* Anel pulsante em cima do play */}
          {showRing && (
            <span
              className="absolute pointer-events-none"
              style={{
                top: `${PLAY_Y}%`,
                left: `${PLAY_X}%`,
                width: 14,
                height: 14,
                border: '1.5px solid #1F4E79',
                borderRadius: '9999px',
                transform: 'translate(-50%, -50%)',
                animation: 'intro-ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite',
              }}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes intro-ping {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
