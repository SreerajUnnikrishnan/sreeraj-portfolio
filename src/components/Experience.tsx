import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { GraduationCap, MapPin } from 'lucide-react'
import { education, experience } from '../data/portfolioData'
import SpotlightCard from './SpotlightCard'
import { Reveal, SectionHeading } from './ui'

export default function Experience() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })
  const height = useTransform(fill, [0, 1], ['0%', '100%'])

  return (
    <section id="experience" className="section experience">
      <div className="container">
        <SectionHeading index="05" eyebrow="EXPERIENCE & EDUCATION" title="Where the work happens." />

        <div className="timeline" ref={ref}>
          <div className="timeline-rail" aria-hidden="true">
            <motion.div className="timeline-fill" style={{ height }} />
          </div>
          {experience.map((e, i) => (
            <Reveal key={e.org} delay={i * 0.06} className="timeline-item">
              <span className={`timeline-node accent-${e.accent}`} aria-hidden="true" />
              <SpotlightCard accent={e.accent} className="timeline-card">
                <div className="timeline-head">
                  <h3>{e.org}</h3>
                  {e.period && <span className="mono timeline-period">{e.period}</span>}
                </div>
                {e.role && <p className="timeline-role">{e.role}</p>}
                {e.summary && <p className="timeline-summary">{e.summary}</p>}
                <ul className="tag-row">
                  {e.tags.map((t) => (
                    <li key={t} className="tag mono">
                      {t}
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </Reveal>
          ))}

          <Reveal className="timeline-item">
            <span className="timeline-node accent-cyan" aria-hidden="true" />
            <SpotlightCard accent="cyan" className="timeline-card">
              <div className="timeline-head">
                <h3>
                  <GraduationCap size={18} aria-hidden="true" /> {education.school}
                </h3>
                <span className="mono timeline-period">{education.period}</span>
              </div>
              <p className="timeline-role">{education.degree}</p>
              <p className="mono edu-loc">
                <MapPin size={13} aria-hidden="true" /> {education.location}
              </p>
              <p className="timeline-summary">{education.focus}</p>
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

