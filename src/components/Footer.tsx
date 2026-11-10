import { profile } from '../data/portfolioData'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p className="mono">
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="mono footer-meta">Cybersecurity · Full-Stack · AI — a JeztBrain initiative</p>
      </div>
    </footer>
  )
}

