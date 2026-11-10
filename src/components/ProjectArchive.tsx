import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { ARCHIVE_FILTERS, publicProjects } from '../data/portfolioData'
import type { ArchiveFilter } from '../data/portfolioData'
import SpotlightCard from './SpotlightCard'
import { SectionHeading } from './ui'
import { useProjectModal } from '../lib/ProjectContext'

export default function ProjectArchive() {
  const [filter, setFilter] = useState<ArchiveFilter>('All Works')
  const { open } = useProjectModal()

  const counts = useMemo(() => {
    const map = {} as Record<ArchiveFilter, number>
    for (const f of ARCHIVE_FILTERS) {
      map[f] = f === 'All Works' ? publicProjects.length : publicProjects.filter((p) => p.categories.includes(f)).length
    }
    return map
  }, [])

  const list = useMemo(
    () => (filter === 'All Works' ? publicProjects : publicProjects.filter((p) => p.categories.includes(filter))),
    [filter],
  )

  return (
    <section id="archive" className="section archive">
      <div className="container">
        <SectionHeading
          index="04"
          eyebrow="PROJECT ARCHIVE"
          title="The complete vault."
          lead="Every verified project, filterable by discipline. Open any entry for the full case study."
        />

        <div className="filter-bar" role="tablist" aria-label="Project categories">
          {ARCHIVE_FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              className={`chip ${filter === f ? 'is-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
              <span className="chip-count mono">{counts[f]}</span>
            </button>
          ))}
        </div>

        <motion.div layout className="archive-grid" role="tabpanel" aria-live="polite">
          <AnimatePresence mode="popLayout">
            {list.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <SpotlightCard
                  as="button"
                  accent={p.accent}
                  className="archive-card"
                  onClick={() => open(p.id)}
                  aria-label={`Open case study: ${p.title}`}
                >
                  <span className="mono archive-cat">{p.categories[0]}</span>
                  <h3>{p.title}</h3>
                  <p>{p.tagline}</p>
                  <ul className="tag-row">
                    {p.stack.slice(0, 4).map((s) => (
                      <li key={s} className="tag mono">
                        {s}
                      </li>
                    ))}
                  </ul>
                  <ArrowUpRight className="archive-arrow" size={18} aria-hidden="true" />
                </SpotlightCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {list.length === 0 && (
          <div className="glass empty-state">
            <p className="mono">NO PUBLISHED CASE STUDIES IN THIS CATEGORY YET</p>
            <p>New work is added to this archive as it is verified and documented.</p>
          </div>
        )}
      </div>
    </section>
  )
}

