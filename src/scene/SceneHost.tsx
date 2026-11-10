import { Component, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import ChipScene from './ChipScene'
import ChipCallouts from './ChipCallouts'
import { sceneState } from '../lib/sceneState'
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useMedia'

class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Managed WebGL context hosting the "Silicon to Soul" JeztBrain Neural Processor
 * exclusively for the #ecosystem (JEZTBRAIN / JEZTBRAIN CORTEX) section.
 *  - Completely decoupled from #home and #about so the Hero remains 100% focused on Sreeraj Unnikrishnan.
 *  - Ecosystem.tsx drives `sceneState.eco` (0 -> 1) and `sceneState.assemble` (0 -> 1 across 0 -> 0.75 of #ecosystem).
 *  - Rendering pauses (`frameloop="never"`) whenever #ecosystem is off-screen or the browser tab is hidden.
 */
export default function SceneHost() {
  const mobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  const [visible, setVisible] = useState(false)
  const [tabVisible, setTabVisible] = useState(true)
  const [supported] = useState(webglAvailable)
  const [maxDpr, setMaxDpr] = useState(mobile ? 1.5 : 2)

  useEffect(() => setMaxDpr(mobile ? 1.5 : 2), [mobile])

  // Activate the 3D processor strictly when the #ecosystem (JEZTBRAIN) section is in view.
  useEffect(() => {
    const eco = document.getElementById('ecosystem')
    if (!eco) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          setVisible(e.isIntersecting)
        }
      },
      { threshold: 0, rootMargin: '-12% 0px -12% 0px' },
    )
    io.observe(eco)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const on = () => setTabVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])

  // Pointer + scroll-velocity feed (no React renders).
  useEffect(() => {
    let lastY = window.scrollY
    let lastT = performance.now()
    const onScroll = () => {
      const y = window.scrollY
      const now = performance.now()
      const dt = Math.max(16, now - lastT)
      sceneState.scrollVel = Math.max(Math.min(1, Math.abs(y - lastY) / (dt * 2.2)), sceneState.scrollVel * 0.75)
      lastY = y
      lastT = now
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      sceneState.mx = (e.clientX / window.innerWidth) * 2 - 1
      sceneState.my = -((e.clientY / window.innerHeight) * 2 - 1)
      sceneState.pointerActive = true
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  if (!supported) return null

  const running = visible && tabVisible
  const frameloop = reduced ? 'demand' : running ? 'always' : 'never'

  return (
    <div className="scene-host" data-active={running} aria-hidden="true">
      <WebGLBoundary>
        <Canvas
          frameloop={frameloop}
          dpr={[1, maxDpr]}
          camera={{ position: [0, 0, 7.2], fov: 44, near: 0.1, far: 60 }}
          gl={{
            antialias: !mobile,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
          }}
          style={{ pointerEvents: 'none' }}
        >
          <PerformanceMonitor
            onDecline={() => setMaxDpr((d) => Math.max(1, d - 0.5))}
            flipflops={3}
            onFallback={() => setMaxDpr(1)}
          />
          <ChipScene mobile={mobile} reducedMotion={reduced} />
        </Canvas>
        <ChipCallouts />
      </WebGLBoundary>
    </div>
  )
}
