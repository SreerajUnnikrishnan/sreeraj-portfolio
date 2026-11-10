import { Brain, Code2, Cpu, Layers, Network, Radar, ShieldAlert, ShieldCheck, Smartphone, Terminal } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Project } from '../data/portfolioData'
import flsirImg from '../assets/flsir-architecture.jpg'

const IMAGES: Record<NonNullable<Project['image']>, string> = { flsir: flsirImg }

const GLYPHS: Record<string, LucideIcon> = {
  jeztbrain: Brain,
  'jeztbrain-cortex': Cpu,
  flsir: Network,
  'fullstack-supabase-platform': Code2,
  'flutter-mobile-systems': Smartphone,
  'webapp-pentest-audit': ShieldAlert,
  'python-recon-scanner': Radar,
  'ad-offensive-lab': Terminal,
  'portfolio-engine': Layers,
}

/** Project hero art: real architecture diagram when available, otherwise a bespoke schematic composition. */
export default function ProjectVisual({ project, eager = false }: { project: Project; eager?: boolean }) {
  if (project.image) {
    return (
      <div className={`pv pv-image accent-${project.accent}`}>
        <img
          src={IMAGES[project.image]}
          alt={project.imageAlt ?? project.title}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
        />
        <span className="pv-caption mono">ARCHITECTURE ILLUSTRATION</span>
      </div>
    )
  }
  const Glyph = GLYPHS[project.id] ?? ShieldCheck
  return (
    <div className={`pv pv-gen accent-${project.accent}`} role="img" aria-label={`${project.title} schematic visual`}>
      <svg className="pv-bg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <circle
            key={i}
            cx={200}
            cy={150}
            r={38 + i * 34}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.44 - i * 0.06}
            strokeDasharray={i % 2 ? '3 7' : undefined}
          />
        ))}
        <line x1={200} y1={16} x2={200} y2={284} stroke="currentColor" strokeOpacity={0.12} strokeDasharray="2 6" />
        <line x1={24} y1={150} x2={376} y2={150} stroke="currentColor" strokeOpacity={0.12} strokeDasharray="2 6" />
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={i} x1={0} x2={400} y1={i * 38 + 16} y2={i * 38 + 16} stroke="currentColor" strokeOpacity={0.05} />
        ))}
      </svg>
      <div className="pv-badge">
        <Glyph className="pv-glyph" strokeWidth={1.3} aria-hidden="true" />
      </div>
      <span className="pv-caption mono">{project.categories[0].toUpperCase()}</span>
    </div>
  )
}
