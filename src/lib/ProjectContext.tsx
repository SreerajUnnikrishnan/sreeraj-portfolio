import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { publicProjects } from '../data/portfolioData'
import type { Project } from '../data/portfolioData'

interface ProjectApi {
  active: Project | null
  open: (id: string) => void
  close: () => void
}

const ProjectContext = createContext<ProjectApi>({ active: null, open: () => {}, close: () => {} })

export const useProjectModal = () => useContext(ProjectContext)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<Project | null>(null)
  const open = useCallback((id: string) => {
    setActive(publicProjects.find((p) => p.id === id) ?? null)
  }, [])
  const close = useCallback(() => setActive(null), [])
  const value = useMemo(() => ({ active, open, close }), [active, open, close])
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

