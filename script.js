document.addEventListener("DOMContentLoaded", () => {
    // Typing Effect for Hero
    const roles = ["Junior Penetration Tester", "Ethical Hacker"];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typedSpan = document.querySelector(".typed");
    const typingDelay = 70;
    const erasingDelay = 50;
    const newTextDelay = 2000;

    function type() {
        if (!typedSpan) return;
        const currentRole = roles[roleIndex];
        if (isDeleting) {
            typedSpan.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typedSpan.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? erasingDelay : typingDelay;

        if (!isDeleting && charIndex === currentRole.length) {
            typeSpeed = newTextDelay;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500;
        }
        setTimeout(type, typeSpeed);
    }
    setTimeout(type, newTextDelay);

    // Animate Skill Bars on Scroll
    const skillBars = document.querySelectorAll('.progress');
    const animateSkills = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.getAttribute('data-width');
                bar.style.width = width;
                observer.unobserve(bar);
            }
        });
    };

    const skillsObserver = new IntersectionObserver(animateSkills, { threshold: 0.1 });
    skillBars.forEach(bar => skillsObserver.observe(bar));

    // Particles JS Configuration
    if (window.particlesJS) {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 60, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#00ff41" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.3, "random": true },
                "size": { "value": 3, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#00ff41", "opacity": 0.1, "width": 1 },
                "move": { "enable": true, "speed": 1 }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true }
            },
            "retina_detect": true
        });
    }
});
