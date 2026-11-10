import { Suspense, lazy, useEffect, useState } from 'react'
import { ScrollProvider } from './lib/ScrollProvider'
import { ProjectProvider } from './lib/ProjectContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Ecosystem from './components/Ecosystem'
import FeaturedShowcase from './components/FeaturedShowcase'
import ProjectArchive from './components/ProjectArchive'
import Experience from './components/Experience'
import Research from './components/Research'
import Skills from './components/Skills'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ProjectModal from './components/ProjectModal'

// The WebGL bundle (three + R3F + drei) is fetched after first paint and never blocks content.
const SceneHost = lazy(() => import('./scene/SceneHost'))

export default function App() {
  const [mountScene, setMountScene] = useState(false)

  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
    const start = () => setMountScene(true)
    if (w.requestIdleCallback) w.requestIdleCallback(start, { timeout: 1200 })
    else setTimeout(start, 300)
  }, [])

  return (
    <ScrollProvider>
      <ProjectProvider>
        <a className="skip-link" href="#about">
          Skip to content
        </a>
        {mountScene && (
          <Suspense fallback={null}>
            <SceneHost />
          </Suspense>
        )}
        <Navbar />
        <main>
          <Hero />
          <About />
          <Ecosystem />
          <FeaturedShowcase />
          <ProjectArchive />
          <Experience />
          <Research />
          <Skills />
          <Contact />
        </main>
        <Footer />
        <ProjectModal />
      </ProjectProvider>
    </ScrollProvider>
  )
}

