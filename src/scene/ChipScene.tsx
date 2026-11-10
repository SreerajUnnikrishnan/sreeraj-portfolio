import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { sceneState } from '../lib/sceneState'
import {
  makeDieMaps,
  makeFrameMaps,
  makeGlowTexture,
  makeInterposerMaps,
  makePcbMaps,
  makeRibMaps,
  mulberry32,
} from './chipTextures'

/**
 * Builds a bevelled RoundedBoxGeometry whose top surface maps UVs strictly across [0, 1]
 * (matching our procedural canvas textures 1:1) while side bevels sample the clean dark margin.
 */
function slabGeo(w: number, h: number, d: number, radius: number, smoothness = 3): RoundedBoxGeometry {
  const geo = new RoundedBoxGeometry(w, h, d, smoothness, radius)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const norm = geo.attributes.normal as THREE.BufferAttribute
  const uv = geo.attributes.uv as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    if (norm.getY(i) > 0.35) {
      uv.setXY(i, pos.getX(i) / w + 0.5, 1 - (pos.getZ(i) / d + 0.5))
    } else {
      uv.setXY(i, 0.002, 0.002)
    }
  }
  uv.needsUpdate = true
  return geo
}

/* ==========================================================================
   "Silicon to Soul": procedural JeztBrain neural processor (SoC).
   Units are arbitrary scene units; the chip lies flat in X/Z with +Y up.
   ========================================================================== */

const BOARD = { w: 7.6, t: 0.12, d: 5.4 }
const PKG = { w: 4.9, d: 3.7 }
const PCB_TOP = BOARD.t / 2

const AMBER = '#FF9900'
const GOLD = '#D9A93A'

interface LayerCfg {
  off: [number, number, number]
  rot: [number, number, number]
  /** assemble window [start, end] within the 0 → 1 assembly progress (0 → 0.75 of #ecosystem scroll) */
  win: [number, number]
}

/** Scattered/deconstructed offsets (relative to assembled position) and lock-in window within #ecosystem Phase 1 → Phase 2. */
const LAYERS: Record<'pcb' | 'pins' | 'frame' | 'interposer' | 'chiplets' | 'die', LayerCfg> = {
  pcb: { off: [0.45, -1.1, 0.2], rot: [0.16, -0.2, 0.06], win: [0.0, 0.7] },
  pins: { off: [-0.25, -0.2, 0.45], rot: [-0.12, 0.22, -0.08], win: [0.06, 0.76] },
  frame: { off: [0.85, 0.65, -0.35], rot: [0.2, -0.26, 0.1], win: [0.1, 0.82] },
  interposer: { off: [-0.35, 1.35, 0.35], rot: [-0.18, 0.28, -0.12], win: [0.14, 0.88] },
  chiplets: { off: [1.3, 1.75, -0.55], rot: [0.24, -0.32, 0.14], win: [0.18, 0.92] },
  die: { off: [0.1, 2.5, 0.25], rot: [-0.26, -0.38, 0.14], win: [0.12, 0.96] },
}

/** Hardware anchors for the five CORTEX modules (assembled-state coordinates). */
const ANCHORS: THREE.Vector3[] = [
  new THREE.Vector3(-0.95, 0.28, -1.73), // OSINT & Reconnaissance → north edge pin header
  new THREE.Vector3(0.1, 0.3, -0.85), // Continuous Recon → interposer neural trace field
  new THREE.Vector3(1.35, 0.37, 0.42), // Workflow Automation → logic fabric chiplet
  new THREE.Vector3(1.41, 0.45, -0.98), // Vulnerability Discovery → HBM memory stack
  new THREE.Vector3(-0.95, 0.4, 0), // Security Intelligence → core die
]

const clamp01 = (t: number) => Math.min(1, Math.max(0, t))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const layerT = (asm: number, win: [number, number]) => ease(clamp01((asm - win[0]) / (win[1] - win[0])))

/* ---------- ignition: data pulses travelling through the emissive traces ---------- */

interface Shared {
  uTime: { value: number }
  uWave: { value: number }
}

function ignitable<T extends THREE.MeshStandardMaterial>(mat: T, shared: Shared): T {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = shared.uTime
    shader.uniforms.uWave = shared.uWave
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vChipPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvChipPos = position;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vChipPos;\nuniform float uTime;\nuniform float uWave;')
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float chipR = length(vChipPos.xz);
        float front = uWave * 6.5;
        float lit = 1.0 - smoothstep(front - 1.4, front, chipR);
        float ring = exp(-pow((chipR - front) / 0.45, 2.0)) * smoothstep(0.0, 0.05, uWave) * (1.0 - smoothstep(0.95, 1.0, uWave));
        float flow = 0.5 + 0.5 * sin(chipR * 3.4 - uTime * 3.2 + vChipPos.x * 1.7);
        float gain = mix(0.55, 0.98 + 0.75 * flow, lit) + ring * 2.2;
        totalEmissiveRadiance *= gain;`,
      )
  }
  mat.customProgramCacheKey = () => 'chip-ignite-v1'
  return mat
}

/* ---------- instanced SMD micro-components ---------- */

interface Part {
  x: number
  y: number
  z: number
  sx: number
  sy: number
  sz: number
  rot: number
  delay: number
  off: THREE.Vector3
  tumble: THREE.Vector3
  color: THREE.Color
}

interface R2 {
  x0: number
  x1: number
  z0: number
  z1: number
}

function buildParts(mobile: boolean) {
  const rand = mulberry32(2024)
  const occ: R2[] = []
  const keep: R2 = { x0: -2.68, x1: 2.68, z0: -2.05, z1: 2.05 }
  const bx = BOARD.w / 2 - 0.22
  const bz = BOARD.d / 2 - 0.2
  const hits = (a: R2, b: R2, pad = 0) => a.x0 < b.x1 + pad && a.x1 > b.x0 - pad && a.z0 < b.z1 + pad && a.z1 > b.z0 - pad
  const free = (r: R2) => r.x0 > -bx && r.x1 < bx && r.z0 > -bz && r.z1 < bz && !hits(r, keep) && !occ.some((o) => hits(r, o, 0.12))

  const offFor = (x: number, z: number) => {
    const len = Math.hypot(x, z) || 1
    return new THREE.Vector3(
      (x / len) * (0.4 + rand() * 1.2) + (rand() - 0.5) * 0.8,
      1.2 + rand() * 2.2,
      (z / len) * (0.4 + rand() * 1.0) + (rand() - 0.5) * 0.8,
    )
  }
  const tumble = () => new THREE.Vector3((rand() - 0.5) * 3, (rand() - 0.5) * 4, (rand() - 0.5) * 3)
  const capColors = ['#7a5c3a', '#2b2f38', '#5e4a30', '#1b1e25', '#8a6a3c']

  const small: Part[] = []
  const target = mobile ? 150 : 270
  for (let attempt = 0; attempt < 1400 && small.length < target; attempt++) {
    const isRes = rand() < 0.4
    const sx = isRes ? 0.11 : 0.12
    const sy = isRes ? 0.04 : 0.07
    const sz = isRes ? 0.07 : 0.075
    const rows = 2 + Math.floor(rand() * 3)
    const cols = 3 + Math.floor(rand() * 5)
    const px = sx + 0.055
    const pz = sz + 0.05
    const vertical = rand() < 0.5
    const w = cols * px
    const d = rows * pz
    const cw = vertical ? d : w
    const cd = vertical ? w : d
    const cx = (rand() * 2 - 1) * bx
    const cz = (rand() * 2 - 1) * bz
    const r: R2 = { x0: cx - cw / 2, x1: cx + cw / 2, z0: cz - cd / 2, z1: cz + cd / 2 }
    if (!free(r)) continue
    occ.push(r)
    const clusterDelay = rand()
    const colour = new THREE.Color(isRes ? '#0d0d10' : capColors[Math.floor(rand() * capColors.length)])
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const lx = (j - (cols - 1) / 2) * px
        const lz = (i - (rows - 1) / 2) * pz
        const x = cx + (vertical ? lz : lx)
        const z = cz + (vertical ? lx : lz)
        small.push({
          x,
          y: PCB_TOP + sy / 2,
          z,
          sx,
          sy,
          sz,
          rot: vertical ? Math.PI / 2 : 0,
          delay: clamp01(clusterDelay * 0.9 + rand() * 0.1),
          off: offFor(x, z),
          tumble: tumble(),
          color: colour.clone().offsetHSL(0, 0, (rand() - 0.5) * 0.03),
        })
      }
    }
  }

  const chokes: Part[] = []
  for (let attempt = 0; attempt < 600 && chokes.length < 9; attempt++) {
    const sx = 0.34 + rand() * 0.18
    const sy = 0.26 + rand() * 0.1
    const sz = 0.3 + rand() * 0.12
    const cx = (rand() * 2 - 1) * bx
    const cz = (rand() * 2 - 1) * bz
    const r: R2 = { x0: cx - sx / 2, x1: cx + sx / 2, z0: cz - sz / 2, z1: cz + sz / 2 }
    if (!free(r)) continue
    occ.push(r)
    chokes.push({
      x: cx,
      y: PCB_TOP + sy / 2,
      z: cz,
      sx,
      sy,
      sz,
      rot: (rand() - 0.5) * 0.3,
      delay: rand(),
      off: offFor(cx, cz),
      tumble: tumble(),
      color: new THREE.Color(rand() < 0.5 ? '#8f98a8' : '#6a7282'),
    })
  }

  const cyls: Part[] = []
  for (let attempt = 0; attempt < 600 && cyls.length < 6; attempt++) {
    const rad = 0.13 + rand() * 0.07
    const h = 0.22 + rand() * 0.12
    const cx = (rand() * 2 - 1) * bx
    const cz = (rand() * 2 - 1) * bz
    const r: R2 = { x0: cx - rad, x1: cx + rad, z0: cz - rad, z1: cz + rad }
    if (!free(r)) continue
    occ.push(r)
    cyls.push({
      x: cx,
      y: PCB_TOP + h / 2,
      z: cz,
      sx: rad,
      sy: h,
      sz: rad,
      rot: 0,
      delay: rand(),
      off: offFor(cx, cz),
      tumble: tumble(),
      color: new THREE.Color(rand() < 0.5 ? '#b9c0cc' : '#d8a53a'),
    })
  }
  return { small, chokes, cyls }
}

interface Target {
  mesh: THREE.InstancedMesh | null
  mul: [number, number, number]
}

function applyParts(parts: Part[], targets: Target[], asm: number, tmp: THREE.Object3D) {
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i]
    const inv = 1 - ease(clamp01((asm - 0.06 - 0.52 * p.delay) / 0.4))
    tmp.position.set(p.x + p.off.x * inv, p.y + p.off.y * inv, p.z + p.off.z * inv)
    tmp.rotation.set(p.tumble.x * inv, p.rot + p.tumble.y * inv, p.tumble.z * inv)
    for (const t of targets) {
      if (!t.mesh) continue
      tmp.scale.set(p.sx * t.mul[0], p.sy * t.mul[1], p.sz * t.mul[2])
      tmp.updateMatrix()
      t.mesh.setMatrixAt(i, tmp.matrix)
    }
  }
  for (const t of targets) if (t.mesh) t.mesh.instanceMatrix.needsUpdate = true
}

function useStaticInstances(ref: RefObject<THREE.InstancedMesh | null>, mats: THREE.Matrix4[]) {
  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    mats.forEach((mt, i) => m.setMatrixAt(i, mt))
    m.instanceMatrix.needsUpdate = true
  }, [ref, mats])
}

function gridMatrices(
  xs: number[],
  zs: number[],
  y: number,
  skip?: (x: number, z: number) => boolean,
): THREE.Matrix4[] {
  const out: THREE.Matrix4[] = []
  for (const x of xs) {
    for (const z of zs) {
      if (skip?.(x, z)) continue
      out.push(new THREE.Matrix4().makeTranslation(x, y, z))
    }
  }
  return out
}

function range(a: number, b: number, step: number) {
  const out: number[] = []
  for (let v = a; v <= b + 1e-6; v += step) out.push(v)
  return out
}

/* ---------- scene ---------- */

interface ChipProps {
  mobile: boolean
  reducedMotion: boolean
}

export default function ChipScene({ mobile, reducedMotion }: ChipProps) {
  const { gl, camera, invalidate } = useThree()
  const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy())

  const group = useRef<THREE.Group>(null)
  const chip = useRef<THREE.Group>(null)
  const glow = useRef<THREE.Mesh>(null)
  const layerRefs = {
    pcb: useRef<THREE.Group>(null),
    pins: useRef<THREE.Group>(null),
    frame: useRef<THREE.Group>(null),
    interposer: useRef<THREE.Group>(null),
    chiplets: useRef<THREE.Group>(null),
    die: useRef<THREE.Group>(null),
  }
  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const termRef = useRef<THREE.InstancedMesh>(null)
  const chokeRef = useRef<THREE.InstancedMesh>(null)
  const cylRef = useRef<THREE.InstancedMesh>(null)
  const pinRef = useRef<THREE.InstancedMesh>(null)
  const teethRef = useRef<THREE.InstancedMesh>(null)
  const studRef = useRef<THREE.InstancedMesh>(null)
  const dieRingRef = useRef<THREE.InstancedMesh>(null)
  const glowSprite = useRef<THREE.SpriteMaterial>(null)

  const asm = useRef(0)
  const wave = useRef(0)
  const lastApplied = useRef(-1)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tmpV = useMemo(() => new THREE.Vector3(), [])
  const tmpV2 = useMemo(() => new THREE.Vector3(), [])

  const shared = useMemo<Shared>(() => ({ uTime: { value: 0 }, uWave: { value: 0 } }), [])

  /* textures */
  const tex = useMemo(() => {
    const big = mobile ? 1024 : 2048
    const mid = mobile ? 512 : 1024
    return {
      pcb: makePcbMaps(big, aniso),
      interposer: makeInterposerMaps(mid, aniso),
      frame: makeFrameMaps(mid, aniso),
      ribH: makeRibMaps({ vertical: false, dots: false }, aniso),
      ribV: makeRibMaps({ vertical: true, dots: true }, aniso),
      die: makeDieMaps(mid, aniso),
      glow: makeGlowTexture(),
    }
  }, [mobile, aniso])

  /* materials */
  const mats = useMemo(() => {
    const pcb = ignitable(
      new THREE.MeshPhysicalMaterial({
        color: '#0a1020',
        map: tex.pcb.map,
        emissiveMap: tex.pcb.emissive,
        emissive: '#ffffff',
        emissiveIntensity: 1.6,
        bumpMap: tex.pcb.bump,
        bumpScale: 1.6,
        metalness: 0.55,
        roughness: 0.42,
        clearcoat: 0.6,
        clearcoatRoughness: 0.35,
      }),
      shared,
    )
    const interposer = ignitable(
      new THREE.MeshPhysicalMaterial({
        color: '#0a1a33',
        map: tex.interposer.map,
        emissiveMap: tex.interposer.emissive,
        emissive: '#ffffff',
        emissiveIntensity: 2.0,
        bumpMap: tex.interposer.bump,
        bumpScale: 1.4,
        metalness: 0.8,
        roughness: 0.3,
        clearcoat: 0.8,
      }),
      shared,
    )
    const frame = ignitable(
      new THREE.MeshPhysicalMaterial({
        color: '#0c2c58',
        map: tex.frame.map,
        emissiveMap: tex.frame.emissive,
        emissive: '#ffffff',
        emissiveIntensity: 1.3,
        bumpMap: tex.frame.bump,
        bumpScale: 1.0,
        metalness: 0.88,
        roughness: 0.28,
        clearcoat: 0.9,
        clearcoatRoughness: 0.2,
      }),
      shared,
    )
    const hbm = new THREE.MeshPhysicalMaterial({
      color: '#0a0d14',
      map: tex.ribH.map,
      bumpMap: tex.ribH.bump,
      bumpScale: 1.8,
      metalness: 0.6,
      roughness: 0.35,
      clearcoat: 0.5,
    })
    const logic = ignitable(
      new THREE.MeshPhysicalMaterial({
        color: '#0a0d14',
        map: tex.ribV.map,
        bumpMap: tex.ribV.bump,
        bumpScale: 1.8,
        emissiveMap: tex.ribV.emissive,
        emissive: '#ffffff',
        emissiveIntensity: 1.2,
        metalness: 0.6,
        roughness: 0.35,
        clearcoat: 0.5,
      }),
      shared,
    )
    const ctrl = new THREE.MeshPhysicalMaterial({ color: '#10151f', metalness: 0.85, roughness: 0.3, clearcoat: 0.8 })
    const square = new THREE.MeshPhysicalMaterial({ color: '#05070b', metalness: 0.7, roughness: 0.22, clearcoat: 1 })
    const die = ignitable(
      new THREE.MeshPhysicalMaterial({
        color: '#05080f',
        map: tex.die.map,
        emissiveMap: tex.die.emissive,
        emissive: '#ffffff',
        emissiveIntensity: 2.3,
        metalness: 0.9,
        roughness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
      }),
      shared,
    )
    const gold = new THREE.MeshStandardMaterial({
      color: GOLD,
      metalness: 1,
      roughness: 0.3,
      emissive: '#6a3d00',
      emissiveIntensity: 0.35,
    })
    const body = new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.1, roughness: 0.55 })
    const metal = new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.95, roughness: 0.32 })
    return { pcb, interposer, frame, hbm, logic, ctrl, square, die, gold, body, metal }
  }, [tex, shared])

  useEffect(() => {
    return () => {
      Object.values(tex).forEach((t) => {
        const maybe = t as unknown
        if (maybe instanceof THREE.Texture) maybe.dispose()
        else
          Object.values(maybe as Record<string, unknown>).forEach((v) => {
            if (v instanceof THREE.Texture) v.dispose()
          })
      })
      Object.values(mats).forEach((m) => m.dispose())
    }
  }, [tex, mats])

  /* geometry & instances */
  const parts = useMemo(() => buildParts(mobile), [mobile])
  const chokeGeo = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 3, 0.1), [])
  const geos = useMemo(
    () => ({
      pcb: slabGeo(BOARD.w, BOARD.t, BOARD.d, 0.04, 3),
      frame: slabGeo(PKG.w, 0.1, PKG.d, 0.05, 4),
      interposer: slabGeo(2.7, 0.05, 3.0, 0.02, 3),
      hbm: slabGeo(1.8, 0.16, 0.95, 0.025, 3),
      hbmSq: slabGeo(0.26, 0.05, 0.3, 0.012, 2),
      logic: slabGeo(1.8, 0.12, 1.4, 0.025, 3),
      ctrl: slabGeo(0.5, 0.08, 0.32, 0.02, 3),
      die: slabGeo(1.35, 0.1, 1.35, 0.03, 4),
    }),
    [],
  )
  useEffect(
    () => () => {
      chokeGeo.dispose()
      Object.values(geos).forEach((g) => g.dispose())
    },
    [chokeGeo, geos],
  )

  const pinMats = useMemo(() => {
    const pitch = mobile ? 0.14 : 0.1
    return gridMatrices(range(-2.2, 2.2, pitch), range(-1.6, 1.6, pitch), 0.1)
  }, [mobile])
  const teethMats = useMemo(() => {
    const out: THREE.Matrix4[] = []
    const y = 0.262
    for (const x of range(-2.2, 2.2, 0.07)) {
      for (const z of [-1.73, 1.73]) out.push(new THREE.Matrix4().makeTranslation(x, y, z))
    }
    for (const z of range(-1.5, 1.5, 0.07)) {
      for (const x of [-2.33, 2.33]) {
        out.push(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)), new THREE.Vector3(1, 1, 1)))
      }
    }
    return out
  }, [])
  const studMats = useMemo(() => {
    const pts: [number, number][] = [
      [-2.3, -1.7],
      [2.3, -1.7],
      [-2.3, 1.7],
      [2.3, 1.7],
      [0, -1.7],
      [0, 1.7],
      [-2.3, 0],
      [2.3, 0],
    ]
    return pts.map(([x, z]) => new THREE.Matrix4().makeTranslation(x, 0.25, z))
  }, [])
  const dieRingMats = useMemo(() => {
    const out: THREE.Matrix4[] = []
    const cx = -0.95
    const half = 0.675 + 0.06
    const y = 0.31
    for (const t of range(-0.62, 0.62, 0.046)) {
      out.push(new THREE.Matrix4().makeTranslation(cx + t, y, -half))
      out.push(new THREE.Matrix4().makeTranslation(cx + t, y, half))
      out.push(new THREE.Matrix4().compose(new THREE.Vector3(cx - half, y, t), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)), new THREE.Vector3(1, 1, 1)))
      out.push(new THREE.Matrix4().compose(new THREE.Vector3(cx + half, y, t), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)), new THREE.Vector3(1, 1, 1)))
    }
    return out
  }, [])
  useStaticInstances(pinRef, pinMats)
  useStaticInstances(teethRef, teethMats)
  useStaticInstances(studRef, studMats)
  useStaticInstances(dieRingRef, dieRingMats)

  useLayoutEffect(() => {
    const setColors = (mesh: THREE.InstancedMesh | null, list: Part[]) => {
      if (!mesh) return
      list.forEach((p, i) => mesh.setColorAt(i, p.color))
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }
    setColors(bodyRef.current, parts.small)
    setColors(chokeRef.current, parts.chokes)
    setColors(cylRef.current, parts.cyls)
    lastApplied.current = -1
  }, [parts])

  // Reduced motion renders on demand: repaint whenever scroll moves.
  useEffect(() => {
    if (!reducedMotion) return
    const on = () => invalidate()
    window.addEventListener('scroll', on, { passive: true })
    on()
    return () => window.removeEventListener('scroll', on)
  }, [reducedMotion, invalidate])

  useFrame((state, delta) => {
    const g = group.current
    const c = chip.current
    if (!g || !c) return
    const dt = Math.min(delta, 0.05)
    const time = reducedMotion ? 0 : state.clock.elapsedTime
    const sm = (cur: number, target: number, lambda: number) => (reducedMotion ? target : THREE.MathUtils.damp(cur, target, lambda, dt))
    const lerp = THREE.MathUtils.lerp
    const { assemble, eco, scrollVel, mx, my, pointerActive } = sceneState
    sceneState.scrollVel = THREE.MathUtils.damp(scrollVel, 0, 4, dt)
    shared.uTime.value = time

    asm.current = sm(asm.current, assemble, 7.5)
    const a = asm.current
    const aE = ease(clamp01(a))
    const stage3 = THREE.MathUtils.smoothstep(eco, 0.74, 0.88)

    /* ignition wave fires as assemblyProgress reaches 0.75 (a -> 1.0) */
    wave.current = sm(wave.current, THREE.MathUtils.smoothstep(a, 0.92, 1.0), 4.0)
    shared.uWave.value = wave.current

    /* composition: right column on wide screens, centred above the copy on tall ones */
    const aspect = state.size.width / state.size.height
    const portrait = aspect < 1.15
    const fov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180
    camera.position.z = sm(camera.position.z, 7.2 - stage3 * 0.7, 3.5)
    const halfH = Math.tan(fov / 2) * camera.position.z
    const halfW = halfH * aspect

    let scale: number
    let tx: number
    let ty: number
    if (portrait) {
      const fit = (2 * halfW * 0.92) / BOARD.w
      scale = lerp(lerp(fit * 0.78, fit, aE), fit * 1.06, stage3)
      tx = 0
      ty = lerp(0.24, 0.12, aE) * halfH
    } else {
      scale = lerp(lerp(0.49, 0.62, aE), 0.7, stage3)
      tx = lerp(0.58, 0.5, aE) * halfW
      ty = lerp(-0.04, 0, aE) * halfH
    }
    const tilt = lerp(lerp(0.76, 0.6, aE), 0.74, stage3)
    const yaw = lerp(lerp(-0.66, -0.5, aE), -0.34, stage3)
    const px = pointerActive && !portrait ? mx : 0
    const py = pointerActive && !portrait ? my : 0

    g.position.x = sm(g.position.x, tx, 3.5)
    g.position.y = sm(g.position.y, ty, 3.5)
    g.scale.setScalar(sm(g.scale.x, scale, 3.5))
    g.rotation.x = sm(g.rotation.x, tilt - py * 0.07, 2.8)
    g.rotation.y = sm(g.rotation.y, yaw + Math.sin(time * 0.22) * 0.1 * (1 - stage3 * 0.6) + px * 0.17, 2.6)
    c.position.y = lerp(-0.55, -0.1, aE)

    /* readable text on narrow viewports */
    const dim = portrait ? lerp(0.55, 0.85, aE) : 1
    const cur = parseFloat(gl.domElement.style.opacity || '1')
    if (Math.abs(cur - dim) > 0.01) gl.domElement.style.opacity = String(dim)

    /* layer explode / lock across X, Y, Z and 3-axis rotation */
    ;(Object.keys(LAYERS) as (keyof typeof LAYERS)[]).forEach((k, i) => {
      const ref = layerRefs[k].current
      if (!ref) return
      const cfg = LAYERS[k]
      const inv = 1 - layerT(a, cfg.win)
      const bob = reducedMotion ? 0 : Math.sin(time * 0.85 + i * 1.3) * 0.055 * inv
      ref.position.set(cfg.off[0] * inv, cfg.off[1] * inv + bob, cfg.off[2] * inv)
      ref.rotation.set(cfg.rot[0] * inv, cfg.rot[1] * inv, cfg.rot[2] * inv)
    })

    /* per-instance SMD flight paths (only recomputed while the assembly value moves) */
    if (Math.abs(a - lastApplied.current) > 0.0005) {
      lastApplied.current = a
      applyParts(parts.small, [
        { mesh: termRef.current, mul: [1, 1, 1] },
        { mesh: bodyRef.current, mul: [0.62, 1.1, 1.1] },
      ], a, dummy)
      applyParts(parts.chokes, [{ mesh: chokeRef.current, mul: [1, 1, 1] }], a, dummy)
      applyParts(parts.cyls, [{ mesh: cylRef.current, mul: [1, 1, 1] }], a, dummy)
    }

    /* glow */
    if (glowSprite.current) glowSprite.current.opacity = 0.12 + 0.5 * wave.current + scrollVel * 0.15
    if (glow.current) {
      glow.current.position.x = g.position.x
      glow.current.position.y = g.position.y
      glow.current.scale.setScalar(lerp(8, 10.5, aE))
      ;(glow.current.material as THREE.MeshBasicMaterial).opacity = (0.1 + 0.22 * wave.current) * (portrait ? 0.6 : 1)
    }

    /* CORTEX callout anchors → screen space */
    g.updateMatrixWorld(true)
    camera.updateMatrixWorld()
    ANCHORS.forEach((p, i) => {
      tmpV.copy(p)
      c.localToWorld(tmpV)
      tmpV.project(camera)
      const out = sceneState.anchors[i]
      out.x = (tmpV.x * 0.5 + 0.5) * state.size.width
      out.y = (-tmpV.y * 0.5 + 0.5) * state.size.height
      out.visible = tmpV.z < 1
    })
    tmpV2.set(0, 0, 0)
    sceneState.calloutT = THREE.MathUtils.smoothstep(eco, 0.72, 0.84) * THREE.MathUtils.smoothstep(a, 0.9, 0.98)
  })

  const hbmSquares = useMemo(() => [0.75, 1.08, 1.41, 1.74, 2.07], [])
  const ctrlDies = useMemo<[number, number][]>(() => [[0.85, 1.45], [1.6, 1.45]], [])

  return (
    <>
      {/* Procedural studio reflections: amber key, cyan fill, white top softbox (no network assets). */}
      <Environment resolution={mobile ? 128 : 256} frames={1}>
        <Lightformer form="rect" intensity={3.2} color="#ffffff" position={[0, 6, 2]} scale={[10, 2, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={4} color="#FFB347" position={[6, 1, -2]} scale={[6, 3, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="rect" intensity={3.5} color="#38BDF8" position={[-6, 0.5, 2]} scale={[6, 3, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="ring" intensity={2} color="#8B5CF6" position={[0, -2, 6]} scale={4} />
      </Environment>
      <ambientLight color="#0b1022" intensity={0.5} />
      <directionalLight color="#e2e8f0" intensity={1.8} position={[3.5, 5, 5]} />
      <pointLight color="#38BDF8" intensity={14} distance={9} decay={2} position={[-2.5, 2.6, 2.2]} />
      <pointLight color="#FF9900" intensity={16} distance={10} decay={2} position={[3.5, 1.8, 2.6]} />

      {/* Soft backdrop bloom */}
      <mesh ref={glow} position={[0, 0, -1.4]} scale={[8, 8, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={tex.glow} color="#1fa8ff" transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <group ref={group} rotation={[0.8, -0.62, 0]} scale={0.5}>
        <group ref={chip}>
          {/* 1 · Base PCB motherboard + SMD micro-components */}
          <group ref={layerRefs.pcb}>
            <mesh geometry={geos.pcb} material={mats.pcb} />

            <instancedMesh ref={termRef} args={[undefined, undefined, parts.small.length]} frustumCulled={false}>
              <boxGeometry args={[1, 1, 1]} />
              <primitive object={mats.gold} attach="material" />
            </instancedMesh>
            <instancedMesh ref={bodyRef} args={[undefined, undefined, parts.small.length]} frustumCulled={false}>
              <boxGeometry args={[1, 1, 1]} />
              <primitive object={mats.body} attach="material" />
            </instancedMesh>
            <instancedMesh ref={chokeRef} args={[chokeGeo, undefined, parts.chokes.length]} frustumCulled={false}>
              <primitive object={mats.metal} attach="material" />
            </instancedMesh>
            <instancedMesh ref={cylRef} args={[undefined, undefined, parts.cyls.length]} frustumCulled={false}>
              <cylinderGeometry args={[1, 1, 1, 20]} />
              <primitive object={mats.metal} attach="material" />
            </instancedMesh>
          </group>

          {/* 2 · Gold BGA pin matrix */}
          <group ref={layerRefs.pins}>
            <instancedMesh ref={pinRef} args={[undefined, undefined, pinMats.length]} frustumCulled={false}>
              <cylinderGeometry args={[0.026, 0.026, 0.08, 8]} />
              <primitive object={mats.gold} attach="material" />
            </instancedMesh>
          </group>

          {/* 3 · Blue-metal package frame, gold studs and edge contacts */}
          <group ref={layerRefs.frame}>
            <mesh geometry={geos.frame} material={mats.frame} position={[0, 0.19, 0]} />
            <instancedMesh ref={studRef} args={[undefined, undefined, studMats.length]} frustumCulled={false}>
              <cylinderGeometry args={[0.085, 0.085, 0.14, 20]} />
              <primitive object={mats.gold} attach="material" />
            </instancedMesh>
            <instancedMesh ref={teethRef} args={[undefined, undefined, teethMats.length]} frustumCulled={false}>
              <boxGeometry args={[0.04, 0.05, 0.16]} />
              <primitive object={mats.gold} attach="material" />
            </instancedMesh>
          </group>

          {/* 4 · Cyan neural interposer */}
          <group ref={layerRefs.interposer}>
            <mesh geometry={geos.interposer} material={mats.interposer} position={[-0.95, 0.265, 0]} />
            <instancedMesh ref={dieRingRef} args={[undefined, undefined, dieRingMats.length]} frustumCulled={false}>
              <boxGeometry args={[0.028, 0.03, 0.05]} />
              <primitive object={mats.gold} attach="material" />
            </instancedMesh>
          </group>

          {/* 5 · HBM memory + logic chiplets + controller dies */}
          <group ref={layerRefs.chiplets}>
            <mesh geometry={geos.hbm} material={mats.hbm} position={[1.35, 0.32, -0.98]} />
            {hbmSquares.map((x) => (
              <mesh key={x} geometry={geos.hbmSq} material={mats.square} position={[x, 0.425, -0.98]} />
            ))}
            <mesh geometry={geos.logic} material={mats.logic} position={[1.35, 0.3, 0.42]} />
            {ctrlDies.map(([x, z]) => (
              <mesh key={x} geometry={geos.ctrl} material={mats.ctrl} position={[x, 0.28, z]} />
            ))}
          </group>

          {/* 6 · JeztBrain CORTEX silicon die */}
          <group ref={layerRefs.die}>
            <mesh geometry={geos.die} material={mats.die} position={[-0.95, 0.34, 0]} />
            <sprite position={[-0.95, 0.5, 0]} scale={[3.4, 3.4, 1]}>
              <spriteMaterial
                ref={glowSprite}
                map={tex.glow}
                color="#38BDF8"
                transparent
                opacity={0.12}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
          </group>
        </group>
      </group>
    </>
  )
}

export { AMBER }

