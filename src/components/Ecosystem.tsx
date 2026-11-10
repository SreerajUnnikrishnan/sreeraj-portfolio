import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data/portfolioData'
import { MaturityChip } from './ui'
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useMedia'
import { sceneState } from '../lib/sceneState'
import { useProjectModal } from '../lib/ProjectContext'

const cortex = projects.find((p) => p.id === 'jeztbrain-cortex')!

const steps = [
  {
    kicker: '01 · THE R&D ECOSYSTEM — JEZTBRAIN',
    title: 'JEZTBRAIN',
    telemetry: 'PHASE 01 → 02 · SILICON CONVERGENCE IN PROGRESS',
    body: 'Founded and architected by Sreeraj Unnikrishnan—inspired by the principle that the human brain is the catalyst behind every technological leap—JEZTBRAIN is the flagship R&D innovation ecosystem where full-stack software engineering, applied artificial intelligence, and offensive security research converge into unified silicon-to-soul systems.',
  },
  {
    kicker: '02 · THE COGNITIVE CORE ENGINE',
    title: 'JEZTBRAIN CORTEX',
    telemetry: 'PHASE 02 · CORTEX CORE LOCK & NEURAL IGNITION',
    body: 'Locked at the center of the neural interposer, JEZTBRAIN CORTEX is the proactive cognitive intelligence engine of JEZTBRAIN—unifying autonomous workflow automation, security intelligence, continuous OSINT reconnaissance, and vulnerability discovery across high-bandwidth memory and logic chiplets.',
  },
  {
    kicker: '03 · ARCHITECTURAL TELEMETRY & MATURITY',
    title: 'Implemented vs. Active R&D vs. Vision',
    telemetry: 'PHASE 03 · HARDWARE TELEMETRY & MATURITY MAPPING',
    body: 'Every JEZTBRAIN CORTEX hardware-mapped module is classified with strict engineering transparency: the OSINT & reconnaissance crawler is the implemented foundation; continuous recon, workflow automation, and vulnerability discovery are in active R&D; the unified security intelligence layer is the long-term architectural vision.',
  },
]

function CapabilityList({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`cap-list ${compact ? 'cap-compact' : ''}`}>
      {(cortex.capabilities ?? []).map((c) => (
        <li key={c.label}>
          <div>
            <strong>{c.label}</strong>
            {!compact && <span>{c.detail}</span>}
          </div>
          <MaturityChip maturity={c.maturity} />
        </li>
      ))}
    </ul>
  )
}

export default function Ecosystem() {
  const mobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  const native = mobile || reduced
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const { open } = useProjectModal()

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!root.current) return

    // Reset to deconstructed state (0.0) before #ecosystem is scrolled.
    sceneState.eco = 0
    sceneState.assemble = 0

    if (native) {
      if (reduced) {
        sceneState.eco = 0.75
        sceneState.assemble = 1
        return
      }
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top 70%',
          end: 'bottom 30%',
          scrub: 0.4,
          onUpdate: (self) => {
            const p = self.progress
            sceneState.eco = p
            sceneState.assemble = Math.min(1, p / 0.75)
          },
          onLeaveBack: () => {
            sceneState.eco = 0
            sceneState.assemble = 0
          },
        })
      }, root)
      return () => {
        ctx.revert()
        sceneState.eco = 0
        sceneState.assemble = 0
      }
    }

    if (!stage.current) return
    let last = 0
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: '+=300%',
        pin: stage.current,
        scrub: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress
          // Phase 1 (p = 0.0): 100% scattered/deconstructed
          // Phase 2 (p: 0.0 -> 0.75): live on-screen assembly -> lock-in & ignition pulse at p = 0.75
          // Phase 3 (p: 0.75 -> 1.0): camera zoom/tilt + 5 hardware-anchored telemetry callouts
          sceneState.eco = p
          sceneState.assemble = Math.min(1, p / 0.72)
          const s = p < 0.36 ? 0 : p < 0.72 ? 1 : 2
          if (s !== last) {
            last = s
            setStep(s)
          }
          if (bar.current) bar.current.style.transform = `scaleY(${p})`
        },
        onLeaveBack: () => {
          sceneState.eco = 0
          sceneState.assemble = 0
          if (last !== 0) {
            last = 0
            setStep(0)
          }
          if (bar.current) bar.current.style.transform = 'scaleY(0)'
        },
      })
    }, root)
    return () => {
      ctx.revert()
      sceneState.eco = 0
      sceneState.assemble = 0
    }
  }, [native, reduced])

  return (
    <section id="ecosystem" ref={root} className={`eco ${native ? 'eco-native' : ''}`} aria-label="JEZTBRAIN and JEZTBRAIN CORTEX ecosystem">
      <div className="eco-stage" ref={stage}>
        <div className="container eco-grid">
          <div className="eco-text">
            {native ? (
              <div className="eco-stack">
                {steps.map((s, i) => (
                  <div key={s.title} className="glass eco-card">
                    <span className="mono eyebrow">{s.kicker}</span>
                    <h2>{s.title}</h2>
                    <p>{s.body}</p>
                    {i === 2 && <CapabilityList />}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="eco-rail" aria-hidden="true">
                  <div className="eco-rail-fill" ref={bar} />
                </div>
                <AnimatePresence initial={false}>
                  <motion.div
                    key={step}
                    className="eco-panel"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10, position: 'absolute', inset: '0 0 auto 28px', pointerEvents: 'none' }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="mono eyebrow">{steps[step].kicker}</span>
                    <h2>{steps[step].title}</h2>
                    <p>{steps[step].body}</p>
                    <div className="eco-phase-pill mono">
                      <span className="eco-phase-dot" data-step={step} />
                      <span>{steps[step].telemetry}</span>
                    </div>
                    {step === 2 && <CapabilityList compact />}
                  </motion.div>
                </AnimatePresence>
              </>
            )}
            <button className="btn btn-ghost eco-link" onClick={() => open('jeztbrain-cortex')}>
              Open the JEZTBRAIN CORTEX case study
            </button>
          </div>
          {/* Open right-hand stage reserved for the 3D JeztBrain Neural Processor & Phase 3 hardware leader-line callouts */}
          <div className="eco-visual" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
