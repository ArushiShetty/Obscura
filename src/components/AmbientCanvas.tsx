import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  baseAlpha: number
}

export function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000, speed: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mouseRef.current.targetX
      const dy = e.clientY - mouseRef.current.targetY
      mouseRef.current.speed = Math.min(Math.sqrt(dx * dx + dy * dy), 40)
      mouseRef.current.targetX = e.clientX
      mouseRef.current.targetY = e.clientY
    }

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -1000
      mouseRef.current.targetY = -1000
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    // Generate floating wind mist/spore particles
    const particleCount = Math.min(Math.floor(width / 25), 55)
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0.2 + Math.random() * 0.4, // gentle drifting wind
        vy: (Math.random() - 0.5) * 0.25,
        radius: 1 + Math.random() * 2,
        alpha: 0.15 + Math.random() * 0.35,
        baseAlpha: 0.15 + Math.random() * 0.35,
      })
    }

    let time = 0

    const render = () => {
      time += 0.012

      // Ease current mouse toward target for fluid organic momentum
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08
      mouseRef.current.speed *= 0.95

      ctx.clearRect(0, 0, width, height)

      // 1. Interactive Soft Lantern Cursor Aura
      if (mouseRef.current.x > 0 && mouseRef.current.y > 0) {
        const auraRadius = 240 + mouseRef.current.speed * 2
        const auraGradient = ctx.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          auraRadius,
        )
        auraGradient.addColorStop(0, 'rgba(139, 154, 106, 0.09)') // subtle moss glow
        auraGradient.addColorStop(0.5, 'rgba(110, 125, 78, 0.03)')
        auraGradient.addColorStop(1, 'rgba(14, 15, 12, 0)')

        ctx.fillStyle = auraGradient
        ctx.beginPath()
        ctx.arc(mouseRef.current.x, mouseRef.current.y, auraRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      // 2. Multi-Layer Fluid Sea / Wind Waves
      const waveLayers = [
        {
          baseY: height * 0.78,
          amplitude: 28,
          frequency: 0.0035,
          speed: 0.6,
          color: 'rgba(110, 125, 78, 0.05)', // deepest olive wave
          mouseInfluence: 0.45,
        },
        {
          baseY: height * 0.86,
          amplitude: 36,
          frequency: 0.0042,
          speed: 0.85,
          color: 'rgba(139, 154, 106, 0.06)', // signature moss wave
          mouseInfluence: 0.7,
        },
        {
          baseY: height * 0.93,
          amplitude: 22,
          frequency: 0.005,
          speed: 1.1,
          color: 'rgba(243, 239, 228, 0.035)', // gentle cream sea spray
          mouseInfluence: 0.9,
        },
      ]

      waveLayers.forEach((layer, layerIdx) => {
        ctx.beginPath()
        ctx.moveTo(0, height)

        const step = 14
        for (let x = 0; x <= width + step; x += step) {
          // Base harmonic sine swell
          let y =
            layer.baseY +
            Math.sin(x * layer.frequency + time * layer.speed + layerIdx) * layer.amplitude +
            Math.cos(x * layer.frequency * 0.5 - time * 0.4) * (layer.amplitude * 0.4)

          // Fluid swell reaction to cursor
          if (mouseRef.current.x > 0) {
            const distToMouse = Math.abs(x - mouseRef.current.x)
            if (distToMouse < 260) {
              const rippleFactor = Math.cos((distToMouse / 260) * (Math.PI / 2))
              const mouseOffsetY = (mouseRef.current.y - layer.baseY) * 0.15
              y +=
                Math.sin(time * 3 + distToMouse * 0.04) *
                14 *
                rippleFactor *
                layer.mouseInfluence +
                mouseOffsetY * rippleFactor * 0.3
            }
          }

          if (x === 0) ctx.lineTo(x, y)
          else ctx.lineTo(x, y)
        }

        ctx.lineTo(width, height)
        ctx.closePath()
        ctx.fillStyle = layer.color
        ctx.fill()
      })

      // 3. Floating Wind Spores / Sea Mist Particles
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy + Math.sin(time * 1.5 + p.x * 0.005) * 0.3

        // Wind responsiveness to mouse motion
        if (mouseRef.current.x > 0) {
          const dx = p.x - mouseRef.current.x
          const dy = p.y - mouseRef.current.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 140) {
            const push = (140 - dist) / 140
            p.x += (dx / dist) * push * 3.5
            p.y += (dy / dist) * push * 3.5
            p.alpha = Math.min(p.baseAlpha * 2, 0.8) // lights up slightly near cursor
          } else {
            p.alpha += (p.baseAlpha - p.alpha) * 0.05
          }
        }

        // Wrap around borders seamlessly
        if (p.x > width + 10) p.x = -10
        if (p.x < -10) p.x = width + 10
        if (p.y > height + 10) p.y = -10
        if (p.y < -10) p.y = height + 10

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(184, 178, 164, ${p.alpha})` // warm stone particles
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{ opacity: 0.85 }}
    />
  )
}
