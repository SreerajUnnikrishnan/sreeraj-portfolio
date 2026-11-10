import { useRef } from 'react'
import type { CSSProperties, ElementType, PointerEvent as RPointerEvent, ReactNode } from 'react'
import type { Accent } from '../data/portfolioData'

interface Props {
  as?: ElementType
  accent?: Accent
  className?: string
  children: ReactNode
  style?: CSSProperties
  [key: string]: unknown
}

/** Glass surface with a mouse-tracking radial spotlight (updates CSS vars only, no re-render). */
export default function SpotlightCard({ as: Tag = 'div', accent = 'cyan', className = '', children, style, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null)

  const onMove = (e: RPointerEvent<HTMLElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <Tag ref={ref} onPointerMove={onMove} className={`glass spotlight accent-${accent} ${className}`} style={style} {...rest}>
      {children}
    </Tag>
  )
}

