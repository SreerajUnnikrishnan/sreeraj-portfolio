import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ArrowDown, ArrowUpRight, Mail } from 'lucide-react'
import { profile } from '../data/portfolioData'
import { useScroll } from '../lib/ScrollProvider'
import { usePrefersReducedMotion } from '../hooks/useMedia'
import type { PillarIndex } from '../scene/HeroSculpture'

const HeroSculpture = lazy(() => import('../scene/HeroSculpture'))

const EASE = [0.22, 1, 0.36, 1] as const

const HERO_PILLARS: { index: 0 | 1 | 2 | 3; label: string; value: string; accent: string }[] = [
  {
    index: 0,
    label: 'DISCIPLINES',
    value: 'Security · Full-Stack · AI',
    accent: '#10B981',
  },
  {
    index: 1,
    label: 'PUBLISHED RESEARCH',
    value: 'IEEE Federated ML (FLSIR)',
    accent: '#8B5CF6',
  },
  {
    index: 2,
    label: 'ENGINEERING STACK',
    value: 'React · Node · Python · Flutter',
    accent: '#38BDF8',
  },
  {
    index: 3,
    label: 'R&D ECOSYSTEM',
    value: 'JEZTBRAIN & CORTEX Core',
    accent: '#F59E0B',
  },
]

function SplitHeadline({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <h1 className="hero-headline" aria-label={text}>
      {words.map((w, wi) => (
        <span className="hero-word" key={wi} aria-hidden="true">
          {w.split('').map((c, ci) => (
            <motion.span
              key={ci}
              className="hero-char"
              initial={{ y: '110%', opacity: 0, filter: 'blur(10px)' }}
              animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.95, ease: EASE, delay: 0.1 + (wi * 8 + ci) * 0.026 }}
            >
              {c}
            </motion.span>
          ))}
        </span>
      ))}
    </h1>
  )
}

export default function Hero() {
  const { scrollTo } = useScroll()
  const reduced = usePrefersReducedMotion()
  const content = useRef<HTMLDivElement>(null)
  const [activePillar, setActivePillar] = useState<PillarIndex>(null)

  useEffect(() => {
    if (reduced || !content.current) return
    const ctx = gsap.context(() => {
      gsap.to(content.current, {
        yPercent: -8,
        scale: 0.97,
        opacity: 0,
        filter: 'blur(6px)',
        ease: 'none',
        scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom 20%', scrub: true },
      })
    })
    return () => ctx.revert()
  }, [reduced])

  return (
    <section id="home" className="hero" aria-label="Introduction">
      <div className="hero-shell" ref={content}>
        <div className="hero-inner hero-layout">
          <div className="hero-copy">
            <SplitHeadline text={profile.headline} />

            <motion.h2
              className="hero-tagline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.68, ease: EASE }}
            >
              {profile.tagline}
            </motion.h2>

            <motion.p
              className="hero-desc"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.84, ease: EASE }}
            >
              {profile.description}
            </motion.p>

            <motion.p
              className="hero-availability mono"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.98, ease: EASE }}
            >
              <span className="availability-dot" aria-hidden="true" />
              <span>{profile.statusBadge}</span>
            </motion.p>

            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.1, ease: EASE }}
            >
              <button className="btn btn-primary" onClick={() => scrollTo('featured')}>
                Explore selected works <ArrowUpRight size={16} />
              </button>
              <button className="btn btn-ghost" onClick={() => scrollTo('contact')}>
                <Mail size={16} /> Full-time &amp; freelance inquiry
              </button>
            </motion.div>
          </div>

          <motion.div
            className="hero-sculpture-col"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.25, delay: 0.35, ease: EASE }}
          >
            <Suspense fallback={null}>
              <HeroSculpture activePillar={activePillar} />
            </Suspense>
          </motion.div>
        </div>

        {/* Full-Width 4-Column Architectural Metadata Strip */}
        <motion.div
          className="hero-spec-bar"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, delay: 1.22, ease: EASE }}
          onMouseLeave={() => setActivePillar(null)}
        >
          <div className="hero-spec-inner">
            {HERO_PILLARS.map((item) => {
              const isActive = activePillar === item.index
              return (
                <div
                  key={item.label}
                  className={`hero-spec-col ${isActive ? 'is-active' : ''}`}
                  style={{ ['--spec-accent' as string]: item.accent }}
                  onMouseEnter={() => setActivePillar(item.index)}
                >
                  <span className="hero-spec-label mono">{item.label}</span>
                  <strong className="hero-spec-value">{item.value}</strong>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      <motion.button
        className="scroll-cue mono"
        onClick={() => scrollTo('about')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.75, duration: 1 }}
        aria-label="Scroll to about section"
      >
        SCROLL <ArrowDown size={14} />
      </motion.button>
    </section>
  )
}
