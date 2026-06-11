document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    const navLinksItems = document.querySelectorAll('.nav-link');

    mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.setAttribute('data-lucide', 'x');
        } else {
            icon.setAttribute('data-lucide', 'menu');
        }
        lucide.createIcons();
    });

    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileBtn.querySelector('i');
            icon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        });
    });

    // 2. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });
    revealElements.forEach(el => revealObserver.observe(el));

    // 4. Hero 3D Cube Interaction
    const heroSection = document.getElementById('hero');
    const cubeElement = document.getElementById('cube-element');
    if (heroSection && cubeElement) {
        heroSection.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
            cubeElement.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });
        heroSection.addEventListener('mouseleave', () => {
            cubeElement.style.transform = `rotateX(-15deg) rotateY(25deg)`;
            cubeElement.style.transition = 'transform 0.5s ease';
        });
        heroSection.addEventListener('mouseenter', () => {
            cubeElement.style.transition = 'transform 0.1s ease-out';
        });
    }

    // 5. Dynamic Data Loading and Rendering
    async function loadAndRenderData() {
        try {
            let data;
            try {
                const response = await fetch('/api/data'); 
                if (response.ok) {
                    data = await response.json();
                } else {
                    throw new Error('Fallback to local file');
                }
            } catch (e) {
                const resFile = await fetch('./data.json');
                data = await resFile.json();
            }

            if (!data) return;

            // Hero
            if (data.hero) {
                document.getElementById('hero-title').innerHTML = data.hero.title;
                document.getElementById('hero-description').textContent = data.hero.description;
                const btnPrimary = document.getElementById('hero-btn-primary');
                if(btnPrimary) {
                    btnPrimary.textContent = data.hero.primaryBtn.text;
                    btnPrimary.href = data.hero.primaryBtn.link;
                }
                const btnSec = document.getElementById('hero-btn-secondary');
                if(btnSec) {
                    btnSec.textContent = data.hero.secondaryBtn.text;
                    btnSec.href = data.hero.secondaryBtn.link;
                }
            }

            // About
            if (data.about) {
                document.getElementById('about-title').innerHTML = data.about.title;
                document.getElementById('about-description').textContent = data.about.description;
                const aboutGrid = document.getElementById('about-features');
                aboutGrid.innerHTML = data.about.features.map(f => `
                    <div class="about-feature reveal">
                        <i data-lucide="${f.icon}"></i>
                        <h3>${f.title}</h3>
                        <p class="text-muted">${f.description}</p>
                    </div>
                `).join('');
            }

            // Services
            if (data.services) {
                document.getElementById('services-title').innerHTML = data.services.title;
                document.getElementById('services-description').textContent = data.services.description;
                const svGrid = document.getElementById('services-grid');
                svGrid.innerHTML = data.services.items.map((s, idx) => `
                    <div class="service-card reveal delay-${idx % 3}">
                        <div class="service-icon"><i data-lucide="${s.icon}"></i></div>
                        <h3>${s.title}</h3>
                        <p>${s.description}</p>
                    </div>
                `).join('');
            }

            // Process
            if (data.process) {
                document.getElementById('process-title').innerHTML = data.process.title;
                document.getElementById('process-description').textContent = data.process.description;
                const pTimeline = document.getElementById('process-timeline');
                pTimeline.innerHTML = data.process.steps.map((s, idx) => `
                    <div class="process-step reveal delay-${idx % 3}">
                        <div class="step-icon"><i data-lucide="${s.icon}"></i></div>
                        <h3>${s.title}</h3>
                        <p>${s.description}</p>
                    </div>
                `).join('');
            }

            // Differentials
            if (data.differentials) {
                document.getElementById('differentials-title').innerHTML = data.differentials.title;
                document.getElementById('differentials-description').textContent = data.differentials.description;
                const dGrid = document.getElementById('differentials-grid');
                dGrid.innerHTML = data.differentials.items.map((d, idx) => `
                    <div class="diff-card reveal delay-${idx % 3}">
                        <i data-lucide="${d.icon}"></i>
                        <h3>${d.title}</h3>
                        <p class="text-muted">${d.description}</p>
                    </div>
                `).join('');
            }

            // Audience & Culture
            if (data.audience) {
                document.getElementById('audience-title').innerHTML = data.audience.title;
                document.getElementById('audience-description').textContent = data.audience.description;
                const aList = document.getElementById('audience-list');
                aList.innerHTML = data.audience.items.map(a => `
                    <li class="audience-item">
                        <h3>${a.title}</h3>
                        <p class="text-muted">${a.description}</p>
                    </li>
                `).join('');
            }
            if (data.culture) {
                document.getElementById('culture-title').innerHTML = data.culture.title;
                document.getElementById('culture-description').textContent = data.culture.description;
            }

            // FAQ
            if (data.faq) {
                const fGrid = document.getElementById('faq-container');
                fGrid.innerHTML = data.faq.map(f => `
                    <details class="faq-item">
                        <summary>${f.question}</summary>
                        <div class="faq-content">
                            <p>${f.answer}</p>
                        </div>
                    </details>
                `).join('');
                
                // Re-attach accordion logic
                const faqItems = document.querySelectorAll('.faq-item');
                faqItems.forEach(item => {
                    item.addEventListener('click', (e) => {
                        if (e.target.tagName.toLowerCase() === 'summary' || e.target.parentElement.tagName.toLowerCase() === 'summary') {
                            faqItems.forEach(otherItem => {
                                if (otherItem !== item && otherItem.hasAttribute('open')) {
                                    otherItem.removeAttribute('open');
                                }
                            });
                        }
                    });
                });
            }

            // Contact
            if (data.contact) {
                const wBtn = document.getElementById('whatsapp-btn');
                if(wBtn) {
                    wBtn.href = `https://wa.me/${data.contact.whatsappNumber}`;
                }
                const igBtn = document.getElementById('footer-ig-link');
                if(igBtn && data.contact.instagram) {
                    igBtn.href = data.contact.instagram;
                }
            }

            // Re-initialize Lucide icons for new elements
            lucide.createIcons();

            // Re-run reveal observer for new elements
            const newRevealElements = document.querySelectorAll('.reveal:not(.active)');
            newRevealElements.forEach(el => revealObserver.observe(el));
        } catch (err) {
            console.log('Error loading data:', err);
        }
    }

    // Initialize
    loadAndRenderData();
});
