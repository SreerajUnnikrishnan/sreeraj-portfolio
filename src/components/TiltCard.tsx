import { useRef } from 'react'
import type { PointerEvent as RPointerEvent, ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useCoarsePointer, usePrefersReducedMotion } from '../hooks/useMedia'

interface Props {
  className?: string
  children: ReactNode
  max?: number
}

/**
 * Layered card with spring-physics 3D tilt (rotateX / rotateY).
 * Children may use `.z-1`, `.z-2`, `.z-3` utilities to float at different depths.
 * Tilt is disabled on touch devices and for reduced-motion users.
 */
export default function TiltCard({ className = '', children, max = 9 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const coarse = useCoarsePointer()
  const reduced = usePrefersReducedMotion()
  const disabled = coarse || reduced

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 20, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 220, damping: 20, mass: 0.6 })
  const rotateY = useTransform(sx, [-0.5, 0.5], [-max, max])
  const rotateX = useTransform(sy, [-0.5, 0.5], [max, -max])

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
    if (disabled) return
    x.set((e.clientX - r.left) / r.width - 0.5)
    y.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div className="tilt-perspective">
      <motion.div
        ref={ref}
        className={`tilt-card ${className}`}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={disabled ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </div>
  )
}

