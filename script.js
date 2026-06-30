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

            // Contact global reference
            if (data.contact) {
                window.whatsappNumber = data.contact.whatsappNumber;
            }

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

            // Process (Interactive tabs)
            if (data.process && data.process.steps) {
                document.getElementById('process-title').innerHTML = data.process.title;
                document.getElementById('process-description').textContent = data.process.description;
                
                const tabsContainer = document.getElementById('process-tabs');
                const cardContainer = document.getElementById('process-card-container');
                
                if (tabsContainer && cardContainer) {
                    tabsContainer.innerHTML = data.process.steps.map((s, idx) => `
                        <button class="process-tab-btn ${idx === 0 ? 'active' : ''}" onclick="selectProcessStep(${idx})">
                            <span>0${idx + 1}</span> ${s.title.split('. ')[1] || s.title}
                        </button>
                    `).join('');
                    
                    window.processSteps = data.process.steps;
                    selectProcessStep(0);
                }
            }

            // Differentials
            if (data.differentials) {
                document.getElementById('differentials-title').innerHTML = data.differentials.title;
                document.getElementById('differentials-description').textContent = data.differentials.description;
                const dfGrid = document.getElementById('differentials-grid');
                dfGrid.innerHTML = data.differentials.items.map((d, idx) => `
                    <div class="differential-card reveal delay-${idx % 3}">
                        <div class="diff-icon"><i data-lucide="${d.icon}"></i></div>
                        <h3>${d.title}</h3>
                        <p class="text-muted">${d.description}</p>
                    </div>
                `).join('');
            }

            // Audience
            if (data.audience) {
                document.getElementById('audience-title').innerHTML = data.audience.title;
                document.getElementById('audience-description').textContent = data.audience.description;
                const adList = document.getElementById('audience-list');
                adList.innerHTML = data.audience.items.map(a => `
                    <li><i data-lucide="check" class="text-brand"></i> <span><strong>${a.title}:</strong> ${a.description}</span></li>
                `).join('');
            }

            // Culture
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

            // Portfolio (with click modal)
            if (data.portfolio) {
                const pTitle = document.getElementById('portfolio-title');
                if (pTitle) pTitle.innerHTML = data.portfolio.title;
                const pDesc = document.getElementById('portfolio-description');
                if (pDesc) pDesc.textContent = data.portfolio.description;
                const pGrid = document.getElementById('portfolio-grid');
                if (pGrid) {
                    window.portfolioItems = data.portfolio.items || [];
                    pGrid.innerHTML = data.portfolio.items.slice(0, 3).map((p, idx) => `
                        <div class="portfolio-card reveal delay-${idx % 3}" onclick="openProjectModal(${idx})" style="cursor:pointer;">
                            <div class="portfolio-img-wrap">
                                <img src="${p.image}" alt="${p.title}" loading="lazy">
                            </div>
                            <div class="portfolio-body">
                                <span class="portfolio-tag">${p.category}</span>
                                <h3>${p.title}</h3>
                                <p>${p.description}</p>
                            </div>
                        </div>
                    `).join('');
                }
            }

            // Testimonials
            if (data.testimonials) {
                const tTitle = document.getElementById('testimonials-title');
                if (tTitle) tTitle.innerHTML = data.testimonials.title;
                const tDesc = document.getElementById('testimonials-description');
                if (tDesc) tDesc.textContent = data.testimonials.description;
                const tGrid = document.getElementById('testimonials-grid');
                if (tGrid) {
                    tGrid.innerHTML = data.testimonials.items.map((t, idx) => {
                        const initial = t.name ? t.name.charAt(0) : 'U';
                        return `
                        <div class="testimonial-card reveal delay-${idx % 3}">
                            <i data-lucide="quote" class="testimonial-quote-icon" size="48"></i>
                            <p>"${t.content}"</p>
                            <div class="testimonial-author">
                                <div class="testimonial-avatar">${initial}</div>
                                <div class="testimonial-meta">
                                    <h4>${t.name}</h4>
                                    <span>${t.role}</span>
                                </div>
                            </div>
                        </div>
                    `}).join('');
                }
            }

            // Contact
            if (data.contact) {
                const wBtn = document.getElementById('whatsapp-btn');
                if(wBtn) {
                    wBtn.href = `https://wa.me/${data.contact.whatsappNumber}`;
                }
                const floatWa = document.getElementById('floating-whatsapp');
                if(floatWa) {
                    floatWa.href = `https://wa.me/${data.contact.whatsappNumber}`;
                }
                const igBtn = document.getElementById('footer-ig-link');
                if(igBtn && data.contact.instagram) {
                    igBtn.href = data.contact.instagram;
                }
            }

            // Budget Simulator
            if (data.simulator && data.simulator.items) {
                const sTitle = document.getElementById('simulator-title');
                if (sTitle) sTitle.innerHTML = data.simulator.title;
                const sDesc = document.getElementById('simulator-description');
                if (sDesc) sDesc.textContent = data.simulator.description;
                
                const sGrid = document.getElementById('simulator-items-grid');
                if (sGrid) {
                    sGrid.innerHTML = data.simulator.items.map((item, idx) => `
                        <div class="simulator-item-card" onclick="toggleSimulatorItem(${idx})" data-index="${idx}">
                            <div class="sim-card-icon"><i data-lucide="${item.icon || 'palette'}"></i></div>
                            <div class="sim-card-details">
                                <h4>${item.name}</h4>
                                <p>${item.description}</p>
                            </div>
                            <div class="sim-card-price">
                                <span>R$ ${item.price}</span>
                                <small>${item.type === 'monthly' ? '/mês' : 'investimento único'}</small>
                            </div>
                        </div>
                    `).join('');
                }
                
                window.simulatorItems = data.simulator.items;
                window.selectedSimulatorItems = new Set();
                
                const slider = document.getElementById('media-budget-slider');
                const sliderVal = document.getElementById('media-budget-val');
                if (slider && sliderVal) {
                    slider.addEventListener('input', (e) => {
                        sliderVal.textContent = `R$ ${parseInt(e.target.value).toLocaleString('pt-BR')}`;
                        calculateBudget();
                    });
                }
                
                const waBtn = document.getElementById('simulator-whatsapp-btn');
                if (waBtn) {
                    waBtn.addEventListener('click', sendSimulatorWhatsApp);
                }
                
                calculateBudget();
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

// Global Helpers
function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

window.selectProcessStep = function(idx) {
    const steps = window.processSteps;
    if (!steps || !steps[idx]) return;
    
    const btns = document.querySelectorAll('.process-tab-btn');
    btns.forEach((btn, i) => {
        if (i === idx) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    
    const s = steps[idx];
    const cardContainer = document.getElementById('process-card-container');
    if (cardContainer) {
        cardContainer.innerHTML = `
            <div class="process-card">
                <div class="step-icon"><i data-lucide="${s.icon}"></i></div>
                <div class="process-card-content">
                    <h3>${s.title}</h3>
                    <p>${s.description}</p>
                </div>
            </div>
        `;
        lucide.createIcons();
    }
};

window.openProjectModal = function(idx) {
    const items = window.portfolioItems;
    if (!items || !items[idx]) return;
    
    const p = items[idx];
    const modal = document.getElementById('project-modal');
    const body = document.getElementById('project-modal-body');
    
    if (modal && body) {
        body.innerHTML = `
            <div class="modal-project-header">
                <span class="modal-project-tag">${escapeHtml(p.category)}</span>
                <h2>${escapeHtml(p.title)}</h2>
            </div>
            <div class="modal-project-img">
                <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}">
            </div>
            <div class="modal-project-description">
                <p>${escapeHtml(p.description)}</p>
            </div>
            <div class="modal-project-grid">
                <div class="modal-grid-card">
                    <h4><i data-lucide="help-circle"></i> O Desafio</h4>
                    <p>${escapeHtml(p.challenge || 'Desenvolver um projeto inovador e de alto impacto que atendesse aos objetivos da marca no mercado.')}</p>
                </div>
                <div class="modal-grid-card">
                    <h4><i data-lucide="check-square"></i> A Solução</h4>
                    <p>${escapeHtml(p.solution || 'Aplicação de metodologias ágeis de criação, design centrado no usuário e estratégias de marketing personalizadas.')}</p>
                </div>
                <div class="modal-grid-card">
                    <h4><i data-lucide="trending-up"></i> O Resultado</h4>
                    <p>${escapeHtml(p.results || 'Alinhamento completo com o público-alvo, aumento de engajamento e melhoria significativa na percepção de valor.')}</p>
                </div>
            </div>
            <div style="text-align: center; margin-top: 2rem;">
                <a href="https://wa.me/${window.whatsappNumber || '5585992629819'}?text=Ol%C3%A1%2C%20gostaria%20de%20um%20projeto%20semelhante%20ao%3A%20${encodeURIComponent(p.title)}" target="_blank" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:0.5rem; justify-content:center;">
                    <i data-lucide="message-circle"></i> Quero um Projeto Semelhante
                </a>
            </div>
        `;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        lucide.createIcons();
    }
};

window.closeProjectModal = function() {
    const modal = document.getElementById('project-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
};

window.toggleSimulatorItem = function(idx) {
    const card = document.querySelector(`.simulator-item-card[data-index="${idx}"]`);
    if (!card) return;
    
    if (window.selectedSimulatorItems.has(idx)) {
        window.selectedSimulatorItems.delete(idx);
        card.classList.remove('selected');
    } else {
        window.selectedSimulatorItems.add(idx);
        card.classList.add('selected');
    }
    
    const items = window.simulatorItems;
    let hasTraffic = false;
    window.selectedSimulatorItems.forEach(i => {
        if (items[i] && (items[i].name.toLowerCase().includes('tráfego') || items[i].icon === 'trending-up')) {
            hasTraffic = true;
        }
    });
    
    const mediaGroup = document.getElementById('media-budget-group');
    const mediaLine = document.getElementById('summary-media-line');
    if (mediaGroup) mediaGroup.style.display = hasTraffic ? 'block' : 'none';
    if (mediaLine) mediaLine.style.display = hasTraffic ? 'flex' : 'none';
    
    calculateBudget();
};

window.calculateBudget = function() {
    const items = window.simulatorItems;
    if (!items) return;
    
    let onceTotal = 0;
    let monthlyTotal = 0;
    
    window.selectedSimulatorItems.forEach(idx => {
        const item = items[idx];
        if (!item) return;
        if (item.type === 'monthly') {
            monthlyTotal += item.price;
        } else {
            onceTotal += item.price;
        }
    });
    
    const mediaGroup = document.getElementById('media-budget-group');
    let mediaVal = 0;
    if (mediaGroup && mediaGroup.style.display !== 'none') {
        const slider = document.getElementById('media-budget-slider');
        if (slider) {
            mediaVal = parseInt(slider.value);
        }
    }
    
    document.getElementById('val-once').textContent = `R$ ${onceTotal.toLocaleString('pt-BR')}`;
    document.getElementById('val-monthly').textContent = `R$ ${monthlyTotal.toLocaleString('pt-BR')}`;
    document.getElementById('val-media').textContent = `R$ ${mediaVal.toLocaleString('pt-BR')}`;
    
    document.getElementById('total-once').textContent = `R$ ${onceTotal.toLocaleString('pt-BR')}`;
    document.getElementById('total-monthly').textContent = `R$ ${(monthlyTotal + mediaVal).toLocaleString('pt-BR')}`;
};

window.sendSimulatorWhatsApp = function() {
    const items = window.simulatorItems;
    if (!items || window.selectedSimulatorItems.size === 0) {
        alert('Por favor, selecione pelo menos um serviço para simular o orçamento.');
        return;
    }
    
    let selectedNames = [];
    let onceTotal = 0;
    let monthlyTotal = 0;
    
    window.selectedSimulatorItems.forEach(idx => {
        const item = items[idx];
        if (item) {
            selectedNames.push(item.name);
            if (item.type === 'monthly') monthlyTotal += item.price;
            else onceTotal += item.price;
        }
    });
    
    const mediaGroup = document.getElementById('media-budget-group');
    let mediaVal = 0;
    if (mediaGroup && mediaGroup.style.display !== 'none') {
        const slider = document.getElementById('media-budget-slider');
        if (slider) {
            mediaVal = parseInt(slider.value);
        }
    }
    
    let message = `Olá, ARKE Estúdio! Montei uma simulação de orçamento personalizada no site para o meu negócio:\n\n`;
    message += `📋 *Serviços Selecionados:*\n`;
    selectedNames.forEach(name => {
        message += `- ${name}\n`;
    });
    
    if (mediaVal > 0) {
        message += `- Verba Mensal de Anúncios: R$ ${mediaVal.toLocaleString('pt-BR')}\n`;
    }
    
    message += `\n💰 *Estimativa de Investimento:*\n`;
    if (onceTotal > 0) message += `- Investimento Único: R$ ${onceTotal.toLocaleString('pt-BR')}\n`;
    if (monthlyTotal > 0 || mediaVal > 0) {
        message += `- Mensalidade Total (Agência + Anúncios): R$ ${(monthlyTotal + mediaVal).toLocaleString('pt-BR')}/mês\n`;
    }
    message += `\nGostaria de conversar para detalhar o projeto!`;
    
    const waNumber = window.whatsappNumber || '5585992629819';
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
};
