import { useEffect, useRef, useState } from 'react'
import { skillGroups } from '../data/portfolioData'
import SpotlightCard from './SpotlightCard'
import TiltCard from './TiltCard'
import { Reveal, SectionHeading } from './ui'

const ORBIT = [
  'React',
  'Next.js',
  'Flutter',
  'Supabase',
  'Node.js',
  'PostgreSQL',
  'Python',
  'TypeScript',
  'Burp Suite',
  'Nmap',
  'Metasploit',
  'CORTEX',
]

/** Hardware-accelerated CSS 3D tech ring; staggered planes prevent collisions; pauses off-screen. */
function TechOrbit() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.1 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className="orbit-wrap" ref={ref} aria-hidden="true">
      <div className="orbit" data-run={visible}>
        {ORBIT.map((t, i) => {
          const a = (360 / ORBIT.length) * i
          const yOff = i % 2 === 0 ? -24 : 24
          return (
            <span
              key={t}
              className="orbit-item"
              style={{ transform: `translate3d(-50%, calc(-50% + ${yOff}px), 0) rotateY(${a}deg) translateZ(var(--orbit-r))` }}
            >
              <span className="orbit-label mono" style={{ ['--a' as string]: `${a}deg` }}>
                {t}
              </span>
            </span>
          )
        })}
      </div>
      <div className="orbit-core" />
    </div>
  )
}

export default function Skills() {
  const [first, second, third, fourth] = skillGroups

  return (
    <section id="skills" className="section skills">
      <div className="container">
        <SectionHeading
          index="07"
          eyebrow="TECHNOLOGY & ARSENAL"
          title="One stack, from exploit to production."
          lead="Offensive security tooling, full-stack web & Flutter mobile engineering, and proactive AI automation under one roof."
        />

        <div className="bento">
          {[first, second, third].map((g, i) => (
            <Reveal key={g.id} delay={i * 0.07} className={`bento-cell span-${g.span}`}>
              <TiltCard max={5} className={`bento-tilt accent-${g.accent}`}>
                <SpotlightCard accent={g.accent} className="bento-card">
                  <h3 className="z-2">{g.title}</h3>
                  <p className="z-1">{g.blurb}</p>
                  <ul className="tag-row z-3">
                    {g.items.map((t) => (
                      <li key={t} className="tag mono">
                        {t}
                      </li>
                    ))}
                  </ul>
                </SpotlightCard>
              </TiltCard>
            </Reveal>
          ))}

          <Reveal delay={0.22} className="bento-cell span-orbit">
            <TiltCard max={5} className="bento-tilt accent-indigo">
              <SpotlightCard accent="indigo" className="bento-card orbit-card">
                <div className="orbit-head mono">
                  <span>STACK TELEMETRY</span>
                  <span className="orbit-live">3D · ACTIVE</span>
                </div>
                <TechOrbit />
              </SpotlightCard>
            </TiltCard>
          </Reveal>

          {fourth && (
            <Reveal delay={0.28} className={`bento-cell span-${fourth.span}`}>
              <TiltCard max={5} className={`bento-tilt accent-${fourth.accent}`}>
                <SpotlightCard accent={fourth.accent} className="bento-card">
                  <h3 className="z-2">{fourth.title}</h3>
                  <p className="z-1">{fourth.blurb}</p>
                  <ul className="tag-row z-3">
                    {fourth.items.map((t) => (
                      <li key={t} className="tag mono">
                        {t}
                      </li>
                    ))}
                  </ul>
                </SpotlightCard>
              </TiltCard>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
