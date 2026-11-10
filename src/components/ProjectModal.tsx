import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, X } from 'lucide-react'
import { useProjectModal } from '../lib/ProjectContext'
import { useScroll } from '../lib/ScrollProvider'
import ProjectVisual from './ProjectVisual'
import { MaturityChip } from './ui'

export default function ProjectModal() {
  const { active, close } = useProjectModal()
  const { stop, start } = useScroll()
  const closeBtn = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return
    returnFocus.current = document.activeElement as HTMLElement | null
    stop()
    document.documentElement.style.overflow = 'hidden'
    closeBtn.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'Tab' && dialog.current) {
        const f = dialog.current.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      start()
      returnFocus.current?.focus?.()
    }
  }, [active, close, stop, start])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={close}
        >
          <motion.div
            ref={dialog}
            className={`modal glass accent-${active.accent}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, y: 40, scale: 0.96, rotateX: 6 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
          >
            <button ref={closeBtn} className="modal-close" onClick={close} aria-label="Close case study">
              <X size={18} />
            </button>
            <ProjectVisual project={active} eager />
            <div className="modal-body">
              <div className="mono modal-kicker">
                {active.categories.join(' · ')} — {active.status}
              </div>
              <h3 id="modal-title">{active.title}</h3>
              <p className="modal-tagline">{active.tagline}</p>
              {active.story.map((s, i) => (
                <p key={i}>{s}</p>
              ))}

              {active.capabilities && (
                <>
                  <h4 className="mono">CAPABILITIES · MATURITY</h4>
                  <ul className="cap-list">
                    {active.capabilities.map((c) => (
                      <li key={c.label}>
                        <div>
                          <strong>{c.label}</strong>
                          <span>{c.detail}</span>
                        </div>
                        <MaturityChip maturity={c.maturity} />
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <h4 className="mono">STACK</h4>
              <ul className="tag-row">
                {active.stack.map((s) => (
                  <li key={s} className="tag mono">
                    {s}
                  </li>
                ))}
              </ul>

              {active.links.length > 0 && (
                <div className="modal-links">
                  {active.links.map((l) => (
                    <a key={l.href} className="btn btn-ghost" href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label} <ExternalLink size={14} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

