import { useSyncExternalStore } from 'react'

function subscribeTo(query: string) {
  return (cb: () => void) => {
    const mql = window.matchMedia(query)
    mql.addEventListener('change', cb)
    return () => mql.removeEventListener('change', cb)
  }
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    subscribeTo(query),
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Viewports under 768px get touch-native alternatives to pinned/3D interactions. */
export const useIsMobile = () => useMediaQuery('(max-width: 767px)')

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

/** True for devices whose primary pointer is coarse (touch). */
export const useCoarsePointer = () => useMediaQuery('(pointer: coarse)')

