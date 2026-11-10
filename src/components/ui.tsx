import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { Maturity } from '../data/portfolioData'
import { MATURITY_LABEL } from '../data/portfolioData'

export function MaturityChip({ maturity }: { maturity: Maturity }) {
  return <span className={`maturity maturity-${maturity}`}>{MATURITY_LABEL[maturity]}</span>
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  lead,
}: {
  index: string
  eyebrow: string
  title: string
  lead?: ReactNode
}) {
  return (
    <motion.header
      className="section-heading"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="mono eyebrow">
        <span className="eyebrow-index">{index}</span> / {eyebrow}
      </span>
      <h2>{title}</h2>
      {lead && <p className="lead">{lead}</p>}
    </motion.header>
  )
}

export function Reveal({
  children,
  delay = 0,
  className = '',
  y = 24,
}: {
  children: ReactNode
  delay?: number
  className?: string
  y?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Renders **bold** segments from data strings. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

