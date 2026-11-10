import { Component, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { sceneState } from '../lib/sceneState'
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useMedia'

export type PillarIndex = null | 0 | 1 | 2 | 3

interface Palette {
  primary: string
  secondary: string
  attenuation: string
  glass: string
}

const PALETTES: Record<'default' | 0 | 1 | 2 | 3, Palette> = {
  default: {
    primary: '#38BDF8',
    secondary: '#6366F1',
    attenuation: '#1e3a5f',
    glass: '#b8dcff',
  },
  0: {
    // DISCIPLINES: Security · Full-Stack · AI (Emerald)
    primary: '#10B981',
    secondary: '#38BDF8',
    attenuation: '#064e3b',
    glass: '#a7f3d0',
  },
  1: {
    // PUBLISHED RESEARCH: IEEE Federated ML (FLSIR) (Violet)
    primary: '#8B5CF6',
    secondary: '#6366F1',
    attenuation: '#3b1d7a',
    glass: '#ddd6fe',
  },
  2: {
    // ENGINEERING STACK: React · Node · Python · Flutter (Cyan)
    primary: '#38BDF8',
    secondary: '#00F0FF',
    attenuation: '#0c4a6e',
    glass: '#bae6fd',
  },
  3: {
    // R&D ECOSYSTEM: JEZTBRAIN & CORTEX Core (Amber/Cyan)
    primary: '#F59E0B',
    secondary: '#00F0FF',
    attenuation: '#6b3408',
    glass: '#fde68a',
  },
}

class SculptureBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function KineticGyroscope({ activePillar, reducedMotion }: { activePillar: PillarIndex; reducedMotion: boolean }) {
  const root = useRef<THREE.Group>(null)
  const outerRing = useRef<THREE.Group>(null)
  const gimbalRing = useRef<THREE.Group>(null)
  const ribbon = useRef<THREE.Mesh>(null)
  const coreGroup = useRef<THREE.Group>(null)

  const coreMat = useRef<THREE.MeshPhysicalMaterial>(null)
  const innerCageMat = useRef<THREE.MeshStandardMaterial>(null)
  const keyLight = useRef<THREE.PointLight>(null)
  const rimLight = useRef<THREE.PointLight>(null)
  const coreLight = useRef<THREE.PointLight>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transMat = useRef<any>(null)

  const targetPrimary = useMemo(() => new THREE.Color(), [])
  const targetSecondary = useMemo(() => new THREE.Color(), [])
  const targetAtten = useMemo(() => new THREE.Color(), [])
  const targetGlass = useMemo(() => new THREE.Color(), [])

  const curPrimary = useMemo(() => new THREE.Color(PALETTES.default.primary), [])
  const curSecondary = useMemo(() => new THREE.Color(PALETTES.default.secondary), [])
  const curAtten = useMemo(() => new THREE.Color(PALETTES.default.attenuation), [])
  const curGlass = useMemo(() => new THREE.Color(PALETTES.default.glass), [])

  const couplers = useMemo(() => [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2], [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = reducedMotion ? 0 : state.clock.elapsedTime
    const damp = THREE.MathUtils.damp

    const pal = activePillar !== null ? PALETTES[activePillar] : PALETTES.default
    targetPrimary.set(pal.primary)
    targetSecondary.set(pal.secondary)
    targetAtten.set(pal.attenuation)
    targetGlass.set(pal.glass)

    const colorRate = 1 - Math.exp(-4.5 * dt)
    curPrimary.lerp(targetPrimary, colorRate)
    curSecondary.lerp(targetSecondary, colorRate)
    curAtten.lerp(targetAtten, colorRate)
    curGlass.lerp(targetGlass, colorRate)

    if (keyLight.current) {
      keyLight.current.color.copy(curPrimary)
      keyLight.current.intensity = damp(keyLight.current.intensity, activePillar !== null ? 24 : 16, 4, dt)
    }
    if (rimLight.current) {
      rimLight.current.color.copy(curSecondary)
      rimLight.current.intensity = damp(rimLight.current.intensity, activePillar !== null ? 18 : 13, 4, dt)
    }
    if (coreLight.current) {
      coreLight.current.color.copy(curPrimary)
      coreLight.current.intensity = damp(coreLight.current.intensity, activePillar !== null ? 14 : 8, 4, dt)
    }
    if (coreMat.current) {
      coreMat.current.emissive.copy(curPrimary)
      coreMat.current.color.copy(curGlass)
      coreMat.current.emissiveIntensity = damp(coreMat.current.emissiveIntensity, activePillar !== null ? 2.4 : 1.35, 4, dt)
    }
    if (innerCageMat.current) {
      innerCageMat.current.emissive.copy(curSecondary)
    }
    if (transMat.current) {
      if (transMat.current.color) transMat.current.color.copy(curGlass)
      if (transMat.current.attenuationColor) transMat.current.attenuationColor.copy(curAtten)
    }

    const px = sceneState.pointerActive ? sceneState.mx : 0
    const py = sceneState.pointerActive ? sceneState.my : 0

    if (root.current) {
      // Heavy physical inertia following cursor + gentle levitation
      root.current.position.y = Math.sin(t * 0.55) * 0.08
      root.current.rotation.x = damp(root.current.rotation.x, 0.24 - py * 0.28 + Math.cos(t * 0.32) * 0.06, 2.4, dt)
      root.current.rotation.y = damp(root.current.rotation.y, -0.32 + px * 0.38 + Math.sin(t * 0.28) * 0.08, 2.2, dt)
    }

    if (outerRing.current) {
      outerRing.current.rotation.z = t * 0.14
      outerRing.current.rotation.x = Math.sin(t * 0.22) * 0.18
    }

    if (gimbalRing.current) {
      gimbalRing.current.rotation.y = -t * 0.22
      gimbalRing.current.rotation.x = Math.PI / 2.6 + Math.cos(t * 0.3) * 0.15
    }

    if (ribbon.current) {
      ribbon.current.rotation.x = t * 0.19 + py * 0.15
      ribbon.current.rotation.y = t * 0.26 + px * 0.18
      ribbon.current.rotation.z = Math.sin(t * 0.18) * 0.12
    }

    if (coreGroup.current) {
      coreGroup.current.rotation.y = -t * 0.48
      coreGroup.current.rotation.z = t * 0.32
      const pulse = 1 + Math.sin(t * 1.8) * 0.035 + (activePillar !== null ? 0.06 : 0)
      coreGroup.current.scale.setScalar(damp(coreGroup.current.scale.x, pulse, 4, dt))
    }
  })

  return (
    <>
      {/* Studio softbox reflections (procedural, zero external HDR fetches) */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4.2} color="#ffffff" position={[0, 5, 3]} scale={[8, 2, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={3.8} color="#38BDF8" position={[-5, 1.5, 2]} scale={[5, 2.5, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={3.4} color="#6366F1" position={[5, -1, 2]} scale={[5, 2.5, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={2.6} color="#10B981" position={[0, -4, 3]} scale={4.5} rotation-x={-Math.PI / 2} />
      </Environment>

      <ambientLight color="#090d1a" intensity={0.55} />
      <directionalLight color="#f8fafc" intensity={1.8} position={[4, 6, 5]} />
      <pointLight ref={keyLight} color="#38BDF8" intensity={16} distance={9} decay={2} position={[-2.6, 2.2, 2.8]} />
      <pointLight ref={rimLight} color="#6366F1" intensity={13} distance={9} decay={2} position={[2.8, -1.8, 2.4]} />
      <pointLight color="#10B981" intensity={9} distance={8} decay={2} position={[0, 2.8, -2.5]} />

      <group ref={root} scale={0.96}>
        {/* 1 · Outer Brushed-Titanium Architectural Ring */}
        <group ref={outerRing}>
          <mesh>
            <torusGeometry args={[1.92, 0.052, 48, 200]} />
            <meshPhysicalMaterial
              color="#0e1422"
              metalness={0.92}
              roughness={0.18}
              clearcoat={0.95}
              clearcoatRoughness={0.12}
            />
          </mesh>
          {/* Subtle inner machined chamfer ring */}
          <mesh>
            <torusGeometry args={[1.84, 0.014, 24, 160]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.95} roughness={0.15} emissive="#0c4a6e" emissiveIntensity={0.6} />
          </mesh>
          {couplers.map((ang) => (
            <mesh
              key={ang}
              position={[Math.cos(ang) * 1.92, Math.sin(ang) * 1.92, 0]}
              rotation={[0, 0, ang]}
            >
              <cylinderGeometry args={[0.072, 0.072, 0.14, 24]} />
              <meshPhysicalMaterial color="#1e293b" metalness={0.95} roughness={0.16} clearcoat={1} />
            </mesh>
          ))}
        </group>

        {/* 1B · Orthogonal Dark-Anodized Gimbal Ring */}
        <group ref={gimbalRing}>
          <mesh>
            <torusGeometry args={[1.58, 0.028, 36, 180]} />
            <meshPhysicalMaterial
              color="#141c2e"
              metalness={0.9}
              roughness={0.2}
              clearcoat={0.9}
              clearcoatRoughness={0.15}
            />
          </mesh>
        </group>

        {/* 2 · Middle Refractive Obsidian-Glass Torus Knot Sculpture */}
        <mesh ref={ribbon}>
          <torusKnotGeometry args={[0.88, 0.23, 220, 48, 2, 3]} />
          <MeshTransmissionMaterial
            ref={transMat}
            backside
            samples={4}
            resolution={256}
            transmission={0.95}
            thickness={1.5}
            roughness={0.12}
            chromaticAberration={0.06}
            anisotropy={0.3}
            distortion={0.15}
            distortionScale={0.25}
            temporalDistortion={0.08}
            ior={1.52}
            clearcoat={1}
            clearcoatRoughness={0.08}
            attenuationDistance={2.2}
            attenuationColor="#1e3a5f"
            color="#b8dcff"
          />
        </mesh>

        {/* 3 · Suspended Glowing Crystalline Core */}
        <group ref={coreGroup}>
          <pointLight ref={coreLight} color="#38BDF8" intensity={8} distance={4.5} decay={2} />
          <mesh>
            <octahedronGeometry args={[0.34, 0]} />
            <meshPhysicalMaterial
              ref={coreMat}
              color="#b8dcff"
              emissive="#38BDF8"
              emissiveIntensity={1.35}
              metalness={0.25}
              roughness={0.08}
              clearcoat={1}
              clearcoatRoughness={0.04}
            />
          </mesh>
          <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
            <icosahedronGeometry args={[0.46, 0]} />
            <meshStandardMaterial
              ref={innerCageMat}
              color="#1e293b"
              emissive="#6366F1"
              emissiveIntensity={0.45}
              metalness={0.92}
              roughness={0.18}
              wireframe
            />
          </mesh>
        </group>
      </group>
    </>
  )
}

export default function HeroSculpture({ activePillar }: { activePillar: PillarIndex }) {
  const mobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting)
      },
      { threshold: 0.01 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={hostRef} className="hero-sculpture-stage" aria-hidden="true">
      <SculptureBoundary>
        <Canvas
          frameloop={inView ? 'always' : 'never'}
          dpr={[1, mobile ? 1.5 : 2]}
          camera={{ position: [0, 0, 5.4], fov: 40, near: 0.1, far: 30 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.08,
          }}
        >
          <KineticGyroscope activePillar={activePillar} reducedMotion={reduced} />
        </Canvas>
      </SculptureBoundary>
    </div>
  )
}
