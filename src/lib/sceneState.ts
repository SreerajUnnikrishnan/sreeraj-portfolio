/**
 * Mutable, non-reactive state shared between DOM sections and the WebGL scene.
 * Read inside `useFrame`; written by scroll/pointer handlers and GSAP ScrollTrigger.
 * Kept outside React so that 60fps updates never trigger re-renders.
 */
export interface ScreenAnchor {
  x: number
  y: number
  visible: boolean
}

export const sceneState = {
  /** 0 → 1: exploded → fully assembled, driven by ScrollTrigger from Hero to the JEZTBRAIN section. */
  assemble: 0,
  /** 0 → 1 progress through the pinned JEZTBRAIN / CORTEX story. */
  eco: 0,
  /** Normalized scroll velocity (0 → 1) used for subtle reactive lighting. */
  scrollVel: 0,
  /** Normalised pointer, -1 → 1. */
  mx: 0,
  my: 0,
  /** Whether a real pointer has moved yet (avoids a jump on load). */
  pointerActive: false,
  /** 0 → 1 visibility of the CORTEX callout labels. */
  calloutT: 0,
  /** Screen-space (px) projections of the five CORTEX hardware anchors, written by the scene every frame. */
  anchors: Array.from({ length: 5 }, (): ScreenAnchor => ({ x: 0, y: 0, visible: false })),
}
