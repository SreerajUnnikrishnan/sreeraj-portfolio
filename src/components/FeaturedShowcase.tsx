import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight } from 'lucide-react'
import { featuredProjects } from '../data/portfolioData'
import type { Project } from '../data/portfolioData'
import TiltCard from './TiltCard'
import ProjectVisual from './ProjectVisual'
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useMedia'
import { useProjectModal } from '../lib/ProjectContext'

const pad = (n: number) => String(n).padStart(2, '0')

function FeaturedCard({ project, index, total }: { project: Project; index: number; total: number }) {
  const { open } = useProjectModal()
  return (
    <TiltCard className={`glass spotlight featured-card accent-${project.accent}`}>
      <div className="featured-visual z-1">
        <ProjectVisual project={project} eager={index === 0} />
      </div>
      <div className="featured-body">
        <div className="featured-meta mono z-2">
          <span>
            {pad(index + 1)} / {pad(total)}
          </span>
          <span className="featured-status">{project.status}</span>
        </div>
        <h3 className="z-3">{project.title}</h3>
        <p className="featured-tagline z-2">{project.tagline}</p>
        <p className="featured-summary z-1">{project.summary}</p>
        <ul className="tag-row z-1">
          {project.stack.slice(0, 6).map((s) => (
            <li key={s} className="tag mono">
              {s}
            </li>
          ))}
        </ul>
        <button className="btn btn-primary z-3" onClick={() => open(project.id)}>
          Explore architecture <ArrowUpRight size={16} />
        </button>
      </div>
    </TiltCard>
  )
}

export default function FeaturedShowcase() {
  const mobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  const native = mobile || reduced
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const stRef = useRef<ScrollTrigger | null>(null)
  const [active, setActive] = useState(0)
  const total = featuredProjects.length

  // Pinned horizontal storytelling (desktop, motion allowed).
  useEffect(() => {
    if (native || !root.current || !track.current) return
    const trackEl = track.current
    const cards = Array.from(trackEl.querySelectorAll<HTMLElement>('[data-card]'))
    let current = -1

    const ctx = gsap.context(() => {
      const dist = () => Math.max(0, trackEl.scrollWidth - window.innerWidth)

      const applyDepth = (x: number) => {
        const vw = window.innerWidth
        let nearest = 0
        let best = Infinity
        cards.forEach((card, i) => {
          const center = card.offsetLeft + card.offsetWidth / 2 + x
          const off = (center - vw / 2) / vw // -1..1 around the focal point
          const a = Math.min(1, Math.abs(off))
          gsap.set(card, {
            rotationY: -off * 24,
            z: -a * 300,
            scale: 1 - a * 0.13,
            opacity: 1 - a * 0.52,
            transformPerspective: 1400,
          })
          if (Math.abs(off) < best) {
            best = Math.abs(off)
            nearest = i
          }
        })
        if (nearest !== current) {
          current = nearest
          setActive(nearest)
        }
      }

      applyDepth(0)
      const tween = gsap.to(trackEl, {
        x: () => -dist(),
        ease: 'none',
        onUpdate: function (this: gsap.core.Tween) {
          applyDepth(Number(gsap.getProperty(trackEl, 'x')))
          if (bar.current) bar.current.style.transform = `scaleX(${this.progress()})`
        },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${dist() * 1.12}`,
          pin: true,
          scrub: 0.55,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: () => applyDepth(Number(gsap.getProperty(trackEl, 'x'))),
        },
      })
      stRef.current = tween.scrollTrigger ?? null
    }, root)

    return () => {
      stRef.current = null
      ctx.revert()
    }
  }, [native])

  // Touch / reduced-motion: native horizontal swipe with scroll-snap.
  useEffect(() => {
    if (!native || !track.current) return
    const el = track.current
    const onScroll = () => {
      const card = el.querySelector<HTMLElement>('[data-card]')
      if (!card) return
      const step = card.offsetWidth + 16
      setActive(Math.max(0, Math.min(total - 1, Math.round(el.scrollLeft / step))))
      const max = el.scrollWidth - el.clientWidth
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? el.scrollLeft / max : 0})`
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [native, total])

  useEffect(() => {
    if (native) ScrollTrigger.refresh()
  }, [native])

  const jumpTo = (idx: number) => {
    const ratio = total > 1 ? idx / (total - 1) : 0
    if (native && track.current) {
      const max = track.current.scrollWidth - track.current.clientWidth
      track.current.scrollTo({ left: max * ratio, behavior: reduced ? 'auto' : 'smooth' })
      return
    }
    const st = stRef.current
    if (st) {
      const y = st.start + (st.end - st.start) * ratio
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <section id="featured" ref={root} className={`featured ${native ? 'featured-native' : ''}`} aria-label="Featured projects">
      <div className="featured-stage">
        <div className="container featured-head">
          <div>
            <span className="mono eyebrow">
              <span className="eyebrow-index">03</span> / FEATURED WORK
            </span>
            <h2>Flagship systems &amp; R&amp;D</h2>
          </div>
          <div className="featured-telemetry">
            <div className="featured-dots" role="group" aria-label="Jump to featured project">
              {featuredProjects.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  className={`featured-dot ${active === i ? 'is-active' : ''}`}
                  aria-label={`Jump to ${p.title}`}
                  aria-current={active === i ? 'true' : undefined}
                  onClick={() => jumpTo(i)}
                />
              ))}
            </div>
            <div className="counter mono" aria-live="polite">
              <span className="counter-current">{pad(active + 1)}</span>
              <span className="counter-total"> / {pad(total)}</span>
            </div>
          </div>
        </div>

        <div className="featured-track" ref={track} tabIndex={native ? 0 : -1} aria-label={native ? 'Swipe through featured projects' : undefined}>
          {featuredProjects.map((p, i) => (
            <article className="featured-slot" data-card key={p.id} aria-label={p.title}>
              <FeaturedCard project={p} index={i} total={total} />
            </article>
          ))}
        </div>

        <div className="container featured-foot">
          <div className="progress-rail" aria-hidden="true">
            <div className="progress-fill" ref={bar} />
          </div>
          <span className="mono hint">{native ? 'SWIPE →' : 'SCROLL →'}</span>
        </div>
      </div>
    </section>
  )
}
