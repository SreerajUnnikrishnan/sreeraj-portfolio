import { ArrowUpRight, BadgeCheck, FlaskConical, Loader, Shield } from 'lucide-react'
import { certifications, research } from '../data/portfolioData'
import { useProjectModal } from '../lib/ProjectContext'
import SpotlightCard from './SpotlightCard'
import { Reveal, SectionHeading } from './ui'

export default function Research() {
  const { open } = useProjectModal()

  return (
    <section id="research" className="section research">
      <div className="container">
        <SectionHeading
          index="06"
          eyebrow="RESEARCH & CREDENTIALS"
          title="Research, labs and certifications."
          lead="Peer-reviewed academic publication, applied federated-learning security research, and hands-on offensive credentials."
        />

        <div className="research-grid">
          {research.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.08}>
              <SpotlightCard
                as={r.projectId ? 'button' : 'div'}
                accent={r.accent}
                className={`research-card ${r.projectId ? 'is-interactive' : ''}`}
                onClick={r.projectId ? () => open(r.projectId!) : undefined}
              >
                <div className="research-top">
                  <FlaskConical size={20} className="research-icon" aria-hidden="true" />
                  {r.projectId && (
                    <span className="mono research-cta">
                      Architecture <ArrowUpRight size={14} aria-hidden="true" />
                    </span>
                  )}
                </div>
                <span className="mono research-venue">{r.venue}</span>
                <h3>{r.title}</h3>
                <p>{r.summary}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>

        <div className="cert-grid">
          {certifications.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.06}>
              <SpotlightCard accent={c.accent} className="cert-card">
                <div className="cert-top">
                  <Shield size={18} className="cert-shield" aria-hidden="true" />
                  <span className={`cert-status mono ${c.status === 'Completed' ? 'is-done' : 'is-progress'}`}>
                    {c.status === 'Completed' ? <BadgeCheck size={13} aria-hidden="true" /> : <Loader size={13} aria-hidden="true" />}
                    {c.status}
                  </span>
                </div>
                <h3 className="cert-name mono">{c.name}</h3>
                <p className="cert-full">{c.full}</p>
                <p className="mono cert-note">{c.note}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
