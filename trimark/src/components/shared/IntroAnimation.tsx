import { useEffect, useRef, useState } from 'react'

interface IntroAnimationProps {
  onComplete: () => void
}

type Phase = 'fade-in' | 'idle' | 'zoom' | 'click' | 'rush' | 'reveal' | 'done'

/**
 * Intro cinematografica do site Trimark.
 *
 * Conceito (pedido do produto):
 *   - O LOGO "trimark" fica visivel e estavel durante toda a intro
 *     (so se move/escala junto com o container no zoom)
 *   - SO O SIMBOLO DE PLAY se move e cresce ate cobrir a tela inteira
 *   - Quando o play preenche a tela, ele "abre" no centro dele,
 *     revelando o site
 *
 * Sequencia:
 *   0.0s - 0.3s   logo + play aparecem em fade-in
 *   0.3s - 1.0s   idle (pausa pra ler "trimark")
 *   1.0s - 2.0s   ZOOM forte focando o play (todo o container escala 5.5x
 *                 com transform-origin no play; "trimark" continua visivel
 *                 mas esticado pra fora)
 *   2.0s - 2.3s   anel pulsante em volta do play
 *   2.3s - 2.4s   CLIQUE: play e pressionado (scale-down 0.92, escurece)
 *   2.4s         som de obturador de camera (Web Audio)
 *   2.4s - 3.4s   RUSH: SO O PLAY cresce em direcao ao usuario (scale 50x).
 *                 Domina a tela inteira de azul-marinho. Logo permanece atras.
 *   3.4s - 3.8s   "ABERTURA": fundo da intro fade out → site aparece atras
 */

// Posicao do play dentro do container quadrado do logo (% do container)
const PLAY_X = 30
const PLAY_Y = 40
// Tamanho do play SVG no container (% — bate com o tamanho real do play no PNG)
const PLAY_SIZE = 17

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState<Phase>('fade-in')
  const audioPlayedRef = useRef(false)
  // AudioContext criado uma unica vez. Tenta destravar em qualquer interacao
  // do usuario (autoplay policy dos browsers).
  const audioCtxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setPhase('done')
      onComplete()
      return
    }

    // Cria AudioContext logo no mount (se possivel; vai nascer suspended
    // no primeiro acesso por causa da autoplay policy).
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      audioCtxRef.current = new AudioCtx()
    } catch {
      /* ignore */
    }

    // Listener pra destravar audio em qualquer gesto do usuario antes
    // do click da intro. Mouse mover, click, touch, tecla — qualquer um serve.
    const unlock = () => {
      const ctx = audioCtxRef.current
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }
    }
    const events = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'click']
    events.forEach((ev) =>
      document.addEventListener(ev, unlock, { once: true, passive: true }),
    )

    const timers = [
      setTimeout(() => setPhase('idle'), 100),
      setTimeout(() => setPhase('zoom'), 1000),
      setTimeout(() => setPhase('click'), 2300),
      setTimeout(() => playCameraSound(), 2360),
      setTimeout(() => setPhase('rush'), 2450),
      setTimeout(() => setPhase('reveal'), 3400),
      setTimeout(() => {
        setPhase('done')
        onComplete()
      }, 3800),
    ]
    return () => {
      timers.forEach(clearTimeout)
      events.forEach((ev) => document.removeEventListener(ev, unlock))
    }
  }, [onComplete])

  async function playCameraSound() {
    if (audioPlayedRef.current) return
    audioPlayedRef.current = true
    try {
      const ctx = audioCtxRef.current
      if (!ctx) return
      // Tenta destravar (vai falhar silenciosamente se nao houve gesto)
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume()
        } catch {
          /* autoplay policy bloqueou — som nao vai tocar nesta visita */
          return
        }
      }
      const now = ctx.currentTime
      // Volume bem mais alto pra garantir audibilidade (era 0.4/0.45)
      makeClick(ctx, now, 2200, 0.05, 0.85)
      makeClick(ctx, now + 0.09, 1400, 0.07, 0.95)
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

  // Container do logo (escala junto durante zoom; nao move durante rush)
  const containerStyle = (() => {
    const origin = `${PLAY_X}% ${PLAY_Y}%`
    switch (phase) {
      case 'fade-in':
        return {
          transform: 'translate(-50%, -50%) scale(0.85)',
          opacity: 0,
          transformOrigin: 'center center',
        }
      case 'idle':
        return {
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: 1,
          transformOrigin: 'center center',
        }
      case 'zoom':
      case 'click':
      case 'rush':
      case 'reveal':
        // Mantem o container escalado 5.5x com origin no play durante o resto
        return {
          transform: 'translate(-50%, -50%) scale(5.5)',
          opacity: 1,
          transformOrigin: origin,
        }
      default:
        return {
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: 1,
          transformOrigin: 'center center',
        }
    }
  })()

  // Play SVG: efeito proprio em CIMA do efeito do container
  // (so o play continua a animacao no rush)
  const playMarkStyle = (() => {
    switch (phase) {
      case 'click':
        return {
          transform: 'translate(-50%, -50%) scale(0.92)',
          filter: 'brightness(0.85)',
        }
      case 'rush':
        // Play cresce ENORME (cobre toda a tela) com glow
        return {
          transform: 'translate(-50%, -50%) scale(50)',
          filter:
            'drop-shadow(0 0 100px rgba(31, 78, 121, 0.6)) drop-shadow(0 0 40px rgba(31, 78, 121, 0.4))',
        }
      case 'reveal':
        // Mantem o play preenchendo a tela; o BG da intro vai dar fade out
        return {
          transform: 'translate(-50%, -50%) scale(60)',
          filter: 'none',
        }
      default:
        return {
          transform: 'translate(-50%, -50%) scale(1)',
          filter: 'none',
        }
    }
  })()

  const showRing = phase === 'zoom' || phase === 'click'

  return (
    <div
      className="fixed inset-0 z-[9999] bg-white overflow-hidden"
      style={{
        opacity: phase === 'reveal' ? 0 : 1,
        transition: 'opacity 0.45s ease-out',
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

      {/* Container do logo, posicionado no centro da tela */}
      <div
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          ...containerStyle,
          transition:
            'transform 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-out',
        }}
      >
        {/* Container quadrado pra logo + play (PNG e 1:1) */}
        <div
          className="relative"
          style={{ width: '160px', height: '160px' }}
        >
          {/* LAYER 1 — Logo PNG. Visivel a intro toda. */}
          <img
            src="/logo-trimark.png"
            alt="Trimark"
            className="absolute inset-0 w-full h-full select-none"
            draggable={false}
            style={{
              objectFit: 'contain',
            }}
          />

          {/* LAYER 2 — Play SVG sobreposto exatamente sobre o play do PNG.
              Tem transform proprio que escalona MUITO durante o rush. */}
          <div
            className="absolute"
            style={{
              top: `${PLAY_Y}%`,
              left: `${PLAY_X}%`,
              width: `${PLAY_SIZE}%`,
              aspectRatio: '1 / 1',
              ...playMarkStyle,
              transition:
                'transform 0.95s cubic-bezier(0.5, 0, 0.4, 1), filter 0.4s ease-out, opacity 0.4s ease-out',
            }}
          >
            <PlayMark />
          </div>

          {/* LAYER 3 — Anel pulsante em volta do play */}
          {showRing && (
            <div
              className="absolute pointer-events-none"
              style={{
                top: `${PLAY_Y}%`,
                left: `${PLAY_X}%`,
                width: `${PLAY_SIZE}%`,
                aspectRatio: '1 / 1',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span
                className="block w-full h-full rounded-full"
                style={{
                  border: '1.5px solid #1F4E79',
                  animation:
                    'intro-ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite',
                }}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes intro-ping {
          0% { transform: scale(1); opacity: 0.85; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

/**
 * Botao de play visualmente identico ao do logo Trimark:
 * circulo navy preenchido + triangulo branco apontando pra direita.
 */
function PlayMark() {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full block"
      preserveAspectRatio="xMidYMid meet"
    >
      <circle cx="50" cy="50" r="48" fill="#1B2D5C" />
      <path d="M 40 30 L 40 70 L 72 50 Z" fill="#FFFFFF" />
    </svg>
  )
}
