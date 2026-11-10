import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll as useFmScroll, useSpring } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { navLinks } from '../data/portfolioData'
import { useScroll } from '../lib/ScrollProvider'

export default function Navbar() {
  const { scrollTo } = useScroll()
  const [active, setActive] = useState('home')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollYProgress } = useFmScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 })

  useEffect(() => {
    const ids = ['home', ...navLinks.map((l) => l.id)]
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const go = (id: string) => {
    setOpen(false)
    scrollTo(id)
  }

  return (
    <>
      <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
        <nav className="navbar-inner" aria-label="Primary">
          <button className="brand" onClick={() => go('home')} aria-label="Sreeraj Unnikrishnan, back to top">
            <span className="brand-name">Sreeraj Unnikrishnan</span>
          </button>

          <ul className="nav-links">
            {navLinks.map((l) => (
              <li key={l.id}>
                <button
                  className={active === l.id ? 'is-active' : ''}
                  aria-current={active === l.id ? 'true' : undefined}
                  onClick={() => go(l.id)}
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>

          <button className="nav-cta" onClick={() => go('contact')}>
            Get in touch
          </button>
          <button
            className="nav-toggle"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              className="nav-sheet glass"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {navLinks.map((l) => (
                <button key={l.id} className={active === l.id ? 'is-active' : ''} onClick={() => go(l.id)}>
                  {l.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
