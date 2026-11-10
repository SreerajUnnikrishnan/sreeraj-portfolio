import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowUpRight, Briefcase, Mail, MessagesSquare } from 'lucide-react'
import { profile } from '../data/portfolioData'
import { GithubIcon, InstagramIcon, LinkedinIcon } from './BrandIcons'
import { usePrefersReducedMotion } from '../hooks/useMedia'

const EASE = [0.22, 1, 0.36, 1] as const

type Intent = 'role' | 'consult'
const INTENTS: Record<Intent, { label: string; subject: string; icon: typeof Briefcase }> = {
  role: { label: 'Full-Time Engineering Role', subject: 'Full-Time Engineering Opportunity', icon: Briefcase },
  consult: { label: 'Freelance & Collaboration', subject: 'Selected Freelance / Technical Collaboration', icon: MessagesSquare },
}

const SOCIAL_ICONS: Record<string, typeof Mail> = {
  Email: Mail,
  LinkedIn: LinkedinIcon as unknown as typeof Mail,
  GitHub: GithubIcon as unknown as typeof Mail,
  Instagram: InstagramIcon as unknown as typeof Mail,
}

/** CTA that leans toward the cursor with spring physics. */
function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.5 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.5 })

  const move = (e: React.PointerEvent) => {
    if (reduced || e.pointerType === 'touch' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.25)
  }
  const leave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button ref={ref} type="submit" className="btn btn-primary btn-lg" style={{ x, y }} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </motion.button>
  )
}

export default function Contact() {
  const [intent, setIntent] = useState<Intent>('role')
  const [name, setName] = useState('')
  const [from, setFrom] = useState('')
  const [message, setMessage] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const subject = `[${INTENTS[intent].subject}] ${name || 'Hello Sreeraj'}`
    const body = `${message}\n\n—\n${name}${from ? ` <${from}>` : ''}`
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const headline = ['Let’s', 'build', 'something', 'resilient.']

  return (
    <section id="contact" className="section contact">
      <div className="container contact-grid">
        <div className="contact-copy">
          <span className="mono eyebrow">
            <span className="eyebrow-index">08</span> / CONTACT
          </span>
          <motion.h2
            className="contact-headline"
            aria-label={headline.join(' ')}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ staggerChildren: 0.12 }}
          >
            {headline.map((w) => (
              <span className="mask" key={w} aria-hidden="true">
                <motion.span
                  variants={{ hidden: { y: '115%' }, show: { y: '0%' } }}
                  transition={{ duration: 1, ease: EASE }}
                >
                  {w}&nbsp;
                </motion.span>
              </span>
            ))}
          </motion.h2>
          <motion.p
            className="contact-lead"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          >
            Open to Full-Time Engineering Opportunities across cybersecurity, full-stack software development, and AI systems, as well as Selected Freelance &amp; Technical Collaborations.
          </motion.p>

          <ul className="social-list">
            {profile.socials.map((s, i) => {
              const Icon = SOCIAL_ICONS[s.label] ?? Mail
              return (
                <motion.li
                  key={s.label}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 + i * 0.08, ease: EASE }}
                >
                  <a href={s.href} target={s.href.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer">
                    <Icon width={18} height={18} aria-hidden="true" />
                    <span>
                      <strong>{s.label}</strong>
                      <em className="mono">{s.handle}</em>
                    </span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </motion.li>
              )
            })}
          </ul>
        </div>

        <motion.form
          className="contact-form glass"
          onSubmit={submit}
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 1, ease: EASE, delay: 0.2 }}
        >
          <fieldset className="intent">
            <legend className="mono">I’M REACHING OUT ABOUT</legend>
            {(Object.keys(INTENTS) as Intent[]).map((k) => {
              const I = INTENTS[k].icon
              return (
                <label key={k} className={intent === k ? 'is-active' : ''}>
                  <input type="radio" name="intent" checked={intent === k} onChange={() => setIntent(k)} />
                  <I size={16} aria-hidden="true" /> {INTENTS[k].label}
                </label>
              )
            })}
          </fieldset>

          <label className="field">
            <span className="mono">NAME</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </label>
          <label className="field">
            <span className="mono">EMAIL</span>
            <input type="email" value={from} onChange={(e) => setFrom(e.target.value)} autoComplete="email" required />
          </label>
          <label className="field">
            <span className="mono">MESSAGE</span>
            <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
          </label>

          <MagneticButton>
            Send message <ArrowUpRight size={18} />
          </MagneticButton>
          <p className="form-note mono">Opens your email client with the message pre-filled.</p>
        </motion.form>
      </div>
    </section>
  )
}
