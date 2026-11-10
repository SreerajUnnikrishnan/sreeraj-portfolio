import { useEffect, useRef } from 'react'
import { projects, MATURITY_LABEL } from '../data/portfolioData'
import type { Maturity } from '../data/portfolioData'
import { sceneState } from '../lib/sceneState'

const cortex = projects.find((p) => p.id === 'jeztbrain-cortex')!
const CAPS = cortex.capabilities ?? []
const COLOR: Record<Maturity, string> = { implemented: '#10B981', rd: '#38BDF8', vision: '#8B5CF6' }

const LABEL_W = 214
const LABEL_H = 44
const GAP_X = 14

/** Spread a row of labels left → right so none overlap, then keep the row inside [minX, maxX]. */
function placeRow(order: number[], desired: number[], minX: number, maxX: number): number[] {
  const xs = order.map((i) => desired[i])
  for (let k = 0; k < xs.length; k++) {
    xs[k] = Math.max(xs[k], k === 0 ? minX : xs[k - 1] + LABEL_W + GAP_X)
  }
  const over = xs.length ? xs[xs.length - 1] - maxX : 0
  if (over > 0) for (let k = 0; k < xs.length; k++) xs[k] -= over
  for (let k = 0; k < xs.length; k++) xs[k] = Math.max(xs[k], k === 0 ? minX : xs[k - 1] + LABEL_W + GAP_X)
  return xs
}

/**
 * CORTEX telemetry callouts: crisp leader lines from the five glowing hardware anchors on the 3D processor
 * to HTML labels. Positions are read from `sceneState` (written by the WebGL scene) and applied directly to
 * the DOM every frame, so React never re-renders.
 */
export default function ChipCallouts() {
  const root = useRef<HTMLDivElement>(null)
  const labels = useRef<(HTMLDivElement | null)[]>([])
  const lines = useRef<(SVGPolylineElement | null)[]>([])
  const dots = useRef<(SVGGElement | null)[]>([])

  useEffect(() => {
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const el = root.current
      if (!el) return
      const t = sceneState.calloutT
      if (t < 0.01) {
        if (el.style.opacity !== '0') el.style.opacity = '0'
        return
      }
      el.style.opacity = String(t)

      const vw = window.innerWidth
      const vh = window.innerHeight
      const A = sceneState.anchors
      const byY = [0, 1, 2, 3, 4].sort((i, j) => A[i].y - A[j].y)
      const top = byY.slice(0, 2).sort((i, j) => A[i].x - A[j].x)
      const bottom = byY.slice(2).sort((i, j) => A[i].x - A[j].x)

      const minX = Math.max(vw * 0.46, 24)
      const maxX = vw - LABEL_W - 20
      const desired = A.map((a) => a.x - 28)
      const topXs = placeRow(top, desired, minX, maxX)
      const botXs = placeRow(bottom, desired, minX, maxX)
      const topY = Math.max(92, Math.min(...top.map((i) => A[i].y)) - 96)
      const botY = Math.min(vh - LABEL_H - 24, Math.max(...bottom.map((i) => A[i].y)) + 64)

      const place = (i: number, x: number, y: number, isTop: boolean) => {
        const lab = labels.current[i]
        const line = lines.current[i]
        const dot = dots.current[i]
        if (!lab || !line || !dot) return
        const a = A[i]
        lab.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
        const ax = isTop ? x + 16 : x + 16
        const ay = isTop ? y + LABEL_H : y
        const midY = isTop ? ay + 22 : ay - 22
        line.setAttribute('points', `${ax.toFixed(1)},${ay.toFixed(1)} ${ax.toFixed(1)},${midY.toFixed(1)} ${a.x.toFixed(1)},${a.y.toFixed(1)}`)
        dot.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)})`)
        const show = a.visible ? '1' : '0'
        lab.style.opacity = show
        line.style.opacity = show
        dot.style.opacity = show
      }
      top.forEach((i, k) => place(i, topXs[k], topY, true))
      bottom.forEach((i, k) => place(i, botXs[k], botY, false))
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="chip-callouts" ref={root} aria-hidden="true">
      <svg className="chip-callouts-lines" width="100%" height="100%">
        {CAPS.map((c, i) => (
          <g key={c.label}>
            <polyline
              ref={(el) => {
                lines.current[i] = el
              }}
              fill="none"
              stroke={COLOR[c.maturity]}
              strokeWidth={1.25}
              strokeOpacity={0.85}
              strokeDasharray={c.maturity === 'vision' ? '4 4' : undefined}
            />
            <g
              ref={(el) => {
                dots.current[i] = el
              }}
            >
              <circle className="chip-ring" r={9} fill="none" stroke={COLOR[c.maturity]} strokeWidth={1.2} />
              <circle r={3.6} fill={COLOR[c.maturity]} />
            </g>
          </g>
        ))}
      </svg>
      {CAPS.map((c, i) => (
        <div
          key={c.label}
          className="chip-callout"
          style={{ ['--c' as string]: COLOR[c.maturity] }}
          ref={(el) => {
            labels.current[i] = el
          }}
        >
          <strong className="mono">{c.label}</strong>
          <span className="mono">{MATURITY_LABEL[c.maturity].toUpperCase()}</span>
        </div>
      ))}
    </div>
  )
}

