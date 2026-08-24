document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    const navLinksItems = document.querySelectorAll('.nav-link');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.setAttribute('data-lucide', 'x');
                } else {
                    icon.setAttribute('data-lucide', 'menu');
                }
                lucide.createIcons();
            }
        });

        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = mobileBtn.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                    lucide.createIcons();
                }
            });
        });
    }

    // 2. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
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

    // 4. Dynamic Data Loading and Rendering
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
                const hTitle = document.getElementById('hero-title');
                if (hTitle) hTitle.innerHTML = data.hero.title;
                const hDesc = document.getElementById('hero-description');
                if (hDesc) hDesc.textContent = data.hero.description;
                
                const btnPrimary = document.getElementById('hero-btn-primary');
                if (btnPrimary && data.hero.primaryBtn) {
                    btnPrimary.textContent = data.hero.primaryBtn.text;
                    btnPrimary.href = data.hero.primaryBtn.link;
                }
                const btnSec = document.getElementById('hero-btn-secondary');
                if (btnSec && data.hero.secondaryBtn) {
                    btnSec.textContent = data.hero.secondaryBtn.text;
                    btnSec.href = data.hero.secondaryBtn.link;
                }
            }

            // About
            if (data.about) {
                const aTitle = document.getElementById('about-title');
                if (aTitle) aTitle.innerHTML = data.about.title;
                const aDesc = document.getElementById('about-description');
                if (aDesc) aDesc.textContent = data.about.description;
                
                const aboutGrid = document.getElementById('about-features');
                if (aboutGrid && data.about.features) {
                    aboutGrid.innerHTML = data.about.features.map(f => `
                        <div class="about-feature reveal">
                            <i data-lucide="${f.icon}"></i>
                            <h3>${f.title}</h3>
                            <p class="text-muted">${f.description}</p>
                        </div>
                    `).join('');
                }
            }

            // Services
            if (data.services) {
                const sTitle = document.getElementById('services-title');
                if (sTitle) sTitle.innerHTML = data.services.title;
                const sDesc = document.getElementById('services-description');
                if (sDesc) sDesc.textContent = data.services.description;
                
                const svGrid = document.getElementById('services-grid');
                if (svGrid && data.services.items) {
                    svGrid.innerHTML = data.services.items.map((s, idx) => `
                        <div class="service-card reveal delay-${idx % 3}">
                            <div class="service-icon"><i data-lucide="${s.icon}"></i></div>
                            <h3>${s.title}</h3>
                            <p>${s.description}</p>
                        </div>
                    `).join('');
                }
            }

            // Process (Clean Horizontal Step Grid without duplicate numbers)
            if (data.process && data.process.steps) {
                const pTitle = document.getElementById('process-title');
                if (pTitle) pTitle.innerHTML = data.process.title;
                const pDesc = document.getElementById('process-description');
                if (pDesc) pDesc.textContent = data.process.description;
                
                const processGrid = document.getElementById('process-grid');
                if (processGrid) {
                    processGrid.innerHTML = data.process.steps.map((s, idx) => {
                        const cleanTitle = s.title.replace(/^\d+\.\s*/, '');
                        return `
                        <div class="process-step-card reveal delay-${idx % 3}">
                            <div class="step-icon"><i data-lucide="${s.icon}"></i></div>
                            <h3>${cleanTitle}</h3>
                            <p>${s.description}</p>
                        </div>
                    `}).join('');
                }
            }

            // Differentials
            if (data.differentials) {
                const dTitle = document.getElementById('differentials-title');
                if (dTitle) dTitle.innerHTML = data.differentials.title;
                const dDesc = document.getElementById('differentials-description');
                if (dDesc) dDesc.textContent = data.differentials.description;
                
                const dfGrid = document.getElementById('differentials-grid');
                if (dfGrid && data.differentials.items) {
                    dfGrid.innerHTML = data.differentials.items.map((d, idx) => `
                        <div class="differential-card reveal delay-${idx % 3}">
                            <div class="diff-icon"><i data-lucide="${d.icon}"></i></div>
                            <h3>${d.title}</h3>
                            <p class="text-muted">${d.description}</p>
                        </div>
                    `).join('');
                }
            }

            // Audience
            if (data.audience) {
                const auTitle = document.getElementById('audience-title');
                if (auTitle) auTitle.innerHTML = data.audience.title;
                const auDesc = document.getElementById('audience-description');
                if (auDesc) auDesc.textContent = data.audience.description;
                
                const adList = document.getElementById('audience-list');
                if (adList && data.audience.items) {
                    adList.innerHTML = data.audience.items.map(a => `
                        <li><i data-lucide="check" class="text-brand"></i> <span><strong>${a.title}:</strong> ${a.description}</span></li>
                    `).join('');
                }
            }

            // Culture
            if (data.culture) {
                const cTitle = document.getElementById('culture-title');
                if (cTitle) cTitle.innerHTML = data.culture.title;
                const cDesc = document.getElementById('culture-description');
                if (cDesc) cDesc.textContent = data.culture.description;
            }

            // FAQ
            if (data.faq) {
                const fGrid = document.getElementById('faq-container');
                if (fGrid) {
                    fGrid.innerHTML = data.faq.map(f => `
                        <details class="faq-item">
                            <summary>${f.question}</summary>
                            <div class="faq-content">
                                <p>${f.answer}</p>
                            </div>
                        </details>
                    `).join('');
                    
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
            }

            // Portfolio (Clean Filter Tabs & Cards)
            if (data.portfolio) {
                const poTitle = document.getElementById('portfolio-title');
                if (poTitle) poTitle.innerHTML = data.portfolio.title;
                const poDesc = document.getElementById('portfolio-description');
                if (poDesc) poDesc.textContent = data.portfolio.description;

                const pFilters = document.getElementById('portfolio-filters');
                if (pFilters && data.portfolio.categories) {
                    pFilters.innerHTML = data.portfolio.categories.map(c => `
                        <button class="filter-btn ${c.id === 'all' ? 'active' : ''}" onclick="filterPortfolio('${c.id}', this)">
                            ${c.label}
                        </button>
                    `).join('');
                }
                
                window.allPortfolioItems = data.portfolio.items || [];
                renderFilteredPortfolio('all');
            }

            // Contact
            if (data.contact) {
                const wBtn = document.getElementById('whatsapp-btn');
                if (wBtn) wBtn.href = `https://wa.me/${data.contact.whatsappNumber}`;
                const floatWa = document.getElementById('floating-whatsapp');
                if (floatWa) floatWa.href = `https://wa.me/${data.contact.whatsappNumber}`;
                const igBtn = document.getElementById('footer-ig-link');
                if (igBtn && data.contact.instagram) igBtn.href = data.contact.instagram;
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

    // Initialize Data
    loadAndRenderData();
});

// Lead Diagnostic Questionnaire State & Global Actions
window.elaborateQuizData = {
    goal: '',
    segment: '',
    solutions: new Set(),
    timeline: '',
    name: '',
    phone: '',
    email: '',
    company: '',
    notes: ''
};

window.selectQuizGoal = function(goalVal, cardEl) {
    window.elaborateQuizData.goal = goalVal;
    document.querySelectorAll('#quiz-step-1 .quiz-option-card').forEach(c => c.classList.remove('selected'));
    if (cardEl) cardEl.classList.add('selected');
    updateBriefingSummary();
};

window.selectQuizSegment = function(segmentVal, cardEl) {
    window.elaborateQuizData.segment = segmentVal;
    document.querySelectorAll('#quiz-step-2 .quiz-option-card').forEach(c => c.classList.remove('selected'));
    if (cardEl) cardEl.classList.add('selected');
    updateBriefingSummary();
};

window.toggleQuizSolution = function(solutionVal, cardEl) {
    if (window.elaborateQuizData.solutions.has(solutionVal)) {
        window.elaborateQuizData.solutions.delete(solutionVal);
        if (cardEl) cardEl.classList.remove('selected');
    } else {
        window.elaborateQuizData.solutions.add(solutionVal);
        if (cardEl) cardEl.classList.add('selected');
    }
    updateBriefingSummary();
};

window.selectQuizTimeline = function(timelineVal, cardEl) {
    window.elaborateQuizData.timeline = timelineVal;
    document.querySelectorAll('#quiz-step-4 .quiz-option-card').forEach(c => c.classList.remove('selected'));
    if (cardEl) cardEl.classList.add('selected');
    updateBriefingSummary();
};

function updateBriefingSummary() {
    const sumGoal = document.getElementById('sum-goal');
    if (sumGoal) sumGoal.textContent = window.elaborateQuizData.goal || 'Não selecionado';

    const sumSegment = document.getElementById('sum-segment');
    if (sumSegment) sumSegment.textContent = window.elaborateQuizData.segment || 'Não selecionado';

    const sumTimeline = document.getElementById('sum-timeline');
    if (sumTimeline) sumTimeline.textContent = window.elaborateQuizData.timeline || 'Não selecionado';

    const sumSolutions = document.getElementById('sum-solutions');
    if (sumSolutions) {
        if (window.elaborateQuizData.solutions.size === 0) {
            sumSolutions.innerHTML = '<li class="empty-list">Nenhuma selecionada</li>';
        } else {
            sumSolutions.innerHTML = Array.from(window.elaborateQuizData.solutions).map(s => `<li>${s}</li>`).join('');
        }
    }
}

window.nextQuizStep = function(targetStep) {
    if (targetStep === 2 && !window.elaborateQuizData.goal) {
        alert('Por favor, selecione o objetivo principal do seu projeto.');
        return;
    }
    if (targetStep === 3 && !window.elaborateQuizData.segment) {
        alert('Por favor, selecione o segmento da sua empresa.');
        return;
    }
    if (targetStep === 4 && window.elaborateQuizData.solutions.size === 0) {
        alert('Por favor, selecione pelo menos uma solução de seu interesse.');
        return;
    }
    if (targetStep === 5 && !window.elaborateQuizData.timeline) {
        alert('Por favor, selecione a expectativa de prazo.');
        return;
    }

    [1, 2, 3, 4, 5].forEach(step => {
        const stepContent = document.getElementById(`quiz-step-${step}`);
        const indicator = document.getElementById(`quiz-ind-${step}`);
        if (stepContent) stepContent.style.display = step === targetStep ? 'block' : 'none';
        if (indicator) {
            if (step <= targetStep) indicator.classList.add('active');
            else indicator.classList.remove('active');
        }
    });

    const progressFill = document.getElementById('quiz-progress-fill');
    if (progressFill) {
        const pct = (targetStep / 5) * 100;
        progressFill.style.width = `${pct}%`;
    }

    updateBriefingSummary();
    lucide.createIcons();
};

window.prevQuizStep = function(targetStep) {
    window.nextQuizStep(targetStep);
};

window.jumpQuizStep = function(stepNum) {
    if (stepNum > 1 && !window.elaborateQuizData.goal) return;
    if (stepNum > 2 && !window.elaborateQuizData.segment) return;
    if (stepNum > 3 && window.elaborateQuizData.solutions.size === 0) return;
    if (stepNum > 4 && !window.elaborateQuizData.timeline) return;
    window.nextQuizStep(stepNum);
};

window.submitElaborateLeadQuiz = function(event) {
    if (event) event.preventDefault();
    
    const name = document.getElementById('lead-name')?.value.trim();
    const phone = document.getElementById('lead-phone')?.value.trim();
    const email = document.getElementById('lead-email')?.value.trim();
    const company = document.getElementById('lead-company')?.value.trim();
    const notes = document.getElementById('lead-notes')?.value.trim() || 'Nenhuma observação adicional';

    if (!name || !phone || !email || !company) {
        alert('Por favor, preencha todos os campos obrigatórios (*).');
        return;
    }

    window.elaborateQuizData.name = name;
    window.elaborateQuizData.phone = phone;
    window.elaborateQuizData.email = email;
    window.elaborateQuizData.company = company;
    window.elaborateQuizData.notes = notes;

    // Build complete briefing WhatsApp message
    let msg = `Olá, ARKE Estúdio! Preenchi o Diagnóstico de Projeto Completo no site:\n\n`;
    msg += `👤 *Nome:* ${name}\n`;
    msg += `📱 *WhatsApp:* ${phone}\n`;
    msg += `📧 *E-mail:* ${email}\n`;
    msg += `🏢 *Empresa / Insta:* ${company}\n\n`;
    msg += `🎯 *Objetivo Principal:* ${window.elaborateQuizData.goal}\n`;
    msg += `🏬 *Segmento:* ${window.elaborateQuizData.segment}\n`;
    msg += `⏳ *Expectativa de Prazo:* ${window.elaborateQuizData.timeline}\n\n`;
    msg += `💡 *Soluções Desejadas:*\n`;
    Array.from(window.elaborateQuizData.solutions).forEach(s => {
        msg += `- ${s}\n`;
    });
    msg += `\n📝 *Detalhes:* ${notes}\n\nGostaria de agendar uma reunião ou receber um diagnóstico detalhado!`;

    const waNumber = window.whatsappNumber || '5585992629819';
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

    const waDirectBtn = document.getElementById('quiz-whatsapp-direct');
    if (waDirectBtn) {
        waDirectBtn.href = waUrl;
    }

    // Hide steps, show success
    [1, 2, 3, 4, 5].forEach(s => {
        const el = document.getElementById(`quiz-step-${s}`);
        if (el) el.style.display = 'none';
    });
    const successEl = document.getElementById('quiz-step-success');
    if (successEl) successEl.style.display = 'block';

    const progressFill = document.getElementById('quiz-progress-fill');
    if (progressFill) progressFill.style.width = '100%';

    // Automatically open WhatsApp direct with formatted briefing
    window.open(waUrl, '_blank');
};

// Helper Functions & Global Window Bindings
window.filterPortfolio = function(catId, btnEl) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    renderFilteredPortfolio(catId);
};

function renderFilteredPortfolio(catId) {
    const pGrid = document.getElementById('portfolio-grid');
    if (!pGrid || !window.allPortfolioItems) return;
    
    let filtered = window.allPortfolioItems;
    if (catId !== 'all') {
        filtered = window.allPortfolioItems.filter(item => item.categoryKey === catId);
    }
    
    pGrid.innerHTML = filtered.map((p, idx) => `
        <div class="portfolio-card reveal active" onclick="openProjectModal(${window.allPortfolioItems.indexOf(p)})" style="cursor:pointer;">
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
    lucide.createIcons();
}

function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

window.openProjectModal = function(idx) {
    const items = window.allPortfolioItems || window.portfolioItems;
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
                    <span class="icon-wa"></span> Quero um Projeto Semelhante
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

