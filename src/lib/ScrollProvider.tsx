import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '../hooks/useMedia'

gsap.registerPlugin(ScrollTrigger)

interface ScrollApi {
  scrollTo: (id: string) => void
  stop: () => void
  start: () => void
}

const ScrollContext = createContext<ScrollApi>({
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
})

export const useScroll = () => useContext(ScrollContext)

/**
 * Lenis inertia scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis
 * share a single clock. Disabled for prefers-reduced-motion. On touch devices
 * Lenis leaves native scrolling untouched (syncTouch is off).
 */
export function ScrollProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion()
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduced])

  // Pinned layouts depend on final font/image metrics.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh).catch(() => {})
    return () => window.removeEventListener('load', refresh)
  }, [])

  const scrollTo = useCallback(
    (id: string) => {
      const el = document.getElementById(id)
      if (!el) return
      if (lenisRef.current) {
        lenisRef.current.scrollTo(el, { duration: 1.6, offset: 0 })
      } else {
        el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
      }
    },
    [reduced],
  )

  const api = useMemo<ScrollApi>(
    () => ({
      scrollTo,
      stop: () => lenisRef.current?.stop(),
      start: () => lenisRef.current?.start(),
    }),
    [scrollTo],
  )

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>
}

