import * as THREE from 'three'

/* ==========================================================================
   Procedural hardware textures for the "Silicon to Soul" microprocessor.
   Every surface gets a colour map, an emissive map (the glowing traces) and a
   bump map generated from the same trace layout so the three always agree.
   ========================================================================== */

export function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
type Rand = () => number

type Kind = 'amber' | 'cyan' | 'gray'
type Mode = 'map' | 'emi' | 'bump'
type Pt = [number, number]
interface Rect {
  x0: number
  y0: number
  x1: number
  y1: number
}
interface Trace {
  pts: Pt[]
  w: number
  kind: Kind
  dash?: boolean
}
interface Pad {
  x: number
  y: number
  r: number
  kind: Kind
  ring?: boolean
  a?: number
}
interface Layout {
  w: number
  h: number
  traces: Trace[]
  pads: Pad[]
  baseMap: string
}

export interface SurfaceMaps {
  map: THREE.CanvasTexture
  emissive: THREE.CanvasTexture
  bump: THREE.CanvasTexture
}

const KIND_COLOR: Record<Mode, Record<Kind, string | null>> = {
  map: { amber: '#4d3a14', cyan: '#12476a', gray: '#172033' },
  emi: { amber: '#FF9900', cyan: '#00F0FF', gray: null },
  bump: { amber: '#ffffff', cyan: '#ffffff', gray: '#8a8a8a' },
}

function render(layout: Layout, mode: Mode, px: number): HTMLCanvasElement {
  const s = px / layout.w
  const c = document.createElement('canvas')
  c.width = Math.round(layout.w * s)
  c.height = Math.round(layout.h * s)
  const ctx = c.getContext('2d')!
  ctx.fillStyle = mode === 'map' ? layout.baseMap : mode === 'emi' ? '#000000' : '#202020'
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const colors = KIND_COLOR[mode]

  for (const t of layout.traces) {
    const col = colors[t.kind]
    if (!col || t.pts.length < 2) continue
    ctx.strokeStyle = col
    ctx.lineWidth = Math.max(1, t.w * s)
    ctx.shadowColor = col
    ctx.shadowBlur = mode === 'emi' ? 3.2 * s : 0
    ctx.setLineDash(t.dash ? [10 * s, 8 * s] : [])
    ctx.beginPath()
    ctx.moveTo(t.pts[0][0] * s, t.pts[0][1] * s)
    for (let i = 1; i < t.pts.length; i++) ctx.lineTo(t.pts[i][0] * s, t.pts[i][1] * s)
    ctx.stroke()
  }
  ctx.setLineDash([])

  for (const p of layout.pads) {
    const col = colors[p.kind]
    if (!col) continue
    ctx.globalAlpha = p.a ?? 1
    ctx.fillStyle = col
    ctx.strokeStyle = col
    ctx.shadowColor = col
    ctx.shadowBlur = mode === 'emi' ? 5 * s : 0
    ctx.beginPath()
    ctx.arc(p.x * s, p.y * s, p.r * s, 0, Math.PI * 2)
    if (p.ring) {
      ctx.lineWidth = Math.max(1, p.r * 0.38 * s)
      ctx.stroke()
    } else {
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1
  ctx.shadowBlur = 0

  if (mode === 'emi') {
    // Dark margin so the glow never bleeds onto the thin side faces of the slabs.
    const m = Math.ceil(10 * s)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, c.width, m)
    ctx.fillRect(0, c.height - m, c.width, m)
    ctx.fillRect(0, 0, m, c.height)
    ctx.fillRect(c.width - m, 0, m, c.height)
  }
  return c
}

function toTexture(c: HTMLCanvasElement, srgb: boolean, aniso: number) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  t.anisotropy = aniso
  return t
}

function surface(layout: Layout, px: number, aniso: number): SurfaceMaps {
  return {
    map: toTexture(render(layout, 'map', px), true, aniso),
    emissive: toTexture(render(layout, 'emi', px), true, aniso),
    bump: toTexture(render(layout, 'bump', px), false, aniso),
  }
}

/* ---------- bundle router: parallel trace groups leaving a rectangle with 45° bends ---------- */

interface BundleOpts {
  gap: number
  lw: number
  kind: Kind
  perSide: [number, number]
  lines: [number, number]
  spacing: number
  padR: number
  len: [number, number]
}

function addBundles(rand: Rand, L: Layout, r: Rect, o: BundleOpts, bounds: Rect) {
  const ri = (range: [number, number]) => Math.floor(range[0] + rand() * (range[1] - range[0] + 1))
  const sides = [
    { o: [0, -1], l: [1, 0], a: [r.x0, r.y0], len: r.x1 - r.x0 },
    { o: [0, 1], l: [1, 0], a: [r.x0, r.y1], len: r.x1 - r.x0 },
    { o: [-1, 0], l: [0, 1], a: [r.x0, r.y0], len: r.y1 - r.y0 },
    { o: [1, 0], l: [0, 1], a: [r.x1, r.y0], len: r.y1 - r.y0 },
  ]
  const clamp = (p: Pt): Pt => [
    Math.min(bounds.x1 - 14, Math.max(bounds.x0 + 14, p[0])),
    Math.min(bounds.y1 - 14, Math.max(bounds.y0 + 14, p[1])),
  ]
  for (const s of sides) {
    const count = ri(o.perSide)
    const used: [number, number][] = []
    for (let b = 0; b < count; b++) {
      const n = ri(o.lines)
      const width = n * o.spacing
      let t = -1
      for (let tries = 0; tries < 24; tries++) {
        const cand = 30 + rand() * Math.max(1, s.len - width - 60)
        if (used.every(([u0, u1]) => cand > u1 + 26 || cand + width < u0 - 26)) {
          t = cand
          break
        }
      }
      if (t < 0) continue
      used.push([t, t + width])
      const turn = rand() < 0.5 ? -1 : 1
      const L1 = o.len[0] + rand() * (o.len[1] - o.len[0])
      const L2 = 50 + rand() * 140
      const L3 = 40 + rand() * 260
      for (let j = 0; j < n; j++) {
        const lat = t + j * o.spacing
        const sx = s.a[0] + s.l[0] * lat + s.o[0] * o.gap
        const sy = s.a[1] + s.l[1] * lat + s.o[1] * o.gap
        const nest = (turn > 0 ? n - 1 - j : j) * o.spacing * 0.414
        const l1 = L1 + nest
        const p1: Pt = [sx + s.o[0] * l1, sy + s.o[1] * l1]
        const d = L2 / Math.SQRT2
        const p2: Pt = [p1[0] + (s.o[0] + s.l[0] * turn) * d, p1[1] + (s.o[1] + s.l[1] * turn) * d]
        const p3: Pt = [p2[0] + s.o[0] * L3, p2[1] + s.o[1] * L3]
        const pts: Pt[] = [clamp([sx, sy]), clamp(p1), clamp(p2), clamp(p3)]
        L.traces.push({ pts, w: o.lw, kind: o.kind })
        if (o.padR > 0 && rand() < 0.8) L.pads.push({ x: pts[3][0], y: pts[3][1], r: o.padR, kind: o.kind, ring: true })
      }
    }
  }
}

function outline(r: Rect, expand: number): Pt[] {
  return [
    [r.x0 - expand, r.y0 - expand],
    [r.x1 + expand, r.y0 - expand],
    [r.x1 + expand, r.y1 + expand],
    [r.x0 - expand, r.y1 + expand],
    [r.x0 - expand, r.y0 - expand],
  ]
}

/* ---------- layouts ---------- */

/** Base motherboard: warm amber power routing radiating outward from the socket. Board = 7.6 × 5.4 units. */
function pcbLayout(): Layout {
  const W = 2048
  const H = 1455
  const rand = mulberry32(77)
  const L: Layout = { w: W, h: H, traces: [], pads: [], baseMap: '#070b14' }
  const u = W / 7.6
  const cx = W / 2
  const cy = H / 2
  const pkg: Rect = { x0: cx - 2.45 * u, x1: cx + 2.45 * u, y0: cy - 1.85 * u, y1: cy + 1.85 * u }
  const inPkg = (x: number, y: number, m = 30) => x > pkg.x0 - m && x < pkg.x1 + m && y > pkg.y0 - m && y < pkg.y1 + m

  // Quiet dark-grey routing and vias fill the rest of the board.
  for (let i = 0; i < 340; i++) {
    let x = 30 + rand() * (W - 60)
    let y = 30 + rand() * (H - 60)
    if (inPkg(x, y, 60)) continue
    const pts: Pt[] = [[x, y]]
    let dir = Math.floor(rand() * 4)
    const segs = 2 + Math.floor(rand() * 3)
    for (let s = 0; s < segs; s++) {
      const len = 40 + rand() * 160
      const ang = (dir * Math.PI) / 2 + (rand() < 0.3 ? Math.PI / 4 : 0)
      x += Math.cos(ang) * len
      y += Math.sin(ang) * len
      if (x < 12 || x > W - 12 || y < 12 || y > H - 12 || inPkg(x, y, 40)) break
      pts.push([x, y])
      dir = (dir + (rand() < 0.5 ? 1 : 3)) % 4
    }
    if (pts.length > 1) L.traces.push({ pts, w: 3 + rand() * 2, kind: 'gray' })
  }
  for (let i = 0; i < 480; i++) {
    const x = 20 + rand() * (W - 40)
    const y = 20 + rand() * (H - 40)
    if (!inPkg(x, y, 40)) L.pads.push({ x, y, r: 3 + rand() * 3, kind: 'gray' })
  }

  // Socket outline, corner pads and the BGA landing grid.
  L.traces.push({ pts: outline(pkg, 24), w: 5, kind: 'amber' })
  for (const [px, py] of [
    [pkg.x0 - 24, pkg.y0 - 24],
    [pkg.x1 + 24, pkg.y0 - 24],
    [pkg.x0 - 24, pkg.y1 + 24],
    [pkg.x1 + 24, pkg.y1 + 24],
  ]) {
    L.pads.push({ x: px, y: py, r: 18, kind: 'amber', ring: true })
  }
  for (let x = pkg.x0 + 30; x < pkg.x1 - 20; x += 22) {
    for (let y = pkg.y0 + 30; y < pkg.y1 - 20; y += 22) L.pads.push({ x, y, r: 2.8, kind: 'amber', a: 0.7 })
  }

  addBundles(rand, L, pkg, { gap: 28, lw: 2.8, kind: 'amber', perSide: [4, 6], lines: [5, 8], spacing: 16, padR: 7, len: [55, 165] }, { x0: 0, y0: 0, x1: W, y1: H })
  return L
}

/** Electric-cyan neural routing plate that frames the core die. Plate = 2.7 × 3.0 units, die footprint 1.35 × 1.35. */
function interposerLayout(): Layout {
  const W = 1024
  const H = 1138
  const rand = mulberry32(311)
  const L: Layout = { w: W, h: H, traces: [], pads: [], baseMap: '#06101f' }
  const half = 256
  const die: Rect = { x0: W / 2 - half, x1: W / 2 + half, y0: H / 2 - half, y1: H / 2 + half }
  const rings: [number, number, boolean][] = [
    [26, 4, false],
    [58, 2.5, false],
    [96, 2.5, true],
    [140, 2, false],
  ]
  for (const [e, w, dash] of rings) L.traces.push({ pts: outline(die, e), w, kind: 'cyan', dash })

  addBundles(rand, L, die, { gap: 22, lw: 2.0, kind: 'cyan', perSide: [3, 5], lines: [5, 8], spacing: 15, padR: 3.5, len: [32, 92] }, { x0: 30, y0: 30, x1: W - 30, y1: H - 30 })

  // Sparse neural micro-dots.
  for (let i = 0; i < 260; i++) {
    const x = 40 + rand() * (W - 80)
    const y = 40 + rand() * (H - 80)
    if (x > die.x0 - 20 && x < die.x1 + 20 && y > die.y0 - 20 && y < die.y1 + 20) continue
    L.pads.push({ x, y, r: 2 + rand() * 2, kind: 'cyan', a: 0.8 })
  }
  // Gold contact edge and corner studs.
  for (let x = 44; x < W - 40; x += 24) {
    L.pads.push({ x, y: 30, r: 4, kind: 'amber' })
    L.pads.push({ x, y: H - 30, r: 4, kind: 'amber' })
  }
  for (let y = 44; y < H - 40; y += 24) {
    L.pads.push({ x: 30, y, r: 4, kind: 'amber' })
    L.pads.push({ x: W - 30, y, r: 4, kind: 'amber' })
  }
  return L
}

/** Blue-metal package frame with cyan / amber inlay lines. Frame = 4.9 × 3.7 units. */
function frameLayout(): Layout {
  const W = 1024
  const H = 773
  const L: Layout = { w: W, h: H, traces: [], pads: [], baseMap: '#082244' }
  L.traces.push({ pts: outline({ x0: 30, y0: 30, x1: W - 30, y1: H - 30 }, 0), w: 4, kind: 'cyan' })
  L.traces.push({ pts: outline({ x0: 50, y0: 50, x1: W - 50, y1: H - 50 }, 0), w: 2, kind: 'amber' })
  L.traces.push({ pts: outline({ x0: 70, y0: 70, x1: W - 70, y1: H - 70 }, 0), w: 2, kind: 'cyan', dash: true })
  for (let x = 90; x < W - 80; x += 36) {
    L.pads.push({ x, y: 40, r: 2.5, kind: 'amber' })
    L.pads.push({ x, y: H - 40, r: 2.5, kind: 'amber' })
  }
  return L
}

/* ---------- public builders ---------- */

export function makePcbMaps(px: number, aniso: number) {
  return surface(pcbLayout(), px, aniso)
}
export function makeInterposerMaps(px: number, aniso: number) {
  return surface(interposerLayout(), px, aniso)
}
export function makeFrameMaps(px: number, aniso: number) {
  return surface(frameLayout(), px, aniso)
}

/** Grooved matte-black silicon: horizontal ribs (HBM stack) or vertical ribs with a diagonal dot staircase (logic fabric). */
export function makeRibMaps(opts: { vertical: boolean; dots: boolean }, aniso: number): SurfaceMaps {
  const S = 512
  const mk = (bg: string) => {
    const c = document.createElement('canvas')
    c.width = c.height = S
    const x = c.getContext('2d')!
    x.fillStyle = bg
    x.fillRect(0, 0, S, S)
    return { c, x }
  }
  const m = mk('#05070c')
  const b = mk('#1e1e1e')
  const e = mk('#000000')
  for (let i = 0; i < S; i += 8) {
    m.x.fillStyle = '#10161f'
    b.x.fillStyle = '#ffffff'
    if (opts.vertical) {
      m.x.fillRect(i, 0, 3, S)
      b.x.fillRect(i, 0, 4, S)
    } else {
      m.x.fillRect(0, i, S, 3)
      b.x.fillRect(0, i, S, 4)
    }
  }
  if (opts.dots) {
    e.x.fillStyle = '#ffd9a3'
    e.x.shadowColor = '#ffb347'
    e.x.shadowBlur = 6
    for (let k = 0; k < 24; k++) {
      const x = 40 + k * 19
      const y = 36 + k * 18
      for (const [dx, dy] of [
        [0, 0],
        [26, -14],
        [-26, 14],
      ]) {
        e.x.beginPath()
        e.x.arc(x + dx, y + dy, 2.6, 0, Math.PI * 2)
        e.x.fill()
      }
    }
  }
  return {
    map: toTexture(m.c, true, aniso),
    emissive: toTexture(e.c, true, aniso),
    bump: toTexture(b.c, false, aniso),
  }
}

/* ---------- central die: brain emblem + laser-etched type ---------- */

function drawBrain(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number) {
  const rand = mulberry32(909)
  const nodes: Pt[] = []
  let guard = 0
  while (nodes.length < 62 && guard++ < 4000) {
    const x = (rand() * 2 - 1) * 1.05
    const y = (rand() * 2 - 1) * 0.8
    const lobe = (Math.abs(x) - 0.5) ** 2 / 0.56 ** 2 + y ** 2 / 0.78 ** 2
    if (lobe > 1) continue
    if (Math.abs(x) < 0.06) continue
    if (y < -0.5 && Math.abs(x) < 0.22) continue
    if (nodes.every(([nx, ny]) => Math.hypot(nx - x, ny - y) > 0.17)) nodes.push([x, y])
  }
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(R, R)
  ctx.strokeStyle = '#38D8FF'
  ctx.shadowColor = '#00F0FF'
  ctx.shadowBlur = 18
  // Two cortical lobes.
  ctx.lineWidth = 0.035
  for (const sx of [-1, 1]) {
    ctx.beginPath()
    ctx.ellipse(sx * 0.5, 0, 0.56, 0.78, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  // Synaptic links.
  ctx.lineWidth = 0.016
  ctx.globalAlpha = 0.9
  for (let i = 0; i < nodes.length; i++) {
    const near = nodes
      .map((n, j) => ({ j, d: Math.hypot(n[0] - nodes[i][0], n[1] - nodes[i][1]) }))
      .filter((o) => o.j !== i && o.d < 0.46)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
    for (const { j } of near) {
      ctx.beginPath()
      ctx.moveTo(nodes[i][0], nodes[i][1])
      ctx.lineTo(nodes[j][0], nodes[j][1])
      ctx.stroke()
    }
  }
  ctx.globalAlpha = 1
  ctx.fillStyle = '#C8F6FF'
  for (const [x, y] of nodes) {
    ctx.beginPath()
    ctx.arc(x, y, 0.034, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

export interface DieMaps {
  map: THREE.CanvasTexture
  emissive: THREE.CanvasTexture
  /** Re-renders the typography once the web font is available. */
  redraw: () => void
}

export function makeDieMaps(size: number, aniso: number): DieMaps {
  const S = size
  const base = document.createElement('canvas')
  const emi = document.createElement('canvas')
  base.width = base.height = emi.width = emi.height = S
  const k = S / 1024

  const draw = () => {
    const b = base.getContext('2d')!
    const e = emi.getContext('2d')!
    const g = b.createRadialGradient(S / 2, S / 2, 40 * k, S / 2, S / 2, S * 0.72)
    g.addColorStop(0, '#0b1a3a')
    g.addColorStop(1, '#030612')
    b.fillStyle = g
    b.fillRect(0, 0, S, S)
    b.strokeStyle = 'rgba(56,189,248,0.22)'
    b.lineWidth = 2 * k
    for (const i of [40, 90, 200]) b.strokeRect(i * k, i * k, S - 2 * i * k, S - 2 * i * k)

    e.fillStyle = '#000'
    e.fillRect(0, 0, S, S)
    e.lineCap = 'round'
    e.shadowColor = '#00F0FF'
    e.shadowBlur = 8 * k
    e.strokeStyle = '#00D8F0'
    e.lineWidth = 4 * k
    e.strokeRect(36 * k, 36 * k, S - 72 * k, S - 72 * k)
    e.lineWidth = 2.5 * k
    e.strokeRect(86 * k, 86 * k, S - 172 * k, S - 172 * k)
    e.lineWidth = 3 * k
    e.strokeRect(196 * k, 196 * k, S - 392 * k, S - 392 * k)

    // Etched micro-traces in the border ring.
    const rand = mulberry32(55)
    e.lineWidth = 2 * k
    for (let i = 0; i < 90; i++) {
      const side = i % 4
      const t = (60 + rand() * 904) * k
      const len = (20 + rand() * 50) * k
      const d = (100 + rand() * 80) * k
      e.beginPath()
      if (side === 0) {
        e.moveTo(t, d)
        e.lineTo(t, d + len)
      } else if (side === 1) {
        e.moveTo(t, S - d)
        e.lineTo(t, S - d - len)
      } else if (side === 2) {
        e.moveTo(d, t)
        e.lineTo(d + len, t)
      } else {
        e.moveTo(S - d, t)
        e.lineTo(S - d - len, t)
      }
      e.stroke()
    }
    // Gold bond pads around the die edge.
    e.fillStyle = '#FFAA22'
    e.shadowColor = '#FF9900'
    for (let p = 70; p < 960; p += 30) {
      for (const [x, y] of [
        [p, 62],
        [p, 962],
        [62, p],
        [962, p],
      ]) {
        e.beginPath()
        e.arc(x * k, y * k, 4 * k, 0, Math.PI * 2)
        e.fill()
      }
    }

    drawBrain(e, S / 2, 392 * k, 168 * k)

    e.textAlign = 'center'
    e.textBaseline = 'middle'
    const grad = e.createLinearGradient(0, 600 * k, 0, 720 * k)
    grad.addColorStop(0, '#FFFFFF')
    grad.addColorStop(1, '#9FE8FF')
    e.fillStyle = grad
    e.shadowColor = '#38BDF8'
    e.shadowBlur = 22 * k
    e.font = `700 ${Math.round(122 * k)}px "Inter Variable", Inter, system-ui, sans-serif`
    e.fillText('JeztBrain', S / 2, 668 * k)
    e.font = `600 ${Math.round(46 * k)}px "JetBrains Mono Variable", ui-monospace, monospace`
    ;(e as unknown as { letterSpacing: string }).letterSpacing = `${Math.round(14 * k)}px`
    e.fillStyle = '#5FD8FF'
    e.shadowBlur = 14 * k
    e.fillText('CORTEX', S / 2 + 7 * k, 770 * k)
    ;(e as unknown as { letterSpacing: string }).letterSpacing = '0px'
  }

  draw()
  const map = toTexture(base, true, aniso)
  const emissive = toTexture(emi, true, aniso)
  const redraw = () => {
    draw()
    map.needsUpdate = true
    emissive.needsUpdate = true
  }
  if (typeof document !== 'undefined' && document.fonts) {
    Promise.all([document.fonts.load('700 100px "Inter Variable"'), document.fonts.load('600 40px "JetBrains Mono Variable"')])
      .then(redraw)
      .catch(() => undefined)
  }
  return { map, emissive, redraw }
}

/** Soft radial sprite used for the volumetric glow above the die. */
export function makeGlowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const x = c.getContext('2d')!
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.35)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 256, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

