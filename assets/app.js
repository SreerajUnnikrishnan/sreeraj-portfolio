/**
 * Sreeraj Unnikrishnan Portfolio - Interactive Logic & Visual Effects
 * Theme: Obsidian / Electric Blue / Violet / Cyan
 */

document.addEventListener('DOMContentLoaded', () => {
  initAmbientCanvas();
  initNavigation();
  initScrollSpy();
  initScrollReveal();
  initCountUp();
  initModals();
  initToast();
  initContactForm();
});

/* ==========================================================================
   AMBIENT CANVAS PARTICLE NETWORK
   ========================================================================== */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];
  const particleCount = window.innerWidth < 768 ? 35 : 70;
  const maxDistance = 140;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 1.8 + 0.8;
      // Palette: 60% electric blue, 25% violet, 15% cyan
      const rand = Math.random();
      if (rand < 0.6) {
        this.color = 'rgba(59, 130, 246, ';
      } else if (rand < 0.85) {
        this.color = 'rgba(139, 92, 246, ';
      } else {
        this.color = 'rgba(6, 182, 212, ';
      }
      this.baseAlpha = Math.random() * 0.4 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.baseAlpha + ')';
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color + '0.8)';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connection links
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const alpha = (1 - dist / maxDistance) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
          ctx.lineWidth = 0.75;
          ctx.shadowBlur = 0;
          ctx.stroke();
        }
      }
    }

    // Update & draw particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   NAVIGATION & SCROLL SPY
   ========================================================================== */
function initNavigation() {
  const nav = document.querySelector('.site-nav');
  const progressBar = document.querySelector('.scroll-progress-bar');
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const backdrop = document.querySelector('.drawer-backdrop');
  const drawerClose = document.querySelector('.drawer-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

  // Scroll handler for navbar elevation and progress bar
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollY / docHeight) * 100;

    if (progressBar) progressBar.style.width = `${progress}%`;

    if (scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  function toggleDrawer(open) {
    if (open) {
      drawer.classList.add('active');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      drawer.classList.remove('active');
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (menuToggle) menuToggle.addEventListener('click', () => toggleDrawer(true));
  if (drawerClose) drawerClose.addEventListener('click', () => toggleDrawer(false));
  if (backdrop) backdrop.addEventListener('click', () => toggleDrawer(false));

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleDrawer(false));
  });
}

function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.scrollY + 180;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   SCROLL REVEAL (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ==========================================================================
   STATISTIC COUNTER ANIMATION
   ========================================================================== */
function initCountUp() {
  const statNumbers = document.querySelectorAll('.stat-count');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach(num => {
          const target = parseInt(num.getAttribute('data-target'), 10);
          const suffix = num.getAttribute('data-suffix') || '';
          let count = 0;
          const duration = 1600;
          const stepTime = Math.abs(Math.floor(duration / target));

          const timer = setInterval(() => {
            count += 1;
            num.textContent = count + suffix;
            if (count >= target) {
              clearInterval(timer);
              num.textContent = target + suffix;
            }
          }, Math.max(stepTime, 40));
        });
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.stats-grid');
  if (statsSection) observer.observe(statsSection);
}

/* ==========================================================================
   MODALS SYSTEM
   ========================================================================== */
const modalData = {
  journal_cert: {
    tag: 'RESEARCH PUBLICATION · 2024',
    title: 'Secure Image Retrieval Based on Federated Learning and Additive Secret Sharing',
    subtitle: 'Journal of Xidian University · Volume 18, Issue 4, 2024',
    image: 'assets/journal-certificate.png',
    description: 'Official Certificate of Publication for the academic research paper titled "Secure Image Retrieval Based on Federated Learning and Additive Secret Sharing" authored by Sreeraj Unnikrishnan from Hindustan Institute of Technology, published in the peer-reviewed Journal of Xidian University (Volume 18, Issue 4, 2024).',
    highlights: [
      'Published in the peer-reviewed Journal of Xidian University (Volume 18, Issue 4, 2024).',
      'Authored by Sreeraj Unnikrishnan, Hindustan Institute of Technology.',
      'Explores privacy-preserving distributed visual search with zero raw image exposure.',
      'Combines federated neural gradient synchronization with additive secret sharing cryptography.'
    ],
    techStack: ['Federated Learning', 'Additive Secret Sharing', 'Machine Learning', 'Privacy-Preserving Computing', 'Secure Image Retrieval', 'Cybersecurity'],
    downloadUrl: 'assets/journal-certificate.png'
  },
  jeztbrain: {
    tag: 'AI SECURITY PLATFORM',
    title: 'JEZTBrain: Next-Gen AI Threat Detection & Analysis',
    subtitle: 'Autonomous Vulnerability Discovery & Security Telemetry Platform',
    image: 'assets/jeztbrain_preview.png',
    description: 'JEZTBrain is an intelligent cybersecurity platform designed to accelerate vulnerability detection, threat hunting, and automated security assessments. Powered by deep learning models and continuous attack vector profiling, it provides defensive analysts and penetration testers with actionable threat telemetry and risk scoring in real time.',
    highlights: [
      'Automated Vulnerability Scanner with intelligent CVSS 3.1 contextual risk scoring.',
      'Neural Network Security Graph analyzing multi-hop attack vectors and lateral movement paths.',
      'Live Threat Intelligence Feed correlating real-time IOCs, ransomware signatures, and CVE advisories.',
      'Autonomous Security Assistant offering automated remediation playbooks and code patches.'
    ],
    techStack: ['React 18', 'TypeScript', 'Supabase', 'Python FastAPIs', 'PyTorch', 'Tailwind CSS', 'Docker'],
    githubUrl: 'https://github.com/SreerajUnnikrishnan'
  },
  spider: {
    tag: 'OSINT & SECURITY INTELLIGENCE',
    title: 'JEZTBrainSpider: Reconnaissance & Footprint Analyzer',
    subtitle: 'Graph-Based Threat Intelligence & Open Source Intelligence Engine',
    image: 'assets/jeztbrain-spider_preview.png',
    description: 'JEZTBrainSpider is an advanced OSINT framework engineered to map organization attack surfaces, discover exposed infrastructure, track entity relationships, and aggregate external threat indicators into an interactive real-time visual graph.',
    highlights: [
      'Automated Asset Discovery: Subdomains, IP ranges, mail servers, cloud buckets, and open ports.',
      'Entity Network Graph: Visualizes connections between organizations, employees, and exposed infrastructure.',
      'Exploit & CVE Detection: Flags vulnerabilities associated with discovered tech stacks immediately.',
      'Exportable Intelligence Reports for red teams, penetration testing scopes, and executive briefings.'
    ],
    techStack: ['Next.js', 'Python', 'NetworkX / D3.js', 'OSINT Frameworks', 'Shodan API', 'MongoDB'],
    githubUrl: 'https://github.com/SreerajUnnikrishnan'
  },
  flsir: {
    tag: 'AI / MACHINE LEARNING RESEARCH',
    title: 'FLSIR: Federated Learning-Based Secure Image Retrieval',
    subtitle: 'Privacy-Preserving Distributed Machine Learning & Cryptographic Retrieval',
    image: 'assets/flsir_preview.png',
    description: 'FLSIR is an innovative cybersecurity research framework investigating privacy-preserving visual search. Utilizing federated learning and homomorphic encryption, multiple decentralized nodes train high-accuracy visual embeddings without ever exposing sensitive raw imagery or patient/corporate data.',
    highlights: [
      'Decentralized Model Synchronization: Eliminates single points of failure and prevents centralized data leaks.',
      'Homomorphic Encryption & Paillier Cryptosystem: Encrypts gradient updates during aggregation.',
      'High Retrieval Accuracy: Achieves 89.2% mAP while maintaining mathematically proven data privacy.',
      'Resistant to Model Inversion and Membership Inference Attacks.'
    ],
    techStack: ['Python', 'PyTorch', 'Flower (FL Framework)', 'Paillier Cryptosystem', 'NumPy', 'Research Benchmarks'],
    githubUrl: 'https://github.com/SreerajUnnikrishnan'
  },
  ocsp: {
    tag: 'CERTIFICATION CREDENTIAL',
    title: 'Offenso Certified Security Professional (OCSP)',
    subtitle: 'Offenso Hacker Academy · Practical Penetration Testing Credential',
    image: 'assets/ocsp_cert.jpg',
    description: 'Hands-on practical certification validating mastery in network penetration testing, web application exploitation, privilege escalation, vulnerability discovery, and technical report writing against realistic enterprise lab environments.',
    highlights: [
      '100% Practical Examination in multi-target virtualized laboratory.',
      'Exploitation of Web Vulnerabilities (OWASP Top 10, Injection, Auth Bypass).',
      'Post-Exploitation, Linux/Windows Privilege Escalation, and Lateral Pivoting.',
      'Professional Pentest Documentation and Remediations Formulation.'
    ],
    techStack: ['Kali Linux', 'Burp Suite Pro', 'Metasploit', 'Nmap', 'Privilege Escalation']
  },
  lab_metasploitable: {
    tag: 'SECURITY LAB · EXPLOITATION',
    title: 'Metasploitable Lab & Vulnerability Exploitation',
    subtitle: 'Simulated Target Environments & Exploit Verification',
    image: 'assets/metasploitable.png',
    description: 'Hands-on laboratory dedicated to simulating vulnerable infrastructure, analyzing exploit payload behavior, verifying CVE attack vectors, and testing defensive endpoint response policies.',
    highlights: [
      'SMB, FTP, RPC service exploitation and misconfiguration auditing.',
      'Custom exploit payload creation and staged meterpreter sessions.',
      'Vulnerability validation before remediation recommendation in enterprise networks.',
      'Behavioral logging and signature generation for defensive alerting.'
    ],
    techStack: ['Metasploitable 2/3', 'Metasploit Framework', 'Nmap', 'Wireshark', 'Python Scripting']
  },
  lab_owasp: {
    tag: 'SECURITY LAB · WEB SECURITY',
    title: 'OWASP Top 10 Exploitation & Hardening Labs',
    subtitle: 'Web Application Attack Vectors & Secure Code Review',
    image: 'assets/owasp-labs.png',
    description: 'Comprehensive research into modern web application security vulnerabilities including Broken Object Level Authorization (BOLA), SQL Injection, Cross-Site Scripting (XSS), Server-Side Request Forgery (SSRF), and CSRF bypass mechanisms.',
    highlights: [
      'Testing authentication token tampering, JWT key confusion, and OAuth misconfigurations.',
      'Constructing sophisticated blind and error-based SQLi test scripts.',
      'Auditing REST and GraphQL APIs for mass assignment and parameter tampering.',
      'Formulating hardened defensive headers, input sanitization, and CSP policies.'
    ],
    techStack: ['Burp Suite Pro', 'OWASP ZAP', 'Postman', 'SQLMap', 'ffuf', 'CyberChef']
  },
  lab_ad: {
    tag: 'SECURITY LAB · ENTERPRISE',
    title: 'Active Directory & Domain Privilege Escalation Lab',
    subtitle: 'Kerberos Attacks, Domain Enumeration & Lateral Movement',
    image: 'assets/active-directory.png',
    description: 'Advanced homelab environment simulating corporate Active Directory topologies. Focuses on identity attack chains, Kerberoasting, AS-REP roasting, BloodHound path discovery, and domain controller auditing.',
    highlights: [
      'BloodHound graph analysis to uncover hidden domain administrator paths.',
      'Kerberoasting and offline ticket cracking analysis.',
      'GPO abuse, token impersonation, and Golden/Silver ticket inspection.',
      'Defensive auditing with Group Policy hardening and tiering models.'
    ],
    techStack: ['Active Directory Domain Services', 'BloodHound', 'Impacket', 'Mimikatz', 'PowerView']
  },
  lab_webexp: {
    tag: 'SECURITY LAB · WEB EXPLOITATION',
    title: 'Advanced Web Exploitation & Bug Bounty Practice',
    subtitle: 'Modern Web Architectures, Microservices & Cloud API Audits',
    image: 'assets/web-exploitation.png',
    description: 'In-depth laboratory analyzing modern web application architectures, headless APIs, microservices, and serverless backends for business logic flaws, race conditions, and deserialization vulnerabilities.',
    highlights: [
      'Race condition testing in order processing and coupon systems.',
      'SSRF exploitation targeting internal cloud metadata services (AWS / GCP / Azure).',
      'Insecure direct object reference (IDOR) automation scripts.',
      'Subdomain takeover validation and CORS misconfiguration testing.'
    ],
    techStack: ['Burp Suite', 'Python Requests', 'Turbo Intruder', 'Nuclei', 'Docker']
  },
  lab_netenum: {
    tag: 'SECURITY LAB · NETWORK RECON',
    title: 'Network Enumeration & Traffic Dissection Lab',
    subtitle: 'Deep Packet Inspection, Protocol Auditing & Banner Fingerprinting',
    image: 'assets/network-enumeration.png',
    description: 'Laboratory environment dedicated to protocol reverse engineering, deep packet inspection, stealth port scanning, firewall evasion, and custom NSE script development.',
    highlights: [
      'Crafting custom Nmap NSE scripts for rapid service fingerprinting.',
      'Dissecting raw PCAP traces in Wireshark for credential leaks and plain text protocols.',
      'Evaluating IDS/IPS rule triggers against randomized probe timing.',
      'Wireless security auditing and 802.1X enterprise authentication analysis.'
    ],
    techStack: ['Wireshark', 'Nmap / Ncat', 'Tcpdump', 'Scapy', 'Snort / Suricata']
  }
};

function initModals() {
  const modalOverlay = document.getElementById('project-modal');
  const modalContent = document.getElementById('modal-content-container');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modalOverlay || !modalContent) return;

  function openModal(key) {
    const data = modalData[key];
    if (!data) return;

    let html = `
      <div class="modal-content-body">
        <span class="section-tag ${data.tag.includes('PUBLICATION') ? 'violet' : 'cyan'}">
        <i class="fa-solid fa-shield-halved"></i> ${data.tag}
      </span>
      <h2 style="font-size: 2.1rem; font-weight: 800; color: #fff; margin-top: 12px; margin-bottom: 8px; line-height: 1.2;">
        ${data.title}
      </h2>
      <p style="font-family: var(--font-mono); font-size: 0.92rem; color: var(--accent-cyan); margin-bottom: 24px;">
        ${data.subtitle || ''}
      </p>
    `;

    if (data.image) {
      const isSquare = data.image.includes('metasploitable') || data.image.includes('owasp') || data.image.includes('active-directory') || data.image.includes('web-exploitation') || data.image.includes('network-enumeration');
      html += `
        <div style="border-radius: var(--radius-lg); overflow: hidden; border: 1px solid rgba(255,255,255,0.12); margin-bottom: 28px; box-shadow: 0 12px 30px rgba(0,0,0,0.7); background: #07090e; display: flex; justify-content: center; align-items: center; ${isSquare ? 'max-height: 380px; padding: 12px;' : ''}">
          <img src="${data.image}" alt="${data.title}" style="width: ${isSquare ? 'auto' : '100%'}; max-width: 100%; height: ${isSquare ? '340px' : 'auto'}; max-height: 450px; object-fit: contain; display: block; border-radius: 8px;">
        </div>
      `;
    }

    html += `
      <p style="font-size: 1.05rem; color: var(--text-secondary); line-height: 1.75; margin-bottom: 24px;">
        ${data.description}
      </p>
    `;

    if (data.highlights && data.highlights.length > 0) {
      html += `
        <h4 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin-bottom: 14px;">Key Capabilities & Details</h4>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px;">
          ${data.highlights.map(h => `<li style="position: relative; padding-left: 24px; color: var(--text-secondary);"><span style="position: absolute; left: 0; color: var(--accent-blue-bright);">▹</span>${h}</li>`).join('')}
        </ul>
      `;
    }

    if (data.techStack && data.techStack.length > 0) {
      html += `
        <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 12px;">Keywords & Technologies</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px;">
          ${data.techStack.map(t => `<span class="tech-badge"><i class="fa-solid fa-tag"></i> ${t}</span>`).join('')}
        </div>
      `;
    }

    if (data.downloadUrl) {
      html += `
        <div style="display: flex; gap: 14px; margin-top: 10px;">
          <a href="${data.downloadUrl}" download="Sreeraj_Unnikrishnan_Journal_Certificate.png" class="btn-primary">
            <i class="fa-solid fa-arrow-down"></i> Download Certificate
          </a>
        </div>
      `;
    } else if (data.liveUrl) {
      html += `
        <div style="display: flex; gap: 14px; margin-top: 10px;">
          <a href="${data.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Visit Live Website
          </a>
        </div>
      `;
    } else if (data.githubUrl) {
      html += `
        <div style="display: flex; gap: 14px; margin-top: 10px;">
          <a href="${data.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary">
            <i class="fa-brands fa-github"></i> View on GitHub <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      `;
    }

    html += `</div>`;
    modalContent.innerHTML = html;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Trigger elements with data-modal attribute
  document.querySelectorAll('[data-modal]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const modalKey = el.getAttribute('data-modal');
      openModal(modalKey);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   TOAST NOTIFICATION & CLIPBOARD
   ========================================================================== */
function initToast() {
  const toast = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-message');

  window.showToast = function(msg) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  };

  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy');
      navigator.clipboard.writeText(textToCopy).then(() => {
        window.showToast(`Copied to clipboard: ${textToCopy}`);
      }).catch(() => {
        window.showToast(`Email: ${textToCopy}`);
      });
    });
  });
}

/* ==========================================================================
   LET'S CONNECT 3-COLUMN CONTACT FORM & EMAILJS DISPATCH
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('portfolio-contact-form');
  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const messageInput = document.getElementById('contact-message');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  const submitBtn = document.getElementById('contact-submit-btn');
  const statusMsg = document.getElementById('form-status');

  // ========================================================================
  // EMAILJS CONFIGURATION
  // To connect your EmailJS account (https://www.emailjs.com):
  // 1. Create a free account at EmailJS.
  // 2. Add an Email Service (e.g. Gmail) -> get SERVICE_ID
  // 3. Create an Email Template -> get TEMPLATE_ID
  // 4. Get your Public Key from Account Settings -> get PUBLIC_KEY
  // ========================================================================
  const EMAILJS_CONFIG = {
    publicKey: "YOUR_PUBLIC_KEY",     // e.g. "user_xxxxxxxxxxxx"
    serviceId: "YOUR_SERVICE_ID",     // e.g. "service_xxxxxxx"
    templateId: "YOUR_TEMPLATE_ID",   // e.g. "template_xxxxxxx"
    recipientEmail: "sreerajunnikrishnanofficial@gmail.com"
  };

  // Initialize EmailJS SDK if available
  if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey && EMAILJS_CONFIG.publicKey !== "YOUR_PUBLIC_KEY") {
    emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
  }

  // RFC 5322 compliant simplified email regex
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  function clearError(input, errorEl) {
    if (input) input.classList.remove('is-invalid');
    if (errorEl) errorEl.textContent = '';
  }

  function setError(input, errorEl, message) {
    if (input) input.classList.add('is-invalid');
    if (errorEl) errorEl.textContent = message;
  }

  // Real-time error dismissal on input
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      if (nameInput.value.trim().length >= 2) {
        clearError(nameInput, nameError);
      }
    });
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      if (emailPattern.test(emailInput.value.trim())) {
        clearError(emailInput, emailError);
      }
    });
  }

  if (messageInput) {
    messageInput.addEventListener('input', () => {
      if (messageInput.value.trim().length >= 5) {
        clearError(messageInput, messageError);
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;
    const nameVal = nameInput ? nameInput.value.trim() : '';
    const emailVal = emailInput ? emailInput.value.trim() : '';
    const messageVal = messageInput ? messageInput.value.trim() : '';

    // Validate Name
    if (!nameVal) {
      setError(nameInput, nameError, 'Please enter your name.');
      isValid = false;
    } else if (nameVal.length < 2) {
      setError(nameInput, nameError, 'Name must be at least 2 characters.');
      isValid = false;
    } else {
      clearError(nameInput, nameError);
    }

    // Validate Email
    if (!emailVal) {
      setError(emailInput, emailError, 'Please enter your email address.');
      isValid = false;
    } else if (!emailPattern.test(emailVal)) {
      setError(emailInput, emailError, 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearError(emailInput, emailError);
    }

    // Validate Comments / Message
    if (!messageVal) {
      setError(messageInput, messageError, 'Please enter your comments or message.');
      isValid = false;
    } else if (messageVal.length < 5) {
      setError(messageInput, messageError, 'Message must be at least 5 characters.');
      isValid = false;
    } else {
      clearError(messageInput, messageError);
    }

    if (!isValid) {
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '<span>Get In Touch</span> <i class="fa-solid fa-arrow-right"></i>';

    // Set loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending Message...</span>`;
    }
    if (statusMsg) {
      statusMsg.className = 'form-status-msg';
      statusMsg.innerHTML = '';
    }

    const templateParams = {
      name: nameVal,
      from_name: nameVal,
      user_name: nameVal,
      email: emailVal,
      from_email: emailVal,
      user_email: emailVal,
      reply_to: emailVal,
      message: messageVal,
      comments: messageVal,
      to_email: EMAILJS_CONFIG.recipientEmail,
      subject: `Portfolio Inquiry from ${nameVal}`
    };

    try {
      // Check if configured with active EmailJS keys
      if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.serviceId !== 'YOUR_SERVICE_ID' && EMAILJS_CONFIG.templateId !== 'YOUR_TEMPLATE_ID') {
        await emailjs.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templateId,
          templateParams,
          EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY' ? EMAILJS_CONFIG.publicKey : undefined
        );
      } else {
        // Direct AJAX endpoint dispatch to ensure delivery to recipient
        const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(EMAILJS_CONFIG.recipientEmail)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: nameVal,
            email: emailVal,
            message: messageVal,
            _subject: `New Portfolio Inquiry from ${nameVal}`,
            _template: 'table',
            _captcha: 'false'
          })
        });

        if (!response.ok) {
          throw new Error('Delivery gateway error');
        }
      }

      // Success handling: Clear form and show confirmation on the same page
      form.reset();

      if (submitBtn) {
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Message Sent!</span>`;
      }

      if (statusMsg) {
        statusMsg.className = 'form-status-msg success';
        statusMsg.innerHTML = `<i class="fa-solid fa-circle-check"></i> Message sent successfully!`;
      }

      if (window.showToast) {
        window.showToast('Message sent successfully!');
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }, 4000);

      setTimeout(() => {
        if (statusMsg) {
          statusMsg.innerHTML = '';
        }
      }, 8000);

    } catch (err) {
      console.error('Submission error:', err);

      if (submitBtn) {
        submitBtn.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <span>Failed to Send</span>`;
      }

      if (statusMsg) {
        statusMsg.className = 'form-status-msg error';
        statusMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> An error occurred while sending. Please try again.`;
      }

      if (window.showToast) {
        window.showToast('Failed to send message. Please try again.');
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }, 4000);
    }
  });
}

