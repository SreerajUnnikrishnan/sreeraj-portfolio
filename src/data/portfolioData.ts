/**
 * Centralised, typed data layer for Sreeraj Unnikrishnan's portfolio (V4.0).
 *
 * INTEGRITY NOTES
 * ---------------
 *  - Preserves all verified credentials, academic research, security labs,
 *    and engineering history while balancing Cybersecurity, Full-Stack Software
 *    Engineering, Flutter Mobile Development, and AI Innovation.
 *  - Positions `JEZTBRAIN CORTEX` as the proactive cognitive intelligence engine
 *    at the core of the `JEZTBRAIN` R&D ecosystem.
 *  - `maturity` explicitly separates shipped functionality (`implemented`),
 *    ongoing research & development (`rd`), and long-term direction (`vision`).
 */

export type Accent = 'emerald' | 'cyan' | 'indigo'

export type ProjectCategory =
  | 'Cybersecurity'
  | 'Software Development'
  | 'Web Applications'
  | 'Mobile Applications'
  | 'AI & Automation'
  | 'Research & Innovation'

export type ArchiveFilter = 'All Works' | ProjectCategory

export const ARCHIVE_FILTERS: ArchiveFilter[] = [
  'All Works',
  'Cybersecurity',
  'Software Development',
  'Web Applications',
  'Mobile Applications',
  'AI & Automation',
  'Research & Innovation',
]

export type Maturity = 'implemented' | 'rd' | 'vision'

export const MATURITY_LABEL: Record<Maturity, string> = {
  implemented: 'Implemented',
  rd: 'Active R&D',
  vision: 'Architectural Vision',
}

export interface CapabilityItem {
  label: string
  detail: string
  maturity: Maturity
}

export interface ProjectLink {
  label: string
  href: string
}

export interface Project {
  id: string
  title: string
  tagline: string
  summary: string
  /** Longer narrative for the case-study modal. */
  story: string[]
  categories: ProjectCategory[]
  accent: Accent
  stack: string[]
  featured: boolean
  /** Position inside the pinned showcase (lower first). */
  featuredOrder?: number
  /** Overall status of the project as a whole. */
  status: string
  capabilities?: CapabilityItem[]
  links: ProjectLink[]
  /** Optional illustration (resolved by the component via the asset map). */
  image?: 'flsir'
  imageAlt?: string
  visibility: 'public' | 'draft'
}

export interface Profile {
  name: string
  email: string
  location: string
  statusBadge: string
  preTitle: string
  headline: string
  tagline: string
  subHeadline: string
  description: string
  aboutHeadline: string
  aboutBody: string[]
  portraitTitle: string
  portraitRole: string
  socials: { label: string; href: string; handle: string }[]
}

export const profile: Profile = {
  name: 'Sreeraj Unnikrishnan',
  email: 'sreerajunnikrishnanofficial@gmail.com',
  location: 'Coimbatore, Tamil Nadu, India',
  statusBadge: 'Open to Full-Time Engineering Opportunities & Selected Freelance Collaborations.',
  preTitle: 'CYBERSECURITY ENGINEERING · FULL-STACK DEVELOPMENT · ARTIFICIAL INTELLIGENCE',
  headline: 'SREERAJ UNNIKRISHNAN',
  tagline: 'I Architect Intelligent Digital Experiences — And Engineer the Security That Makes Them Endure.',
  subHeadline: 'Systems-level software engineering, applied AI innovation, and offensive security resilience.',
  description:
    'I work at the intersection of software engineering, artificial intelligence, and cybersecurity — transforming complex technical challenges into intelligent applications, sophisticated digital systems, and resilient technology solutions. From architecting full-stack web and mobile experiences to exploring AI-driven innovation and offensive security research, I bring together the engineering discipline, analytical depth, and security-first thinking required to build technology that performs, adapts, and earns trust.',
  aboutHeadline: 'ENGINEERING RESILIENCE THROUGH OFFENSIVE INSIGHT & FULL-STACK MASTERY.',
  aboutBody: [
    'I operate across three reinforcing disciplines: full-stack software engineering, applied artificial intelligence, and offensive cybersecurity research. By pairing modern application architecture—React, Next.js, Node.js, Flutter, PostgreSQL, Supabase, and MongoDB—with adversarial penetration testing and threat modeling, I design and ship production systems where performance, scalability, and security are engineered into the foundation rather than bolted on after deployment.',
    'From architecting typed full-stack web platforms, custom backend APIs, and cross-platform mobile applications to conducting peer-reviewed research in privacy-preserving machine learning and building autonomous security workflows, my focus is empirical engineering rigor: creating intelligent software systems that remain resilient under real-world operational and adversarial pressure.',
  ],
  portraitTitle: 'Sreeraj Unnikrishnan',
  portraitRole: 'Cybersecurity Researcher · Software Engineer · AI Developer',
  socials: [
    { label: 'Email', href: 'mailto:sreerajunnikrishnanofficial@gmail.com', handle: 'sreerajunnikrishnanofficial@gmail.com' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sreeraj-unnikrishnan', handle: 'linkedin.com/in/sreeraj-unnikrishnan' },
    { label: 'GitHub', href: 'https://github.com/SreerajUnnikrishnan', handle: 'github.com/SreerajUnnikrishnan' },
    { label: 'Instagram', href: 'https://instagram.com/imsreeraj_', handle: 'instagram.com/imsreeraj_' },
  ],
}

/* ------------------------------------------------------------------ */
/* Projects (Featured 3D Stage + Complete Filterable Archive)          */
/* ------------------------------------------------------------------ */

export const projects: Project[] = [
  {
    id: 'jeztbrain',
    title: 'JEZTBRAIN',
    tagline: 'Technology innovation ecosystem & flagship R&D initiative',
    summary:
      'Founded by Sreeraj Unnikrishnan—inspired by the philosophy that the human brain is the catalyst behind every technological leap—uniting AI-powered applications, full-stack software engineering, and proactive cybersecurity research.',
    story: [
      'Founded and architected by Sreeraj Unnikrishnan, JEZTBRAIN is a dedicated technology innovation and R&D ecosystem where full-stack software engineering, applied artificial intelligence, and offensive security insight converge into cohesive digital systems.',
      'Structured as an R&D innovation initiative rather than a service agency, JEZTBRAIN serves as the architectural umbrella for intelligent workflow automation, vulnerability assessment tooling, and proactive threat analysis—powered at its core by JEZTBRAIN CORTEX.',
      'Engineered across Python, React, TypeScript, and Node.js with a live web presence at jeztbrain.com.',
    ],
    categories: ['Software Development', 'AI & Automation', 'Cybersecurity'],
    accent: 'emerald',
    stack: ['Python', 'React', 'Node.js', 'AI Security', 'Automation'],
    featured: true,
    featuredOrder: 1,
    status: 'Live ecosystem · active R&D',
    capabilities: [
      { label: 'Vulnerability assessment workflows', detail: 'AI-assisted surface analysis and security assessment pipelines.', maturity: 'implemented' },
      { label: 'Intelligent threat signal triage', detail: 'Context-aware correlation and prioritization of security telemetry.', maturity: 'rd' },
      { label: 'Defensive workflow automation', detail: 'Repeatable orchestration for reconnaissance and remediation checks.', maturity: 'rd' },
      { label: 'Unified multi-product ecosystem', detail: 'Shared identity, telemetry, and cognitive layer powered by JEZTBRAIN CORTEX.', maturity: 'vision' },
    ],
    links: [
      { label: 'jeztbrain.com', href: 'https://jeztbrain.com' },
      { label: 'GitHub', href: 'https://github.com/SreerajUnnikrishnan' },
    ],
    visibility: 'public',
  },
  {
    id: 'jeztbrain-cortex',
    title: 'JEZTBRAIN CORTEX',
    tagline: 'Core cognitive intelligence engine of the JEZTBRAIN ecosystem',
    summary:
      'The core intelligence engine of JEZTBRAIN—architected for autonomous workflow automation, security intelligence, continuous OSINT reconnaissance, and proactive vulnerability discovery beyond reactive chatbots.',
    story: [
      'JEZTBRAIN CORTEX is the central intelligence engine of the JEZTBRAIN ecosystem. Unlike reactive conversational interfaces that wait for human prompts, CORTEX is architected around proactive cognition—continuously observing, correlating, and surfacing actionable engineering and security intelligence.',
      'Built upon an implemented OSINT crawling and endpoint discovery foundation in Python, React, and Node.js, CORTEX expands into scheduled reconnaissance pipelines, multi-step workflow automation, and early vulnerability discovery.',
      'Every capability is transparently classified by engineering maturity: Implemented foundation, Active R&D, or long-term Architectural Vision.',
    ],
    categories: ['AI & Automation', 'Cybersecurity', 'Software Development'],
    accent: 'indigo',
    stack: ['Python', 'React', 'Node.js', 'OSINT', 'Autonomous Workflows'],
    featured: true,
    featuredOrder: 2,
    status: 'Core engine · foundation implemented, active R&D',
    capabilities: [
      { label: 'OSINT & Reconnaissance', detail: 'Digital intelligence gathering, surface mapping, and endpoint enumeration.', maturity: 'implemented' },
      { label: 'Continuous Recon', detail: 'Scheduled, delta-aware monitoring across target digital footprints.', maturity: 'rd' },
      { label: 'Workflow Automation', detail: 'Multi-step agentic orchestration across engineering and security pipelines.', maturity: 'rd' },
      { label: 'Vulnerability Discovery', detail: 'Correlating exposed endpoints and configurations against known weakness patterns.', maturity: 'rd' },
      { label: 'Security Intelligence', detail: 'Unified cognitive core delivering anticipatory risk posture before incidents escalate.', maturity: 'vision' },
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/SreerajUnnikrishnan' }],
    visibility: 'public',
  },
  {
    id: 'flsir',
    title: 'FLSIR',
    tagline: 'Federated Learning-Based Secure Image Retrieval',
    summary:
      'Privacy-preserving secure image retrieval architecture powered by federated learning, differential privacy, and deep feature extraction—keeping raw sensitive imagery decentralized at source nodes.',
    story: [
      'Centralizing sensitive medical or enterprise imagery introduces severe breach and compliance exposure. FLSIR addresses this by training deep feature-retrieval models collaboratively across decentralized nodes without transferring raw images.',
      'Each participating site trains locally, injects differential-privacy noise, and transmits encrypted gradient/model updates to an aggregation server to refine a global retrieval network.',
      'Developed as applied academic security & AI research by Sreeraj, paired with peer-reviewed publication work in the Journal of Xidian University.',
    ],
    categories: ['Research & Innovation', 'AI & Automation', 'Cybersecurity'],
    accent: 'indigo',
    stack: ['Python', 'Federated Learning', 'Deep Learning', 'Differential Privacy', 'Cryptography'],
    featured: true,
    featuredOrder: 3,
    status: 'Completed research architecture',
    capabilities: [
      { label: 'Decentralized local model training', detail: 'Feature learning on local image repositories without raw data export.', maturity: 'implemented' },
      { label: 'Privacy-preserving update aggregation', detail: 'Differential privacy noise injection and encrypted channel transport.', maturity: 'implemented' },
      { label: 'Secure similarity retrieval pipeline', detail: 'AI-driven image indexing and retrieval across federated representations.', maturity: 'implemented' },
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/SreerajUnnikrishnan' }],
    image: 'flsir',
    imageAlt:
      'Architecture diagram of FLSIR showing decentralized local training sites, differential privacy noise injection, encrypted channels, and global federated aggregator',
    visibility: 'public',
  },
  {
    id: 'fullstack-supabase-platform',
    title: 'Full-Stack Web & Supabase Systems',
    tagline: 'Security-hardened Next.js, React, Node.js & PostgreSQL production architecture',
    summary:
      'End-to-end full-stack web application engineering combining React, Next.js, Node.js, and Supabase/PostgreSQL—built with Row-Level Security, REST/realtime APIs, strict schema validation, and offensive-minded API hardening.',
    story: [
      'Modern web platforms frequently ship fast at the expense of authorization boundaries. Approaching full-stack development with an adversarial security mindset means every route, database policy, and session token is architected for resilience.',
      'This full-stack blueprint powers custom web applications, API backends, and internal dashboards using React, Next.js, TypeScript, Node.js, PostgreSQL/Supabase, and MongoDB—enforcing Postgres Row-Level Security (RLS), role-based access control, parameterized queries, and realtime telemetry.',
      'Applied across custom software builds, operational dashboards, and technical engineering collaborations.',
    ],
    categories: ['Web Applications', 'Software Development'],
    accent: 'cyan',
    stack: ['Next.js', 'React', 'TypeScript', 'Node.js', 'Supabase', 'PostgreSQL', 'MongoDB'],
    featured: true,
    featuredOrder: 4,
    status: 'Production engineering stack',
    capabilities: [
      { label: 'Next.js & React modular web applications', detail: 'Typed component systems, SSR/ISR routing, and responsive data-dense interfaces.', maturity: 'implemented' },
      { label: 'Database architecture & Supabase RLS', detail: 'Relational PostgreSQL & NoSQL MongoDB schemas with fine-grained Row-Level Security.', maturity: 'implemented' },
      { label: 'Hardened Node.js & REST API services', detail: 'Input validation, rate-limiting, least-privilege session tokens, and audit logging.', maturity: 'implemented' },
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/SreerajUnnikrishnan' }],
    visibility: 'public',
  },
  {
    id: 'flutter-mobile-systems',
    title: 'Flutter Cross-Platform Mobile Suite',
    tagline: 'Native-grade iOS & Android applications backed by Supabase & REST APIs',
    summary:
      'Cross-platform mobile application engineering in Flutter and Dart with encrypted credential storage, realtime Supabase/PostgreSQL synchronization, custom REST API integration, and resilient offline-capable state management.',
    story: [
      'Delivering cohesive products across mobile and web requires a unified data and security model. Using Flutter and Dart paired with Supabase and Node.js backends enables single-codebase delivery across Android and iOS without sacrificing 60fps UI responsiveness.',
      'Security practices from mobile penetration testing—encrypted local token storage, transport security hygiene, and strict server-side authorization—are integrated directly into the client architecture.',
      'Ongoing R&D also explores extending JEZTBRAIN CORTEX alerts and workflow triggers into a dedicated mobile companion interface.',
    ],
    categories: ['Mobile Applications', 'Software Development'],
    accent: 'cyan',
    stack: ['Flutter', 'Dart', 'Supabase', 'REST APIs', 'PostgreSQL', 'Mobile Security'],
    featured: true,
    featuredOrder: 5,
    status: 'Cross-platform engineering · companion R&D',
    capabilities: [
      { label: 'Cross-platform Flutter UI & state architecture', detail: 'Single-codebase Android & iOS interfaces with fluid motion and adaptive layouts.', maturity: 'implemented' },
      { label: 'Supabase auth, realtime & offline sync', detail: 'Authenticated session lifecycle, encrypted local storage, and live data streams.', maturity: 'implemented' },
      { label: 'JEZTBRAIN CORTEX mobile telemetry companion', detail: 'Mobile notification and workflow approval surface for CORTEX events.', maturity: 'rd' },
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/SreerajUnnikrishnan' }],
    visibility: 'public',
  },
  {
    id: 'webapp-pentest-audit',
    title: 'Web Application Pentest & OWASP Audit Lab',
    tagline: 'Adversarial security testing, vulnerability isolation & remediation playbooks',
    summary:
      'Structured web application penetration testing workflows covering OWASP Top 10 attack surfaces—authentication flaws, SQLi, XSS, SSRF, access-control bypasses, and developer-ready remediation engineering.',
    story: [
      'Built from hands-on offensive security assessments and lab engagements, this methodology systematically maps application endpoints, session handling, privilege boundaries, and injection vectors.',
      'Combines manual proxy interception in Burp Suite with targeted enumeration and validation using SQLMap, Nikto, Gobuster, and Dirb—translating raw findings into reproducible proof-of-concepts and concrete full-stack code patches.',
    ],
    categories: ['Cybersecurity', 'Web Applications'],
    accent: 'emerald',
    stack: ['Burp Suite', 'SQLMap', 'OWASP Top 10', 'Nikto', 'Gobuster', 'Dirb'],
    featured: false,
    status: 'Operational methodology',
    capabilities: [
      { label: 'Manual & proxy-driven OWASP auditing', detail: 'Auth/session, IDOR, injection, and business-logic flaw discovery via Burp Suite.', maturity: 'implemented' },
      { label: 'Developer-ready remediation guidance', detail: 'Root-cause analysis paired with concrete full-stack patch patterns.', maturity: 'implemented' },
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/SreerajUnnikrishnan' }],
    visibility: 'public',
  },
  {
    id: 'python-recon-scanner',
    title: 'Python Network & Recon Automation Toolkit',
    tagline: 'Custom offensive reconnaissance, port enumeration & banner triage software',
    summary:
      'Custom Python security and automation utilities for host discovery, service/banner enumeration, directory probing, and structured recon reporting across authorized targets and lab networks.',
    story: [
      'Repetitive reconnaissance phases slow down deep manual testing. These Python tools automate initial network discovery, port/service sweeps alongside Nmap, HTTP header inspection, and structured output normalization.',
      'Insights from building these modular CLI utilities directly informed the automated reconnaissance pipeline inside JEZTBRAIN CORTEX.',
    ],
    categories: ['Cybersecurity', 'Software Development', 'AI & Automation'],
    accent: 'emerald',
    stack: ['Python', 'Nmap', 'Linux', 'Network Security', 'CLI Automation'],
    featured: false,
    status: 'Implemented toolkit',
    links: [{ label: 'GitHub', href: 'https://github.com/SreerajUnnikrishnan' }],
    visibility: 'public',
  },
  {
    id: 'ad-offensive-lab',
    title: 'Enterprise & Ethical Hacking Homelab',
    tagline: 'Multi-node offensive/defensive simulation, packet analysis & OSCP prep lab',
    summary:
      'Virtualized offensive and defensive security lab environment for practicing network enumeration, Active Directory attack paths, exploitation, packet inspection, and system hardening.',
    story: [
      'Maintained for continuous offensive sharpening alongside TryHackMe and OSCP/CEH preparation, this isolated multi-VM lab models realistic enterprise network segments and vulnerable services.',
      'Covers the full engagement lifecycle—reconnaissance, exploitation with Metasploit, credential auditing with John the Ripper, PCAP traffic forensics in Wireshark, and post-incident defensive lock-down.',
    ],
    categories: ['Cybersecurity', 'Research & Innovation'],
    accent: 'emerald',
    stack: ['Kali Linux', 'Metasploit', 'Wireshark', 'Nmap', 'John the Ripper', 'Active Directory'],
    featured: false,
    status: 'Active lab environment',
    links: [{ label: 'TryHackMe', href: 'https://tryhackme.com' }],
    visibility: 'public',
  },
  {
    id: 'portfolio-engine',
    title: 'Cinematic 3D Web & Interactive Architecture',
    tagline: 'GPU-managed WebGL neural intelligence engine, GSAP ScrollTrigger & typed React system',
    summary:
      'The full-stack frontend and WebGL engineering behind www.sreerajunnikrishnan.com: a custom PBR & GLSL 3D neural architecture in React Three Fiber, Lenis + GSAP ScrollTrigger choreography, and a centralized TypeScript system.',
    story: [
      'Engineered as a high-performance React 19 + TypeScript web application with a single managed WebGL context, physically based lighting, and custom GLSL shaders.',
      'Lazy-loads the Three.js bundle after first paint, pauses GPU rendering via IntersectionObserver when off-screen, adapts DPR dynamically to frame rate, and provides native touch-scroll & responsive fallbacks on mobile viewports.',
    ],
    categories: ['Web Applications', 'Software Development'],
    accent: 'cyan',
    stack: ['React', 'TypeScript', 'Three.js', 'React Three Fiber', 'GSAP', 'Framer Motion', 'Lenis'],
    featured: false,
    status: 'Live production site',
    links: [{ label: 'sreerajunnikrishnan.com', href: 'https://www.sreerajunnikrishnan.com' }],
    visibility: 'public',
  },
]

export const publicProjects = projects.filter((p) => p.visibility === 'public')
export const featuredProjects = publicProjects
  .filter((p) => p.featured)
  .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99))

/* ------------------------------------------------------------------ */
/* Experience, research, education, certifications                     */
/* ------------------------------------------------------------------ */

export interface ExperienceItem {
  org: string
  role: string
  period?: string
  summary: string
  tags: string[]
  accent: Accent
}

export const experience: ExperienceItem[] = [
  {
    org: 'JEZTBRAIN',
    role: 'Founder & Lead Architect · R&D Innovation Ecosystem',
    period: 'Ongoing',
    summary:
      'Founded and architected the JEZTBRAIN technology innovation ecosystem and its core cognitive intelligence engine, JEZTBRAIN CORTEX—spanning full-stack software engineering, proactive AI workflow automation, OSINT reconnaissance, and vulnerability discovery.',
    tags: ['JEZTBRAIN CORTEX', 'Full-Stack Engineering', 'AI Security', 'OSINT', 'Automation'],
    accent: 'emerald',
  },
  {
    org: 'Offenso Hacker Academy',
    role: 'Cybersecurity & Penetration Testing',
    summary:
      'Hands-on offensive security operations, ethical hacking methodologies, web application and network vulnerability assessments, exploitation labs, and structured remediation reporting.',
    tags: ['Penetration Testing', 'Web App Security', 'Network Auditing', 'Ethical Hacking'],
    accent: 'cyan',
  },
  {
    org: 'Flextronics',
    role: 'Engineering & Enterprise Operations',
    summary:
      'Experience within global-scale technology and manufacturing systems, operating under structured engineering workflows, quality assurance standards, and enterprise operational reliability.',
    tags: ['Systems Engineering', 'Enterprise Workflows', 'Operations'],
    accent: 'indigo',
  },
]

export interface ResearchItem {
  title: string
  venue: string
  summary: string
  projectId?: string
  accent: Accent
}

export const research: ResearchItem[] = [
  {
    title: 'Privacy-Preserving AI & Secure Image Retrieval Research',
    venue: 'Journal of Xidian University · Peer-Reviewed Publication',
    summary:
      'Peer-reviewed academic research published in the Journal of Xidian University, investigating privacy-preserving machine learning and secure decentralized image retrieval architectures.',
    projectId: 'flsir',
    accent: 'indigo',
  },
  {
    title: 'FLSIR: Federated Learning-Based Secure Image Retrieval',
    venue: 'Applied Security & Deep Learning Architecture',
    summary:
      'Decentralized training and retrieval framework combining federated learning, differential privacy noise injection, and encrypted model-update aggregation channels.',
    projectId: 'flsir',
    accent: 'cyan',
  },
]

export const education = {
  degree: 'B.Tech — Information Technology',
  school: 'Hindusthan Institute of Technology',
  location: 'Coimbatore, Tamil Nadu',
  period: '2020 – 2024',
  focus:
    'Cryptography, Network Security, Database Administration, Python System Architecture, Design and Analysis of Algorithms, and Distributed Computing.',
}

export interface Certification {
  id: string
  name: string
  full: string
  status: 'Completed' | 'Pursuing'
  note: string
  accent: Accent
}

export const certifications: Certification[] = [
  {
    id: 'ocsp',
    name: 'OCSP',
    full: 'Offenso Certified Security Professional',
    status: 'Completed',
    note: 'Advanced hands-on security professional training and practical assessment completed via Offenso Hacker Academy',
    accent: 'emerald',
  },
  { id: 'ceh', name: 'CEH', full: 'Certified Ethical Hacker', status: 'Pursuing', note: 'Continuing exam & lab preparation', accent: 'cyan' },
  { id: 'thm', name: 'TryHackMe', full: 'Practical Cyber Security Learning Paths', status: 'Completed', note: 'Hands-on offensive & defensive labs', accent: 'cyan' },
  { id: 'labs', name: 'Ethical Hacking Labs', full: 'Advanced Penetration Testing & Security Labs', status: 'Completed', note: 'Practical vulnerability & exploit labs', accent: 'emerald' },
]

/* ------------------------------------------------------------------ */
/* Skills (3D Bento Grid)                                              */
/* ------------------------------------------------------------------ */

export interface SkillGroup {
  id: string
  title: string
  blurb: string
  accent: Accent
  items: string[]
  span: 'wide' | 'tall' | 'normal' | 'full'
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'security',
    title: 'Cybersecurity & Offensive Research',
    blurb: 'Adversarial penetration testing, vulnerability research, network auditing, and OSINT reconnaissance.',
    accent: 'emerald',
    items: ['Kali Linux', 'Burp Suite', 'Nmap', 'Metasploit', 'SQLMap', 'Wireshark', 'Nikto', 'Gobuster', 'John the Ripper', 'Dirb', 'OSINT', 'Threat Hunting', 'OWASP Top 10'],
    span: 'wide',
  },
  {
    id: 'mobile',
    title: 'Flutter & Mobile Engineering',
    blurb: 'Cross-platform iOS & Android applications with secure local storage and realtime API sync.',
    accent: 'cyan',
    items: ['Flutter', 'Dart', 'iOS & Android', 'Mobile Security', 'Secure Storage', 'Realtime Sync', 'REST APIs'],
    span: 'normal',
  },
  {
    id: 'fullstack',
    title: 'Full-Stack, Backend & Database Architecture',
    blurb: 'Scalable web applications, REST/realtime APIs, and hardened relational & NoSQL database schemas.',
    accent: 'cyan',
    items: ['React', 'Next.js', 'TypeScript', 'Node.js', 'REST APIs', 'Supabase', 'PostgreSQL', 'MongoDB', 'Row-Level Security', 'Custom Software'],
    span: 'normal',
  },
  {
    id: 'ai',
    title: 'AI Innovation & Autonomous Systems',
    blurb: 'Proactive cognitive engines, multi-step workflow automation, and privacy-preserving machine learning.',
    accent: 'indigo',
    items: ['Python', 'JEZTBRAIN CORTEX', 'AI-Powered Apps', 'Workflow Automation', 'Federated Learning', 'Deep Learning', 'Differential Privacy'],
    span: 'normal',
  },
]

/* ------------------------------------------------------------------ */
/* Navigation & SEO                                                    */
/* ------------------------------------------------------------------ */

export const navLinks = [
  { id: 'about', label: 'About' },
  { id: 'ecosystem', label: 'JeztBrain' },
  { id: 'featured', label: 'Featured' },
  { id: 'archive', label: 'Archive' },
  { id: 'experience', label: 'Experience' },
  { id: 'research', label: 'Research' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
]

export const seo = {
  siteUrl: 'https://www.sreerajunnikrishnan.com',
  title: 'Sreeraj Unnikrishnan | Cybersecurity Engineering · Full-Stack Development · Artificial Intelligence',
  description:
    'Sreeraj Unnikrishnan: Cybersecurity Researcher, Full-Stack Software Engineer, and AI Developer. Open to Full-Time Engineering Opportunities & Selected Freelance Collaborations.',
}
