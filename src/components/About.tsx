import { useRef } from 'react'
import type { PointerEvent as RPointerEvent } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Brain, Bug, Code2, Smartphone } from 'lucide-react'
import { profile } from '../data/portfolioData'
import { useCoarsePointer, usePrefersReducedMotion } from '../hooks/useMedia'
import sreerajPortrait from '../assets/sreeraj.png'
import { Reveal, RichText } from './ui'
import SpotlightCard from './SpotlightCard'

const pillars = [
  { icon: Bug, title: 'Offensive Security', text: 'Penetration testing, web/API security auditing, OSINT reconnaissance, and threat analysis.', accent: 'emerald' as const },
  { icon: Code2, title: 'Full-Stack Engineering', text: 'React, Next.js, Node.js, REST APIs, Supabase, PostgreSQL, and MongoDB architectures.', accent: 'cyan' as const },
  { icon: Smartphone, title: 'Mobile Applications', text: 'Cross-platform iOS & Android applications engineered with Flutter, Dart, and realtime sync.', accent: 'cyan' as const },
  { icon: Brain, title: 'AI & Automation', text: 'Proactive cognitive workflows, intelligent automation, and privacy-preserving ML.', accent: 'indigo' as const },
]

function PortraitCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const coarse = useCoarsePointer()
  const reduced = usePrefersReducedMotion()
  const disabled = coarse || reduced

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 200, damping: 22, mass: 0.6 })
  const sy = useSpring(my, { stiffness: 200, damping: 22, mass: 0.6 })

  // Subtle ±6deg 3D spring tilt + counter-shifted portrait parallax.
  const rotateY = useTransform(sx, [-0.5, 0.5], [-6, 6])
  const rotateX = useTransform(sy, [-0.5, 0.5], [6, -6])
  const imgX = useTransform(sx, [-0.5, 0.5], [-7, 7])
  const imgY = useTransform(sy, [-0.5, 0.5], [-5, 5])

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = e.clientX - r.left
    const py = e.clientY - r.top
    el.style.setProperty('--px', `${px}px`)
    el.style.setProperty('--py', `${py}px`)
    if (disabled) return
    mx.set(px / r.width - 0.5)
    my.set(py / r.height - 0.5)
  }

  const onLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <div className="portrait-perspective">
      <motion.div
        ref={cardRef}
        className="portrait-card"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={disabled ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
      >
        <div className="portrait-studio">
          <motion.div
            className="portrait-media"
            style={disabled ? undefined : { x: imgX, y: imgY, translateZ: 25 }}
          >
            <img
              src={sreerajPortrait}
              alt="Sreeraj Unnikrishnan — Cybersecurity Researcher, Software Engineer & AI Developer"
              className="portrait-img"
              loading="eager"
              decoding="async"
              draggable={false}
            />
          </motion.div>
          <div className="portrait-vignette" aria-hidden="true" />
          <div className="portrait-specular" aria-hidden="true" />
        </div>

        <div
          className="portrait-badge"
          style={disabled ? undefined : { transform: 'translateZ(36px)' }}
        >
          <span className="portrait-badge-dot" aria-hidden="true" />
          <div className="portrait-badge-stack">
            <strong className="portrait-badge-name">{profile.portraitTitle}</strong>
            <span className="portrait-badge-role mono">{profile.portraitRole}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="container about-stack">
        <div className="about-editorial">
          <Reveal className="about-copy">
            <span className="mono eyebrow">
              <span className="eyebrow-index">01</span> / ABOUT
            </span>
            <h2 className="about-headline">{profile.aboutHeadline}</h2>
            {profile.aboutBody.map((p, i) => (
              <p key={i} className="about-body">
                <RichText text={p} />
              </p>
            ))}
          </Reveal>

          <Reveal delay={0.12} className="about-portrait-col">
            <PortraitCard />
          </Reveal>
        </div>

        <div className="pillar-row">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={0.1 + i * 0.06} className="pillar-cell">
              <SpotlightCard accent={p.accent} className="pillar">
                <p.icon size={22} className="pillar-icon" aria-hidden="true" />
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
